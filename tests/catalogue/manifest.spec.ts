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

  it('carries the four published weights and the 0 sentinel on the size the source never specced', () => {
    expect(grp.sizes.map((size) => size.weightKg)).toEqual([280, 350, 450, 550, 0])
  })

  it('omits height on 270x270 and publishes 2.40m on the four confirmed sizes', () => {
    expect(grp.sizes.map((size) => size.heightM)).toEqual([2.4, 2.4, 2.4, 2.4, undefined])
  })

  it('prices every size POA', () => {
    expect(grp.sizes.every((size) => size.isPoa && size.price === 0)).toBe(true)
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
