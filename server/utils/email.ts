/**
 * Resend Email Dispatcher & Branded Template Generator.
 * Visual design ported from the "Karmod Email Templates" Claude Design handoff —
 * table-based, inline-styled, single 600px breakpoint, matching the site's
 * brand tokens (app/assets/css/main.css) and company data (app/constants/company.ts).
 */

import { COMPANY_DETAILS, COMPANY_ADDRESS, COMPANY_CONTACT } from '../../app/constants/company'
import { getQuoteLineFinancials, getQuoteLinesTotal } from '../../shared/utils/quoteLine'
import type { QuoteLinePriceInputs } from '../../shared/utils/quoteLine'
import type { SanitySelectedCustomization } from '../../app/types/catalog'

export interface EmailPayload {
  from: string
  to: string[]
  subject: string
  html: string
  replyTo?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  simulated?: boolean
  error?: string
}

export interface ContactEnquiryPayload {
  fullName: string
  companyName?: string
  email: string
  phone?: string
  details: string
}

/**
 * The presentation fields the email templates render for a line, plus the pricing fields the
 * shared Quote Line module reads — sourced straight from `QuoteLinePriceInputs` so this shape
 * can't drift from what the Quote List page and price bar already agree a line costs.
 */
export interface QuoteItemSummary extends QuoteLinePriceInputs {
  productName: string
  sizeLabel?: string
  dimensions?: string
  imageUrl?: string
  notes?: string
  specBadges?: string[]
  selectedCustomizations?: SanitySelectedCustomization[]
  specSummary?: Array<{ label: string; value: string }>
}

export interface QuoteEmailPayload {
  quoteReference?: string
  customer: {
    name: string
    email: string
    phone?: string
    company?: string
    address?: string | { formattedAddress?: string; townCity?: string; postcode?: string }
    deliveryLocation?: string
    notes?: string
  }
  items: QuoteItemSummary[]
}

