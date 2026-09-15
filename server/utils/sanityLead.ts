import { getQuoteLineFinancials, getQuoteLinesTotal } from '../../shared/utils/quoteLine'
import type { QuoteLinePriceInputs } from '../../shared/utils/quoteLine'
import type { SanitySelectedCustomization } from '../../app/types/catalog'

export interface CustomerPayload {
  name: string
  email: string
  phone: string
  company?: string
  deliveryLocation?: string
  notes?: string
}

/**
 * The fields the lead needs to display a Quote Line, plus the pricing fields the shared Quote
 * Line module reads — sourced straight from `QuoteLinePriceInputs` so a Quote Line can be passed
 * through unchanged and this shape can't drift from what the emails already agree a line costs.
 */
export interface QuoteItemPayload extends QuoteLinePriceInputs {
  productId?: string
  productName: string
  sizeKey?: string
  sizeLabel?: string
  notes?: string
  selectedCustomizations?: SanitySelectedCustomization[]
}

export interface QuoteEnquiryInput {
  customer: CustomerPayload
  items: QuoteItemPayload[]
}

export interface SanityQuoteEnquiryDocument {
  _type: 'quoteEnquiry'
  referenceNumber: string
  status: 'new' | 'in_progress' | 'quote_sent' | 'won' | 'lost'
  customerName: string
  email: string
  phone: string
  company?: string
  deliveryLocation?: string
  customerNotes?: string
  items: Array<{
    _type: 'quoteItem'
    _key: string
    product?: { _type: 'reference'; _ref: string }
    productTitle: string
    sizeOptionKey?: string
    sizeLabel: string
    quantity: number
    unitPrice?: number
    isPoa: boolean
    subtotal?: number
    selectedCustomizations?: Array<{
      _key: string
      groupId?: string
      groupTitle: string
      itemKey?: string
      optionTitle: string
      price?: number
      isPoa?: boolean
      pricingType?: string
      priceSource?: string
      customNotes?: string
    }>
  }>
  estimatedTotal: number
  hasPoa: boolean
  submittedAt: string
}

export function generateReferenceNumber(prefix = 'KQ'): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}${random}`
}

export function buildSanityQuoteEnquiry(input: QuoteEnquiryInput): SanityQuoteEnquiryDocument {
  const { customer, items } = input

  let hasPoa = false

  const formattedItems = items.map((item, index) => {
    const { unitPrice, isPoa: isItemPoa, lineTotal } = getQuoteLineFinancials(item)
    if (isItemPoa) {
      hasPoa = true
    }

    const formattedCustomizations = (item.selectedCustomizations || []).map((c, cIdx) => {
      if (c.isPoa) hasPoa = true
      return {
        _key: `cust_${index}_${cIdx}`,
        groupId: c.groupId,
        groupTitle: c.groupTitle,
        itemKey: c.itemKey,
        optionTitle: c.optionTitle,
        price: c.price,
        isPoa: Boolean(c.isPoa),
        pricingType: c.pricingType,
        priceSource: c.priceSource,
        customNotes: c.customNotes
      }
    })

    const docItem: SanityQuoteEnquiryDocument['items'][0] = {
      _type: 'quoteItem',
      _key: `item_${index}_${Date.now().toString(36)}`,
      productTitle: item.productName,
      sizeOptionKey: item.sizeKey,
      sizeLabel: item.sizeLabel || 'Standard',
      quantity: item.quantity,
      unitPrice,
      isPoa: isItemPoa,
      subtotal: lineTotal,
      selectedCustomizations: formattedCustomizations.length > 0 ? formattedCustomizations : undefined
    }

    if (item.productId) {
      docItem.product = {
        _type: 'reference',
        _ref: item.productId
      }
    }

    return docItem
  })

  return {
    _type: 'quoteEnquiry',
    referenceNumber: generateReferenceNumber(),
    status: 'new',
    customerName: customer.name,
    email: customer.email,
    phone: customer.phone || 'Not provided',
    company: customer.company,
    deliveryLocation: customer.deliveryLocation,
    customerNotes: customer.notes,
    items: formattedItems,
    estimatedTotal: getQuoteLinesTotal(items),
    hasPoa,
    submittedAt: new Date().toISOString()
  }
}

export interface SanityWriteConfig {
  projectId: string
  dataset: string
  apiToken: string
  apiVersion?: string
}

/**
 * Persists the confirmed Quote Enquiry snapshot to Sanity. Throws on any failure — a successful
 * Quote Enquiry submission must be recorded, so callers should treat this as required rather than
 * best-effort.
 */
export async function writeSanityQuoteEnquiry(
  doc: SanityQuoteEnquiryDocument,
  config: SanityWriteConfig
): Promise<{ id: string }> {
  const apiVersion = config.apiVersion ?? 'v2024-01-01'
  const url = `https://${config.projectId}.api.sanity.io/${apiVersion}/data/mutate/${config.dataset}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mutations: [{ create: doc }] })
  })

  if (!res.ok) {
    throw new Error(`Sanity quote enquiry write failed with status ${res.status}`)
  }

  const data = await res.json()
  const id = data?.results?.[0]?.id
  if (!id) {
    throw new Error('Sanity quote enquiry write did not return a document id')
  }

  return { id }
}
