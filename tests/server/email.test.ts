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
        deliveryLocation: 'LE14 4AJ',
        notes: 'Forklift required for offloading',
        deliveryEstimate: {
          miles: 45.2,
          km: 72.7,
          duration: '52 mins',
          originPostcode: 'LE14 4AJ',
          destinationPostcode: 'NG1 1AA'
        }
      },
      items: [
        {
          productName: 'Executive Modular Gatehouse 3x7m',
          variantLabel: 'Standard Premium',
          quantity: 2,
          unitPrice: 12500,
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
      expect(businessEmail.html).toContain('45.2 miles')
      expect(businessEmail.html).toContain('25,000.00')

      expect(customerEmail.to).toEqual(['bob@builds.co.uk'])
      expect(customerEmail.subject).toContain('Your Karmod quote')
      expect(customerEmail.html).toContain('Executive Modular Gatehouse')
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
