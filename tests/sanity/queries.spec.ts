import { describe, it, expect } from 'vitest'
import { executeGroq } from '../utils/groqRunner'

describe('Sanity GROQ Query Evaluation (SSG Data Fetching)', () => {
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
})
