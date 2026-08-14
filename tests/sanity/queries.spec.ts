import { describe, it, expect } from 'vitest'
import { executeGroq } from '../utils/groqRunner'

describe('Sanity GROQ Query Evaluation (SSG Data Fetching)', () => {
  it('fetches all active categories ordered by sort weight', async () => {
    const query = `*[_type == "category" && isActive == true] | order(displayOrder asc) {
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
      "sizeCount": count(sizes)
    }`

    const results = await executeGroq<any[]>(query)
    expect(results).toHaveLength(2)

    const gatehouse = results.find((p) => p.slug === '1-50m-x-1-50m-security-cabin')
    expect(gatehouse).toBeDefined()
    expect(gatehouse.categories).toContain('Portable Cabins')
    expect(gatehouse.minPrice).toBe(2450)
    expect(gatehouse.sizeCount).toBe(2)
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
        price,
        isPoa,
        isDefault
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
})
