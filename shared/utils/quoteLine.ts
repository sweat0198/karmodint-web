import type { CarouselImage, SanitySelectedCustomization } from '~/types/catalog'
import type { CustomizationNotes, CustomizationSelections, SpecSummaryItem } from '~/types/customization'

/**
 * A Size Option a visitor has put in their Quote List, plus whatever they customized it with.
 * One line per Product + Size Option (D6).
 */
export interface QuoteLine {
  id: string
  productId: string
  productName: string
  productSlug: string
  sizeKey: string
  sizeLabel: string
  basePrice?: number
  priceModifier?: number
  quantity: number
  notes?: string
  image?: string
  /**
   * Every angle of this size, for the customize page's viewer. Optional: carts persisted before
   * this field existed replay with only `image`, and the viewer falls back to that single render.
   */
  images?: CarouselImage[]
  /** The plan attached to the selected size only; omitted for representative product imagery. */
  floorPlan?: CarouselImage
  configState?: CustomizationSelections
  customizationNotes?: CustomizationNotes
  customTotal?: number
  specSummary?: SpecSummaryItem[]
  selectedCustomizations?: SanitySelectedCustomization[]
  isPoa?: boolean
  /** Portable containers enter Customize before a concrete size has been selected. */
  isPortableContainer?: boolean
  /** Omitted for every legacy and non-container line; false blocks quote progression/submission. */
  hasSelectedSize?: boolean
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).sort().join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

/** A portable quote line is identical only when its model, size, options, and notes all match. */
export function getPortableConfigurationKey(line: Pick<QuoteLine, 'configState' | 'customizationNotes'>): string {
  return canonicalJson({ selections: line.configState ?? {}, notes: line.customizationNotes ?? {} })
}

/** Hex is longer than raw JSON but safe in DOM ids, CSS selectors, URLs, and persisted state. */
function selectorSafeKey(value: string): string {
  return Array.from(value)
    .map((character) => character.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('')
}

/** Existing product-size IDs remain stable; portable IDs include their selected configuration. */
export function getQuoteLineId(line: Omit<QuoteLine, 'id'>): string {
  if (!line.isPortableContainer || line.hasSelectedSize === false) {
    return `${line.productId}-${line.sizeKey}`
  }
  return `${line.productId}-${line.sizeKey}-config-${selectorSafeKey(getPortableConfigurationKey(line))}`
}

export function requiresSizeSelection(line: Pick<QuoteLine, 'isPortableContainer' | 'hasSelectedSize' | 'sizeKey'>): boolean {
  return line.isPortableContainer === true && (line.hasSelectedSize === false || !line.sizeKey)
}

/** The subset of a Quote Line that the financials rules read. */
export type QuoteLinePriceInputs = Pick<QuoteLine, 'basePrice' | 'customTotal' | 'isPoa' | 'quantity'>

export interface QuoteLineFinancials {
  /** The line's current per-unit price: the customized total when one exists, else the price captured at add time. */
  unitPrice: number
  /** Whether this line is POA, per the stored flag rather than an inference from a missing price. */
  isPoa: boolean
  /** `unitPrice * quantity`. */
  lineTotal: number
}

/**
 * The one place that decides what a Quote Line currently costs. `customTotal` wins over
 * `basePrice` because customizing a line is what keeps its price current; `basePrice` is only
 * what was captured at add time.
 */
export function getQuoteLineFinancials(line: QuoteLinePriceInputs): QuoteLineFinancials {
  const unitPrice = line.customTotal ?? line.basePrice ?? 0
  const isPoa = line.isPoa === true
  return {
    unitPrice,
    isPoa,
    lineTotal: unitPrice * line.quantity
  }
}

/** The Quote List total: every line's `lineTotal`, POA lines included at their current price. */
export function getQuoteLinesTotal(lines: QuoteLinePriceInputs[]): number {
  return lines.reduce((sum, line) => sum + getQuoteLineFinancials(line).lineTotal, 0)
}
