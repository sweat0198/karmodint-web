import { describe, it, expect } from 'vitest'
import { executeGroq } from '../utils/groqRunner'
import { CATEGORY_TREE_QUERY, PRODUCTS_WITH_SIZES_QUERY } from '~/queries/catalog'
import { REFERENCES_QUERY } from '~/queries/references'
import { mockSanityDataset, mockProducts, mockSizeImage } from '../fixtures/sanityData'

describe('Sanity GROQ Query Evaluation (SSG Data Fetching)', () => {
  it('normalises legacy category names for the UK catalogue UI', async () => {
    const legacyDataset = [
      {
        _id: 'category-containers',
        _type: 'category',
        name: 'Containers',
        slug: { current: 'containers' },
        displayOrder: 1
      },
      {
        _id: 'category-cabin',
        _type: 'category',
        name: 'Cabin',
        slug: { current: 'cabin' },
        displayOrder: 2
      },
      {
        _id: 'product-legacy-category',
        _type: 'product',
        name: 'Legacy Category Product',
        slug: { current: 'legacy-category-product' },
        status: 'published',
        categories: [{ _ref: 'category-cabin' }],
        sizes: [{
          _key: 'default',
          label: '1m x 1m',
          lengthM: 1,
          widthM: 1,
          price: 1,
          isPoa: false,
          isDefault: true,
          images: [{
            _key: 'front',
            view: 'front',
            alt: 'Legacy category product front view',
            asset: { _ref: 'image-legacy-category' }
          }]
        }]
      }
    ]

    const tree = await executeGroq<any[]>(CATEGORY_TREE_QUERY, {}, legacyDataset)
    expect(tree.map((category) => category.name)).toEqual(['Portable Cabins', 'Gatehouses & Kiosks'])
    expect(tree[0].children).toEqual([])

    const products = await executeGroq<any[]>(PRODUCTS_WITH_SIZES_QUERY, {}, legacyDataset)
    expect(products.flatMap((product) => product.categories.map((category: any) => category.name))).toContain(
      'Gatehouses & Kiosks'
    )
  })

  // No isActive field exists on the category schema; filtering on it only ever passed because the
  // fixtures invented one. Categories are listed by display order alone.
  it('fetches all categories ordered by sort weight', async () => {
    const query = `*[_type == "category"] | order(displayOrder asc) {
      _id,
      name,
      "slug": slug.current,
      description
    }`

    const results = await executeGroq<any[]>(query)
    expect(results).toHaveLength(2)
    expect(results[0].slug).toBe('portable-cabins')
    expect(results[1].slug).toBe('kiosks')
  })

  it('fetches catalog product cards with expanded category name', async () => {
    const query = `*[_type == "product" && status == "published"] {
      _id,
      name,
      "slug": slug.current,
      status,
      "categories": categories[]->name,
      "minPrice": math::min(sizes[isPoa != true].price),
      "sizeCount": count(sizes),
      "thumbnail": sizes[isDefault == true][0].images[0]
    }`

    const results = await executeGroq<any[]>(query)
    expect(results).toHaveLength(2)

    const gatehouse = results.find((p) => p.slug === '1-50m-x-1-50m-security-cabin')
    expect(gatehouse).toBeDefined()
    expect(gatehouse.categories).toContain('Portable Cabins')
    expect(gatehouse.sizeCount).toBe(2)

    // The extended size is POA with a placeholder price of 0. Excluding it is what keeps the card
    // from advertising "From £0".
    expect(gatehouse.minPrice).toBe(2450)

    // Card thumbnails resolve through the default size, which is why exactly one is mandated.
    expect(gatehouse.thumbnail.view).toBe('front')
    expect(gatehouse.thumbnail.asset._ref).toBe('image-gatehouse150-front-png')
  })

  it('fetches single product detail by slug with resolved customization groups', async () => {
    const query = `*[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      "slug": slug.current,
      categories[]->{
        name,
        "slug": slug.current
      },
      sizes[] {
        _key,
        label,
        lengthM,
        widthM,
        heightM,
        weightKg,
        price,
        isPoa,
        isDefault,
        images[] {
          _key,
          view,
          alt,
          caption,
          asset
        }
      },
      customizationGroups[]-> {
        _id,
        title,
        "identifier": identifier.current,
        selectionType,
        items[] {
          _key,
          title,
          pricingType,
          price,
          requiresTextInput
        }
      },
      seo
    }`

    const product = await executeGroq<any>(query, { slug: '1-50m-x-1-50m-security-cabin' })

    expect(product).toBeDefined()
    expect(product.name).toBe('1.50m x 1.50m Security Gatehouse Cabin')
    expect(product.categories[0].name).toBe('Portable Cabins')
    expect(product.sizes).toHaveLength(2)
    expect(product.customizationGroups).toHaveLength(2)

    // The guarantee the schema restructure exists to provide: a size's gallery is reachable only
    // through that size, so it cannot surface another size's renders.
    const [compact, extended] = product.sizes
    expect(compact.images).toHaveLength(3)
    expect(extended.images).toHaveLength(2)

    const compactRefs = compact.images.map((i: any) => i.asset._ref)
    const extendedRefs = extended.images.map((i: any) => i.asset._ref)
    expect(compactRefs.some((ref: string) => extendedRefs.includes(ref))).toBe(false)

    // Exactly one plan view per size, keyed by view name.
    expect(compact.images.filter((i: any) => i.view === 'top')).toHaveLength(1)
    expect(extended.images.filter((i: any) => i.view === 'top')).toHaveLength(1)
    expect(compact.images.map((i: any) => i._key)).toEqual(['front', 'interior', 'top'])

    // 0 kg is the "not yet supplied" sentinel, not a weightless cabin.
    expect(compact.weightKg).toBe(280)
    expect(extended.weightKg).toBe(0)
    expect(extended.isPoa).toBe(true)

    const elecGroup = product.customizationGroups.find((g: any) => g.identifier === 'electricity')
    expect(elecGroup).toBeDefined()
    expect(elecGroup.items).toHaveLength(2)
    expect(elecGroup.items[0].pricingType).toBe('fixed')
    expect(elecGroup.items[0].price).toBe(350)
  })

  it('fetches quote enquiry record by reference number', async () => {
    const query = `*[_type == "quoteEnquiry" && referenceNumber == $ref][0] {
      referenceNumber,
      status,
      customerName,
      email,
      estimatedTotal,
      hasPoa,
      "itemCount": count(items)
    }`

    const enquiry = await executeGroq<any>(query, { ref: 'KQ-TEST01' })
    expect(enquiry).toBeDefined()
    expect(enquiry.customerName).toBe('John Smith')
    expect(enquiry.estimatedTotal).toBe(4900)
    expect(enquiry.itemCount).toBe(1)
  })

  describe('catalog fan-out query (app/queries/catalog.ts)', () => {
    it('projects Product customization configurations with resolved reusable groups and overrides', async () => {
      const configuredProduct = {
        ...mockProducts[0],
        _id: 'product-configured-customization',
        customizationConfigurations: [{
          _key: 'electricity-config',
          group: { _ref: 'group_electrical' },
          itemOverrides: [{
            _key: 'disable-premium',
            itemKey: 'opt_prem_elec',
            enabled: false,
            titleOverride: 'Premium electrical package',
            descriptionOverride: 'Equipment matched to this Product.',
            sizeRules: [{
              _key: 'small-cabin-rule',
              sizeOptionKey: mockProducts[0].sizes[0]._key,
              mode: 'unavailable',
              review: { status: 'reviewed', snapshot: 'Small cabin does not offer this package.' }
            }]
          }]
        }]
      }

      const electricalGroup = mockSanityDataset.find((document) => document._id === 'group_electrical')!
      const scopedElectricalGroup = {
        ...electricalGroup,
        items: electricalGroup.items.map((item: any) => ({ ...item, scope: 'universal' }))
      }
      const dataset = [
        ...mockSanityDataset.filter((document) => document._id !== electricalGroup._id),
        scopedElectricalGroup,
        configuredProduct
      ]
      const results = await executeGroq<any[]>(PRODUCTS_WITH_SIZES_QUERY, {}, dataset)
      const product = results.find((candidate) => candidate._id === configuredProduct._id)

      expect(product.customizationConfigurations).toEqual([
        expect.objectContaining({
          _key: 'electricity-config',
          group: expect.objectContaining({
            _id: 'group_electrical',
            title: 'Electrical & Lighting Package',
            items: expect.arrayContaining([expect.objectContaining({ scope: 'universal' })])
          }),
          itemOverrides: [expect.objectContaining({
            _key: 'disable-premium',
            itemKey: 'opt_prem_elec',
            enabled: false,
            titleOverride: 'Premium electrical package',
            descriptionOverride: 'Equipment matched to this Product.',
            sizeRules: [expect.objectContaining({
              _key: 'small-cabin-rule',
              sizeOptionKey: mockProducts[0].sizes[0]._key,
              mode: 'unavailable',
              review: { status: 'reviewed', snapshot: 'Small cabin does not offer this package.' }
            })]
          })]
        })
      ])
    })

    it('excludes a drafts.* twin of a published product', async () => {
      const draftTwin = { ...mockProducts[0], _id: `drafts.${mockProducts[0]._id}` }
      const dataset = [...mockSanityDataset, draftTwin]

      const results = await executeGroq<any[]>(PRODUCTS_WITH_SIZES_QUERY, {}, dataset)

      expect(results.filter((p) => p.name === mockProducts[0].name)).toHaveLength(1)
      expect(results.some((p: any) => p._id.startsWith('drafts.'))).toBe(false)
    })

    it('selects the thumbnail by view name, not array position', async () => {
      const withDiagonal = {
        ...mockProducts[0],
        _id: 'prod_with_diagonal',
        sizes: [
          {
            ...mockProducts[0].sizes[0],
            images: [
              mockSizeImage('front', 'image-front-leading', 'front view'),
              mockSizeImage('left-diagonal', 'image-diagonal', 'three-quarter view')
            ]
          }
        ]
      }
      const dataset = [...mockSanityDataset, withDiagonal]

      const results = await executeGroq<any[]>(PRODUCTS_WITH_SIZES_QUERY, {}, dataset)
      const product = results.find((p: any) => p._id === 'prod_with_diagonal')

      expect(product).toBeDefined()
      // "front" is first in the array, but "left-diagonal" is named, so it wins the projection.
      expect(product.sizes[0].thumbnail.view).toBe('left-diagonal')
      expect(product.sizes[0].thumbnail.asset._ref).toBe('image-diagonal')
      expect(product.sizes[0].fallbackThumbnail.asset._ref).toBe('image-front-leading')
    })

    it('excludes the plan view from the carousel images, keeping every other angle', async () => {
      const results = await executeGroq<any[]>(PRODUCTS_WITH_SIZES_QUERY)
      const gatehouse = results.find((p: any) => p.slug === '1-50m-x-1-50m-security-cabin')

      // The fixture size carries front + interior + top; only the plan drawing is dropped.
      expect(gatehouse.sizes[0].images.map((i: any) => i.view)).toEqual(['front', 'interior'])
    })

    it('carries portable representative images and every configured size without floor-plan-only data', async () => {
      const container = {
        _id: 'product-k1002',
        _type: 'product',
        name: 'K1002 Portable Cabin',
        slug: { current: 'k1002-portable-cabin' },
        status: 'published',
        categories: [{ _ref: 'category-containers' }],
        representativeImages: [mockSizeImage('front', 'image-k1002-shared', 'K1002 representative view')],
        sizes: [
          {
            _key: '300x700', label: '3m × 7m', lengthM: 7, widthM: 3, price: 9000,
            isPoa: false, images: []
          },
          {
            _key: '300x900', label: '3m × 9m', lengthM: 9, widthM: 3, price: 0,
            isPoa: true, images: [mockSizeImage('top', 'image-k1002-900-plan', 'K1002 3m × 9m plan')]
          }
        ]
      }

      const results = await executeGroq<any[]>(
        PRODUCTS_WITH_SIZES_QUERY,
        {},
        [...mockSanityDataset, {
          _id: 'category-containers', _type: 'category', name: 'Portable Cabins',
          slug: { current: 'containers' }, displayOrder: 1
        }, container]
      )
      const result = results.find((product) => product._id === container._id)

      expect(result.representativeImages.map((image: any) => image.asset._ref)).toEqual([
        'image-k1002-shared'
      ])
      expect(result.sizes).toHaveLength(2)
      expect(result.sizes[0]).not.toHaveProperty('planImage')
      expect(result.sizes[1]).not.toHaveProperty('planImage')
      expect(result.sizes[1].images).toEqual([])
    })
  })
})

describe('homepage references query', () => {
  it('excludes drafts and puts unordered references last alphabetically', async () => {
    const dataset = [
      {
        _id: 'reference-zulu',
        _type: 'clientReference',
        companyName: 'Zulu Ltd',
        displayOrder: 20,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-zulu-100x50-png' } }
      },
      {
        _id: 'reference-beta',
        _type: 'clientReference',
        companyName: 'Beta Ltd',
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-beta-100x50-png' } }
      },
      {
        _id: 'reference-alpha',
        _type: 'clientReference',
        companyName: 'Alpha Ltd',
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-alpha-100x50-png' } }
      },
      {
        _id: 'drafts.reference-first',
        _type: 'clientReference',
        companyName: 'Draft Ltd',
        displayOrder: 10,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-draft-100x50-png' } }
      }
    ]

    const results = await executeGroq<any[]>(REFERENCES_QUERY, {}, dataset)

    expect(results.map((reference) => reference.companyName)).toEqual([
      'Zulu Ltd',
      'Alpha Ltd',
      'Beta Ltd'
    ])
    expect(results.some((reference) => reference._id.startsWith('drafts.'))).toBe(false)
    expect(results[0].logo.asset._ref).toBe('image-zulu-100x50-png')
  })
})
