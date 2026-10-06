import { describe, expect, it } from 'vitest'
import { productLineBreadcrumbs, productLineCatalogueLink } from '~/utils/productLines'

describe('productLineBreadcrumbs', () => {
  it('runs Home, then the parent chain from the top, then the page itself', () => {
    expect(
      productLineBreadcrumbs({
        name: 'Steel Cabin',
        path: '/portable-cabin/steel-cabin/',
        parent: { name: 'Portable Cabin', path: '/portable-cabin/', parent: null }
      })
    ).toEqual([
      { name: 'Home', path: '/' },
      { name: 'Portable Cabin', path: '/portable-cabin/' },
      { name: 'Steel Cabin', path: '/portable-cabin/steel-cabin/' }
    ])
  })

  it('gives a top-level Product Line just Home and itself', () => {
    expect(productLineBreadcrumbs({ name: 'GRP Kiosk Cabin', path: '/grp-kiosk-cabin/' })).toEqual([
      { name: 'Home', path: '/' },
      { name: 'GRP Kiosk Cabin', path: '/grp-kiosk-cabin/' }
    ])
  })
})

describe('productLineCatalogueLink', () => {
  it('filters the catalogue to a subcategory under its parent', () => {
    expect(
      productLineCatalogueLink({ _id: 'category-cabin-grp', slug: 'grp', parentSlug: 'cabin', childIds: [] })
    ).toBe('/products/?category=cabin&subcategory=grp')
  })

  it('filters the catalogue to a top-level category', () => {
    expect(
      productLineCatalogueLink({ _id: 'category-containers', slug: 'containers', parentSlug: null, childIds: [] })
    ).toBe('/products/?category=containers')
  })

  it('has no link for a hub page', () => {
    expect(productLineCatalogueLink(null)).toBeUndefined()
  })
})
