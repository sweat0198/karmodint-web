import { describe, expect, it } from 'vitest'
import type { GalleryManifestItem } from '../../scripts/gallery/lib/model'
import { CSV_COLUMNS, manifestCsv, manifestJson, reviewReport } from '../../scripts/gallery/lib/serialize'

function item(overrides: Partial<GalleryManifestItem> = {}): GalleryManifestItem {
  const sha256 = (overrides.sha256 ?? 'a'.repeat(64))
  return {
    assetId: `sha256:${sha256}`,
    sha256,
    filePath: 'sanity/gallery/source/containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-001.jpg',
    sourcePath: 'Konteyner/Yatakhane/1.jpg',
    sourceAliases: [],
    family: 'containers',
    useCase: 'dormitory',
    project: 'kiptas-vaditepe',
    categories: [],
    title: 'Container dormitory block',
    alt: 'White container dormitory units in two rows on a gravel site.',
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
    byteSize: 2_000_000,
    hasExif: true,
    ...overrides
  }
}

describe('manifestJson', () => {
  it('is two-space indented and ends with a newline', () => {
    const json = manifestJson([item()])

    expect(json.endsWith('\n')).toBe(true)
    expect(json).toContain('\n  "assets": [')
    expect(JSON.parse(json).assets).toHaveLength(1)
  })

  it('states the counts a reviewer needs without recomputing them', () => {
    const parsed = JSON.parse(manifestJson([
      item({ sourceAliases: ['A/2.jpg'] }),
      item({ sha256: 'b'.repeat(64), order: 2, role: 'secondary', heroEligible: false })
    ]))

    expect(parsed).toMatchObject({
      sourceImageCount: 3,
      canonicalAssetCount: 2,
      exactDuplicatesCollapsed: 1
    })
  })

  it('omits absent optional fields rather than writing null', () => {
    const json = manifestJson([item()])

    expect(json).not.toContain('null')
    expect(json).not.toContain('"caption"')
    expect(json).not.toContain('"capturedAt"')
  })

  it('writes keys in a fixed order regardless of construction order', () => {
    const reordered = { ...item() }
    const rebuilt = Object.fromEntries(Object.entries(reordered).reverse()) as unknown as GalleryManifestItem

    expect(manifestJson([rebuilt])).toBe(manifestJson([item()]))
  })

  it('is byte-identical when serialized twice', () => {
    const items = [item(), item({ sha256: 'b'.repeat(64), order: 2, role: 'secondary', heroEligible: false })]

    expect(manifestJson(items)).toBe(manifestJson(items))
  })

  it('carries no absolute path', () => {
    expect(manifestJson([item()])).not.toContain('/Users/')
  })
})

describe('manifestCsv', () => {
  it('writes the agreed header and one row per canonical asset', () => {
    const csv = manifestCsv([item(), item({ sha256: 'b'.repeat(64), order: 2, role: 'secondary', heroEligible: false })])
    const lines = csv.trimEnd().split('\n')

    expect(lines[0]).toBe(CSV_COLUMNS.join(','))
    expect(lines).toHaveLength(3)
    expect(csv.endsWith('\n')).toBe(true)
  })

  it('joins arrays with a pipe in stable order', () => {
    const csv = manifestCsv([item({
      sourceAliases: ['B/2.jpg', 'A/3.jpg'],
      flags: ['low-resolution', 'dark'],
      heroEligible: false,
      categories: [
        { family: 'cabins', useCase: 'wc-shower', project: 'others' },
        { family: 'containers', useCase: 'office', project: 'kiptas-vaditepe' }
      ]
    })])

    expect(csv).toContain('A/3.jpg|B/2.jpg')
    expect(csv).toContain('dark|low-resolution')
    expect(csv).toContain('cabins/wc-shower/others|containers/office/kiptas-vaditepe')
  })

  it('escapes commas, quotes and newlines per RFC 4180', () => {
    const csv = manifestCsv([item({
      title: 'Office, dormitory and canteen',
      alt: 'A sign reading "Karmod" above the door.',
      caption: 'Two lines\nof caption.'
    })])

    expect(csv).toContain('"Office, dormitory and canteen"')
    expect(csv).toContain('"A sign reading ""Karmod"" above the door."')
    expect(csv).toContain('"Two lines\nof caption."')
  })

  it('writes an empty cell for an absent optional value', () => {
    const row = manifestCsv([item()]).trimEnd().split('\n')[1]!
    const cells = row.split(',')

    expect(cells[CSV_COLUMNS.indexOf('caption')]).toBe('')
    expect(cells[CSV_COLUMNS.indexOf('capturedAt')]).toBe('')
    expect(cells[CSV_COLUMNS.indexOf('hasExif')]).toBe('true')
  })

  it('is byte-identical when serialized twice and carries no absolute path', () => {
    const items = [item()]

    expect(manifestCsv(items)).toBe(manifestCsv(items))
    expect(manifestCsv(items)).not.toContain('/Users/')
  })
})