const DEFAULT_SITE_URL = 'https://www.karmodint.co.uk'
const FONT = `'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function fmtGBP(amount: number): string {
  return `&pound;${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDateLong(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function microLabel(text: string, color = '#64748B'): string {
  return `<span style="font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:${color};">${text}</span>`
}

function fieldLabel(text: string): string {
  return `<div style="font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#64748B;line-height:18px;">${text}</div>`
}

function fieldValue(html: string, padBottom = 12): string {
  return `<div style="font-family:${FONT};font-size:14px;color:#1F2937;line-height:22px;padding-bottom:${padBottom}px;">${html}</div>`
}

function spacerRow(height = 16): string {
  return `<tr><td style="height:${height}px;line-height:${height}px;font-size:1px;">&nbsp;</td></tr>`
}

function cardRow(innerHtml: string): string {
  return `<tr><td class="pad pad-y" style="background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;box-shadow:0 10px 15px -3px rgba(0,0,0,.05),0 4px 6px -2px rgba(0,0,0,.06);padding:24px 26px;">${innerHtml}</td></tr>`
}

function sectionLabelRow(text: string): string {
  return `<tr><td style="padding:6px 2px 12px 2px;">${microLabel(text)}</td></tr>`
}

function renderHeaderRow(siteUrl: string): string {
  const logoUrl = `${siteUrl}/images/karmod-logo.png`
  return `<tr><td class="pad" style="background:#121C2A;padding:20px 28px;border-radius:8px 8px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td class="stack" align="left" style="line-height:1;"><a href="${siteUrl}" style="text-decoration:none;"><img src="${logoUrl}" width="180" height="42" alt="Karmod INT &mdash; Modular Building Solutions" style="display:block;width:180px;height:42px;border:0;outline:none;text-decoration:none;"></a></td>
      <td class="stack right" align="right" style="font-family:${FONT};font-size:12px;line-height:20px;color:#BDC7D9;">
        <a href="${COMPANY_CONTACT.phoneTelHref}" style="color:#BDC7D9;text-decoration:none;">${COMPANY_CONTACT.phoneDisplay}</a><br>
        <a href="mailto:${COMPANY_CONTACT.salesEmail}" style="color:#BDC7D9;text-decoration:none;">${COMPANY_CONTACT.salesEmail}</a>
      </td>
    </tr></table>
  </td></tr>`
}

function renderFooterRow(disclaimerHtml: string): string {
  return `<tr><td class="pad" style="background:#121C2A;padding:32px 28px;border-radius:0 0 8px 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td>
      <span style="font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#E31E24;">Karmod UK</span>
      <div style="height:10px;line-height:10px;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;line-height:22px;">${esc(COMPANY_DETAILS.legalName)}</div>
      <div style="height:10px;line-height:10px;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:13px;color:#BDC7D9;line-height:21px;mso-line-height-rule:exactly;">
        ${esc(COMPANY_ADDRESS.line1)},<br>
        ${esc(COMPANY_ADDRESS.locality)},<br>
        ${esc(COMPANY_ADDRESS.town)}, ${esc(COMPANY_ADDRESS.postcode)}
      </div>
      <div style="height:14px;line-height:14px;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:13px;color:#BDC7D9;line-height:21px;">
        <a href="${COMPANY_CONTACT.phoneTelHref}" style="color:#BDC7D9;text-decoration:none;">${COMPANY_CONTACT.phoneDisplay}</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:${COMPANY_CONTACT.salesEmail}" style="color:#BDC7D9;text-decoration:none;">${COMPANY_CONTACT.salesEmail}</a>
      </div>
      <div style="height:22px;line-height:22px;">&nbsp;</div>
      <div style="border-top:1px solid #2A3648;height:1px;line-height:1px;font-size:1px;">&nbsp;</div>
      <div style="height:18px;line-height:18px;">&nbsp;</div>
      <div style="font-family:${FONT};font-size:11px;color:#8A96AB;line-height:18px;">
        ${disclaimerHtml}<br>
        ${esc(COMPANY_DETAILS.legalName)}, registered in England &amp; Wales. &copy; ${new Date().getFullYear()} ${esc(COMPANY_DETAILS.legalName)}.
      </div>
    </td></tr></table>
  </td></tr>`
}

/**
 * Base email layout: 720px table shell, navy header/footer, white bordered
 * "card" sections in between. `contentHtml` must already be a sequence of
 * `<tr>` blocks (see cardRow/spacerRow/sectionLabelRow) — see buildQuoteEmails
 * and buildContactEmails for how they're assembled.
 */
export function renderBrandedEmailTemplate(options: {
  title: string
  preheader?: string
  contentHtml: string
  footerNote?: string
  siteUrl?: string
}): string {
  const { title, preheader, contentHtml, footerNote, siteUrl = DEFAULT_SITE_URL } = options
  const bareDomain = siteUrl.replace(/^https?:\/\//, '')
  const disclaimerHtml = footerNote || `This is an automated message from <a href="${siteUrl}" style="color:#8A96AB;">${bareDomain}</a>.`

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(title)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;width:100%!important;-webkit-text-size-adjust:100%;}
  table{border-collapse:collapse;}
  img{border:0;outline:none;line-height:100%;-ms-interpolation-mode:bicubic;}
  a{color:#E31E24;}
  @media only screen and (max-width:600px){
    .wrap{width:100%!important;}
    .stack{display:block!important;width:100%!important;max-width:100%!important;}
    .stack-gap{height:16px!important;line-height:16px!important;}
    .pad{padding-left:18px!important;padding-right:18px!important;}
    .pad-y{padding-top:18px!important;padding-bottom:18px!important;}
    .prod-img-cell{width:64px!important;padding-right:12px!important;}
    .right{text-align:left!important;}
    .total-num{font-size:26px!important;}
    .hide-sm{display:none!important;}
    .center-sm{text-align:center!important;}
    .show-sm{display:block!important;font-size:12px!important;line-height:18px!important;max-height:none!important;overflow:visible!important;margin-top:4px!important;color:#64748B!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px;">${esc(preheader)}</div>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F8FAFC;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="wrap" width="720" style="width:720px;max-width:720px;">
${renderHeaderRow(siteUrl)}
${spacerRow(20)}
${contentHtml}
${spacerRow(20)}
${renderFooterRow(disclaimerHtml)}
</table>
</td></tr></table>
</body></html>
  `.trim()
}

function buildInternalIntroCardHtml(opts: { eyebrow: string; title: string; message: string; chipLabel?: string }): string {
  const { eyebrow, title, message, chipLabel } = opts
  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td class="stack" valign="top" style="padding-right:16px;">
        ${microLabel(eyebrow)}
        <div style="height:8px;line-height:8px;">&nbsp;</div>
        <div style="font-family:${FONT};font-size:24px;font-weight:700;color:#291715;line-height:32px;">${title}</div>
        <div style="height:8px;line-height:8px;">&nbsp;</div>
        <div style="font-family:${FONT};font-size:14px;color:#64748B;line-height:22px;">${message}</div>
      </td>
      ${chipLabel ? `<td class="stack right" align="right" valign="top">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;background:#FFE9E6;border:1px solid #E7BDB8;border-radius:4px;"><tr>
          <td style="padding:6px 12px;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#E31E24;white-space:nowrap;">${esc(chipLabel)}</td>
        </tr></table>
      </td>` : ''}
    </tr></table>
  `
  return cardRow(inner)
}

function buildCustomerIntroCardHtml(opts: { eyebrow: string; title: string; message: string }): string {
  const { eyebrow, title, message } = opts
  const inner = `
    ${microLabel(eyebrow)}
    <div style="height:8px;line-height:8px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:24px;font-weight:700;color:#291715;line-height:32px;">${title}</div>
    <div style="height:10px;line-height:10px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:15px;color:#1F2937;line-height:24px;">${message}</div>
  `
  return cardRow(inner)
}

/**
 * Builds email payloads for Contact / Project Consultation submissions.
 */
export function buildContactEmails(
  data: ContactEnquiryPayload,
  businessInbox: string,
  fromEmail = 'Karmod International <info@karmodint.co.uk>',
  siteUrl = DEFAULT_SITE_URL
): { businessEmail: EmailPayload; customerEmail: EmailPayload } {
  const now = new Date()
  const submittedAt = `${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}, ${fmtDateLong(now)}`
  const bareDomain = siteUrl.replace(/^https?:\/\//, '')
  const disclaimerHtml = `This message relates to a contact enquiry made at <a href="${siteUrl}" style="color:#8A96AB;">${bareDomain}</a>.`

  const preparedForInner = `
    ${microLabel('Prepared for')}
    <div style="height:14px;line-height:14px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td class="stack" width="52%" valign="top" style="padding-right:20px;">
        <div style="font-family:${FONT};font-size:19px;font-weight:700;color:#291715;line-height:26px;">${esc(data.fullName)}</div>
        <div style="font-family:${FONT};font-size:14px;color:#64748B;line-height:22px;padding-bottom:16px;">${esc(data.companyName || 'Private client')}</div>
        ${fieldLabel('Email')}
        ${fieldValue(`<a href="mailto:${esc(data.email)}" style="color:#E31E24;text-decoration:none;">${esc(data.email)}</a>`)}
        ${fieldLabel('Phone')}
        ${fieldValue(esc(data.phone || 'Not provided'))}
      </td>
      <td class="stack-gap hide-sm" width="0" style="font-size:1px;">&nbsp;</td>
      <td class="stack" width="48%" valign="top">
        ${fieldLabel('Channel')}
        ${fieldValue('Web consultation form')}
        ${fieldLabel('Submitted')}
        ${fieldValue(esc(submittedAt))}
        ${fieldLabel('Desk email')}
        ${fieldValue(esc(COMPANY_CONTACT.salesEmail))}
      </td>
    </tr></table>
  `

  const requirementsInner = (label: string) => `
    ${microLabel(label)}
    <div style="height:14px;line-height:14px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:14px;color:#1F2937;line-height:24px;white-space:pre-wrap;">${esc(data.details)}</div>
  `

  const businessContentHtml = `
    ${buildInternalIntroCardHtml({
      eyebrow: 'Internal notification',
      title: 'Project Consultation Request',
      message: 'Submitted via the website contact form. Reply directly to this email to reach the customer.',
      chipLabel: 'New inquiry'
    })}
    ${spacerRow(16)}
    ${cardRow(preparedForInner)}
    ${spacerRow(16)}
    ${cardRow(requirementsInner('Requirements &amp; scope'))}
  `

  const customerContentHtml = `
    ${buildCustomerIntroCardHtml({
      eyebrow: 'Consultation request received',
      title: `Thanks for reaching out, ${esc(data.fullName)}`,
      message: 'We&rsquo;ve received your project consultation enquiry. Our commercial engineering team will follow up with you within 1 business day.'
    })}
    ${spacerRow(16)}
    ${cardRow(requirementsInner('Your message'))}
  `

  return {
    businessEmail: {
      from: fromEmail,
      to: [businessInbox],
      subject: `New Project Consultation: ${data.fullName}${data.companyName ? ` (${data.companyName})` : ''}`,
      html: renderBrandedEmailTemplate({
        title: `New Consultation - ${data.fullName}`,
        preheader: `Consultation request from ${data.fullName}`,
        contentHtml: businessContentHtml,
        footerNote: disclaimerHtml,
        siteUrl
      }),
      replyTo: data.email
    },
    customerEmail: {
      from: fromEmail,
      to: [data.email],
      subject: 'Thank you for contacting Karmod International',
      html: renderBrandedEmailTemplate({
        title: 'We have received your enquiry',
        preheader: 'Thank you for contacting Karmod International',
        contentHtml: customerContentHtml,
        footerNote: disclaimerHtml,
        siteUrl
      })
    }
  }
}

function customizationInitial(cust: SanitySelectedCustomization): string {
  return esc(cust.groupTitle.trim().charAt(0).toUpperCase() || '+')
}

function customizationLabel(cust: SanitySelectedCustomization): string {
  return `${esc(cust.groupTitle)}: ${esc(cust.optionTitle)}`
}

function customizationPriceDisplay(cust: SanitySelectedCustomization): string {
  return cust.isPoa ? 'POA' : fmtGBP(cust.price ?? 0)
}

/**
 * `unitPrice`/`itemTotal` already reflect any selected modifiers — the Quote List bakes their
 * price into `customTotal` when a line is customized (see useCustomizationPricing's `subtotal`).
 * `addonsTotal` here is informational only, for the "(incl. add-ons)" note and the subcard's
 * per-item prices; it must never be added on top of `itemTotal` or a line's modifiers would be
 * counted twice.
 */
function computeItemFinancials(item: QuoteItemSummary) {
  const { unitPrice, lineTotal: itemTotal } = getQuoteLineFinancials(item)
  const addons = item.selectedCustomizations ?? []
  const addonsTotal = addons.reduce((sum, c) => sum + (c.isPoa ? 0 : c.price ?? 0), 0)
  return { unitPrice, addonsTotal, itemTotal }
}

function productImageCell(item: QuoteItemSummary): string {
  if (item.imageUrl) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="prod-img" width="64" style="width:64px;height:64px;border-radius:6px;overflow:hidden;"><tr><td style="width:64px;height:64px;"><img src="${esc(item.imageUrl)}" width="64" height="64" alt="${esc(item.productName)}" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:6px;"></td></tr></table>`
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="prod-img" width="64" style="width:64px;height:64px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;"><tr><td align="center" valign="middle" style="height:64px;font-family:${FONT};font-size:10px;letter-spacing:.06em;color:#94A3B8;">IMG</td></tr></table>`
}

function badgesHtml(item: QuoteItemSummary): string {
  const badges = item.specBadges && item.specBadges.length > 0
    ? item.specBadges
    : (item.specSummary || []).map(s => `${s.label}: ${s.value}`)
  if (badges.length === 0) return ''
  const pills = badges.map(b => `<span style="display:inline-block;background:#F1F5F9;border:1px solid #E2E8F0;border-radius:4px;padding:4px 8px;margin:0 6px 6px 0;font-family:${FONT};font-size:11px;color:#1F2937;line-height:14px;">${esc(b)}</span>`).join('')
  return `<div style="height:16px;line-height:16px;">&nbsp;</div><div>${pills}</div>`
}

function customizationsSubcard(item: QuoteItemSummary): string {
  const custs = item.selectedCustomizations ?? []
  if (custs.length === 0) return ''
  const rows = custs.map((c, i) => {
    const isLast = i === custs.length - 1
    const borderBottom = isLast ? 'border-bottom:0;' : 'border-bottom:1px solid #E2E8F0;'
    const priceDisplay = customizationPriceDisplay(c)
    return `<tr>
      <td width="34" valign="top" style="padding:9px 0;${borderBottom}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-radius:4px;background:#FFE9E6;"><tr><td width="22" height="22" align="center" valign="middle" style="width:22px;height:22px;font-family:${FONT};font-size:11px;font-weight:700;color:#E31E24;line-height:22px;">${customizationInitial(c)}</td></tr></table></td>
      <td valign="top" style="padding:9px 12px 9px 0;${borderBottom}font-family:${FONT};font-size:13px;color:#1F2937;line-height:20px;">${customizationLabel(c)}<div class="show-sm" style="display:none;font-size:0;line-height:0;max-height:0;overflow:hidden;"><span style="font-weight:600;color:#291715;">${priceDisplay}</span></div></td>
      <td class="hide-sm" width="90" align="right" valign="top" style="padding:9px 0;${borderBottom}font-family:${FONT};font-size:13px;font-weight:600;color:#291715;white-space:nowrap;">${priceDisplay}</td>
    </tr>`
  }).join('')

  return `<div style="height:18px;line-height:18px;">&nbsp;</div><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;"><tr><td style="padding:14px 16px;">
    ${microLabel('Customisations &amp; add-ons')}
    <div style="height:4px;line-height:4px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows}</table>
  </td></tr></table>`
}

function buildItemCardHtml(item: QuoteItemSummary): string {
  const { unitPrice, addonsTotal, itemTotal } = computeItemFinancials(item)
  const dimsParts = [item.dimensions, item.sizeLabel].filter((v): v is string => Boolean(v))
  const dims = Array.from(new Set(dimsParts)).join(' &middot; ')
  const priceDisplay = item.isPoa ? 'POA' : fmtGBP(unitPrice)
  const baseLine = item.isPoa
    ? 'Price on application'
    : `Unit price ${fmtGBP(unitPrice)} &times; ${item.quantity}${addonsTotal > 0 ? ` &nbsp;(includes selected customisations)` : ''}`

  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td class="prod-img-cell" width="80" valign="top" style="padding-right:18px;">${productImageCell(item)}</td>
      <td valign="top">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td class="stack" valign="top" style="padding-right:16px;">
            <div style="font-family:${FONT};font-size:17px;font-weight:700;color:#291715;line-height:24px;">${esc(item.productName)}</div>
            ${dims ? `<div style="height:6px;line-height:6px;">&nbsp;</div>${microLabel(dims, '#E31E24')}` : ''}
          </td>
          <td class="stack right" align="right" valign="top" style="white-space:nowrap;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border:1px solid #E2E8F0;border-radius:4px;"><tr>
              <td style="padding:5px 10px;font-family:${FONT};font-size:12px;color:#64748B;">Qty</td>
              <td style="padding:5px 12px;border-left:1px solid #E2E8F0;font-family:${FONT};font-size:13px;font-weight:600;color:#1F2937;">${item.quantity}</td>
            </tr></table>
            <div style="height:10px;line-height:10px;">&nbsp;</div>
            <div style="font-family:${FONT};font-size:20px;font-weight:700;color:#291715;line-height:26px;">${priceDisplay}</div>
            <div style="font-family:${FONT};font-size:11px;color:#64748B;line-height:16px;">base unit price</div>
          </td>
        </tr></table>
        ${badgesHtml(item)}
      </td>
    </tr></table>
    ${customizationsSubcard(item)}
    <div style="height:16px;line-height:16px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #E2E8F0;"><tr>
      <td class="stack center-sm" valign="middle" style="padding-top:14px;font-family:${FONT};font-size:12px;color:#64748B;line-height:20px;">${baseLine}</td>
      <td class="stack center-sm" align="right" valign="middle" style="padding-top:14px;font-family:${FONT};font-size:13px;font-weight:600;color:#1F2937;white-space:nowrap;text-align:right;">Item total &nbsp;<span style="font-size:18px;font-weight:700;color:#291715;">${item.isPoa ? 'POA' : fmtGBP(itemTotal)}</span></td>
    </tr></table>
  `
  return cardRow(inner)
}

function addressDisplayFor(customer: QuoteEmailPayload['customer']): string {
  if (typeof customer.address === 'object' && customer.address) {
    return customer.address.formattedAddress || customer.address.postcode || customer.deliveryLocation || 'To be confirmed'
  }
  return customer.address || customer.deliveryLocation || 'To be confirmed'
}

function buildPreparedForCardHtml(opts: {
  customer: QuoteEmailPayload['customer']
  refNumber: string
  submittedDate: string
  showConsultant: boolean
}): string {
  const { customer, refNumber, submittedDate, showConsultant } = opts
  const addressDisplay = addressDisplayFor(customer)
  const phoneHref = customer.phone ? customer.phone.replace(/[^+\d]/g, '') : ''

  const inner = `
    ${microLabel('Prepared for')}
    <div style="height:14px;line-height:14px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
      <td class="stack" width="52%" valign="top" style="padding-right:20px;">
        <div style="font-family:${FONT};font-size:19px;font-weight:700;color:#291715;line-height:26px;">${esc(customer.name)}</div>
        <div style="font-family:${FONT};font-size:14px;color:#64748B;line-height:22px;padding-bottom:16px;">${esc(customer.company || 'Private client')}</div>
        ${fieldLabel('Email')}
        ${fieldValue(`<a href="mailto:${esc(customer.email)}" style="color:#E31E24;text-decoration:none;">${esc(customer.email)}</a>`)}
        ${fieldLabel('Phone')}
        ${fieldValue(customer.phone ? `<a href="tel:${esc(phoneHref)}" style="color:#1F2937;text-decoration:none;">${esc(customer.phone)}</a>` : 'Not provided')}
        ${fieldLabel('Delivery address')}
        ${fieldValue(esc(addressDisplay))}
      </td>
      <td class="stack-gap hide-sm" width="0" style="font-size:1px;">&nbsp;</td>
      <td class="stack" width="48%" valign="top">
        ${fieldLabel('Request reference')}
        ${fieldValue(`<span style="font-weight:600;">${esc(refNumber)}</span>`)}
        ${fieldLabel('Submitted')}
        ${fieldValue(esc(submittedDate))}
        ${showConsultant ? `${fieldLabel('Consultant')}${fieldValue(`UK Technical Desk &middot; ${esc(COMPANY_CONTACT.salesEmail)}`)}` : ''}
        ${customer.notes ? `${fieldLabel('Customer notes')}${fieldValue(esc(customer.notes))}` : ''}
      </td>
    </tr></table>
  `
  return cardRow(inner)
}

function buildLogisticsCardHtml(customer: QuoteEmailPayload['customer']): string {
  const destination = addressDisplayFor(customer)

  const inner = `
    ${microLabel('Logistics &amp; delivery')}
    <div style="height:16px;line-height:16px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFE9E6;border:1px solid #E7BDB8;border-radius:8px;"><tr>
      <td style="padding:18px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
          <td width="34" valign="top" style="padding-right:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-radius:4px;background:#FFE9E6;"><tr><td width="22" height="22" align="center" valign="middle" style="width:22px;height:22px;font-family:${FONT};font-size:11px;font-weight:700;color:#E31E24;line-height:22px;">&#9654;</td></tr></table></td>
          <td valign="top">
            ${fieldLabel('Delivery destination')}
            ${fieldValue(esc(destination), 14)}
            <div style="font-family:${FONT};font-size:14px;font-weight:600;color:#291715;line-height:22px;">The sales team will contact you about the delivery charge after reviewing your quote request.</div>
            <div style="height:6px;line-height:6px;">&nbsp;</div>
            <div style="font-family:${FONT};font-size:13px;color:#64748B;line-height:21px;">Offload requirements and costs will also be confirmed during the review.</div>
          </td>
        </tr></table>
      </td>
    </tr></table>
  `
  return cardRow(inner)
}

function buildFinancialSummaryCardHtml(opts: {
  items: QuoteItemSummary[]
  itemFinancials: ReturnType<typeof computeItemFinancials>[]
  productEstimate: number
  hasPoaItems: boolean
  ctasHtml: string
}): string {
  const { items, itemFinancials, productEstimate, hasPoaItems, ctasHtml } = opts

  const lineRows = items.map((item, i) => {
    const fin = itemFinancials[i] ?? { unitPrice: 0, addonsTotal: 0, itemTotal: 0 }
    const addonsNote = fin.addonsTotal > 0 ? ` <span style="color:#64748B;">(incl. add-ons)</span>` : ''
    return `<tr>
      <td style="padding:9px 0;font-family:${FONT};font-size:14px;font-weight:400;color:#64748B;line-height:22px;">${esc(item.productName)}${addonsNote}</td>
      <td align="right" style="padding:9px 0;font-family:${FONT};font-size:15px;font-weight:600;color:#291715;line-height:22px;white-space:nowrap;">${item.isPoa ? 'POA' : fmtGBP(fin.itemTotal)}</td>
    </tr>`
  }).join('')

  const inner = `
    ${microLabel('Product estimate (ex. VAT)')}
    <div style="height:12px;line-height:12px;">&nbsp;</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${lineRows}
      <tr><td colspan="2" style="border-top:1px solid #E2E8F0;height:1px;line-height:1px;font-size:1px;padding-top:6px;">&nbsp;</td></tr>
      <tr>
        <td style="padding:9px 0;font-family:${FONT};font-size:14px;font-weight:600;color:#1F2937;line-height:22px;">Product estimate (ex. VAT)</td>
        <td align="right" style="padding:9px 0;font-family:${FONT};font-size:18px;font-weight:700;color:#291715;line-height:24px;white-space:nowrap;">${hasPoaItems ? 'Part POA' : fmtGBP(productEstimate)}</td>
      </tr>
      <tr>
        <td style="padding:9px 0;font-family:${FONT};font-size:14px;font-weight:400;color:#64748B;line-height:22px;">VAT, delivery &amp; offload</td>
        <td align="right" style="padding:9px 0;font-family:${FONT};font-size:14px;font-weight:600;color:#E31E24;line-height:22px;">Pending sales review</td>
      </tr>
    </table>
    <div style="height:10px;line-height:10px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:12px;color:#64748B;line-height:18px;">This is a non-binding product estimate. The formal sales quote will confirm VAT, delivery, offload requirements, and the final payable total.</div>
    <div style="height:24px;line-height:24px;">&nbsp;</div>
    ${ctasHtml}
  `
  return cardRow(inner)
}

function buttonHtml(href: string, label: string, variant: 'primary' | 'secondary'): string {
  const bg = variant === 'primary' ? 'background:#E31E24;' : 'background:#FFFFFF;border:1px solid #CBD5E1;'
  const color = variant === 'primary' ? '#FFFFFF' : '#1F2937'
  const padding = variant === 'primary' ? '14px 30px' : '13px 26px'
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;border-radius:4px;${bg}"><tr>
    <td align="center" style="border-radius:4px;${bg}">
      <a href="${href}" style="display:block;padding:${padding};font-family:${FONT};font-size:15px;font-weight:600;color:${color};text-decoration:none;border-radius:4px;">${esc(label)}</a>
    </td></tr></table>`
}

function replyButtonsHtml(customerEmail: string, refNumber: string): string {
  const href = `mailto:${encodeURIComponent(customerEmail)}?subject=${encodeURIComponent(`Your Karmod quote ${refNumber}`)}`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="top">${buttonHtml(href, 'Reply to customer', 'primary')}</td></tr></table>`
}

function customerReplyButtonHtml(refNumber: string): string {
  const href = `mailto:${encodeURIComponent(COMPANY_CONTACT.salesEmail)}?subject=${encodeURIComponent(`Quote request ${refNumber}`)}`
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="top">${buttonHtml(href, 'Reply with a question', 'primary')}</td></tr></table>`
}

function buildWhatsNextCardHtml(): string {
  const inner = `
    ${microLabel('What happens next')}
    <div style="height:12px;line-height:12px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:14px;color:#1F2937;line-height:24px;">
      1. Our sales team reviews your requested products and delivery destination.<br>
      2. The team contacts you about delivery and any offload requirements.<br>
      3. You receive a formal quote confirming VAT and the final payable total.
    </div>
    <div style="height:14px;line-height:14px;">&nbsp;</div>
    <div style="font-family:${FONT};font-size:13px;color:#64748B;line-height:21px;">Questions? Call <a href="${COMPANY_CONTACT.phoneTelHref}" style="color:#E31E24;text-decoration:none;">${COMPANY_CONTACT.phoneDisplay}</a> or reply to this email.</div>
  `
  return cardRow(inner)
}

/**
 * Builds email payloads for Product Quote Requests: internal notification
 * (business) and quote confirmation (customer), sharing one card layout.
 */
export function buildQuoteEmails(
  data: QuoteEmailPayload,
  businessInbox: string,
  fromEmail = 'Karmod International <info@karmodint.co.uk>',
  siteUrl = DEFAULT_SITE_URL
): { businessEmail: EmailPayload; customerEmail: EmailPayload } {
  const { customer, items } = data
  const refNumber = data.quoteReference || `KM-${Math.floor(1000 + Math.random() * 9000)}`

  const now = new Date()
  const submittedDate = fmtDateLong(now)
  const submittedAt = `${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}, ${submittedDate}`

  const itemFinancials = items.map(computeItemFinancials)
  const hasPoaItems = items.some(i => i.isPoa)
  const productEstimate = getQuoteLinesTotal(items)

  const preparedForCardHtml = buildPreparedForCardHtml({
    customer,
    refNumber,
    submittedDate,
    showConsultant: true
  })
  const preparedForCardHtmlCustomer = buildPreparedForCardHtml({
    customer,
    refNumber,
    submittedDate,
    showConsultant: false
  })
  const itemCardsHtml = items.map(buildItemCardHtml).join(spacerRow(16))
  const logisticsCardHtml = buildLogisticsCardHtml(customer)
  const financialCardHtmlBusiness = buildFinancialSummaryCardHtml({
    items,
    itemFinancials,
    productEstimate,
    hasPoaItems,
    ctasHtml: replyButtonsHtml(customer.email, refNumber)
  })
  const financialCardHtmlCustomer = buildFinancialSummaryCardHtml({
    items,
    itemFinancials,
    productEstimate,
    hasPoaItems,
    ctasHtml: customerReplyButtonHtml(refNumber)
  })

  const itemsBlockHtml = `
    ${sectionLabelRow('Requested items &amp; customisations')}
    ${itemCardsHtml}
    ${spacerRow(16)}
    ${logisticsCardHtml}
  `

  const businessContentHtml = `
    ${buildInternalIntroCardHtml({
      eyebrow: 'Internal notification',
      title: 'New Quote Request',
      message: `Submitted via the online configurator at ${esc(submittedAt)}. Reply directly to this email to reach the customer.`,
      chipLabel: 'New inquiry'
    })}
    ${spacerRow(16)}
    ${preparedForCardHtml}
    ${spacerRow(16)}
    ${itemsBlockHtml}
    ${spacerRow(16)}
    ${financialCardHtmlBusiness}
  `

  const customerFirstName = customer.name.trim().split(/\s+/)[0] || customer.name
  const customerContentHtml = `
    ${buildCustomerIntroCardHtml({
      eyebrow: 'Request received',
      title: `Thank you, ${esc(customerFirstName)} &mdash; we received your quote request`,
      message: 'This acknowledgement summarises the products you requested. The sales team will contact you about the delivery charge after reviewing your quote request.'
    })}
    ${spacerRow(16)}
    ${preparedForCardHtmlCustomer}
    ${spacerRow(16)}
    ${itemsBlockHtml}
    ${spacerRow(16)}
    ${financialCardHtmlCustomer}
    ${spacerRow(16)}
    ${buildWhatsNextCardHtml()}
  `

  const bareDomain = siteUrl.replace(/^https?:\/\//, '')
  const quoteDisclaimer = `This message relates to a quotation request made at <a href="${siteUrl}" style="color:#8A96AB;">${bareDomain}</a>.`

  return {
    businessEmail: {
      from: fromEmail,
      to: [businessInbox],
      subject: `New Quote Request from ${customer.name} (${items.length} item${items.length > 1 ? 's' : ''})`,
      html: renderBrandedEmailTemplate({
        title: `New Quote Request &mdash; ${refNumber}`,
        preheader: `New quote request from ${customer.name}. Delivery and offload charges require sales review.`,
        contentHtml: businessContentHtml,
        footerNote: quoteDisclaimer,
        siteUrl
      }),
      replyTo: customer.email
    },
    customerEmail: {
      from: fromEmail,
      to: [customer.email],
      subject: `We received your Karmod quote request ${refNumber}`,
      html: renderBrandedEmailTemplate({
        title: `Quote Request Received &mdash; ${refNumber}`,
        preheader: `We received your quote request ${refNumber}. Our sales team will review delivery and offload requirements.`,
        contentHtml: customerContentHtml,
        footerNote: quoteDisclaimer,
        siteUrl
      }),
      replyTo: COMPANY_CONTACT.salesEmail
    }
  }
}

/**
 * Dispatches an email using the Resend API or simulates delivery in development/mock mode.
 */
export async function sendResendEmail(
  payload: EmailPayload,
  apiKey?: string
): Promise<SendEmailResult> {
  if (!apiKey || apiKey === 'dummy_resend_key' || apiKey === 'mock_resend_key') {
    console.log('[MOCK RESEND] Email dispatch simulated:', {
      to: payload.to,
      subject: payload.subject,
      from: payload.from,
      replyTo: payload.replyTo
    })
    return {
      success: true,
      simulated: true,
      id: `mock_${Date.now().toString(36)}`
    }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {})
      })
    })

    const data = await res.json()

    if (!res.ok) {
      const errorMsg = data?.message || `Resend API returned status ${res.status}: ${res.statusText}`
      console.error('[RESEND ERROR]', errorMsg, data)
      return {
        success: false,
        error: errorMsg
      }
    }

    return {
      success: true,
      id: data?.id
    }
  } catch (err: any) {
    console.error('[RESEND DISPATCH EXCEPTION]', err)
    return {
      success: false,
      error: err?.message || 'Unknown network error during email dispatch'
    }
  }
}
