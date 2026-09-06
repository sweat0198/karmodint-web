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
  configState?: CustomizationSelections
  customizationNotes?: CustomizationNotes
  customTotal?: number
  specSummary?: SpecSummaryItem[]
  selectedCustomizations?: SanitySelectedCustomization[]
  isPoa?: boolean
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
