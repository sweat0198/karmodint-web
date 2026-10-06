import { describe, expect, it } from 'vitest'
import type { CatalogProduct } from '~/queries/catalog'
import { catalogCardSchemaInput, toCatalogDisplayCards } from '~/utils/catalogCards'

const render = (ref: string) => ({
  _key: 'left-diagonal' as const,
  view: 'left-diagonal' as const,
  alt: 'render',
  asset: { _type: 'reference' as const, _ref: ref }
})

const grpKiosk: CatalogProduct = {
  _id: 'prod-grp',
  name: 'GRP Kiosk',
  slug: 'grp-kiosk',
  categories: [{ _id: 'category-cabin-grp', name: 'GRP', slug: 'grp' }],
  representativeImages: [],
  sizes: [
    {
      _key: '150x150', label: '1.5 × 1.5', lengthM: 1.5, widthM: 1.5, heightM: 2.4, price: 2450,
      isPoa: false, thumbnail: render('image-grp150-900x600-png'), fallbackThumbnail: null, images: []
    },
    {
      _key: '390x1230', label: '3.9 × 12.3', lengthM: 12.3, widthM: 3.9, price: 0,
      isPoa: true, thumbnail: render('image-grp390-900x600-png'), fallbackThumbnail: null, images: []
    }
  ]
}

const container: CatalogProduct = {
  _id: 'prod-k1002',
  name: 'K1002 Portable Cabin',
  slug: 'k1002',
  categories: [{ _id: 'category-containers', name: 'Portable Cabins', slug: 'containers' }],
  representativeImages: [{ asset: { _type: 'reference', _ref: 'image-k1002-900x600-jpg' }, alt: 'K1002' }],
  sizes: [
    { _key: 'a', label: '3 × 7', lengthM: 7, widthM: 3, isPoa: true, thumbnail: null, fallbackThumbnail: null, images: [] }
  ]
}

describe('toCatalogDisplayCards', () => {
  it('builds the catalogue’s cards: one per container model, one per size otherwise', () => {
    const cards = toCatalogDisplayCards([grpKiosk, container])

    expect(cards.map((card) => card.cardId)).toEqual([
      'portable-prod-k1002',
      'prod-grp-150x150',
      'prod-grp-390x1230'
    ])
  })
})

describe('catalogCardSchemaInput', () => {
  it('names a size card by product and footprint, and keeps its price', () => {
    const [small] = toCatalogDisplayCards([grpKiosk])

    expect(catalogCardSchemaInput(small)).toMatchObject({
      name: 'GRP Kiosk 5ft × 5ft (1.50m × 1.50m)',
      imageRef: 'image-grp150-900x600-png',
      price: 2450,
      isPoa: false
    })
  })

  it('marks a POA size as POA', () => {
    const [, large] = toCatalogDisplayCards([grpKiosk])
    expect(catalogCardSchemaInput(large)).toMatchObject({ isPoa: true })
  })

  it('describes a container model by its lowest price and representative image', () => {
    const [card] = toCatalogDisplayCards([container])

    expect(catalogCardSchemaInput(card)).toEqual({
      name: 'K1002 Portable Cabin',
      imageRef: 'image-k1002-900x600-jpg',
      price: undefined,
      isPoa: true,
      specs: []
    })
  })
})
