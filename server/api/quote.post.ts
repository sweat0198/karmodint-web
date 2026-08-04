import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const { items, customer } = body || {}

  if (!customer?.name || !customer?.email || !items || !Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid quote submission payload. Missing contact details or quote items.'
    })
  }

  const resendKey = config.resendApiKey || process.env.RESEND_API_KEY
  const businessInbox = config.businessEmail || process.env.BUSINESS_EMAIL || 'enquiries@karmod-international.com'

  // Construct Email HTML Content
  const itemsHtml = items.map((item: any, idx: number) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: 600;">${idx + 1}. ${item.productName}</td>
      <td style="padding: 12px;">${item.variantLabel || 'Standard'}</td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; font-style: italic;">${item.notes || '-'}</td>
    </tr>
  `).join('')

  const emailBodyHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1e293b;">
      <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ef4444; margin: 0; font-size: 24px;">Karmod International</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0;">New Product Quote Request</p>
      </div>

      <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
        <h3 style="color: #0f172a; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">Customer Contact Details</h3>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${customer.company || 'N/A'}</p>
        ${customer.notes ? `<p><strong>Additional Notes:</strong> ${customer.notes}</p>` : ''}

        <h3 style="color: #0f172a; border-bottom: 2px solid #ef4444; padding-bottom: 8px; margin-top: 24px;">Requested Items (${items.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
          <thead>
            <tr style="background: #f8fafc; text-align: left;">
              <th style="padding: 10px;">Product</th>
              <th style="padding: 10px;">Variant</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px;">Item Notes</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          Submitted via Karmod International Web Application.
        </div>
      </div>
    </div>
  `

  if (!resendKey || resendKey === 'dummy_resend_key') {
    // Development/Fallback response when Resend API key is not configured yet
    console.log('[MOCK RESEND] Dual email dispatch simulated for:', {
      businessInbox,
      customerEmail: customer.email,
      itemCount: items.length
    })
    return {
      success: true,
      simulated: true,
      message: 'Quote enquiry logged successfully (Simulated mode: Add RESEND_API_KEY env variable for live delivery).'
    }
  }

  try {
    const resend = new Resend(resendKey)

    // 1. Send Notification to Business Inbox
    const businessResult = await resend.emails.send({
      from: 'Karmod Quotes <quotes@karmod-international.com>',
      to: [businessInbox],
      subject: `New Quote Request from ${customer.name} (${items.length} items)`,
      html: emailBodyHtml
    })

    // 2. Send Confirmation Email to Customer
    const customerResult = await resend.emails.send({
      from: 'Karmod International <enquiries@karmod-international.com>',
      to: [customer.email],
      subject: 'We received your quote request - Karmod International',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; padding: 24px;">
          <h2 style="color: #ef4444;">Thank you for your enquiry, ${customer.name}!</h2>
          <p>We have received your quote request for ${items.length} product(s). Our sales team is reviewing your specification and will follow up with you shortly via email or phone.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 14px; color: #64748b;">Karmod International Ltd — Portable Cabins, Kiosks, Gatehouses & Modular Buildings</p>
        </div>
      `
    })

    return {
      success: true,
      businessEmailId: businessResult.data?.id,
      customerEmailId: customerResult.data?.id
    }
  } catch (err: any) {
    console.error('Failed to send Resend emails:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to dispatch quote email: ${err.message}`
    })
  }
})
