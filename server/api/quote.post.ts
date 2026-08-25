import { buildQuoteEmails, sendResendEmail } from '../utils/email'
import { buildSanityQuoteEnquiry } from '../utils/sanityLead'

const handler = async (event: any) => {
  let body: any
  try {
    body = event?.context?.$mockBody !== undefined 
      ? event.context.$mockBody 
      : (typeof readBody !== 'undefined' ? await readBody(event) : event?.body)
  } catch {
    body = {}
  }

  const { items, customer } = body || {}

  if (!customer?.name || !customer?.email || !items || !Array.isArray(items) || items.length === 0) {
    const errorFn = typeof createError !== 'undefined' ? createError : (err: any) => Object.assign(new Error(err.statusMessage), err)
    throw errorFn({
      statusCode: 400,
      statusMessage: 'Invalid quote submission payload. Missing contact details or quote items.'
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
  const siteUrl = config?.public?.siteUrl || process.env.NUXT_PUBLIC_SITE_URL

  // 1. Build and format email payloads
  const { businessEmail, customerEmail } = buildQuoteEmails(
    {
      customer,
      items
    },
    businessInbox,
    fromEmail,
    siteUrl
  )

  // 2. Dispatch Business Notification
  const businessResult = await sendResendEmail(businessEmail, resendApiKey)

  // 3. Dispatch Customer Confirmation
  const customerResult = await sendResendEmail(customerEmail, resendApiKey)

  // 4. Optional Sanity Lead Sync (if Sanity write token available)
  let sanityLeadId: string | undefined
  if (sanityApiToken && sanityProjectId && sanityProjectId !== 'dummy_project_id') {
    try {
      const sanityDoc = buildSanityQuoteEnquiry({
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone || 'Not provided',
          company: customer.company,
          deliveryLocation: typeof customer.address === 'object' ? customer.address?.formattedAddress : customer.address,
          notes: customer.notes
        },
        items: items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity || 1,
          unitPrice: item.customTotal || item.unitPrice || item.basePrice,
          notes: item.notes,
          selectedCustomizations: item.selectedCustomizations
        }))
      })

      const sanityDataset = config?.public?.sanityDataset || process.env.SANITY_DATASET || 'production'
      const sanityUrl = `https://${sanityProjectId}.api.sanity.io/v2024-01-01/data/mutate/${sanityDataset}`

      const sanityRes = await fetch(sanityUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sanityApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mutations: [{ create: sanityDoc }]
        })
      })

      if (sanityRes.ok) {
        const sanityData = await sanityRes.json()
        sanityLeadId = sanityData?.results?.[0]?.id
      }
    } catch (sanityErr) {
      console.warn('[SANITY LEAD SYNC WARNING]', sanityErr)
    }
  }

  if (!businessResult.success && !businessResult.simulated) {
    const errorFn = typeof createError !== 'undefined' ? createError : (err: any) => Object.assign(new Error(err.statusMessage), err)
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
