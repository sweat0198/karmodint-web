import { describe, it, expect } from 'vitest'
import { executeGroq } from '../utils/groqRunner'
import { SOLUTIONS_QUERY, SOLUTION_BY_SLUG_QUERY } from '~/queries/solutions'
import { mockSanityDataset } from '../fixtures/sanityData'

describe('Solution GROQ queries', () => {
  describe('SOLUTIONS_QUERY', () => {
    it('lists solutions in display order with the listing-card fields', async () => {
      const solutions = await executeGroq<any[]>(SOLUTIONS_QUERY)

      expect(solutions.map((solution) => solution.slug)).toEqual([
        'construction-site-setup',
        'event-infrastructure'
      ])
      expect(solutions[0]).toMatchObject({
        _id: 'solution_site_setup',
        name: 'Construction Site Setup',
        description: 'Everything needed to stand up a secure, staffed construction site.',
        productCount: 2
      })
      expect(solutions[0].coverImage.alt).toBe('A fitted-out construction site compound')
    })

    // The detail page drops entries whose product is unpublished, so a raw array length would
    // advertise more products than the page goes on to show.
    it('counts only the entries whose product is still published', async () => {
      const withArchived = mockSanityDataset.map((doc: any) =>
        doc._id === 'prod_kiosk_retail' ? { ...doc, status: 'archived' } : doc
      )

      const solutions = await executeGroq<any[]>(SOLUTIONS_QUERY, {}, withArchived)
      const siteSetup = solutions.find((solution) => solution.slug === 'construction-site-setup')

      expect(siteSetup.productCount).toBe(1)
    })

    it('excludes drafts, so an open Studio document does not duplicate its card', async () => {
      const withDraft = [
        ...mockSanityDataset,
        {
          _id: 'drafts.solution_site_setup',
          _type: 'solution',
          name: 'Construction Site Setup',
          slug: { _type: 'slug', current: 'construction-site-setup' },
          description: 'Draft copy.',
          coverImage: { alt: 'draft', asset: { _ref: 'image-draft-100x100-jpg' } },
          displayOrder: 1,
          products: []
        }
      ]

      const solutions = await executeGroq<any[]>(SOLUTIONS_QUERY, {}, withDraft)
      expect(solutions).toHaveLength(2)
    })
  })

  describe('SOLUTION_BY_SLUG_QUERY', () => {
    it('resolves each entry to a full product card projection at the chosen size', async () => {
      const solution = await executeGroq<any>(SOLUTION_BY_SLUG_QUERY, {
        slug: 'construction-site-setup'
      })

      expect(solution.name).toBe('Construction Site Setup')
      expect(solution.products).toHaveLength(2)

      const [gatehouse] = solution.products
      expect(gatehouse.sizeOptionKey).toBe('size_1')
      expect(gatehouse.product.name).toBe('1.50m x 1.50m Security Gatehouse Cabin')
      expect(gatehouse.product.slug).toBe('1-50m-x-1-50m-security-cabin')
      expect(gatehouse.product.categories[0].name).toBe('Portable Cabins')

      // The full size list is projected; the page narrows to `sizeOptionKey` itself, which keeps
      // the shape identical to the catalog's and lets `toSizeCards` build the card unchanged.
      const size = gatehouse.product.sizes.find((candidate: any) => candidate._key === 'size_1')
      expect(size.price).toBe(2450)
      expect(size.fallbackThumbnail).toBeTruthy()
      expect(size.images.every((image: any) => image.view !== 'top')).toBe(true)
    })

    it('preserves the authored product order', async () => {
      const solution = await executeGroq<any>(SOLUTION_BY_SLUG_QUERY, {
        slug: 'construction-site-setup'
      })

      expect(solution.products.map((entry: any) => entry.product._id)).toEqual([
        'prod_kiosk_150x150',
        'prod_kiosk_retail'
      ])
    })

    it('returns null for an unknown slug, so the page can 404', async () => {
      const solution = await executeGroq<any>(SOLUTION_BY_SLUG_QUERY, { slug: 'does-not-exist' })
      expect(solution).toBeNull()
    })

    // An unpublished product must not resurface through a solution that still lists it.
    it('drops an entry whose product is no longer published', async () => {
      const withArchived = mockSanityDataset.map((doc: any) =>
        doc._id === 'prod_kiosk_retail' ? { ...doc, status: 'archived' } : doc
      )

      const solution = await executeGroq<any>(
        SOLUTION_BY_SLUG_QUERY,
        { slug: 'construction-site-setup' },
        withArchived
      )

      expect(solution.products.map((entry: any) => entry.product)).toEqual([
        expect.objectContaining({ _id: 'prod_kiosk_150x150' }),
        null
      ])
    })
  })
})
