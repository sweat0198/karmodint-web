import { describe, it, expect } from 'vitest'
import {
  loadManifest,
  readRenderFolder,
  renderPath,
  sizeLabel,
  validateManifest,
  type CatalogueManifest,
  type ManifestSize
} from '../../scripts/catalogue/lib/manifest'
import { repoPath } from '../../scripts/catalogue/lib/paths'
import { existsSync } from 'node:fs'
import { SOURCE_PAGES } from '../../scripts/catalogue/lib/sourcePages'
import type { ProductImageView } from '../../sanity/schemas/objects/productImageViews'

const manifest = loadManifest()

/** Stands in for a render folder on disk, so these tests exercise the rules and not the filesystem. */
function folderHolding(...views: ProductImageView[]) {
  return () => ({ views, unrecognised: [] })
}

/** A minimal manifest whose render folders are supplied by the caller rather than by disk. */
function manifestWith(sizes: ManifestSize[]): CatalogueManifest {
  return {
    renderRoot: 'public/images/products',
    products: [
      {
        id: 'product-test',
        name: 'Test',
        slug: 'test',
        copyFile: 'test.md',
        categories: ['category-cabin'],
        sizes
      }
    ]
  }
}

const baseSize: ManifestSize = {
  key: '150x150',
  lengthM: 1.5,
  widthM: 1.5,
  weightKg: 0,
  isPoa: true,
  price: 0,
  isDefault: true,
  sourceUrl: 'https://example.test/',
  renderFolder: 'folder-a',
  views: ['front', 'top']
}

