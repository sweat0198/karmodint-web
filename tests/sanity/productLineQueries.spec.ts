import { describe, it, expect } from 'vitest'
import { executeGroq } from '../utils/groqRunner'
import { mockProducts, mockSanityDataset } from '../fixtures/sanityData'
import {
  PRODUCT_LINE_BY_PATH_QUERY,
  PRODUCT_LINE_PATHS_QUERY,
  PRODUCT_LINES_NAV_QUERY,
  PRODUCTS_IN_CATEGORIES_QUERY,
  productLineCategoryIds
} from '~/queries/productLines'

const cover = (ref: string) => ({
  _type: 'image',
  alt: 'cover',
  asset: { _type: 'reference', _ref: ref }
})

const subcategory = {
  _id: 'cat_cabins_grp',
  _type: 'category',
  name: 'GRP',
  slug: { _type: 'slug', current: 'grp' },
  parent: { _type: 'reference', _ref: 'cat_cabins' },
  displayOrder: 1
}

const grpProduct = {
  ...mockProducts[0],
  _id: 'prod_grp_kiosk',
  name: 'GRP Kiosk',
  slug: { _type: 'slug', current: 'grp-kiosk' },
  categories: [{ _type: 'reference', _ref: 'cat_cabins_grp' }]
}

const hub = {
  _id: 'productLine-portable-cabin',
  _type: 'productLine',
  name: 'Portable Cabin',
  path: '/portable-cabin/',
  description: 'Hub copy.',
  coverImage: cover('image-hub-1600x900-jpg'),
  body: [],
  displayOrder: 20
}

const child = {
  _id: 'productLine-steel-cabin',
  _type: 'productLine',
  name: 'Steel Cabin',
  path: '/portable-cabin/steel-cabin/',
  parent: { _type: 'reference', _ref: hub._id },
  category: { _type: 'reference', _ref: 'cat_cabins' },
  description: 'Steel copy.',
  coverImage: cover('image-steel-1600x900-jpg'),
  body: [{ _type: 'block', _key: 'b0', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's0', text: 'Copy.', marks: [] }] }],
  faqs: [
    {
      _key: 'faq-0',
      _type: 'faqItem',
      question: 'What is it?',
      answer: [{ _type: 'block', _key: 'a0', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's0', text: 'A cabin.', marks: [] }] }]
    }
  ],
  displayOrder: 30,
  seo: { metaTitle: 'Steel Cabin for Sale UK', metaDescription: 'Legacy description.' }
}

const dataset = [
  ...mockSanityDataset,
  subcategory,
  grpProduct,
  hub,
  child,
  { ...child, _id: 'drafts.productLine-steel-cabin', name: 'Draft name' }
]

describe('Product Line GROQ queries', () => {
  describe('PRODUCT_LINE_PATHS_QUERY', () => {
    it('lists every published Product Line path once, drafts excluded', async () => {
      const paths = await executeGroq<string[]>(PRODUCT_LINE_PATHS_QUERY, {}, dataset)
      expect(paths.sort()).toEqual(['/portable-cabin/', '/portable-cabin/steel-cabin/'])
    })
  })

  describe('PRODUCT_LINES_NAV_QUERY', () => {
    it('lists published Product Lines by display order, with the category and parent the menus match on', async () => {
      const lines = await executeGroq<any[]>(PRODUCT_LINES_NAV_QUERY, {}, [
        ...dataset,
        { ...hub, _id: 'productLine-modular-buildings', name: 'Modular Buildings', path: '/modular-buildings/', displayOrder: 10 }
      ])

      expect(lines).toEqual([
        { _id: 'productLine-modular-buildings', name: 'Modular Buildings', path: '/modular-buildings/', categoryId: null, hasParent: false },
        { _id: 'productLine-portable-cabin', name: 'Portable Cabin', path: '/portable-cabin/', categoryId: null, hasParent: false },
        { _id: 'productLine-steel-cabin', name: 'Steel Cabin', path: '/portable-cabin/steel-cabin/', categoryId: 'cat_cabins', hasParent: true }
      ])
    })
  })

  describe('PRODUCT_LINE_BY_PATH_QUERY', () => {
    it('resolves the published Product Line at a path with its page fields', async () => {
      const line = await executeGroq<any>(
        PRODUCT_LINE_BY_PATH_QUERY,
        { path: '/portable-cabin/steel-cabin/' },
        dataset
      )

      expect(line).toMatchObject({
        _id: 'productLine-steel-cabin',
        name: 'Steel Cabin',
        path: '/portable-cabin/steel-cabin/',
        description: 'Steel copy.',
        seo: { metaTitle: 'Steel Cabin for Sale UK', metaDescription: 'Legacy description.' }
      })
      expect(line.coverImage.asset._ref).toBe('image-steel-1600x900-jpg')
      expect(line.body[0].children[0].text).toBe('Copy.')
      expect(line.faqs[0].question).toBe('What is it?')
      expect(line.faqs[0].answer[0].children[0].text).toBe('A cabin.')
    })

    it('carries the parent chain for breadcrumbs', async () => {
      const line = await executeGroq<any>(
        PRODUCT_LINE_BY_PATH_QUERY,
        { path: '/portable-cabin/steel-cabin/' },
        dataset
      )
      expect(line.parent).toMatchObject({ name: 'Portable Cabin', path: '/portable-cabin/' })
      expect(line.parent.parent).toBeNull()
    })

    it('carries the category with its catalogue filter slugs and published subcategory ids', async () => {
      const line = await executeGroq<any>(
        PRODUCT_LINE_BY_PATH_QUERY,
        { path: '/portable-cabin/steel-cabin/' },
        [...dataset, { ...subcategory, _id: 'drafts.cat_cabins_grp' }]
      )
      expect(line.category).toEqual({
        _id: 'cat_cabins',
        slug: 'portable-cabins',
        parentSlug: null,
        childIds: ['cat_cabins_grp']
      })
      expect(productLineCategoryIds(line)).toEqual(['cat_cabins', 'cat_cabins_grp'])
    })

    it('leaves a hub page without a category', async () => {
      const line = await executeGroq<any>(PRODUCT_LINE_BY_PATH_QUERY, { path: '/portable-cabin/' }, dataset)
      expect(line.category).toBeNull()
      expect(productLineCategoryIds(line)).toEqual([])
    })

    it('finds nothing at an unknown path', async () => {
      const line = await executeGroq<any>(PRODUCT_LINE_BY_PATH_QUERY, { path: '/nope/' }, dataset)
      expect(line?._id ?? null).toBeNull()
    })
  })

  describe('PRODUCTS_IN_CATEGORIES_QUERY', () => {
    it('returns the published products in any of the given categories, as catalogue cards', async () => {
      const products = await executeGroq<any[]>(
        PRODUCTS_IN_CATEGORIES_QUERY,
        { categoryIds: ['cat_cabins', 'cat_cabins_grp'] },
        dataset
      )

      expect(products.map((product) => product._id).sort()).toEqual([
        'prod_grp_kiosk',
        'prod_kiosk_150x150'
      ])
      expect(products[0].sizes[0]).toHaveProperty('thumbnail')
    })

    it('leaves out unpublished products and drafts', async () => {
      const products = await executeGroq<any[]>(
        PRODUCTS_IN_CATEGORIES_QUERY,
        { categoryIds: ['cat_cabins_grp'] },
        [
          ...dataset.filter((doc) => doc._id !== 'prod_grp_kiosk'),
          { ...grpProduct, status: 'archived' },
          { ...grpProduct, _id: 'drafts.prod_grp_kiosk' }
        ]
      )
      expect(products).toEqual([])
    })
  })
})
