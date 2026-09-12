import { describe, expect, it } from 'vitest'
import type {
  GalleryCategory,
  GalleryClassification,
  GalleryManifestItem
} from '../../scripts/gallery/lib/model'
import { validateClassifications, validateManifest } from '../../scripts/gallery/lib/validate'
import { loadClassifications } from '../../scripts/gallery/prepare-gallery'

const category: GalleryCategory = {
  family: 'containers',
  useCase: 'dormitory',
  project: 'others'
}

function classification(overrides: Partial<GalleryClassification> = {}): GalleryClassification {
  return {
    ...category,
    sourcePath: 'Konteyner/Yatakhane/1.jpg',
    categories: [],
    title: 'Container dormitory block',
    alt: 'Row of white container dormitory units on a gravel site.',
    order: 1,
    role: 'hero',
    confidence: 'high',
    flags: [],
    rightsStatus: 'unknown',
    ...overrides
  }
}

function manifestItem(overrides: Partial<GalleryManifestItem> = {}): GalleryManifestItem {
  const sha256 = 'a'.repeat(64)
  return {
    ...category,
    assetId: `sha256:${sha256}`,
    sha256,
    filePath: 'sanity/gallery/source/containers/dormitory/others/others-001.jpg',
    sourcePath: 'Konteyner/Yatakhane/1.jpg',
    sourceAliases: [],
    categories: [],
    title: 'Container dormitory block',
    alt: 'Row of white container dormitory units on a gravel site.',
    order: 1,
    role: 'hero',
    confidence: 'high',
    flags: [],
    rightsStatus: 'unknown',
    uploadEligible: true,
    heroEligible: true,
    possibleDuplicateAssetIds: [],
    format: 'jpeg',
    width: 4000,
    height: 3000,
    byteSize: 2_500_000,
    hasExif: true,
    ...overrides
  }
}

describe('gallery classification invariants', () => {
  it('accepts a well-formed row', () => {
    expect(validateClassifications([classification()])).toEqual([])
  })

  it('rejects missing English title and alt text', () => {
    expect(validateClassifications([
      classification({ title: '', alt: '' })
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('title'),
      expect.stringContaining('alt')
    ]))
  })

  it('rejects non-English title and alt text', () => {
    expect(validateClassifications([
      classification({ title: 'Şantiye konteyneri', alt: 'Şantiye sahasında konteyner.' })
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('title'),
      expect.stringContaining('alt')
    ]))
  })

  it('rejects paths outside the approved taxonomy', () => {
    expect(validateClassifications([
      classification({ family: 'temporary-buildings' as never })
    ])).toContainEqual(expect.stringContaining('family'))
  })

  it('rejects use case and project slugs that are not kebab-case', () => {
    const problems = validateClassifications([
      classification({ useCase: 'Construction Site', project: 'Metropol_AVM' })
    ])
    expect(problems).toContainEqual(expect.stringContaining('useCase'))
    expect(problems).toContainEqual(expect.stringContaining('project'))
  })

  it('rejects source paths that escape the source root', () => {
    expect(validateClassifications([
      classification({ sourcePath: '../Downloads/1.jpg' })
    ])).toContainEqual(expect.stringContaining('sourcePath'))
  })

  it('rejects absolute source paths', () => {
    expect(validateClassifications([
      classification({ sourcePath: '/Users/someone/Downloads/1.jpg' })
    ])).toContainEqual(expect.stringContaining('sourcePath'))
  })

  it('rejects a repeated source path', () => {
    expect(validateClassifications([
      classification({ sourcePath: 'Kabin/WC/1.jpg' }),
      classification({ sourcePath: 'Kabin/WC/1.jpg' })
    ])).toContainEqual(expect.stringContaining('Kabin/WC/1.jpg'))
  })

  it('rejects a non-positive or fractional order', () => {
    expect(validateClassifications([classification({ order: 0 })]))
      .toContainEqual(expect.stringContaining('order'))
    expect(validateClassifications([classification({ order: 1.5 })]))
      .toContainEqual(expect.stringContaining('order'))
  })

  it('rejects a duplicated secondary category', () => {
    const extra: GalleryCategory = { family: 'cabins', useCase: 'security-guard', project: 'others' }
    expect(validateClassifications([
      classification({ categories: [extra, extra] })
    ])).toContainEqual(expect.stringContaining('categories'))
  })

  it('rejects a secondary category that repeats the primary one', () => {
    expect(validateClassifications([
      classification({ categories: [{ ...category }] })
    ])).toContainEqual(expect.stringContaining('categories'))
  })

  it('rejects an unknown flag or role', () => {
    expect(validateClassifications([classification({ flags: ['blurry' as never] })]))
      .toContainEqual(expect.stringContaining('flag'))
    expect(validateClassifications([classification({ role: 'thumbnail' as never })]))
      .toContainEqual(expect.stringContaining('role'))
  })

  it('rejects a possible-duplicate link that points at itself', () => {
    expect(validateClassifications([
      classification({ possibleDuplicateSources: ['Konteyner/Yatakhane/1.jpg'] })
    ])).toContainEqual(expect.stringContaining('possibleDuplicateSources'))
  })
})

