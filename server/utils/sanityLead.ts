export interface CustomerPayload {
  name: string
  email: string
  phone: string
  company?: string
  deliveryLocation?: string
  notes?: string
}

export interface QuoteItemPayload {
  productId?: string
  productName: string
  sizeLabel?: string
  quantity: number
  unitPrice?: number
  isPoa?: boolean
  notes?: string
  selectedCustomizations?: Array<{
    groupTitle: string
    optionTitle: string
    price?: number
    isPoa?: boolean
    customNotes?: string
  }>
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
    sizeLabel: string
    quantity: number
    unitPrice?: number
    isPoa: boolean
    subtotal?: number
    selectedCustomizations?: Array<{
      _key: string
      groupTitle: string
      optionTitle: string
      price?: number
      isPoa?: boolean
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
  let calculatedTotal = 0

  const formattedItems = items.map((item, index) => {
    const isItemPoa = Boolean(item.isPoa || item.unitPrice === undefined || item.unitPrice === null)
    if (isItemPoa) {
      hasPoa = true
    }

    const unitPrice = item.unitPrice || 0
    const qty = Math.max(1, item.quantity || 1)
    const itemSubtotal = isItemPoa ? 0 : unitPrice * qty

    if (!isItemPoa) {
      calculatedTotal += itemSubtotal
    }

    const formattedCustomizations = (item.selectedCustomizations || []).map((c, cIdx) => {
      if (c.isPoa) hasPoa = true
      return {
        _key: `cust_${index}_${cIdx}`,
        groupTitle: c.groupTitle,
        optionTitle: c.optionTitle,
        price: c.price,
        isPoa: Boolean(c.isPoa),
        customNotes: c.customNotes
      }
    })

    const docItem: SanityQuoteEnquiryDocument['items'][0] = {
      _type: 'quoteItem',
      _key: `item_${index}_${Date.now().toString(36)}`,
      productTitle: item.productName,
      sizeLabel: item.sizeLabel || 'Standard',
      quantity: qty,
      unitPrice: unitPrice,
      isPoa: isItemPoa,
      subtotal: itemSubtotal,
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
    estimatedTotal: calculatedTotal,
    hasPoa,
    submittedAt: new Date().toISOString()
  }
}