describe('Catalogue manifest invariants', () => {
  it('holds no problems for the committed manifest', () => {
    expect(validateManifest(manifest)).toEqual([])
  })

  it('rejects a product with anything other than one default size', () => {
    const noDefault = manifestWith([{ ...baseSize, isDefault: false }])
    expect(validateManifest(noDefault, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('exactly one default size (found 0)')
    )

    const twoDefaults = manifestWith([
      { ...baseSize },
      { ...baseSize, key: '150x215', renderFolder: 'folder-b' }
    ])
    expect(validateManifest(twoDefaults, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('exactly one default size (found 2)')
    )
  })

  it('rejects a size with anything other than one plan view', () => {
    const noPlan = manifestWith([{ ...baseSize, views: ['front'] }])
    expect(validateManifest(noPlan, folderHolding('front'))).toContainEqual(
      expect.stringContaining('exactly one "top" view (found 0)')
    )
  })

  it('rejects a duplicate size key within a product', () => {
    const duplicated = manifestWith([
      { ...baseSize },
      { ...baseSize, isDefault: false, renderFolder: 'folder-b' }
    ])
    expect(validateManifest(duplicated, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('is a duplicate key')
    )
  })

  it('rejects two sizes of one product pointing at the same render folder', () => {
    // A shared folder is the one way the schema restructure can still be defeated: both sizes would
    // list their "own" images and both would show the same ones.
    const shared = manifestWith([
      { ...baseSize },
      { ...baseSize, key: '150x215', isDefault: false }
    ])
    expect(validateManifest(shared, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('render folder "folder-a" is already used by')
    )
  })

  it('rejects two products pointing at the same render folder', () => {
    const base = manifestWith([baseSize])
    const twoProducts: CatalogueManifest = {
      ...base,
      products: [
        ...base.products,
        { ...base.products[0], id: 'product-other', slug: 'other' }
      ]
    }
    expect(validateManifest(twoProducts, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('render folder "folder-a" is already used by product-test size "150x150"')
    )
  })

  it('rejects a render folder that is not on disk', () => {
    expect(validateManifest(manifestWith([baseSize]), () => null)).toContainEqual(
      expect.stringContaining('does not exist')
    )
  })

  it('rejects a view list that disagrees with the renders on disk', () => {
    const missingRender = manifestWith([{ ...baseSize, views: ['front', 'back', 'top'] }])
    expect(validateManifest(missingRender, folderHolding('front', 'top'))).toContainEqual(
      expect.stringContaining('must match the renders on disk')
    )

    const orphanedRender = manifestWith([{ ...baseSize, views: ['front', 'top'] }])
    expect(validateManifest(orphanedRender, folderHolding('front', 'interior', 'top'))).toContainEqual(
      expect.stringContaining('must match the renders on disk')
    )
  })

  it('reports a render whose filename is outside the view vocabulary', () => {
    // A `left.png` typo would otherwise be invisible to both the manifest and the import, and the
    // size would quietly ship one render short.
    const problems = validateManifest(
      manifestWith([baseSize]),
      () => ({ views: ['front', 'top'] as ProductImageView[], unrecognised: ['left'] })
    )
    expect(problems).toContainEqual(expect.stringContaining('the view vocabulary does not name: left'))
  })

  it('rejects a POA size carrying a non-zero placeholder price', () => {
    expect(validateManifest(manifestWith([{ ...baseSize, price: 4200 }]), folderHolding('front', 'top')))
      .toContainEqual(expect.stringContaining('placeholder price must be 0'))
  })

  it('rejects a zero height, which is not a sentinel the schema accepts', () => {
    expect(validateManifest(manifestWith([{ ...baseSize, heightM: 0 }]), folderHolding('front', 'top')))
      .toContainEqual(expect.stringContaining('height must be positive or omitted'))
  })

  it('points every referenced render at a file that exists', () => {
    for (const product of manifest.products) {
      for (const size of product.sizes) {
        for (const view of size.views) {
          expect(existsSync(repoPath(renderPath(manifest, size, view)))).toBe(true)
        }
      }
    }
  })
})

describe('GRP Cabin manifest rows', () => {
  const grp = manifest.products.find((product) => product.id === 'product-grp-cabin')!

  it('carries the five GRP sizes with 215x270 as the default', () => {
    expect(grp.sizes.map((size) => size.key)).toEqual([
      '150x150',
      '150x215',
      '150x270',
      '215x270',
      '270x270'
    ])
    expect(grp.sizes.filter((size) => size.isDefault).map((size) => size.key)).toEqual(['215x270'])
    expect(grp.sizes.find((size) => size.key === '215x270')!.views).toHaveLength(7)
  })

  it('reads the key as depth x width', () => {
    const wide = grp.sizes.find((size) => size.key === '150x270')!
    expect(wide.lengthM).toBe(1.5)
    expect(wide.widthM).toBe(2.7)
    expect(sizeLabel(wide)).toBe('1.50m × 2.70m')
  })

  it('carries the five owner-supplied weights', () => {
    expect(grp.sizes.map((size) => size.weightKg)).toEqual([280, 350, 450, 550, 650])
  })

  it('carries the five owner-supplied heights', () => {
    expect(grp.sizes.map((size) => size.heightM)).toEqual([2.4, 2.4, 2.4, 2.4, 2.45])
  })

  it('carries the five supplied sales prices', () => {
    expect(grp.sizes.map((size) => size.price)).toEqual([3890, 4490, 4690, 5890, 6390])
    expect(grp.sizes.every((size) => size.isPoa === false)).toBe(true)
  })

  it('references both the parent category and the GRP subcategory', () => {
    expect(grp.categories).toEqual(['category-cabin', 'category-cabin-grp'])
  })

  it('sources every size from a page the scraper covers', () => {
    const scraped = new Set(SOURCE_PAGES.map((page) => page.url))
    for (const size of grp.sizes) {
      expect(scraped.has(size.sourceUrl)).toBe(true)
    }
  })

  it('accounts for all 23 GRP renders', () => {
    const referenced = grp.sizes.reduce((total, size) => total + size.views.length, 0)
    const onDisk = grp.sizes.reduce(
      (total, size) => total + (readRenderFolder(manifest, size.renderFolder)?.views.length ?? 0),
      0
    )
    expect(referenced).toBe(23)
    expect(onDisk).toBe(23)
  })
})

describe('Product sales price request', () => {
  it('stores the supplied sales price, height and weight for every requested size', () => {
    const requested = Object.fromEntries(
      manifest.products.map((product) => [
        product.slug,
        product.sizes.map((size) => ({
          key: size.key,
          heightM: size.heightM,
          weightKg: size.weightKg,
          price: size.price,
          isPoa: size.isPoa
        }))
      ])
    )

    expect(requested).toMatchObject({
      'bulletproof-security-cabin': [
        { key: '150x150', heightM: 3, weightKg: 3000, price: 39900, isPoa: false },
        { key: '150x200', heightM: 3, weightKg: 3800, price: 47900, isPoa: false },
        { key: '200x200', heightM: 3, weightKg: 4500, price: 54900, isPoa: false },
        { key: '200x300', heightM: 3, weightKg: 5800, price: 59900, isPoa: false },
        { key: '200x400', heightM: 3, weightKg: 7500, price: 67900, isPoa: false },
        { key: '300x300', heightM: 3, weightKg: 8000, price: 69900, isPoa: false },
        { key: '300x400', heightM: 3, weightKg: 8800, price: 78900, isPoa: false },
        { key: '300x500', heightM: 3, weightKg: 10500, price: 84900, isPoa: false }
      ],
      'kompocity-composite-cabin': [
        { key: '140x140', heightM: 2.75, weightKg: 850, price: 6890, isPoa: false },
        { key: '140x215', heightM: 2.75, weightKg: 1100, price: 7890, isPoa: false },
        { key: '215x215', heightM: 2.75, weightKg: 1500, price: 8990, isPoa: false },
        { key: '215x265', heightM: 2.75, weightKg: 1750, price: 10980, isPoa: false },
        { key: '265x265', heightM: 2.75, weightKg: 1900, price: 11980, isPoa: false }
      ],
      'grp-cabin': [
        { key: '150x150', heightM: 2.4, weightKg: 280, price: 3890, isPoa: false },
        { key: '150x215', heightM: 2.4, weightKg: 350, price: 4490, isPoa: false },
        { key: '150x270', heightM: 2.4, weightKg: 450, price: 4690, isPoa: false },
        { key: '215x270', heightM: 2.4, weightKg: 550, price: 5890, isPoa: false },
        { key: '270x270', heightM: 2.45, weightKg: 650, price: 6390, isPoa: false }
      ],
      'metrocity-modular-cabin': [
        { key: '140x140', heightM: 2.75, weightKg: 700, price: 5595, isPoa: false },
        { key: '140x215', heightM: 2.75, weightKg: 950, price: 6490, isPoa: false },
        { key: '215x215', heightM: 2.75, weightKg: 1100, price: 7890, isPoa: false },
        { key: '215x265', heightM: 2.75, weightKg: 1250, price: 8790, isPoa: false },
        { key: '265x265', heightM: 2.75, weightKg: 1400, price: 9890, isPoa: false }
      ],
      'insulated-panel-cabin': [
        { key: '110x110', heightM: 2.35, weightKg: 100, price: 2290, isPoa: false },
        { key: '135x135', heightM: 2.35, weightKg: 125, price: 2690, isPoa: false },
        { key: '135x210', heightM: 2.35, weightKg: 225, price: 3690, isPoa: false },
        { key: '210x210', heightM: 2.35, weightKg: 280, price: 4195, isPoa: false },
        { key: '260x260', heightM: 2.35, weightKg: 380, price: 4890, isPoa: false }
      ]
    })
  })
})
