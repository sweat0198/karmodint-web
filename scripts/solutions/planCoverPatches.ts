import type { SolutionCover } from './data'

export interface SolutionRecord {
  _id: string
  slug: string
}

export interface CoverPatch {
  documentId: string
  coverImage: {
    _type: 'image'
    asset: { _type: 'reference', _ref: string }
    alt: string
  }
}

/**
 * One `coverImage` patch per Solution document, published and draft alike.
 *
 * A pending draft is patched too: publishing it later would otherwise overwrite the new cover
 * with the draft's stale one. Coverage is checked both ways so a renamed slug or a newly added
 * Solution fails the run instead of silently keeping an empty cover.
 */
export function planCoverPatches(
  covers: SolutionCover[],
  solutions: SolutionRecord[],
  assetIds: Record<string, string>
): CoverPatch[] {
  const coveredSlugs = new Set(covers.map((cover) => cover.slug))
  const uncovered = solutions.find((solution) => !coveredSlugs.has(solution.slug))
  if (uncovered) throw new Error(`No cover selected for Solution "${uncovered.slug}" (${uncovered._id})`)

  return covers.flatMap((cover) => {
    const documents = solutions
      .filter((solution) => solution.slug === cover.slug)
      .sort((a, b) => Number(a._id.startsWith('drafts.')) - Number(b._id.startsWith('drafts.')))
    if (documents.length === 0) throw new Error(`No Solution with slug "${cover.slug}" in the dataset`)

    const assetId = assetIds[cover.imagePath]
    if (!assetId) throw new Error(`Missing uploaded cover for ${cover.imagePath}`)

    return documents.map((document) => ({
      documentId: document._id,
      coverImage: {
        _type: 'image' as const,
        asset: { _type: 'reference' as const, _ref: assetId },
        alt: cover.alt
      }
    }))
  })
}
