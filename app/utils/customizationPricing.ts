import type {
  CustomizationPriceSource,
  PricingType,
  SanityCustomizationGroup,
  SanityCustomizationItem,
  SanityCustomizationItemOverride,
  SanityCustomizationSizeRule,
  SanityProductCustomizationConfiguration,
  SanitySizeOption,
} from '~/types/catalog'
import type { CustomizationNotes, CustomizationSelections } from '~/types/customization'

export interface ResolvedCustomizationItemPricing {
  pricingType: PricingType
  price: number | undefined
}

export interface CustomizationPricingTotals {
  subtotal: number
  hasPoa: boolean
}

/**
 * The one place that turns a Size Option and its selected customizations into a subtotal and a
 * POA flag: a POA Size Option zeroes the subtotal entirely, POA customizations are excluded from
 * the sum rather than blended in (POA is additive — see docs/GLOSSARY.md). Shared by the client's
 * live pricing composable and the server's revalidation module so this rule can't drift between
 * the two.
 */
export function computeCustomizationTotals(
  size: { price?: number; isPoa?: boolean } | undefined,
  customizations: Array<{ price?: number; isPoa?: boolean }>,
): CustomizationPricingTotals {
  const sizeIsPoa = size?.isPoa === true
  const itemsTotal = customizations.reduce((sum, item) => sum + (item.isPoa ? 0 : item.price ?? 0), 0)

  return {
    subtotal: sizeIsPoa ? 0 : (size?.price ?? 0) + itemsTotal,
    hasPoa: sizeIsPoa || customizations.some((item) => item.isPoa === true),
  }
}

/** Which precedence tier decided a resolved item's price — Size Option rule, Product override, or the item's own default. */
export function resolveCustomizationPriceSource(
  override?: SanityCustomizationItemOverride,
  sizeRule?: SanityCustomizationSizeRule,
): CustomizationPriceSource {
  if (sizeRule && sizeRule.mode !== 'inherit' && sizeRule.mode !== 'unavailable') return 'sizeRule'
  if (override && (override.pricingType !== undefined || override.price !== undefined)) return 'productOverride'
  return 'itemDefault'
}

/** Resolves Size Option, Product, and item-default pricing in precedence order. */
export function resolveCustomizationItemPricing(
  item: SanityCustomizationItem,
  override?: SanityCustomizationItemOverride,
  sizeRule?: SanityCustomizationSizeRule,
): ResolvedCustomizationItemPricing {
  if (sizeRule && sizeRule.mode !== 'inherit' && sizeRule.mode !== 'unavailable') {
    if (sizeRule.mode === 'included') return { pricingType: 'included', price: 0 }
    if (sizeRule.mode === 'poa') return { pricingType: 'poa', price: undefined }

    return { pricingType: 'fixed', price: sizeRule.price }
  }

  const pricingType = override?.pricingType ?? item.pricingType

  if (pricingType === 'included') return { pricingType, price: 0 }
  if (pricingType === 'poa') return { pricingType, price: undefined }

  return { pricingType, price: override?.price ?? item.price ?? 0 }
}

function validateSizeRules(
  override: SanityCustomizationItemOverride,
  availableSizeOptionKeys?: Set<string>,
): void {
  const sizeRuleKeys = new Set<string>()
  for (const sizeRule of override.sizeRules ?? []) {
    if (!sizeRule.sizeOptionKey) {
      throw new Error(`Customization item "${override.itemKey}" has a Size Option rule without a key`)
    }
    if (availableSizeOptionKeys && !availableSizeOptionKeys.has(sizeRule.sizeOptionKey)) {
      throw new Error(`Customization item "${override.itemKey}" references unknown Size Option "${sizeRule.sizeOptionKey}"`)
    }
    if (sizeRuleKeys.has(sizeRule.sizeOptionKey)) {
      throw new Error(`Customization item "${override.itemKey}" has more than one rule for Size Option "${sizeRule.sizeOptionKey}"`)
    }
    sizeRuleKeys.add(sizeRule.sizeOptionKey)
  }
}

function findSizeRule(
  override: SanityCustomizationItemOverride | undefined,
  selectedSizeOptionKey: string | undefined,
): SanityCustomizationSizeRule | undefined {
  if (!override || !selectedSizeOptionKey) return undefined
  return override.sizeRules?.find((sizeRule) => sizeRule.sizeOptionKey === selectedSizeOptionKey)
}

function validateSizeOptionKeys(sizes: SanitySizeOption[] | undefined): Set<string> | undefined {
  if (!sizes) return undefined

  const sizeOptionKeys = new Set<string>()
  for (const size of sizes) {
    if (!size._key) {
      throw new Error('Product contains a Size Option without a key')
    }
    if (sizeOptionKeys.has(size._key)) {
      throw new Error(`Product has more than one Size Option "${size._key}"`)
    }
    sizeOptionKeys.add(size._key)
  }

  return sizeOptionKeys
}

