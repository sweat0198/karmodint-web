import type {
  PricingType,
  SanityCustomizationGroup,
  SanityCustomizationItem,
  SanityCustomizationItemOverride,
  SanityCustomizationSizeRule,
  SanityProductCustomizationConfiguration,
  SanitySizeOption,
} from '~/types/catalog'

export interface ResolvedCustomizationItemPricing {
  pricingType: PricingType
  price: number | undefined
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
