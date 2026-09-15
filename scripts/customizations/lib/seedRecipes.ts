export interface SeedCustomizationConfiguration {
  _key: string
  _type: 'productCustomizationConfiguration'
  group: { _type: 'reference', _ref: string }
  itemOverrides?: Array<{ _key: string, itemKey: string, enabled: boolean }>
}

/** Optional groups used by imported cabin families. Compact cabins hide elec-2. */
export function cabinCustomizationConfigurations(): SeedCustomizationConfiguration[] {
  return [
    {
      _key: 'electricity',
      _type: 'productCustomizationConfiguration',
      group: { _type: 'reference', _ref: 'customizationGroup-electricity' },
      itemOverrides: [{ _key: 'disable-elec-2', itemKey: 'elec-2', enabled: false }]
    },
    {
      _key: 'heater',
      _type: 'productCustomizationConfiguration',
      group: { _type: 'reference', _ref: 'customizationGroup-heater' }
    },
    {
      _key: 'air-conditioning',
      _type: 'productCustomizationConfiguration',
      group: { _type: 'reference', _ref: 'customizationGroup-ac' }
    }
  ]
}

const CONTAINER_CUSTOMIZATION_GROUP_IDS = [
  'customizationGroup-electricity',
  'customizationGroup-heater',
  'customizationGroup-ac',
  'customizationGroup-wc',
  'customizationGroup-kitchen'
] as const

/** Optional groups used by hand-sourced container products. */
export function containerCustomizationConfigurations(): SeedCustomizationConfiguration[] {
  return CONTAINER_CUSTOMIZATION_GROUP_IDS.map((groupId) => ({
    _key: groupId.replace('customizationGroup-', ''),
    _type: 'productCustomizationConfiguration',
    group: { _type: 'reference', _ref: groupId }
  }))
}
