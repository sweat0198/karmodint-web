import { altPhraseForView, type ProductImageView } from '../../../sanity/schemas/objects/productImageViews'

/**
 * Alt text for one render, from a template rather than by hand.
 *
 * Hand-written alts would drift the moment a size is added or a render is re-shot, and there are
 * 120 of them across the catalogue. The shape is "<product> <size label>, <view phrase>", with the
 * view phrase owned by the vocabulary in `productImageViews.ts`.
 */
export function renderAltText(productName: string, sizeLabel: string, view: ProductImageView): string {
  return `${productName} ${sizeLabel}, ${altPhraseForView(view)}`
}
