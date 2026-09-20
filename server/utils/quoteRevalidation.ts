import { computeCustomizationTotals, resolveCustomizationGroups } from '../../app/utils/customizationPricing'
import { evaluateCustomizationConstraints } from '../../app/utils/customizationConstraints'
import type { SanityProduct, SanitySelectedCustomization } from '../../app/types/catalog'
import type { CustomizationSelections } from '../../app/types/customization'
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

function selectionsFromLines(
  groups: ReturnType<typeof resolveCustomizationGroups>,
  lines: SanitySelectedCustomization[],
): CustomizationSelections {
  const selections: CustomizationSelections = {}
  for (const group of groups) {
    const itemKeys = lines
      .filter((line) => line.groupId === group._id && line.itemKey)
      .map((line) => line.itemKey!)
    if (group.selectionType === 'multiple') selections[group._id] = itemKeys
    else if (group.selectionType === 'single') selections[group._id] = itemKeys[0] ?? null
    else selections[group._id] = itemKeys.length > 0
  }
  return selections
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
    const resolvedSelectionKeys = new Set<string>()
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

      const selectionKey = `${group._id}:${resolvedItem._key}`
      if (resolvedSelectionKeys.has(selectionKey)) {
        issues.push({
          lineId: item.id,
          productName: item.productName,
          sizeLabel: item.sizeLabel,
          groupTitle: group.title,
          optionTitle: resolvedItem.title,
          reason: 'selection_unavailable',
        })
        lineHasUnavailableSelection = true
        continue
      }
      resolvedSelectionKeys.add(selectionKey)

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

    const constraintEvaluation = evaluateCustomizationConstraints(
      resolvedGroups,
      selectionsFromLines(resolvedGroups, resolvedCustomizations),
    )
    for (const violation of constraintEvaluation.violations) {
      const group = resolvedGroups.find((candidate) => candidate._id === violation.groupId)
      issues.push({
        lineId: item.id,
        productName: item.productName,
        sizeLabel: item.sizeLabel,
        groupTitle: group?.title,
        optionTitle: violation.itemTitle,
        reason: 'selection_unavailable',
      })
    }
    if (constraintEvaluation.violations.length > 0) continue

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
