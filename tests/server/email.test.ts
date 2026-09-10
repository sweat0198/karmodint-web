import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  renderBrandedEmailTemplate,
  buildContactEmails,
  buildQuoteEmails,
  sendResendEmail,
  type ContactEnquiryPayload,
  type QuoteEmailPayload
} from '~~/server/utils/email'

describe('Email Utility & Template Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('renderBrandedEmailTemplate', () => {
    it('generates HTML with header, footer, and styling', () => {
      const html = renderBrandedEmailTemplate({
        title: 'New Enquiry',
        preheader: 'Important enquiry details',
        contentHtml: '<p>Hello world</p>',
        footerNote: 'Automated notification'
      })

      expect(html).toContain('Karmod International')
      expect(html).toContain('New Enquiry')
      expect(html).toContain('Hello world')
      expect(html).toContain('Automated notification')
      expect(html).toContain('#121C2A') // Brand navy (site token)
      expect(html).toContain('#E31E24') // Brand red (site token)
    })
  })

  describe('buildContactEmails', () => {
    const contactData: ContactEnquiryPayload = {
      fullName: 'Alice Smith',
      companyName: 'Acme Developments',
      email: 'alice@acme.co.uk',
      phone: '+44 7123 456789',
      details: 'Need 3 security gatehouses by next month.'
    }

    it('builds business notification email', () => {
      const { businessEmail, customerEmail } = buildContactEmails(
        contactData,
        'enquiries@karmod-international.com'
      )

      expect(businessEmail.to).toEqual(['enquiries@karmod-international.com'])
      expect(businessEmail.subject).toContain('New Project Consultation: Alice Smith')
      expect(businessEmail.html).toContain('Alice Smith')
      expect(businessEmail.html).toContain('Acme Developments')
      expect(businessEmail.html).toContain('+44 7123 456789')
      expect(businessEmail.html).toContain('Need 3 security gatehouses')

      expect(customerEmail.to).toEqual(['alice@acme.co.uk'])
      expect(customerEmail.subject).toContain('Thank you for contacting Karmod International')
      expect(customerEmail.html).toContain('Alice Smith')
    })
  })

  describe('buildQuoteEmails', () => {
    const quoteData: QuoteEmailPayload = {
      customer: {
        name: 'Bob Johnson',
        email: 'bob@builds.co.uk',
        phone: '+44 7987 654321',
        company: 'Johnson Ltd',
        address: {
          formattedAddress: '10 High Street, Nottingham, NG1 1AA',
          postcode: 'NG1 1AA'
        },
        notes: 'Forklift required for offloading',
      },
      items: [
        {
          productName: 'Executive Modular Gatehouse 3x7m',
          sizeLabel: 'Standard Premium',
          quantity: 2,
          basePrice: 12500,
          customTotal: 12500,
          notes: 'Anthracite frame'
        }
      ]
    }

    it('builds quote notification for business and receipt for customer', () => {
      const { businessEmail, customerEmail } = buildQuoteEmails(
        quoteData,
        'quotes@karmod-international.com'
      )

      expect(businessEmail.to).toEqual(['quotes@karmod-international.com'])
      expect(businessEmail.subject).toContain('New Quote Request from Bob Johnson (1 item)')
      expect(businessEmail.html).toContain('Executive Modular Gatehouse')
      expect(businessEmail.html).toContain('£25,000')
      expect(businessEmail.html).toContain('Product estimate (ex. VAT)')
      expect(businessEmail.html).toContain('Pending sales review')
      expect(businessEmail.html).toContain('10 High Street, Nottingham, NG1 1AA')

      expect(customerEmail.to).toEqual(['bob@builds.co.uk'])
      expect(customerEmail.subject).toContain('We received your Karmod quote request')
      expect(customerEmail.html).toContain('Executive Modular Gatehouse')
      expect(customerEmail.html).toContain('The sales team will contact you about the delivery charge after reviewing your quote request.')
      expect(customerEmail.html).toContain('Product estimate (ex. VAT)')

      for (const email of [businessEmail, customerEmail]) {
        expect(email.html).not.toContain('45.2 miles')
        expect(email.html).not.toContain('&pound;450.00')
        expect(email.html).not.toContain('VAT @ 20%')
        expect(email.html).not.toContain('Total balance')
        expect(email.html).not.toContain('Valid until')
        expect(email.html).not.toContain('Accept Quote')
        expect(email.html).not.toContain('Download PDF')
      }
    })

    it('itemises selected variant modifiers and includes their contribution in the line total', () => {
      const { businessEmail, customerEmail } = buildQuoteEmails(
        {
          customer: quoteData.customer,
          items: [
            {
              productName: 'Executive Modular Gatehouse 3x7m',
              sizeLabel: 'Standard Premium',
              quantity: 1,
              basePrice: 10000,
              customTotal: 10450,
              selectedCustomizations: [
                { groupTitle: 'Electrical', optionTitle: '2x Double sockets', price: 250 },
                { groupTitle: 'HVAC', optionTitle: '2kW Wall heater', price: 200 }
              ]
            }
          ]
        },
        'quotes@karmod-international.com'
      )

      for (const email of [businessEmail, customerEmail]) {
        expect(email.html).toContain('Customisations &amp; add-ons')
        expect(email.html).toContain('Electrical: 2x Double sockets')
        expect(email.html).toContain('HVAC: 2kW Wall heater')
        expect(email.html).toContain('£250')
        expect(email.html).toContain('£200')
        // Modifiers are already folded into customTotal, so the line total must not double-count them.
        expect(email.html).toContain('£10,450')
        expect(email.html).not.toContain('£10,700')
      }
    })

    it('quotes the customized total, not the price captured when the item was added', () => {
      const { businessEmail, customerEmail } = buildQuoteEmails(
        {
          customer: quoteData.customer,
          items: [
            {
              productName: 'Executive Modular Gatehouse 3x7m',
              sizeLabel: 'Standard Premium',
              quantity: 2,
              basePrice: 10000,
              customTotal: 12500,
              notes: 'Anthracite frame'
            }
          ]
        },
        'quotes@karmod-international.com'
      )

      for (const email of [businessEmail, customerEmail]) {
        expect(email.html).toContain('£25,000')
        expect(email.html).not.toContain('£20,000')
      }
    })

    it('renders POA and priced lines with the same wording as the Quote List page for a mixed-POA enquiry', () => {
      const { businessEmail, customerEmail } = buildQuoteEmails(
        {
          customer: quoteData.customer,
          items: [
            {
              productName: 'Executive Modular Gatehouse 3x7m',
              sizeLabel: 'Standard Premium',
              quantity: 2,
              basePrice: 12500,
              customTotal: 12500
            },
            {
              productName: 'Bespoke Security Cabin',
              sizeLabel: 'Custom',
              quantity: 1,
              isPoa: true
            }
          ]
        },
        'quotes@karmod-international.com'
      )

      for (const email of [businessEmail, customerEmail]) {
        // Priced line: per-line price and per-line total match getTotalLabel's wording.
        expect(email.html).toContain('£25,000')
        expect(email.html).toContain('£12,500')

        // POA line: getQuoteLineFinancials has no price to report, so getTotalLabel renders
        // the placeholder total with the additive "+ POA" suffix — same as the Quote List page.
        expect(email.html).toContain('£0 + POA')

        // Enquiry summary total: some lines priced, one wholly POA -> "Part POA" (getPartialTotalLabel).
        expect(email.html).toContain('Part POA')
        expect(email.html).not.toContain('£25,000 + POA')
      }
    })
  })

  describe('sendResendEmail', () => {
    it('runs in mock mode when no apiKey provided', async () => {
      const result = await sendResendEmail(
        {
          from: 'test@karmod.co.uk',
          to: ['target@test.com'],
          subject: 'Test Email',
          html: '<p>Test</p>'
        },
        ''
      )

      expect(result.simulated).toBe(true)
      expect(result.success).toBe(true)
    })

    it('sends POST request to api.resend.com when apiKey provided', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'resend_email_123' })
      })
      globalThis.fetch = mockFetch

      const result = await sendResendEmail(
        {
          from: 'test@karmod.co.uk',
          to: ['target@test.com'],
          subject: 'Test Email',
          html: '<p>Test</p>'
        },
        're_test_key'
      )

      expect(result.success).toBe(true)
      expect(result.id).toBe('resend_email_123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer re_test_key',
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })
})
