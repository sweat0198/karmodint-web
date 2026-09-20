import { createSizeRuleSnapshot } from '../../../sanity/schemas/product'

type PriceCell = number | 'included' | 'unavailable'

export interface SeedSizeInput {
  key?: string
  _key?: string
  lengthM: number
  widthM: number
  heightM?: number
}

export interface SeedCustomizationSizeRule {
  _key: string
  sizeOptionKey: string
  mode: 'fixed' | 'included' | 'unavailable'
  price?: number
  review: { status: 'reviewed'; snapshot: string }
}

export interface SeedCustomizationItemOverride {
  _key: string
  itemKey: string
  enabled?: boolean
  sizeRules?: SeedCustomizationSizeRule[]
}

export interface SeedCustomizationConfiguration {
  _key: string
  _type: 'productCustomizationConfiguration'
  group: { _type: 'reference'; _ref: string }
  itemOverrides?: SeedCustomizationItemOverride[]
}

interface ExtraItemCostRow {
  standardElectrical: PriceCell
  airConditioning: PriceCell
  heater: PriceCell
  kitchen?: PriceCell
  wc?: PriceCell
}

type ExtraItemCostMatrix = Record<string, Record<string, ExtraItemCostRow>>

/** Owner-supplied values from `extra items cost.xlsx`, keyed by stable Product and Size Option ids. */
export const EXTRA_ITEM_COSTS: ExtraItemCostMatrix = {
  'product-k1002-portable-cabin': {
    '230x600': { standardElectrical: 950, airConditioning: 2950, heater: 375, kitchen: 1475, wc: 1675 },
    '300x500': { standardElectrical: 950, airConditioning: 2950, heater: 375, kitchen: 1475, wc: 1675 },
    '300x600': { standardElectrical: 1050, airConditioning: 3300, heater: 375, kitchen: 1475, wc: 1675 },
    '300x700': { standardElectrical: 1050, airConditioning: 3300, heater: 375, kitchen: 1474, wc: 1675 },
  },
  'product-grp-cabin': {
    '150x150': { standardElectrical: 475, airConditioning: 'unavailable', heater: 225 },
    '150x215': { standardElectrical: 475, airConditioning: 'unavailable', heater: 225 },
    '150x270': { standardElectrical: 475, airConditioning: 'unavailable', heater: 225 },
    '215x270': { standardElectrical: 575, airConditioning: 2950, heater: 325 },
    '270x270': { standardElectrical: 675, airConditioning: 2950, heater: 325 },
  },
  'product-bulletproof-security-cabin': {
    '150x150': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 375 },
    '150x200': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 375 },
    '200x200': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 375 },
    '200x300': { standardElectrical: 'included', airConditioning: 4300, heater: 375 },
    '200x400': { standardElectrical: 'included', airConditioning: 4300, heater: 375 },
    '300x300': { standardElectrical: 'included', airConditioning: 4300, heater: 375 },
    '300x400': { standardElectrical: 'included', airConditioning: 4300, heater: 375 },
    '300x500': { standardElectrical: 'included', airConditioning: 4300, heater: 375 },
  },
  'product-insulated-panel-cabin': {
    '110x110': { standardElectrical: 375, airConditioning: 'unavailable', heater: 225 },
    '135x135': { standardElectrical: 375, airConditioning: 'unavailable', heater: 225 },
    '135x210': { standardElectrical: 475, airConditioning: 'unavailable', heater: 225 },
    '210x210': { standardElectrical: 475, airConditioning: 2950, heater: 375 },
    '260x260': { standardElectrical: 575, airConditioning: 2950, heater: 375 },
  },
  'product-metrocity-modular-cabin': {
    '140x140': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 225 },
    '140x215': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 225 },
    '215x215': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 375 },
    '215x265': { standardElectrical: 'included', airConditioning: 3300, heater: 375 },
    '265x265': { standardElectrical: 'included', airConditioning: 3300, heater: 375 },
  },
  'product-kompocity-composite-cabin': {
    '140x140': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 225 },
    '140x215': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 225 },
    '215x215': { standardElectrical: 'included', airConditioning: 'unavailable', heater: 375 },
    '215x265': { standardElectrical: 'included', airConditioning: 3300, heater: 375 },
    '265x265': { standardElectrical: 'included', airConditioning: 3300, heater: 375 },
  },
}

