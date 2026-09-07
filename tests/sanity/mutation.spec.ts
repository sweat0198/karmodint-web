import { describe, it, expect } from 'vitest'
import {
  buildSanityQuoteEnquiry,
  generateReferenceNumber,
  type QuoteEnquiryInput
} from '../../server/utils/sanityLead'

describe('Sanity Quote Enquiry Mutation Builder', () => {
  it('generates a unique reference number with prefix KQ-', () => {
    const ref1 = generateReferenceNumber()
    const ref2 = generateReferenceNumber()

    expect(ref1).toMatch(/^KQ-[A-Z0-9]+$/)
    expect(ref2).toMatch(/^KQ-[A-Z0-9]+$/)
    expect(ref1).not.toBe(ref2)
  })

  it('builds a valid Sanity quoteEnquiry document with fixed-price items', () => {
    const input: QuoteEnquiryInput = {
      customer: {
        name: 'Sarah Connor',
        email: 'sarah@skynet-defence.co.uk',
        phone: '+44 7911 123456',
        company: 'Cyberdyne Systems',
        deliveryLocation: 'London EC1A 1BB',
        notes: 'Need forklift unloading service.'
      },
      items: [
        {
          productId: 'prod_kiosk_150x150',
          productName: '1.50m x 1.50m Security Gatehouse Cabin',
          sizeLabel: '1.50m x 1.50m (Compact)',
          quantity: 2,
          basePrice: 2450,
          isPoa: false,
          selectedCustomizations: [
            {
              groupTitle: 'Electrical',
              optionTitle: 'Standard UK Electrical Package',
              price: 350,
              isPoa: false
            }
          ]
        }
      ]
    }

    const doc = buildSanityQuoteEnquiry(input)

    expect(doc._type).toBe('quoteEnquiry')
    expect(doc.status).toBe('new')
    expect(doc.customerName).toBe('Sarah Connor')
    expect(doc.email).toBe('sarah@skynet-defence.co.uk')
    expect(doc.company).toBe('Cyberdyne Systems')
    expect(doc.estimatedTotal).toBe(4900)
    expect(doc.hasPoa).toBe(false)
    expect(doc.items).toHaveLength(1)

    const item = doc.items[0]
    expect(item.productTitle).toBe('1.50m x 1.50m Security Gatehouse Cabin')
    expect(item.product?._ref).toBe('prod_kiosk_150x150')
    expect(item.quantity).toBe(2)
    expect(item.subtotal).toBe(4900)
    expect(item.selectedCustomizations).toHaveLength(1)
  })

  it('flags hasPoa = true when an item or customization is POA', () => {
    const input: QuoteEnquiryInput = {
      customer: {
        name: 'James Bond',
        email: '007@mi6.gov.uk',
        phone: '+44 20 7946 0007'
      },
      items: [
        {
          productName: 'Bespoke Armoured Blast Cabin',
          sizeLabel: 'Custom Spec',
          quantity: 1,
          isPoa: true,
          selectedCustomizations: [
            {
              groupTitle: 'HVAC',
              optionTitle: 'Bespoke Industrial HVAC Installation',
              isPoa: true
            }
          ]
        }
      ]
    }

    const doc = buildSanityQuoteEnquiry(input)

    expect(doc.hasPoa).toBe(true)
    expect(doc.estimatedTotal).toBe(0)
    expect(doc.items[0].isPoa).toBe(true)
  })

  it('reads POA and price for a mixed enquiry from the shared Quote Line rule, not an inferred missing price', () => {
    const input: QuoteEnquiryInput = {
      customer: {
        name: 'Ellen Ripley',
        email: 'ripley@weyland-yutani.co.uk',
        phone: '+44 20 7946 0011'
      },
      items: [
        {
          productId: 'prod_office_20ft',
          productName: 'Site Office Cabin 20ft',
          sizeLabel: '2.40m x 6.00m (Standard)',
          quantity: 2,
          basePrice: 1000,
          isPoa: false
        },
        {
          productId: 'prod_blast_cabin',
          productName: 'Bespoke Armoured Blast Cabin',
          sizeLabel: 'Custom Spec',
          quantity: 1,
          basePrice: 500,
          isPoa: true
        }
      ]
    }

    const doc = buildSanityQuoteEnquiry(input)

    // The POA line carries a placeholder price, so an inference from a missing price would miss
    // it — the flag must come from the stored `isPoa`, matching the shared Quote Line rule the
    // emails already use.
    expect(doc.hasPoa).toBe(true)
    expect(doc.items[0].isPoa).toBe(false)
    expect(doc.items[0].subtotal).toBe(2000)
    expect(doc.items[1].isPoa).toBe(true)
    expect(doc.items[1].subtotal).toBe(500)
    expect(doc.estimatedTotal).toBe(2500)
  })
})
