import { describe, expect, it } from 'vitest'
import type {
  GalleryCategory,
  GalleryClassification,
  ScannedImage
} from '../../scripts/gallery/lib/model'
import { planGalleryAssets } from '../../scripts/gallery/lib/planAssets'

const HASH_A = 'a'.repeat(64)
const HASH_B = 'b'.repeat(64)
const HASH_C = 'c'.repeat(64)

const primary: GalleryCategory = {
  family: 'containers',
  useCase: 'dormitory',
  project: 'kiptas-vaditepe'
}

const secondary: GalleryCategory = {
  family: 'containers',
  useCase: 'construction-site',
  project: 'kiptas-vaditepe'
}

function scan(overrides: Partial<ScannedImage> & Pick<ScannedImage, 'sourcePath'>): ScannedImage {
  return {
    absolutePath: `/somewhere/${overrides.sourcePath}`,
    sha256: HASH_A,
    format: 'jpeg',
    width: 4000,
    height: 3000,
    byteSize: 2_000_000,
    hasExif: true,
    hasGpsMetadata: false,
    hasCameraSerial: false,
    hasExifComment: false,
    ...overrides
  }
}

function classification(
  overrides: Partial<GalleryClassification> & Pick<GalleryClassification, 'sourcePath'>
): GalleryClassification {
  return {
    ...primary,
    categories: [],
    title: 'Container dormitory block',
    alt: 'White container dormitory units arranged in two rows on a gravel site.',
    order: 1,
    role: 'hero',
    confidence: 'high',
    flags: [],
    rightsStatus: 'unknown',
    ...overrides
  }
}

