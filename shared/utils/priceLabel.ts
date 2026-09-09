/**
 * The one place that turns the POA flag and the unsupplied-weight sentinel (`weightKg: 0`) into
 * a string to show. See docs/GLOSSARY.md for what the two sentinels mean.
 */

export interface PoaAmount {
  price?: number
  isPoa?: boolean
}

/** A single priced thing (a Size Option, a customization item): bare `POA` when it is one. */
export function getPriceLabel(input: PoaAmount, currencySymbol = '£'): string {
  if (input.isPoa === true || input.price === undefined) return 'POA'
  return `${currencySymbol}${input.price.toLocaleString()}`
}

/**
 * A priced total that may carry POA extras on top of it — a size price plus POA customizations,
 * or a Quote Line's own total. POA is additive (D11): `£3,240 + POA`, never blended into one
 * figure, and never shown as a bare `POA` — the caller uses {@link getPriceLabel} for that case.
 */
export function getTotalLabel(input: { total: number; hasPoa: boolean }, currencySymbol = '£'): string {
  const formatted = `${currencySymbol}${input.total.toLocaleString()}`
  return input.hasPoa ? `${formatted} + POA` : formatted
}

/**
 * A total across sibling lines (distinct products in one enquiry) where some are entirely POA
 * and others are priced — a different aggregation from {@link getTotalLabel}'s "priced base plus
 * POA extras within one line" case, so it gets its own wording rather than reusing "+ POA".
 */
export function getPartialTotalLabel(input: { total: number; hasPoa: boolean }, currencySymbol = '£'): string {
  return input.hasPoa ? 'Part POA' : `${currencySymbol}${input.total.toLocaleString()}`
}

/** Whether a price can be published at all — a POA size's stored price is a placeholder. */
export function hasPublishablePrice(input: PoaAmount): boolean {
  return input.isPoa !== true && input.price !== undefined
}

/** `weightKg: 0` means "not yet supplied", not weightless — omitted rather than shown as "Weight: 0kg". */
export function getWeightLabel(weightKg: number | undefined): string | undefined {
  return weightKg ? `Weight: ${weightKg}kg` : undefined
}
