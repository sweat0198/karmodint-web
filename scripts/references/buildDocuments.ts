import type { ReferenceSeed } from './data'

export interface ReferenceDocument {
  _id: string
  _type: 'clientReference'
  companyName: string
  location?: string
  logo: {
    _type: 'image'
    asset: {
      _type: 'reference'
      _ref: string
    }
  }
  website?: string
  displayOrder: number
}

export function buildReferenceDocuments(
  seeds: ReferenceSeed[],
  assetIds: Record<string, string>
): ReferenceDocument[] {
  for (const seed of seeds) {
    if (!assetIds[seed.logoPath]) {
      throw new Error(`Missing uploaded logo for ${seed.logoPath}`)
    }
  }

  return seeds.map((seed) => ({
    _id: seed.published ? seed.id : `drafts.${seed.id}`,
    _type: 'clientReference' as const,
    companyName: seed.companyName,
    ...(seed.location === undefined ? {} : { location: seed.location }),
    logo: {
      _type: 'image' as const,
      asset: {
        _type: 'reference' as const,
        _ref: assetIds[seed.logoPath]
      }
    },
    ...(seed.website === undefined ? {} : { website: seed.website }),
    displayOrder: seed.displayOrder
  }))
}