describe('planGalleryAssets', () => {
  it('plans one canonical asset for a single image', () => {
    const planned = planGalleryAssets(
      [scan({ sourcePath: 'Konteyner/Yatakhane/1.jpg' })],
      [classification({ sourcePath: 'Konteyner/Yatakhane/1.jpg' })]
    )

    expect(planned).toHaveLength(1)
    expect(planned[0]).toMatchObject({
      assetId: `sha256:${HASH_A}`,
      sha256: HASH_A,
      filePath: 'sanity/gallery/source/containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-001.jpg',
      sourcePath: 'Konteyner/Yatakhane/1.jpg',
      sourceAliases: [],
      width: 4000,
      height: 3000,
      byteSize: 2_000_000,
      uploadEligible: true,
      heroEligible: true
    })
  })

  it('collapses an exact duplicate pair into one file with an alias', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'B/2.JPG', sha256: HASH_A })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', preferredCanonical: true }),
        classification({ sourcePath: 'B/2.JPG', ...secondary, categories: [] })
      ]
    )

    expect(planned).toHaveLength(1)
    expect(planned[0]!.sourcePath).toBe('A/1.jpg')
    expect(planned[0]!.sourceAliases).toEqual(['B/2.JPG'])
    expect(planned[0]!.categories).toContainEqual(secondary)
    expect(planned[0]!.family).toBe(primary.family)
    expect(planned[0]!.useCase).toBe(primary.useCase)
  })

  it('refuses a duplicate group without exactly one preferred canonical', () => {
    const scans = [
      scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
      scan({ sourcePath: 'B/2.jpg', sha256: HASH_A })
    ]

    expect(() => planGalleryAssets(scans, [
      classification({ sourcePath: 'A/1.jpg' }),
      classification({ sourcePath: 'B/2.jpg' })
    ])).toThrow(/preferredCanonical/)

    expect(() => planGalleryAssets(scans, [
      classification({ sourcePath: 'A/1.jpg', preferredCanonical: true }),
      classification({ sourcePath: 'B/2.jpg', preferredCanonical: true })
    ])).toThrow(/preferredCanonical/)
  })

  it('refuses a preferred canonical on an image with no exact duplicate', () => {
    expect(() => planGalleryAssets(
      [scan({ sourcePath: 'A/1.jpg' })],
      [classification({ sourcePath: 'A/1.jpg', preferredCanonical: true })]
    )).toThrow(/preferredCanonical/)
  })

  it('takes the strictest rights posture across a duplicate group', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'B/2.jpg', sha256: HASH_A })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', preferredCanonical: true }),
        classification({ sourcePath: 'B/2.jpg', rightsStatus: 'review-required', flags: ['people-or-privacy'] })
      ]
    )

    expect(planned[0]).toMatchObject({ rightsStatus: 'review-required', uploadEligible: false })
    expect(planned[0]!.flags).toContain('people-or-privacy')
  })

  it('keeps visually similar images with different hashes separate', () => {
    const hashes = Array.from({ length: 7 }, (_, index) => String(index).repeat(64))
    const planned = planGalleryAssets(
      hashes.map((sha256, index) => scan({ sourcePath: `A/${index}.jpg`, sha256 })),
      hashes.map((_, index) => classification({ sourcePath: `A/${index}.jpg`, order: index + 1 }))
    )

    expect(planned).toHaveLength(7)
    expect(new Set(planned.map((item) => item.filePath)).size).toBe(7)
  })

  it('resolves possible-duplicate source links to stable asset ids and flags both sides', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'A/2.jpg', sha256: HASH_B })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', order: 1, possibleDuplicateSources: ['A/2.jpg'] }),
        classification({ sourcePath: 'A/2.jpg', order: 2, role: 'secondary', possibleDuplicateSources: ['A/1.jpg'] })
      ]
    )

    expect(planned[0]!.possibleDuplicateAssetIds).toEqual([`sha256:${HASH_B}`])
    expect(planned[1]!.possibleDuplicateAssetIds).toEqual([`sha256:${HASH_A}`])
    expect(planned[0]!.flags).toContain('possible-duplicate')
    expect(planned[1]!.flags).toContain('possible-duplicate')
  })

  it('refuses a possible-duplicate link to an unscanned source', () => {
    expect(() => planGalleryAssets(
      [scan({ sourcePath: 'A/1.jpg' })],
      [classification({ sourcePath: 'A/1.jpg', possibleDuplicateSources: ['A/gone.jpg'] })]
    )).toThrow(/A\/gone\.jpg/)
  })

  it('merges secondary categories without repeating a row', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'B/2.jpg', sha256: HASH_A })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', preferredCanonical: true, categories: [secondary] }),
        classification({ sourcePath: 'B/2.jpg', ...secondary, categories: [primary] })
      ]
    )

    expect(planned[0]!.categories).toEqual([secondary])
  })

  it('derives the output suffix from the decoded format, not the source suffix', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.JPG', sha256: HASH_A }),
        scan({ sourcePath: 'A/2.jpeg', sha256: HASH_B }),
        scan({ sourcePath: 'A/3.png', sha256: HASH_C, format: 'png' })
      ],
      [
        classification({ sourcePath: 'A/1.JPG', order: 1 }),
        classification({ sourcePath: 'A/2.jpeg', order: 2, role: 'secondary' }),
        classification({ sourcePath: 'A/3.png', order: 3, role: 'secondary' })
      ]
    )

    expect(planned.map((item) => item.filePath)).toEqual([
      'sanity/gallery/source/containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-001.jpg',
      'sanity/gallery/source/containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-002.jpg',
      'sanity/gallery/source/containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-003.png'
    ])
  })

  it('refuses a repeated order inside one physical project group', () => {
    expect(() => planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'A/2.jpg', sha256: HASH_B })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', order: 4 }),
        classification({ sourcePath: 'A/2.jpg', order: 4, role: 'secondary' })
      ]
    )).toThrow(/order/)
  })

  it('refuses a scanned image with no classification, and a classification with no image', () => {
    expect(() => planGalleryAssets([scan({ sourcePath: 'A/1.jpg' })], []))
      .toThrow(/A\/1\.jpg/)
    expect(() => planGalleryAssets([], [classification({ sourcePath: 'A/1.jpg' })]))
      .toThrow(/A\/1\.jpg/)
  })

  it('keeps flagged and review-required assets in the plan while blocking their use', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_A, width: 640, height: 480 }),
        scan({ sourcePath: 'A/2.jpg', sha256: HASH_B })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', order: 1, flags: ['low-resolution'] }),
        classification({ sourcePath: 'A/2.jpg', order: 2, rightsStatus: 'review-required' })
      ]
    )

    expect(planned).toHaveLength(2)
    expect(planned[0]).toMatchObject({ heroEligible: false, uploadEligible: true })
    expect(planned[1]).toMatchObject({ heroEligible: true, uploadEligible: false })
  })

  it('adds capture-metadata flags from the scan without carrying any value', () => {
    const planned = planGalleryAssets(
      [scan({ sourcePath: 'A/1.jpg', hasGpsMetadata: true, hasCameraSerial: true, hasExifComment: true })],
      [classification({ sourcePath: 'A/1.jpg' })]
    )

    expect(planned[0]!.flags).toEqual(
      expect.arrayContaining(['gps-metadata', 'camera-serial-metadata', 'exif-comment-metadata'])
    )
  })

  it('sorts by taxonomy then order then asset id', () => {
    const planned = planGalleryAssets(
      [
        scan({ sourcePath: 'A/1.jpg', sha256: HASH_C }),
        scan({ sourcePath: 'A/2.jpg', sha256: HASH_A }),
        scan({ sourcePath: 'A/3.jpg', sha256: HASH_B })
      ],
      [
        classification({ sourcePath: 'A/1.jpg', order: 2, role: 'secondary' }),
        classification({ sourcePath: 'A/2.jpg', family: 'cabins', useCase: 'wc-shower', project: 'others', order: 1 }),
        classification({ sourcePath: 'A/3.jpg', order: 1 })
      ]
    )

    expect(planned.map((item) => item.sourcePath)).toEqual(['A/2.jpg', 'A/3.jpg', 'A/1.jpg'])
  })
})
