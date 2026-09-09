import { formatFootprintLabel } from '../../../shared/utils/sizeLabels'

export interface ProductSize {
  _key?: string
  label?: string
  lengthM?: number
  widthM?: number
}

export interface ProductWithSizes {
  _id: string
  sizes?: ProductSize[]
}

export interface LabelChange {
  productId: string
  sizeKey: string
  from: string | undefined
  to: string
}

/** Return only labels whose stored value differs from their dimension-derived label. */
export function labelsToUpdate(product: ProductWithSizes): LabelChange[] {
  return (product.sizes ?? []).flatMap((size) => {
    if (!size._key || typeof size.lengthM !== 'number' || typeof size.widthM !== 'number') {
      throw new Error(`Product ${product._id} has a size without _key, lengthM, or widthM`)
    }

    const label = formatFootprintLabel(size.lengthM, size.widthM)
    return label === size.label
      ? []
      : [{ productId: product._id, sizeKey: size._key, from: size.label, to: label }]
  })
}

/** Sanity's field-path map; deliberately changes only Size Label fields. */
export function labelPatchSet(changes: LabelChange[]): Record<string, string> {
  return Object.fromEntries(
    changes.map((change) => [
      `sizes[_key == ${JSON.stringify(change.sizeKey)}].label`,
      change.to
    ])
  )
}
