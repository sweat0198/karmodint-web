import { buildQuoteEmails, sendResendEmail } from '../utils/email'
import { buildSanityQuoteEnquiry, writeSanityQuoteEnquiry } from '../utils/sanityLead'
import { fetchProductsForValidation } from '../utils/sanityProductQuery'
import { revalidateQuoteItems } from '../utils/quoteRevalidation'
import { isCompleteDeliveryAddress } from '../../shared/utils/deliveryAddress'
import { requiresSizeSelection, type QuoteLine } from '../../shared/utils/quoteLine'

interface QuoteEnquiryCustomer {
  name: string
  email: string
  phone?: string
  company?: string
  address?: string | { formattedAddress?: string; townCity?: string; postcode?: string }
  notes?: string
}

interface QuoteEnquiryRequestBody {
  items: QuoteLine[]
  customer: QuoteEnquiryCustomer
  /** The customer has already seen a price-change diff (a prior 409) and asked to proceed. */
  confirmedPrices?: boolean
}

const errorFn = typeof createError !== 'undefined' ? createError : (err: any) => Object.assign(new Error(err.statusMessage), err)

const handler = async (event: any) => {
  let body: Partial<QuoteEnquiryRequestBody>
  try {
    body = event?.context?.$mockBody !== undefined
      ? event.context.$mockBody
      : (typeof readBody !== 'undefined' ? await readBody(event) : event?.body)
  } catch {
    body = {}
  }

  const { items, customer, confirmedPrices } = body || {}
  // Read before the delivery-address validation below, which narrows `customer.address` down to
  // just the fields (townCity/postcode) it checks for — dropping `formattedAddress` from its type.
  const customerAddress = customer?.address

  if (!customer?.name || !customer?.email || !items || !Array.isArray(items) || items.length === 0) {
    throw errorFn({
      statusCode: 400,
      statusMessage: 'Invalid quote submission payload. Missing contact details or quote items.'
    })
  }

  if (!isCompleteDeliveryAddress(customer.address)) {
    throw errorFn({
      statusCode: 400,
      statusMessage: 'A delivery destination with town/city and postcode is required.'
    })
  }

  if (items.some((item) => requiresSizeSelection(item) || (item.isPortableContainer && !item.sizeKey))) {
    throw errorFn({
      statusCode: 400,
      statusMessage: 'Choose a size for every portable container before requesting a quote.'
    })
  }

  if (items.some((item) => !item.productId || !item.sizeKey)) {
    throw errorFn({
      statusCode: 400,
      statusMessage: 'Each quote item must reference a Product and Size Option.'
    })
  }

  let config: any = {}
  try {
    if (typeof useRuntimeConfig !== 'undefined') {
      config = useRuntimeConfig()
    }
  } catch {
    config = {}
  }

  const resendApiKey = config?.resendApiKey || process.env.RESEND_API_KEY
  const businessInbox = config?.businessEmail || process.env.BUSINESS_EMAIL || 'info@karmodint.co.uk'
  const fromEmail = config?.fromEmail || process.env.RESEND_FROM_EMAIL || 'Karmod International <info@karmodint.co.uk>'
  const sanityApiToken = config?.sanityApiToken || process.env.SANITY_API_TOKEN
  const sanityProjectId = config?.public?.sanityProjectId || process.env.SANITY_PROJECT_ID
  const sanityDataset = config?.public?.sanityDataset || process.env.SANITY_DATASET || 'production'
  const siteUrl = config?.public?.siteUrl || process.env.NUXT_PUBLIC_SITE_URL

  // 1. Re-derive Product, Size Option, and customization pricing/availability from Sanity — the
  // client's numbers are never pricing authority (#15).
  let productsById
  try {
    productsById = await fetchProductsForValidation(
      items.map((item) => item.productId),
      { projectId: sanityProjectId, dataset: sanityDataset }
    )
  } catch (validationErr) {
    console.error('[QUOTE PRICING VALIDATION ERROR]', validationErr)
    throw errorFn({
      statusCode: 500,
      statusMessage: 'Unable to validate quote pricing right now. Please try again shortly.'
    })
  }

  const revalidation = revalidateQuoteItems(items, productsById, { confirmedPrices: Boolean(confirmedPrices) })

  if (!revalidation.ok) {
    if (revalidation.reason === 'unavailable') {
      throw errorFn({
        statusCode: 409,
        statusMessage: 'Some selections in your quote are no longer available. Please review your quote list.',
        data: { code: 'unavailable', issues: revalidation.issues }
      })
    }
    throw errorFn({
      statusCode: 409,
      statusMessage: 'Prices have changed since these items were added to your quote. Please confirm the new prices.',
      data: { code: 'price_changed', changes: revalidation.changes }
    })
  }

  const validatedItems = revalidation.items

  // 2. Persist the confirmed configuration snapshot. Required, not best-effort — a successful
  // submission must be recorded.
  let sanityLeadId: string
  try {
    const sanityDoc = buildSanityQuoteEnquiry({
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone || 'Not provided',
        company: customer.company,
        deliveryLocation: typeof customerAddress === 'object' ? customerAddress?.formattedAddress : customerAddress,
        notes: customer.notes
      },
      items: validatedItems
    })

    const result = await writeSanityQuoteEnquiry(sanityDoc, {
      projectId: sanityProjectId,
      dataset: sanityDataset,
      apiToken: sanityApiToken
    })
    sanityLeadId = result.id
  } catch (sanityErr) {
    console.error('[QUOTE ENQUIRY SAVE ERROR]', sanityErr)
    throw errorFn({
      statusCode: 500,
      statusMessage: 'Unable to save your quote enquiry right now. Please try again or contact us directly.'
    })
  }

  // 3. Email the same confirmed configuration snapshot that was just saved.
  const { businessEmail, customerEmail } = buildQuoteEmails(
    {
      customer,
      items: validatedItems
    },
    businessInbox,
    fromEmail,
    siteUrl
  )

  const businessResult = await sendResendEmail(businessEmail, resendApiKey)
  const customerResult = await sendResendEmail(customerEmail, resendApiKey)

  if (!businessResult.success && !businessResult.simulated) {
    throw errorFn({
      statusCode: 500,
      statusMessage: `Failed to dispatch quote email: ${businessResult.error}`
    })
  }

  return {
    success: true,
    simulated: businessResult.simulated || false,
    message: businessResult.simulated
      ? 'Quote enquiry logged successfully (Simulated mode: Add RESEND_API_KEY env variable for live delivery).'
      : 'Quote enquiry dispatched successfully via Resend.',
    businessEmailId: businessResult.id,
    customerEmailId: customerResult.id,
    sanityLeadId
  }
}

export default typeof defineEventHandler !== 'undefined' ? defineEventHandler(handler) : handler