export const CUSTOMIZATION_ITEM_DEFAULTS = {
  standardElectrical: {
    _key: 'standard-electrical-pack',
    scope: 'sizeDependent' as const,
    title: 'Standard Electrical Pack',
    description: 'Standard electrical installation package sized for the selected unit.',
    pricingType: 'fixed' as const,
    price: 0,
  },
  airConditioning: {
    _key: 'ac-std',
    scope: 'sizeDependent' as const,
    title: 'Air Conditioning Unit',
    description: 'Wall-mounted air conditioning unit.',
    pricingType: 'fixed' as const,
    price: 0,
  },
  heater: {
    _key: 'heater-std',
    scope: 'sizeDependent' as const,
    title: 'Electric Wall Heater',
    description: 'Wall-mounted electric heater with thermostat control.',
    pricingType: 'fixed' as const,
    price: 0,
  },
  kitchen: {
    _key: 'kitchen-std',
    scope: 'sizeDependent' as const,
    title: 'Kitchen Unit 5pcs 180 cm',
    description: 'Five-piece 180 cm kitchen unit with sink and worktop included.',
    pricingType: 'fixed' as const,
    price: 0,
  },
  wc: {
    _key: 'wc-std',
    scope: 'sizeDependent' as const,
    title: 'Toilet and Sink Unit',
    description: 'Toilet and sink unit with plumbing fittings.',
    pricingType: 'fixed' as const,
    price: 0,
  },
}

function sizeKey(size: SeedSizeInput): string {
  const key = size._key ?? size.key
  if (!key) throw new Error('Customization price matrix received a Size Option without a key')
  return key
}

function ruleFor(
  size: SeedSizeInput,
  cell: PriceCell,
  item: (typeof CUSTOMIZATION_ITEM_DEFAULTS)[keyof typeof CUSTOMIZATION_ITEM_DEFAULTS],
): SeedCustomizationSizeRule {
  const key = sizeKey(size)
  const rule = typeof cell === 'number'
    ? { _key: `${item._key}-${key}`, sizeOptionKey: key, mode: 'fixed' as const, price: cell }
    : { _key: `${item._key}-${key}`, sizeOptionKey: key, mode: cell }
  return {
    ...rule,
    review: {
      status: 'reviewed',
      snapshot: createSizeRuleSnapshot({ ...size, _key: key }, rule, undefined, item),
    },
  }
}

function overrideFor(
  sizes: SeedSizeInput[],
  rows: Record<string, ExtraItemCostRow>,
  column: keyof ExtraItemCostRow,
  item: (typeof CUSTOMIZATION_ITEM_DEFAULTS)[keyof typeof CUSTOMIZATION_ITEM_DEFAULTS],
): SeedCustomizationItemOverride {
  return {
    _key: `${item._key}-prices`,
    itemKey: item._key,
    sizeRules: sizes.map((size) => {
      const key = sizeKey(size)
      const cell = rows[key]?.[column]
      if (cell === undefined) throw new Error(`Missing ${String(column)} price for Size Option "${key}"`)
      return ruleFor(size, cell, item)
    }),
  }
}

function configuration(
  key: string,
  groupId: string,
  itemOverride: SeedCustomizationItemOverride,
): SeedCustomizationConfiguration {
  return {
    _key: key,
    _type: 'productCustomizationConfiguration',
    group: { _type: 'reference', _ref: groupId },
    itemOverrides: [itemOverride],
  }
}

function baseConfigurations(productId: string, sizes: SeedSizeInput[]): SeedCustomizationConfiguration[] {
  const rows = EXTRA_ITEM_COSTS[productId]
  if (!rows) throw new Error(`No extra-item price matrix exists for Product "${productId}"`)
  const expectedKeys = Object.keys(rows)
  const actualKeys = sizes.map(sizeKey)
  if (expectedKeys.length !== actualKeys.length || expectedKeys.some((key) => !actualKeys.includes(key))) {
    throw new Error(`Extra-item price matrix does not match Product "${productId}" Size Options`)
  }

  return [
    configuration('electricity', 'customizationGroup-electricity', overrideFor(
      sizes, rows, 'standardElectrical', CUSTOMIZATION_ITEM_DEFAULTS.standardElectrical,
    )),
    configuration('heater', 'customizationGroup-heater', overrideFor(
      sizes, rows, 'heater', CUSTOMIZATION_ITEM_DEFAULTS.heater,
    )),
    configuration('air-conditioning', 'customizationGroup-ac', overrideFor(
      sizes, rows, 'airConditioning', CUSTOMIZATION_ITEM_DEFAULTS.airConditioning,
    )),
  ]
}

export function cabinCustomizationConfigurations(
  productId: string,
  sizes: SeedSizeInput[],
): SeedCustomizationConfiguration[] {
  return baseConfigurations(productId, sizes)
}

export function containerCustomizationConfigurations(
  productId: string,
  sizes: SeedSizeInput[],
): SeedCustomizationConfiguration[] {
  const rows = EXTRA_ITEM_COSTS[productId]
  if (!rows) throw new Error(`No extra-item price matrix exists for Product "${productId}"`)
  return [
    ...baseConfigurations(productId, sizes),
    configuration('wc', 'customizationGroup-wc', overrideFor(
      sizes, rows, 'wc', CUSTOMIZATION_ITEM_DEFAULTS.wc,
    )),
    configuration('kitchen', 'customizationGroup-kitchen', overrideFor(
      sizes, rows, 'kitchen', CUSTOMIZATION_ITEM_DEFAULTS.kitchen,
    )),
  ]
}
