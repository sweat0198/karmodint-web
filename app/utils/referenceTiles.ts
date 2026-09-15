import type { ClientReference, ReferenceTile } from '~/types/reference'
import { sanityImageUrl } from '~/utils/sanityImageUrl'

export function toReferenceTiles(
  references: ClientReference[] | null | undefined,
  projectId: string,
  dataset: string
): ReferenceTile[] {
  return (references ?? []).flatMap((reference) => {
    const logoUrl = sanityImageUrl(reference.logo.asset?._ref, projectId, dataset, {
      width: 320,
      fit: 'max'
    })

    if (!logoUrl) return []

    return [{
      _id: reference._id,
      companyName: reference.companyName,
      location: reference.location,
      logoUrl,
      website: reference.website
    }]
  })
}
