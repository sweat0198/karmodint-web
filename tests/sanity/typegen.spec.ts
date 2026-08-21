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
      weightKg: 550,
      isPoa: false,
      price: 3200,
      isDefault: true,
      images: [
        {
          _key: 'front',
          _type: 'image',
          view: 'front',
          alt: 'Cabin 2.40m x 4.00m, front view',
          asset: { _ref: 'image-abc-png', _type: 'reference' }
        },
        {
          _key: 'top',
          _type: 'image',
          view: 'top',
          alt: 'Cabin 2.40m x 4.00m, plan view from above',
          asset: { _ref: 'image-def-png', _type: 'reference' }
        }
      ]
    }

    expect(size.lengthM).toBe(4.0)
    expect(size.isDefault).toBe(true)
    expect(size.images.map((i) => i.view)).toEqual(['front', 'top'])
  })

  it('models a POA size whose weight is the unsupplied sentinel', () => {
    const size: SanitySizeOption = {
      _key: 'sz_poa',
      label: '2.70m x 2.70m',
      lengthM: 2.7,
      widthM: 2.7,
      weightKg: 0,
      isPoa: true,
      price: 0,
      images: [
        {
          _key: 'top',
          _type: 'image',
          view: 'top',
          alt: 'Cabin 2.70m x 2.70m, plan view from above',
          asset: { _ref: 'image-ghi-png', _type: 'reference' }
        }
      ]
    }

    expect(size.isPoa).toBe(true)
    expect(size.weightKg).toBe(0)
    expect(size.heightM).toBeUndefined()
  })
})
