import { describe, expect, it } from 'vitest'
import {
  cabinCustomizationConfigurations,
  containerCustomizationConfigurations,
  type SeedCustomizationConfiguration,
} from '../../scripts/customizations/lib/seedRecipes'
import { loadManifest } from '../../scripts/catalogue/lib/manifest'
import { loadCustomizationGroupSeeds } from '../../scripts/customizations/syncDevCustomizationSeeds'

const manifest = loadManifest()

function cabinConfigurations(productId: string): SeedCustomizationConfiguration[] {
  const product = manifest.products.find((candidate) => candidate.id === productId)!
  return cabinCustomizationConfigurations(product.id, product.sizes)
}

const portableSizes = [
  { _key: '230x600', lengthM: 2.3, widthM: 6 },
  { _key: '300x500', lengthM: 3, widthM: 5 },
  { _key: '300x600', lengthM: 3, widthM: 6 },
  { _key: '300x700', lengthM: 3, widthM: 7 },
]

function rules(configurations: SeedCustomizationConfiguration[], groupId: string, itemKey: string) {
  const configuration = configurations.find((candidate) => candidate.group._ref === groupId)!
  return configuration.itemOverrides?.find((override) => override.itemKey === itemKey)?.sizeRules
}

function modesAndPrices(sizeRules: ReturnType<typeof rules>) {
  return sizeRules?.map((rule) => [rule.mode, rule.price])
}

describe('customization seed recipes', () => {
  it('keeps electrical alternatives exclusive and makes dependent extras require the Standard pack', () => {
    const groups = loadCustomizationGroupSeeds() as Array<{
      _id: string
      selectionType?: string
      maxSelections?: number
      items?: Array<{
        _key: string
        selectionRequirements?: Array<{ group?: { _ref?: string }; itemKey?: string }>
      }>
    }>
    const electricity = groups.find((group) => group._id === 'customizationGroup-electricity')!
    const requirement = {
      group: expect.objectContaining({ _ref: 'customizationGroup-electricity' }),
      itemKey: 'standard-electrical-pack'
    }

    expect(electricity).toMatchObject({ selectionType: 'multiple', maxSelections: 2 })
    expect(electricity.items?.map((item) => item._key)).toEqual([
      'standard-electrical-pack',
      'blue-male-socket',
      'custom-electricity'
    ])
    for (const [groupId, itemKey] of [
      ['customizationGroup-electricity', 'blue-male-socket'],
      ['customizationGroup-electricity', 'custom-electricity'],
      ['customizationGroup-ac', 'ac-std'],
      ['customizationGroup-heater', 'heater-std']
    ]) {
      const item = groups.find((group) => group._id === groupId)?.items?.find((candidate) => candidate._key === itemKey)
      expect(item?.selectionRequirements).toEqual([expect.objectContaining(requirement)])
    }
  })

  it('maps every GRP Cabin workbook price and unavailable AC size', () => {
    const configurations = cabinConfigurations('product-grp-cabin')

    expect(modesAndPrices(rules(configurations, 'customizationGroup-electricity', 'standard-electrical-pack'))).toEqual([
      ['fixed', 475], ['fixed', 475], ['fixed', 475], ['fixed', 575], ['fixed', 675],
    ])
    expect(modesAndPrices(rules(configurations, 'customizationGroup-ac', 'ac-std'))).toEqual([
      ['unavailable', undefined],
      ['unavailable', undefined],
      ['unavailable', undefined],
      ['fixed', 2950],
      ['fixed', 2950],
    ])
    expect(modesAndPrices(rules(configurations, 'customizationGroup-heater', 'heater-std'))).toEqual([
      ['fixed', 225], ['fixed', 225], ['fixed', 225], ['fixed', 325], ['fixed', 325],
    ])
  })

  it.each([
    ['product-metrocity-modular-cabin', [225, 225, 375, 375, 375]],
    ['product-kompocity-composite-cabin', [225, 225, 375, 375, 375]],
  ])('maps included Standard packs and supplied Heater prices for %s', (productId, heaterPrices) => {
    const configurations = cabinConfigurations(productId)

    expect(modesAndPrices(rules(configurations, 'customizationGroup-electricity', 'standard-electrical-pack')))
      .toEqual(Array.from({ length: 5 }, () => ['included', undefined]))
    expect(rules(configurations, 'customizationGroup-heater', 'heater-std')?.map((rule) => rule.price))
      .toEqual(heaterPrices)
  })

  it('maps Bulletproof included packs and its £4,300 AC threshold', () => {
    const configurations = cabinConfigurations('product-bulletproof-security-cabin')

    expect(rules(configurations, 'customizationGroup-electricity', 'standard-electrical-pack')
      ?.map((rule) => rule.mode)).toEqual(Array.from({ length: 8 }, () => 'included'))
    expect(modesAndPrices(rules(configurations, 'customizationGroup-ac', 'ac-std'))).toEqual([
      ['unavailable', undefined],
      ['unavailable', undefined],
      ['unavailable', undefined],
      ['fixed', 4300],
      ['fixed', 4300],
      ['fixed', 4300],
      ['fixed', 4300],
      ['fixed', 4300],
    ])
  })

  it('maps every Portable Cabin price, including the supplied £1,474 kitchen value', () => {
    const configurations = containerCustomizationConfigurations('product-k1002-portable-cabin', portableSizes)

    expect(rules(configurations, 'customizationGroup-electricity', 'standard-electrical-pack')
      ?.map((rule) => rule.price)).toEqual([950, 950, 1050, 1050])
    expect(rules(configurations, 'customizationGroup-ac', 'ac-std')
      ?.map((rule) => rule.price)).toEqual([2950, 2950, 3300, 3300])
    expect(rules(configurations, 'customizationGroup-heater', 'heater-std')
      ?.map((rule) => rule.price)).toEqual([375, 375, 375, 375])
    expect(rules(configurations, 'customizationGroup-kitchen', 'kitchen-std')
      ?.map((rule) => rule.price)).toEqual([1475, 1475, 1475, 1474])
    expect(rules(configurations, 'customizationGroup-wc', 'wc-std')
      ?.map((rule) => rule.price)).toEqual([1675, 1675, 1675, 1675])
  })

  it('returns independent configuration objects for each use', () => {
    const product = manifest.products.find((candidate) => candidate.id === 'product-grp-cabin')!
    const first = cabinCustomizationConfigurations(product.id, product.sizes)
    first[0].itemOverrides![0].sizeRules![0].price = 1

    expect(cabinCustomizationConfigurations(product.id, product.sizes)[0]
      .itemOverrides![0].sizeRules![0].price).toBe(475)
  })
})
