import { buildContactEmails, sendResendEmail } from '../utils/email'

const handler = async (event: any) => {
  let body: any
  try {
    body = event?.context?.$mockBody !== undefined 
      ? event.context.$mockBody 
      : (typeof readBody !== 'undefined' ? await readBody(event) : event?.body)
  } catch {
    body = {}
  }

  const { fullName, companyName, email, phone, details } = body || {}

  // Basic validation
  if (!fullName || typeof fullName !== 'string' || !fullName.trim() ||
      !companyName || typeof companyName !== 'string' || !companyName.trim() ||
      !email || typeof email !== 'string' || !email.includes('@') ||
      !details || typeof details !== 'string' || !details.trim()) {
    const errorFn = typeof createError !== 'undefined' ? createError : (err: any) => Object.assign(new Error(err.statusMessage), err)
    throw errorFn({
      statusCode: 400,
      statusMessage: 'Invalid contact submission. Full name, company/organization, valid email address, and project details are required.'
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
  const siteUrl = config?.public?.siteUrl || process.env.NUXT_PUBLIC_SITE_URL

  const { businessEmail, customerEmail } = buildContactEmails(
    {
      fullName: fullName.trim(),
      companyName: companyName?.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim(),
      details: details.trim()
    },
    businessInbox,
    fromEmail,
    siteUrl
  )

  // 1. Dispatch Notification to Business Inbox
  const businessResult = await sendResendEmail(businessEmail, resendApiKey)

  // 2. Dispatch Confirmation to Customer
  const customerResult = await sendResendEmail(customerEmail, resendApiKey)

  if (!businessResult.success && !businessResult.simulated) {
    const errorFn = typeof createError !== 'undefined' ? createError : (err: any) => Object.assign(new Error(err.statusMessage), err)
    throw errorFn({
      statusCode: 500,
      statusMessage: `Failed to dispatch contact inquiry: ${businessResult.error}`
    })
  }

  return {
    success: true,
    message: 'Your project consultation request has been received. Our team will contact you shortly.',
    simulated: businessResult.simulated || false,
    businessEmailId: businessResult.id,
    customerEmailId: customerResult.id
  }
}

export default typeof defineEventHandler !== 'undefined' ? defineEventHandler(handler) : handler
