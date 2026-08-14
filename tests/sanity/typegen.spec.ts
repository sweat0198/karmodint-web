import { describe, it, expect } from 'vitest'
import {
  metersToFeet,
  formatMetricAndImperialDimension,
  type SanityQuoteEnquiry,
  type SanitySizeOption
} from '../../app/types/catalog'

describe('Sanity Types & Conversion Helpers Contract Verification', () => {
  it('converts meters to feet with precision rounding', () => {
    expect(metersToFeet(1.5)).toBe(4.9)
    expect(metersToFeet(3.0)).toBe(9.8)
    expect(metersToFeet(6.0)).toBe(19.7)
  })

  it('formats metric and imperial dimension pairs for product UI display', () => {
    const dim = formatMetricAndImperialDimension(2.4)
    expect(dim.metric).toBe('2.40m')
    expect(dim.imperial).toBe('7.9ft')
  })

  it('verifies SanityQuoteEnquiry type shape against schema contract', () => {
    const validEnquiry: SanityQuoteEnquiry = {
      _type: 'quoteEnquiry',
      referenceNumber: 'KQ-1234',
      status: 'new',
      customerName: 'Test Buyer',
      email: 'test@example.com',
      phone: '07123456789',
      items: [
        {
          productTitle: 'Cabin 2.4x4',
          sizeLabel: 'Standard',
          quantity: 1,
          unitPrice: 3500,
          isPoa: false
        }
      ],
      estimatedTotal: 3500,
      hasPoa: false
    }

    expect(validEnquiry._type).toBe('quoteEnquiry')
    expect(validEnquiry.items[0].unitPrice).toBe(3500)
  })

  it('verifies SanitySizeOption structural attributes', () => {
    const size: SanitySizeOption = {
      _key: 'sz_1',
      label: '2.40m x 4.00m',
      lengthM: 4.0,
      widthM: 2.4,
      heightM: 2.5,
      price: 3200,
      isDefault: true
    }

    expect(size.lengthM).toBe(4.0)
    expect(size.isDefault).toBe(true)
  })
})
