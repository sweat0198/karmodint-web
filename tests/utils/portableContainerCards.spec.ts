import { describe, expect, it } from 'vitest'
import type { CatalogProduct } from '~/queries/catalog'
import { toPortableContainerCards } from '~/utils/portableContainerCards'

const image = {
  _key: 'front' as const,
  view: 'front' as const,
  alt: 'K1002 representative image',
  asset: { _type: 'reference' as const, _ref: 'image-k1002-representative' }
}

function container(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    _id: 'product-k1002',
    name: 'K1002 Portable Cabin',
    slug: 'k1002-portable-cabin',
    categories: [{ _id: 'category-containers', name: 'Portable Cabins', slug: 'containers' }],
    representativeImages: [{ asset: image.asset, alt: image.alt }],
    sizes: [
      {
        _key: '300x700', label: '3m × 7m', lengthM: 7, widthM: 3, price: 9000,
        isPoa: false, thumbnail: null, fallbackThumbnail: null, planImage: null, images: []
      },
      {
        _key: '300x900', label: '3m × 9m', lengthM: 9, widthM: 3, price: undefined,
        isPoa: true, thumbnail: null, fallbackThumbnail: null, planImage: null, images: []
      }
    ],
    ...overrides
  }
}

describe('toPortableContainerCards', () => {
  it('groups all configured sizes under one card even when a size has no image', () => {
    const cards = toPortableContainerCards([container()])

    expect(cards).toHaveLength(1)
    expect(cards[0].sizes.map((size) => size.sizeKey)).toEqual(['300x700', '300x900'])
    expect(cards[0].representativeImage?.asset?._ref).toBe('image-k1002-representative')
  })

  it('uses the lowest numeric configured price without treating missing prices as zero', () => {
    const cards = toPortableContainerCards([
      container({
        sizes: [
          ...container().sizes,
          {
            _key: '300x1100', label: '3m × 11m', lengthM: 11, widthM: 3, price: 12000,
            isPoa: false, thumbnail: null, fallbackThumbnail: null, planImage: null, images: []
          }
        ]
      })
    ])

    expect(cards[0].lowestPrice).toBe(9000)
    expect(cards[0].isPoaOnly).toBe(false)
  })

  it('shows POA when no configured size has a numeric price', () => {
    const cards = toPortableContainerCards([
      container({ sizes: [container().sizes[1]] })
    ])

    expect(cards[0].lowestPrice).toBeUndefined()
    expect(cards[0].isPoaOnly).toBe(true)
  })

  it('falls back to an available size render when product-level representative media is absent', () => {
    const fallback = { ...image, asset: { _type: 'reference' as const, _ref: 'image-k1002-fallback' } }
    const cards = toPortableContainerCards([
      container({
        representativeImages: [],
        sizes: [{ ...container().sizes[0]!, thumbnail: null, fallbackThumbnail: fallback }]
      })
    ])

    expect(cards[0].representativeImage?.asset?._ref).toBe('image-k1002-fallback')
  })

  it('keeps distinct portable-container models as distinct cards and excludes other categories', () => {
    const cards = toPortableContainerCards([
      container(),
      container({ _id: 'product-k2004', name: 'K2004 Portable Cabin', slug: 'k2004-portable-cabin' }),
      container({
        _id: 'product-kiosk',
        categories: [{ _id: 'category-kiosks', name: 'Kiosks', slug: 'kiosks' }]
      })
    ])

    expect(cards.map((card) => card.productId)).toEqual(['product-k1002', 'product-k2004'])
  })
})
