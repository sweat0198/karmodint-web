import { describe, it, expect } from 'vitest'
import { schemaTypes } from '../../sanity/schemas'
import { solutionType, validateSolutionProducts } from '../../sanity/schemas/solution'
import { solutionProduct } from '../../sanity/schemas/objects/solutionProduct'

const gatehouse = {
  _id: 'prod_gatehouse',
  name: 'Security Gatehouse',
  sizes: [
    { _key: 'size_1', label: '1.50m x 1.50m' },
    { _key: 'size_2', label: '1.50m x 2.15m' }
  ]
}

const kiosk = {
  _id: 'prod_kiosk',
  name: 'Retail Kiosk',
  sizes: [{ _key: 'size_retail_1', label: '3.00m x 2.00m' }]
}

describe('Solution Schema', () => {
  it('registers the solution document and its line-item object', () => {
    const typeNames = schemaTypes.map((type: any) => type.name)
    expect(typeNames).toContain('solution')
    expect(typeNames).toContain('solutionProduct')
  })

  it('defines the agreed fields', () => {
    const fields = Object.fromEntries(solutionType.fields.map((field: any) => [field.name, field]))

    expect(Object.keys(fields)).toEqual([
      'name',
      'slug',
      'description',
      'coverImage',
      'products',
      'displayOrder',
      'seo'
    ])
    expect(fields.name.type).toBe('string')
    expect(fields.slug.type).toBe('slug')
    expect(fields.description.type).toBe('text')
    expect(fields.coverImage.type).toBe('image')
    expect(fields.products.type).toBe('array')
    expect(fields.seo.type).toBe('seo')
  })

  it('derives the slug from the name, since the slug is the public URL', () => {
    const slugField: any = solutionType.fields.find((field: any) => field.name === 'slug')
    expect(slugField.options.source).toBe('name')
  })

  it('builds each product entry from a product reference and one of its size keys', () => {
    const fieldNames = solutionProduct.fields.map((field: any) => field.name)
    expect(fieldNames).toEqual(['product', 'sizeOptionKey'])

    const productField: any = solutionProduct.fields.find((field: any) => field.name === 'product')
    expect(productField.type).toBe('reference')
    expect(productField.to).toEqual([{ type: 'product' }])
  })

  describe('validateSolutionProducts', () => {
    it('accepts entries whose size key exists on the referenced product', () => {
      expect(
        validateSolutionProducts(
          [
            { product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_1' },
            { product: { _ref: 'prod_kiosk' }, sizeOptionKey: 'size_retail_1' }
          ],
          [gatehouse, kiosk]
        )
      ).toBe(true)
    })

    it('accepts the same product twice at different sizes', () => {
      expect(
        validateSolutionProducts(
          [
            { product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_1' },
            { product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_2' }
          ],
          [gatehouse]
        )
      ).toBe(true)
    })

    it('leaves an empty list to the required rule', () => {
      expect(validateSolutionProducts(undefined, [])).toBe(true)
      expect(validateSolutionProducts([], [])).toBe(true)
    })

    it('rejects an entry with no product selected', () => {
      expect(validateSolutionProducts([{ sizeOptionKey: 'size_1' }], [gatehouse])).toMatch(
        /needs a Product/i
      )
    })

    it('rejects an entry with no size key', () => {
      expect(
        validateSolutionProducts([{ product: { _ref: 'prod_gatehouse' } }], [gatehouse])
      ).toMatch(/size_1/)
    })

    it('rejects a size key the referenced product does not have, listing what it does have', () => {
      const result = validateSolutionProducts(
        [{ product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_99' }],
        [gatehouse]
      )

      expect(result).toContain('size_99')
      expect(result).toContain('size_1')
      expect(result).toContain('1.50m x 1.50m')
    })

    it('rejects a reference to a product that no longer exists', () => {
      expect(
        validateSolutionProducts(
          [{ product: { _ref: 'prod_deleted' }, sizeOptionKey: 'size_1' }],
          [gatehouse]
        )
      ).toMatch(/no longer exists/i)
    })

    // The page renders one card per entry keyed by `${productId}-${sizeKey}`, which is also the
    // quote-list id. A repeated pair would collide on both.
    it('rejects the same product and size listed twice', () => {
      expect(
        validateSolutionProducts(
          [
            { product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_1' },
            { product: { _ref: 'prod_gatehouse' }, sizeOptionKey: 'size_1' }
          ],
          [gatehouse]
        )
      ).toMatch(/only once/i)
    })
  })
})