function resolveConfiguredGroup(
  configuration: SanityProductCustomizationConfiguration,
  selectedSizeOptionKey?: string,
  availableSizeOptionKeys?: Set<string>,
): SanityCustomizationGroup {
  const itemKeys = new Set<string>()
  for (const item of configuration.group.items) {
    if (!item._key) {
      throw new Error(`Customization Group "${configuration.group.title}" contains an item without a key`)
    }
    if (itemKeys.has(item._key)) {
      throw new Error(`Customization Group "${configuration.group.title}" has more than one item "${item._key}"`)
    }
    itemKeys.add(item._key)
  }
  const overrideKeys = new Set<string>()
  for (const override of configuration.itemOverrides ?? []) {
    if (!override.itemKey) {
      throw new Error('Customization Product override does not identify an item')
    }
    if (!itemKeys.has(override.itemKey)) {
      throw new Error(`Customization override references unknown item "${override.itemKey}"`)
    }
    if (overrideKeys.has(override.itemKey)) {
      throw new Error(`Customization item "${override.itemKey}" has more than one Product override`)
    }
    overrideKeys.add(override.itemKey)
    validateSizeRules(override, availableSizeOptionKeys)
  }

  const overrides = new Map(
    (configuration.itemOverrides ?? []).map((override) => [override.itemKey, override]),
  )

  return {
    ...configuration.group,
    items: configuration.group.items
      .flatMap((item) => {
        const override = overrides.get(item._key!)
        if (override?.enabled === false) return []

        const sizeRule = findSizeRule(override, selectedSizeOptionKey)
        if (sizeRule?.mode === 'unavailable') return []

        return [{
          ...item,
          title: sizeRule?.titleOverride ?? override?.titleOverride ?? item.title,
          description: sizeRule?.descriptionOverride ?? override?.descriptionOverride ?? item.description,
          ...resolveCustomizationItemPricing(item, override, sizeRule),
          priceSource: resolveCustomizationPriceSource(override, sizeRule),
        }]
      }),
  }
}

/** Product configurations take priority; direct Product groups remain migration fallback. */
export function resolveCustomizationGroups(product: {
  sizes?: SanitySizeOption[]
  customizationConfigurations?: SanityProductCustomizationConfiguration[]
  customizationGroups?: SanityCustomizationGroup[]
}, selectedSizeOptionKey?: string): SanityCustomizationGroup[] {
  if (product.customizationConfigurations?.length) {
    if (!selectedSizeOptionKey?.trim()) {
      throw new Error('Customization resolver requires a selected Size Option key')
    }

    const availableSizeOptionKeys = validateSizeOptionKeys(product.sizes)
    if (availableSizeOptionKeys && !availableSizeOptionKeys.has(selectedSizeOptionKey)) {
      throw new Error(`Customization resolver received unknown Size Option "${selectedSizeOptionKey}"`)
    }

    return product.customizationConfigurations
      .map((configuration) => resolveConfiguredGroup(configuration, selectedSizeOptionKey, availableSizeOptionKeys))
      .filter((group) => group.items.length > 0)
  }

  return product.customizationGroups ?? []
}

export interface CustomizationSelectionReconciliation {
  selections: CustomizationSelections
  notes: CustomizationNotes
  /** Titles of items the customer had selected that the new Size Option no longer offers. */
  removedTitles: string[]
}

/**
 * Carries a customer's selections and notes across a Size Option change. An item still offered by
 * `nextGroups` (resolved for the new size) keeps its selection and any note; one the new size no
 * longer offers is dropped and named in `removedTitles`, so the caller can tell the customer what
 * changed rather than silently discarding it.
 */
export function reconcileCustomizationSelections(
  previousGroups: SanityCustomizationGroup[],
  nextGroups: SanityCustomizationGroup[],
  selections: CustomizationSelections,
  notes: CustomizationNotes,
): CustomizationSelectionReconciliation {
  const nextGroupsById = new Map(nextGroups.map((group) => [group._id, group]))
  const nextSelections: CustomizationSelections = {}
  const removedTitles: string[] = []
  const keptNoteKeys = new Set<string>()

  const reportRemoved = (group: SanityCustomizationGroup, itemKey: string | undefined) => {
    const removed = group.items.find((item) => item._key === itemKey)
    if (removed) removedTitles.push(removed.title)
  }

  for (const group of previousGroups) {
    const value = selections[group._id]
    if (value === undefined) continue

    const nextGroup = nextGroupsById.get(group._id)

    if (group.selectionType === 'single') {
      if (value === null) {
        // "None" names no item, so there's nothing to report removed; it's only worth keeping
        // when the group itself still exists for the customer to see it selected in.
        if (nextGroup) nextSelections[group._id] = null
      } else if (nextGroup?.items.some((item) => item._key === value)) {
        nextSelections[group._id] = value
        keptNoteKeys.add(`${group._id}:${value}`)
      } else {
        reportRemoved(group, value as string)
      }
      continue
    }

    if (group.selectionType === 'multiple') {
      const availableKeys = new Set(nextGroup?.items.map((item) => item._key))
      const kept: string[] = []
      for (const key of (value as string[] | undefined) ?? []) {
        if (availableKeys.has(key)) {
          kept.push(key)
          keptNoteKeys.add(`${group._id}:${key}`)
        } else {
          reportRemoved(group, key)
        }
      }
      if (kept.length > 0) nextSelections[group._id] = kept
      continue
    }

    // boolean
    if (nextGroup) {
      nextSelections[group._id] = value
      const item = nextGroup.items[0]
      if (item?._key) keptNoteKeys.add(`${group._id}:${item._key}`)
    } else if (value === true) {
      reportRemoved(group, group.items[0]?._key)
    }
  }

  const nextNotes: CustomizationNotes = {}
  for (const [key, note] of Object.entries(notes)) {
    if (keptNoteKeys.has(key)) nextNotes[key] = note
  }

  return { selections: nextSelections, notes: nextNotes, removedTitles }
}