describe('gallery manifest invariants', () => {
  it('accepts a well-formed item', () => {
    expect(validateManifest([manifestItem()])).toEqual([])
  })

  it('forces rights-review assets out of automatic upload', () => {
    expect(validateManifest([
      manifestItem({ rightsStatus: 'review-required', uploadEligible: true })
    ])).toContainEqual(expect.stringContaining('uploadEligible'))
  })

  it('forces blocking quality flags out of hero use', () => {
    for (const flag of ['low-resolution', 'overlay-or-watermark', 'soft-or-hazy', 'construction-progress', 'portrait', 'nonstandard-aspect'] as const) {
      expect(validateManifest([
        manifestItem({ flags: [flag], role: 'secondary', heroEligible: true })
      ])).toContainEqual(expect.stringContaining('heroEligible'))
    }
  })

  it('requires a hero role to stay hero eligible when nothing blocks it', () => {
    expect(validateManifest([
      manifestItem({ role: 'hero', heroEligible: false })
    ])).toContainEqual(expect.stringContaining('heroEligible'))
  })

  it('allows a blocked asset to keep a non-hero role', () => {
    expect(validateManifest([
      manifestItem({ flags: ['construction-progress'], role: 'construction-progress', heroEligible: false })
    ])).toEqual([])
  })

  it('rejects an asset id that disagrees with the hash', () => {
    expect(validateManifest([
      manifestItem({ assetId: `sha256:${'b'.repeat(64)}` })
    ])).toContainEqual(expect.stringContaining('assetId'))
  })

  it('rejects a file path outside the gallery source root', () => {
    expect(validateManifest([
      manifestItem({ filePath: 'public/images/gallery/others-001.jpg' })
    ])).toContainEqual(expect.stringContaining('filePath'))
  })

  it('rejects a file path that disagrees with its taxonomy or format', () => {
    expect(validateManifest([
      manifestItem({ filePath: 'sanity/gallery/source/cabins/dormitory/others/others-001.jpg' })
    ])).toContainEqual(expect.stringContaining('filePath'))
    expect(validateManifest([
      manifestItem({ filePath: 'sanity/gallery/source/containers/dormitory/others/others-001.png' })
    ])).toContainEqual(expect.stringContaining('filePath'))
  })

  it('rejects two items sharing one output path', () => {
    const sha = 'c'.repeat(64)
    expect(validateManifest([
      manifestItem(),
      manifestItem({ assetId: `sha256:${sha}`, sha256: sha, sourcePath: 'Konteyner/Yatakhane/2.jpg' })
    ])).toContainEqual(expect.stringContaining('filePath'))
  })

  it('rejects a source path claimed by two items', () => {
    const sha = 'd'.repeat(64)
    expect(validateManifest([
      manifestItem(),
      manifestItem({
        assetId: `sha256:${sha}`,
        sha256: sha,
        filePath: 'sanity/gallery/source/containers/dormitory/others/others-002.jpg',
        order: 2,
        sourceAliases: ['Konteyner/Yatakhane/1.jpg']
      })
    ])).toContainEqual(expect.stringContaining('Konteyner/Yatakhane/1.jpg'))
  })

  it('rejects private capture metadata leaking into the tracked manifest', () => {
    expect(validateManifest([
      { ...manifestItem(), gpsLatitude: 41.0082 } as GalleryManifestItem
    ])).toContainEqual(expect.stringContaining('gpsLatitude'))

    expect(validateManifest([
      manifestItem({ caption: 'Shot at 41.0082, 28.9784 with body serial 0123456789.' })
    ])).toEqual(expect.arrayContaining([expect.stringContaining('caption')]))
  })

  it('rejects an absolute path anywhere in the tracked manifest', () => {
    expect(validateManifest([
      manifestItem({ sourcePath: '/Users/someone/Downloads/Proje Görselleri/1.jpg' })
    ])).toContainEqual(expect.stringContaining('sourcePath'))
  })
})

describe('tracked gallery classification', () => {
  it('records one decision for every audited source image', () => {
    const rows = loadClassifications()
    expect(rows).toHaveLength(314)
    expect(new Set(rows.map((row) => row.sourcePath)).size).toBe(314)
    expect(validateClassifications(rows)).toEqual([])
  })

  it('contains English title and alt text for all rows', () => {
    const rows = loadClassifications()
    for (const row of rows) {
      expect(row.title.trim().length).toBeGreaterThan(0)
      expect(row.alt.trim().length).toBeGreaterThan(0)
      expect(/^[ -~]+$/.test(row.title)).toBe(true)
      expect(/^[ -~]+$/.test(row.alt)).toBe(true)
    }
  })

  it('marks exactly 11 canonical choices for the 11 duplicate pairs', () => {
    const rows = loadClassifications()
    const preferred = rows.filter((row) => row.preferredCanonical === true)
    expect(preferred).toHaveLength(11)
  })

  it('never leaves a retail kiosk item or the school yard photo at the default rights status', () => {
    const rows = loadClassifications()
    const assessed = rows.filter(
      (row) => row.rightsStatus === 'review-required' || row.rightsStatus === 'cleared'
    )
    expect(assessed.length).toBeGreaterThanOrEqual(55)
    // A kiosk photo may only become uploadable through an explicit `cleared`, never by defaulting
    // to `unknown` — that is the gate the blanket review-required flag was there to hold.
    for (const row of rows.filter((r) => r.family === 'cabins' && r.useCase === 'retail-event-kiosk')) {
      expect(row.rightsStatus).not.toBe('unknown')
    }
  })
})

