import { describe, it, expect } from 'vitest'
import { buildCatalogueSeed, buildProductDocument, toNdjson } from '../../scripts/catalogue/lib/buildSeed'
import { loadCopyFile, type ProductCopy } from '../../scripts/catalogue/lib/copy'
import { loadManifest, renderPath } from '../../scripts/catalogue/lib/manifest'
import { loadAssetManifest } from '../../scripts/catalogue/lib/assets'
import { renderAltText } from '../../scripts/catalogue/lib/altText'
import { validatePortableText } from '../../scripts/catalogue/lib/portableText'

const manifest = loadManifest()
const assets = loadAssetManifest('dev')
const grp = manifest.products.find((product) => product.id === 'product-grp-cabin')!

function copyFor(overrides: Partial<ProductCopy['frontmatter']> = {}): ProductCopy {
  const loaded = loadCopyFile(grp.copyFile)
  return { ...loaded, frontmatter: { ...loaded.frontmatter, ...overrides } }
}

describe('Seed document construction', () => {
  const document = buildProductDocument(manifest, grp, copyFor(), assets)

  it('gives the document the manifest id and a published status', () => {
    expect(document._id).toBe('product-grp-cabin')
    expect(document._type).toBe('product')
    expect(document.status).toBe('published')
    expect(document.slug).toEqual({ _type: 'slug', current: 'grp-cabin' })
  })

  it('emits both category references, keyed by id so they cannot collide', () => {
    expect(document.categories).toEqual([
      { _key: 'category-cabin', _type: 'reference', _ref: 'category-cabin' },
      { _key: 'category-cabin-grp', _type: 'reference', _ref: 'category-cabin-grp' }
    ])
  })

  it('derives the size label from the dimensions rather than storing it', () => {
    expect(document.sizes.map((size) => size.label)).toEqual([
      '5ft × 5ft (1.50m × 1.50m)',
      '7ft × 5ft (1.50m × 2.15m)',
      '9ft × 5ft (1.50m × 2.70m)',
      '9ft × 7ft (2.15m × 2.70m)',
      '9ft × 9ft (2.70m × 2.70m)'
    ])
  })

  it('includes the owner-supplied height and weight', () => {
    const wide = document.sizes.find((size) => size._key === '270x270')!
    expect(wide.heightM).toBe(2.45)
    expect(wide.weightKg).toBe(650)
  })

  it('keys each image by its view, making a duplicate view structurally impossible', () => {
    for (const size of document.sizes) {
      expect(size.images.map((image) => image._key)).toEqual(size.images.map((image) => image.view))
      expect(new Set(size.images.map((image) => image._key)).size).toBe(size.images.length)
    }
  })

  it('leads every gallery with the front view, which the size preview picks up', () => {
    for (const size of document.sizes) {
      expect(size.images[0].view).toBe('front')
      expect(size.images.filter((image) => image.view === 'top')).toHaveLength(1)
    }
  })

  it('templates alt text from the product name, size label and view', () => {
    const size = document.sizes.find((s) => s._key === '215x270')!
    expect(size.images.map((image) => image.alt)).toEqual([
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), front view',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), three-quarter view from the left',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), right side view',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), rear view',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), interior view',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), door detail',
      'GRP Cabin 9ft × 7ft (2.15m × 2.70m), plan view from above'
    ])
  })

  it('points each image at the asset the upload recorded for that render', () => {
    for (const [index, size] of document.sizes.entries()) {
      for (const [imageIndex, image] of size.images.entries()) {
        const expected = assets.assets[renderPath(manifest, grp.sizes[index], image.view)]
        expect(image.asset).toEqual({ _type: 'reference', _ref: expected })
        expect(image.view).toBe(grp.sizes[index].views[imageIndex])
      }
    }
  })

  it('carries all 23 renders across the five sizes', () => {
    expect(document.sizes.reduce((total, size) => total + size.images.length, 0)).toBe(23)
  })

  it('leaves specifications off, pending real data', () => {
    expect('specifications' in document).toBe(false)
  })

  it('converts the body to Portable Text inside the whitelist', () => {
    expect(validatePortableText(document.description)).toEqual([])
    expect(document.description.length).toBeGreaterThan(0)
  })

  it('scopes Portable Text keys to the product slug', () => {
    for (const block of document.description) {
      expect(block._key).toMatch(/^grp-cabin-\d+$/)
    }
  })

  it('is a pure function of its inputs, so a re-import is not an edit', () => {
    expect(buildProductDocument(manifest, grp, copyFor(), assets)).toEqual(document)
  })
})

describe('Seed document guards', () => {
  it('refuses a copy file whose slug disagrees with the manifest', () => {
    expect(() => buildProductDocument(manifest, grp, copyFor({ slug: 'grp-kiosk' }), assets))
      .toThrow(/declares slug "grp-kiosk" but the manifest says "grp-cabin"/)
  })

  it('refuses a copy file whose name disagrees with the manifest', () => {
    expect(() => buildProductDocument(manifest, grp, copyFor({ name: 'GRP Kiosk' }), assets))
      .toThrow(/declares name "GRP Kiosk" but the manifest says "GRP Cabin"/)
  })

  it('names the render it has no asset for rather than emitting a dangling reference', () => {
    const incomplete = { dataset: 'dev', assets: { ...assets.assets } }
    delete incomplete.assets['public/images/products/cabin-grp-215x270/door.png']

    expect(() => buildProductDocument(manifest, grp, copyFor(), incomplete))
      .toThrow(/No asset id for public\/images\/products\/cabin-grp-215x270\/door\.png/)
  })
})

describe('NDJSON serialisation', () => {
  it('writes one document per line and ends with a newline', () => {
    const documents = buildCatalogueSeed(manifest, loadCopyFile, assets)
    const ndjson = toNdjson(documents)

    expect(ndjson.endsWith('\n')).toBe(true)
    const lines = ndjson.trimEnd().split('\n')
    expect(lines).toHaveLength(documents.length)
    expect(lines.map((line) => JSON.parse(line))).toEqual(documents)
  })
})

describe('Templated alt text', () => {
  it('reads as "<product> <size label>, <view phrase>"', () => {
    expect(renderAltText('GRP Cabin', '1.50m × 1.50m', 'front'))
      .toBe('GRP Cabin 1.50m × 1.50m, front view')
    expect(renderAltText('GRP Cabin', '2.70m × 2.70m', 'top'))
      .toBe('GRP Cabin 2.70m × 2.70m, plan view from above')
  })
})
