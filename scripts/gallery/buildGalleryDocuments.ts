import type { GallerySeed } from './data'

export interface GalleryManifestEntry {
  filePath: string
  title: string
  alt: string
  rightsStatus: string
  uploadEligible: boolean
}

export interface GalleryEntryDocument {
  _id: string
  _type: 'galleryEntry'
  projectTitle: string
  image: {
    _type: 'image'
    asset: { _type: 'reference', _ref: string }
    alt: string
  }
  category: { _type: 'reference', _ref: string }
  description: string
}

/**
 * Turn the curated selection into `galleryEntry` documents.
 *
 * Title and alt text come from the manifest rather than the seed: the manifest is what the photo
 * audit corrects, so a copy fix there reaches the Studio on the next import without touching this
 * list. `order` is deliberately never set — the schema falls back to alphabetical.
 */
export function buildGalleryDocuments(
  seeds: GallerySeed[],
  manifest: GalleryManifestEntry[],
  assetIds: Record<string, string>
): GalleryEntryDocument[] {
  const byPath = new Map(manifest.map((entry) => [entry.filePath, entry]))

  return seeds.map((seed) => {
    const entry = byPath.get(seed.filePath)
    if (entry === undefined) {
      throw new Error(`${seed.id}: no manifest entry for ${seed.filePath}`)
    }
    // A photo the audit has not cleared must never be published by an unattended script; that
    // gate is the whole point of tracking rights status alongside the image.
    if (!entry.uploadEligible) {
      throw new Error(
        `${seed.id}: ${seed.filePath} is rightsStatus "${entry.rightsStatus}" and not upload eligible`
      )
    }
    const assetId = assetIds[seed.filePath]
    if (!assetId) {
      throw new Error(`${seed.id}: no uploaded asset for ${seed.filePath}`)
    }

    return {
      _id: seed.id,
      _type: 'galleryEntry' as const,
      projectTitle: entry.title,
      image: {
        _type: 'image' as const,
        asset: { _type: 'reference' as const, _ref: assetId },
        alt: entry.alt
      },
      category: { _type: 'reference' as const, _ref: seed.categoryId },
      description: seed.description
    }
  })
}
