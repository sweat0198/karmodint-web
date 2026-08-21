/**
 * Closed vocabulary for the renders attached to a size option.
 *
 * Stored values mirror the render filenames so the catalogue import maps straight off the
 * filesystem with no translation table. Array order is gallery order — `front` leads so the
 * size preview always shows the front elevation.
 *
 * `altPhrase` is the tail of the templated alt text: "<product> <size label>, <altPhrase>".
 * Alt text is generated rather than hand-written so it cannot drift as sizes are added.
 */
export const PRODUCT_IMAGE_VIEWS = [
  { value: 'front', title: 'Front', altPhrase: 'front view' },
  { value: 'left-diagonal', title: 'Three-quarter (left)', altPhrase: 'three-quarter view from the left' },
  { value: 'right-diagonal', title: 'Three-quarter (right)', altPhrase: 'three-quarter view from the right' },
  { value: 'right', title: 'Right', altPhrase: 'right side view' },
  { value: 'back', title: 'Rear', altPhrase: 'rear view' },
  { value: 'interior', title: 'Interior', altPhrase: 'interior view' },
  { value: 'door', title: 'Door detail', altPhrase: 'door detail' },
  { value: 'top', title: 'Plan / top-down', altPhrase: 'plan view from above' }
] as const

export type ProductImageView = (typeof PRODUCT_IMAGE_VIEWS)[number]['value']

export const PRODUCT_IMAGE_VIEW_VALUES: ProductImageView[] = PRODUCT_IMAGE_VIEWS.map((v) => v.value)

/** The view that carries the plan drawing. Exactly one per size — see validateExactlyOneTopView. */
export const PLAN_VIEW: ProductImageView = 'top'

/** Options list for the `view` string field in the Studio. */
export function viewOptionList(): Array<{ title: string, value: ProductImageView }> {
  return PRODUCT_IMAGE_VIEWS.map(({ title, value }) => ({ title, value }))
}

/** Alt-text fragment for a view; empty string for anything outside the vocabulary. */
export function altPhraseForView(view: ProductImageView): string {
  return PRODUCT_IMAGE_VIEWS.find((v) => v.value === view)?.altPhrase ?? ''
}

/**
 * A size's gallery must hold exactly one plan view.
 *
 * Returns `true` for an absent or empty gallery — that is the `required().min(1)` rule's job to
 * report, and stacking a second message on the same field only obscures it.
 */
export function validateExactlyOneTopView(images: Array<{ view?: string }> | undefined): true | string {
  if (!images || images.length === 0) return true

  const planCount = images.filter((image) => image?.view === PLAN_VIEW).length
  if (planCount === 1) return true

  return `Each size needs exactly one image with the "Plan / top-down" view (found ${planCount})`
}
