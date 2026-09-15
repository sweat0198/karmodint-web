import { computeCustomizationTotals, resolveCustomizationGroups } from '../../app/utils/customizationPricing'
import type { SanityProduct, SanitySelectedCustomization } from '../../app/types/catalog'
import { getQuoteLineFinancials, type QuoteLine } from '../../shared/utils/quoteLine'

export type UnavailableReason = 'product_unavailable' | 'size_unavailable' | 'selection_unavailable'

export interface UnavailableIssue {
  lineId: string
  productName: string
  sizeLabel: string
  groupTitle?: string
  optionTitle?: string
  reason: UnavailableReason
}

export interface PriceChange {
  lineId: string
  productName: string
  sizeLabel: string
  oldUnitPrice: number
  newUnitPrice: number
  oldIsPoa: boolean
  newIsPoa: boolean
}

export type QuoteRevalidationResult =
  | { ok: true; items: QuoteLine[] }
  | { ok: false; reason: 'unavailable'; issues: UnavailableIssue[] }
  | { ok: false; reason: 'price_changed'; changes: PriceChange[] }

export interface RevalidateQuoteItemsOptions {
  /** The customer has already seen a price diff and asked to proceed at whatever Sanity now says. */
  confirmedPrices?: boolean
}

/**
 * Re-derives every Quote Line's Product, Size Option, and customization pricing from the current
 * Sanity data (`productsById`, fetched separately so this stays a pure, unit-testable function),
 * and never carries a client-submitted price or POA flag through unchanged. Unavailable selections
 * always block, regardless of `confirmedPrices` — only a price difference can be waved through.
 */
export function revalidateQuoteItems(
  items: QuoteLine[],
  productsById: Map<string, SanityProduct>,
  options: RevalidateQuoteItemsOptions = {},
): QuoteRevalidationResult {
  const issues: UnavailableIssue[] = []
  const changes: PriceChange[] = []
  const revalidated: QuoteLine[] = []

  for (const item of items) {
    const product = productsById.get(item.productId)
    if (!product || product.status !== 'published') {
      issues.push({
        lineId: item.id,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        reason: 'product_unavailable',
      })
      continue
    }

    const size = product.sizes.find((candidate) => candidate._key === item.sizeKey)
    if (!size) {
      issues.push({
        lineId: item.id,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        reason: 'size_unavailable',
      })
      continue
    }

    let resolvedGroups
    try {
      resolvedGroups = resolveCustomizationGroups(product, item.sizeKey)
    } catch {
      issues.push({
        lineId: item.id,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        reason: 'selection_unavailable',
      })
      continue
    }

    const resolvedCustomizations: SanitySelectedCustomization[] = []
    let lineHasUnavailableSelection = false

    for (const selected of item.selectedCustomizations ?? []) {
      const group = resolvedGroups.find((candidate) => candidate._id === selected.groupId)
      const resolvedItem = group?.items.find((candidate) => candidate._key === selected.itemKey)

      if (!group || !resolvedItem) {
        issues.push({
          lineId: item.id,
          productName: item.productName,
          sizeLabel: item.sizeLabel,
          groupTitle: selected.groupTitle,
          optionTitle: selected.optionTitle,
          reason: 'selection_unavailable',
        })
        lineHasUnavailableSelection = true
        continue
      }

      resolvedCustomizations.push({
        groupId: group._id,
        groupTitle: group.title,
        itemKey: resolvedItem._key,
        optionTitle: resolvedItem.title,
        price: resolvedItem.price,
        isPoa: resolvedItem.pricingType === 'poa',
        pricingType: resolvedItem.pricingType,
        priceSource: resolvedItem.priceSource ?? 'itemDefault',
        customNotes: selected.customNotes,
      })
    }

    if (lineHasUnavailableSelection) continue

    const { subtotal: authoritativeUnitPrice, hasPoa: authoritativeIsPoa } = computeCustomizationTotals(
      size,
      resolvedCustomizations,
    )

    const claimed = getQuoteLineFinancials(item)
    if (claimed.unitPrice !== authoritativeUnitPrice || claimed.isPoa !== authoritativeIsPoa) {
      changes.push({
        lineId: item.id,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        oldUnitPrice: claimed.unitPrice,
        newUnitPrice: authoritativeUnitPrice,
        oldIsPoa: claimed.isPoa,
        newIsPoa: authoritativeIsPoa,
      })
    }

    revalidated.push({
      ...item,
      sizeLabel: size.label,
      basePrice: authoritativeUnitPrice,
      customTotal: authoritativeUnitPrice,
      isPoa: authoritativeIsPoa,
      selectedCustomizations: resolvedCustomizations,
    })
  }

  if (issues.length > 0) return { ok: false, reason: 'unavailable', issues }
  if (changes.length > 0 && !options.confirmedPrices) return { ok: false, reason: 'price_changed', changes }
  return { ok: true, items: revalidated }
}
