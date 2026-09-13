import type {
  PricingType,
  SanityCustomizationGroup,
  SanityCustomizationItem,
  SanityCustomizationItemOverride,
  SanityProductCustomizationConfiguration,
} from '~/types/catalog'

export interface ResolvedCustomizationItemPricing {
  pricingType: PricingType
  price: number | undefined
}

/**
 * Resolves the available Product-level price layer. Size Option overrides are
 * intentionally not read here; they arrive in the next customization ticket.
 */
export function resolveCustomizationItemPricing(
  item: SanityCustomizationItem,
  override?: SanityCustomizationItemOverride,
): ResolvedCustomizationItemPricing {
  const pricingType = override?.pricingType ?? item.pricingType

  if (pricingType === 'included') return { pricingType, price: 0 }
  if (pricingType === 'poa') return { pricingType, price: undefined }

  return { pricingType, price: override?.price ?? item.price ?? 0 }
}

function resolveConfiguredGroup(
  configuration: SanityProductCustomizationConfiguration,
): SanityCustomizationGroup {
  const itemKeys = new Set(configuration.group.items.map((item) => item._key).filter(Boolean))
  const overrideKeys = new Set<string>()
  for (const override of configuration.itemOverrides ?? []) {
    if (!itemKeys.has(override.itemKey)) {
      throw new Error(`Customization override references unknown item "${override.itemKey}"`)
    }
    if (overrideKeys.has(override.itemKey)) {
      throw new Error(`Customization item "${override.itemKey}" has more than one Product override`)
    }
    overrideKeys.add(override.itemKey)
  }

  const overrides = new Map(
    (configuration.itemOverrides ?? []).map((override) => [override.itemKey, override]),
  )

  return {
    ...configuration.group,
    items: configuration.group.items
      .filter((item) => overrides.get(item._key ?? '')?.enabled !== false)
      .map((item) => ({
        ...item,
        ...resolveCustomizationItemPricing(item, overrides.get(item._key ?? '')),
      })),
  }
}

/** Product configurations take priority; direct Product groups remain migration fallback. */
export function resolveCustomizationGroups(product: {
  customizationConfigurations?: SanityProductCustomizationConfiguration[]
  customizationGroups?: SanityCustomizationGroup[]
}): SanityCustomizationGroup[] {
  if (product.customizationConfigurations?.length) {
    return product.customizationConfigurations.map(resolveConfiguredGroup)
  }

  return product.customizationGroups ?? []
}