describe('reviewReport', () => {
  const items = [
    item({ sourceAliases: ['A/2.jpg'] }),
    item({
      sha256: 'b'.repeat(64),
      filePath: 'sanity/gallery/source/cabins/retail-event-kiosk/others/others-001.jpg',
      family: 'cabins',
      useCase: 'retail-event-kiosk',
      project: 'others',
      sourcePath: 'Kabin/x.jpg',
      rightsStatus: 'review-required',
      uploadEligible: false,
      flags: ['people-or-privacy'],
      confidence: 'medium'
    }),
    item({
      sha256: 'c'.repeat(64),
      filePath: 'sanity/gallery/source/cabins/retail-event-kiosk/others/others-002.jpg',
      family: 'cabins',
      useCase: 'retail-event-kiosk',
      project: 'others',
      sourcePath: 'Kabin/y.jpg',
      order: 2,
      role: 'secondary',
      confidence: 'low',
      flags: ['low-resolution', 'possible-duplicate'],
      heroEligible: false,
      possibleDuplicateAssetIds: [`sha256:${'b'.repeat(64)}`]
    })
  ]

  it('totals the numbers the design commits to', () => {
    const report = reviewReport(items, 4)

    expect(report).toContain('Source images | 4')
    expect(report).toContain('Canonical assets | 3')
    expect(report).toContain('Exact duplicates collapsed | 1')
    expect(report).toContain('Possible duplicates flagged | 1')
    expect(report).toContain('Rights review required | 1')
    expect(report).toContain('Low resolution | 1')
    expect(report).toContain('Not hero eligible | 1')
  })

  it('breaks the package down by confidence and by taxonomy', () => {
    const report = reviewReport(items, 4)

    expect(report).toContain('| high | 1 |')
    expect(report).toContain('| medium | 1 |')
    expect(report).toContain('| low | 1 |')
    expect(report).toContain('| cabins | retail-event-kiosk | others | 2 |')
    expect(report).toContain('| containers | dormitory | kiptas-vaditepe | 1 |')
  })

  it('states the safety guarantees the package makes', () => {
    const report = reviewReport(items, 4)

    expect(report).toContain('EXIF')
    expect(report).toMatch(/no Sanity upload/i)
    expect(report).toMatch(/uploadEligible/)
    expect(report).toMatch(/hero/i)
  })

  it('lists every asset a human still has to look at', () => {
    const report = reviewReport(items, 4)

    expect(report).toContain('sanity/gallery/source/cabins/retail-event-kiosk/others/others-001.jpg')
  })

  it('ends with a newline, repeats byte-identically and carries no absolute path', () => {
    expect(reviewReport(items, 4).endsWith('\n')).toBe(true)
    expect(reviewReport(items, 4)).toBe(reviewReport(items, 4))
    expect(reviewReport(items, 4)).not.toContain('/Users/')
  })
})
