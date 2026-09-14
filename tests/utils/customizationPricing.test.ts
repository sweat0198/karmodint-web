import { describe, it, expect } from 'vitest'
import { useCustomizationPricing, buildSpecSummary } from '~~/app/composables/useCustomizationPricing'
import { resolveCustomizationGroups, resolveCustomizationItemPricing } from '~~/app/utils/customizationPricing'
import type {
  SanityCustomizationGroup,
  SanityCustomizationItem,
  SanityCustomizationItemOverride,
  SanityCustomizationSizeRule,
  SanitySizeOption,
  CustomizationSizeRuleMode,
} from '~~/app/types/catalog'
import type { CustomizationSelections, CustomizationNotes } from '~~/app/types/customization'

const groupSingleFinish: SanityCustomizationGroup = {
  _id: 'grp-finish',
  _type: 'customizationGroup',
  title: 'Exterior Finish',
  identifier: 'exterior-finish',
  selectionType: 'single',
  isMandatory: true,
  items: [
    { _key: 'white', title: 'Standard White', pricingType: 'included' },
    { _key: 'anthracite', title: 'Anthracite Grey', pricingType: 'fixed', price: 320 }
  ],
  displayOrder: 1
}

const groupMultipleExtras: SanityCustomizationGroup = {
  _id: 'grp-extras',
  _type: 'customizationGroup',
  title: 'Extras',
  identifier: 'extras',
  selectionType: 'multiple',
  isMandatory: false,
  items: [
    { _key: 'shutter', title: 'Roller Shutter', pricingType: 'fixed', price: 295 },
    { _key: 'canopy', title: 'Rain Canopy', pricingType: 'fixed', price: 160 }
  ],
  displayOrder: 2
}

const groupBooleanAc: SanityCustomizationGroup = {
  _id: 'grp-ac',
  _type: 'customizationGroup',
  title: 'Air Conditioning',
  identifier: 'ac',
  selectionType: 'boolean',
  isMandatory: false,
  items: [{ _key: 'ac-unit', title: 'Split AC Unit', pricingType: 'fixed', price: 450 }],
  displayOrder: 3
}

const groupPoaElectrical: SanityCustomizationGroup = {
  _id: 'grp-electrical',
  _type: 'customizationGroup',
  title: 'Electrical Package',
  identifier: 'electrical',
  selectionType: 'single',
  isMandatory: false,
  items: [
    { _key: 'standard', title: 'Standard Package', pricingType: 'included' },
    {
      _key: 'custom',
      title: 'Custom Electrical Layout',
      pricingType: 'poa',
      requiresTextInput: true,
      textInputPlaceholder: 'Describe your custom electrical requirements...'
    }
  ],
  displayOrder: 4
}

const groupBooleanHeater: SanityCustomizationGroup = {
  _id: 'grp-heater',
  _type: 'customizationGroup',
  title: 'Heater',
  identifier: 'heater',
  selectionType: 'boolean',
  isMandatory: false,
  items: [{ _key: 'heater-unit', title: 'Wall Convector Heater', pricingType: 'fixed', price: 210 }],
  displayOrder: 5
}

const sizeFixed: SanitySizeOption = {
  _key: 'small-cabin-3m',
  label: '2.40m x 3.00m',
  lengthM: 3,
  widthM: 2.4,
  price: 3240,
  isPoa: false,
  images: []
}

const sizePoa: SanitySizeOption = {
  _key: 'container-6m',
  label: '6.00m x 2.40m',
  lengthM: 6,
  widthM: 2.4,
  price: 0,
  isPoa: true,
  images: []
}

const sizeRuleModes = [
  'inherit',
  'fixed',
  'included',
  'poa',
  'unavailable'
] as const satisfies readonly CustomizationSizeRuleMode[]

// @ts-expect-error Fixed rules must always provide a price.
const fixedSizeRuleWithoutPrice: SanityCustomizationSizeRule = {
  sizeOptionKey: 'container-4m',
  mode: 'fixed'
}

// @ts-expect-error Non-fixed rules cannot provide a price.
const poaSizeRuleWithPrice: SanityCustomizationSizeRule = {
  sizeOptionKey: 'container-10m',
  mode: 'poa',
  price: 100
}

// @ts-expect-error Non-fixed rules cannot provide a price.
const inheritSizeRuleWithPrice: SanityCustomizationSizeRule = {
  sizeOptionKey: 'container-6m',
  mode: 'inherit',
  price: 100
}

// @ts-expect-error Non-fixed rules cannot provide a price.
const includedSizeRuleWithPrice: SanityCustomizationSizeRule = {
  sizeOptionKey: 'container-8m',
  mode: 'included',
  price: 100
}

// @ts-expect-error Non-fixed rules cannot provide a price.
const unavailableSizeRuleWithPrice: SanityCustomizationSizeRule = {
  sizeOptionKey: 'small-cabin-4m',
  mode: 'unavailable',
  price: 100
}

const sizeRuleContractFixture = {
  itemKey: 'two-light-points',
  titleOverride: 'Two ceiling light points',
  descriptionOverride: 'Included only where the selected size supports it.',
  sizeRules: [{
    sizeOptionKey: sizeFixed._key!,
    mode: 'inherit',
    review: {
      status: 'reviewed',
      snapshot: `${sizeFixed._key}: inherits product pricing`
    }
  }, {
    sizeOptionKey: sizePoa._key!,
    mode: 'fixed',
    price: 90,
    titleOverride: 'Two ceiling light points',
    descriptionOverride: 'Fitted electrical option.',
    review: {
      status: 'reviewed',
      snapshot: `${sizePoa._key}: fixed £90`
    }
  }, {
    sizeOptionKey: 'container-8m',
    mode: 'included',
    titleOverride: 'Included light points',
    descriptionOverride: 'Included in this size option.',
    review: {
      status: 'reviewed',
      snapshot: 'container-8m: included'
    }
  }, {
    sizeOptionKey: 'container-10m',
    mode: 'poa',
    review: {
      status: 'pending',
      snapshot: 'container-10m: POA'
    }
  }, {
    sizeOptionKey: 'small-cabin-4m',
    mode: 'unavailable',
    review: {
      status: 'reviewed',
      snapshot: 'small-cabin-4m: unavailable'
    }
  }]
} satisfies SanityCustomizationItemOverride

const sizeDependentItemContractFixture: SanityCustomizationItem = {
  _key: 'two-light-points',
  title: 'Two ceiling light points',
  pricingType: 'fixed',
  price: 90,
  scope: 'sizeDependent'
}

function pricing(
  groups: SanityCustomizationGroup[],
  selections: CustomizationSelections,
  notes: CustomizationNotes = {},
  size: SanitySizeOption = sizeFixed
) {
  return useCustomizationPricing(groups, selections, notes, size)
}

describe('useCustomizationPricing', () => {
  it('sums fixed items onto the size price', () => {
    const result = pricing([groupSingleFinish], { 'grp-finish': 'anthracite' })
    expect(result.subtotal.value).toBe(3240 + 320)
  })

  it('adds £0 for included items', () => {
    const result = pricing([groupSingleFinish], { 'grp-finish': 'white' })
    expect(result.subtotal.value).toBe(3240)
  })

  it('leaves subtotal untouched by a poa item, sets hasPoa, and labels it "+ POA"', () => {
    const result = pricing([groupPoaElectrical], { 'grp-electrical': 'custom' })
    expect(result.subtotal.value).toBe(3240)
    expect(result.hasPoa.value).toBe(true)
    expect(result.priceLabel.value).toBe('£3,240 + POA')
  })

  it('yields plain "POA" and does not total extras when the size itself is POA', () => {
    const result = pricing(
      [groupSingleFinish],
      { 'grp-finish': 'anthracite' },
      {},
      sizePoa
    )
    expect(result.sizeIsPoa.value).toBe(true)
    expect(result.priceLabel.value).toBe('POA')
    expect(result.subtotal.value).toBe(0)
  })

  it('sums every selected item in a multiple group', () => {
    const result = pricing([groupMultipleExtras], { 'grp-extras': ['shutter', 'canopy'] })
    expect(result.subtotal.value).toBe(3240 + 295 + 160)
  })

  it('adds the boolean item only when true', () => {
    const on = pricing([groupBooleanAc], { 'grp-ac': true })
    expect(on.subtotal.value).toBe(3240 + 450)

    const off = pricing([groupBooleanAc], { 'grp-ac': false })
    expect(off.subtotal.value).toBe(3240)
  })

  it('adds nothing for a single selection of null', () => {
    const result = pricing([{ ...groupSingleFinish, isMandatory: false }], { 'grp-finish': null })
    expect(result.subtotal.value).toBe(3240)
  })

  it('lists a mandatory group with no selection in unsatisfiedMandatory, and drops it once selected', () => {
    const empty = pricing([groupSingleFinish], {})
    expect(empty.unsatisfiedMandatory.value).toEqual([groupSingleFinish])

    const filled = pricing([groupSingleFinish], { 'grp-finish': 'white' })
    expect(filled.unsatisfiedMandatory.value).toEqual([])
  })

  it('treats an empty array as unsatisfied for a mandatory multiple group', () => {
    const mandatoryExtras = { ...groupMultipleExtras, isMandatory: true }
    const empty = pricing([mandatoryExtras], { 'grp-extras': [] })
    expect(empty.unsatisfiedMandatory.value).toEqual([mandatoryExtras])

    const filled = pricing([mandatoryExtras], { 'grp-extras': ['shutter'] })
    expect(filled.unsatisfiedMandatory.value).toEqual([])
  })

  it('never lists a boolean group as unsatisfied mandatory (D8 forbids mandatory toggles)', () => {
    const result = pricing([groupBooleanAc], {})
    expect(result.unsatisfiedMandatory.value).toEqual([])
  })

  it('builds quote lines with groupTitle, optionTitle, price, isPoa and customNotes', () => {
    const result = pricing(
      [groupPoaElectrical],
      { 'grp-electrical': 'custom' },
      { 'grp-electrical:custom': 'Need an extra socket by the desk' }
    )
    expect(result.lines.value).toEqual([
      {
        groupTitle: 'Electrical Package',
        optionTitle: 'Custom Electrical Layout',
        price: undefined,
        isPoa: true,
        customNotes: 'Need an extra socket by the desk'
      }
    ])
  })

  it('omits customNotes when the item does not carry one', () => {
    const result = pricing([groupSingleFinish], { 'grp-finish': 'anthracite' })
    expect(result.lines.value).toEqual([
      { groupTitle: 'Exterior Finish', optionTitle: 'Anthracite Grey', price: 320, isPoa: false, customNotes: undefined }
    ])
  })
})

describe('buildSpecSummary', () => {
  it('caps at 4 badges and joins multi-selects with " + "', () => {
    const groups = [
      groupSingleFinish,
      groupMultipleExtras,
      groupBooleanAc,
      groupPoaElectrical,
      groupBooleanHeater
    ]
    const selections: CustomizationSelections = {
      'grp-finish': 'anthracite',
      'grp-extras': ['shutter', 'canopy'],
      'grp-ac': true,
      'grp-electrical': 'custom',
      'grp-heater': true
    }

    const summary = buildSpecSummary(groups, selections)

    expect(summary).toHaveLength(4)
    expect(summary[0]).toEqual({ label: 'Exterior Finish', value: 'Anthracite Grey' })
    expect(summary[1]).toEqual({ label: 'Extras', value: 'Roller Shutter + Rain Canopy' })
  })

  it('skips groups with no selection', () => {
    const summary = buildSpecSummary([groupSingleFinish, groupBooleanAc], { 'grp-finish': null, 'grp-ac': false })
    expect(summary).toEqual([])
  })
})

describe('Product customization resolution', () => {
  it('accepts native size-option rules for size-dependent items', () => {
    expect(sizeDependentItemContractFixture.scope).toBe('sizeDependent')
    expect(sizeRuleModes).toEqual(['inherit', 'fixed', 'included', 'poa', 'unavailable'])
    expect(sizeRuleContractFixture.sizeRules.map((rule) => rule.sizeOptionKey)).toEqual([
      sizeFixed._key,
      sizePoa._key,
      'container-8m',
      'container-10m',
      'small-cabin-4m'
    ])
    expect(sizeRuleContractFixture.sizeRules.map((rule) => rule.mode)).toEqual(sizeRuleModes)
    expect(sizeRuleContractFixture.sizeRules).toMatchObject([
      {
        mode: 'inherit',
        review: { status: 'reviewed', snapshot: `${sizeFixed._key}: inherits product pricing` }
      },
      {
        mode: 'fixed',
        price: 90,
        titleOverride: 'Two ceiling light points',
        descriptionOverride: 'Fitted electrical option.',
        review: { status: 'reviewed', snapshot: `${sizePoa._key}: fixed £90` }
      },
      {
        mode: 'included',
        titleOverride: 'Included light points',
        descriptionOverride: 'Included in this size option.',
        review: { status: 'reviewed', snapshot: 'container-8m: included' }
      },
      { mode: 'poa', review: { status: 'pending', snapshot: 'container-10m: POA' } },
      { mode: 'unavailable', review: { status: 'reviewed', snapshot: 'small-cabin-4m: unavailable' } }
    ])
  })

  const configuration = {
    group: groupPoaElectrical,
    itemOverrides: [
      { itemKey: 'standard', pricingType: 'fixed' as const, price: 1 },
      { itemKey: 'custom', enabled: false }
    ]
  }

  it('uses the Customization Item default when a Product has no override', () => {
    expect(resolveCustomizationItemPricing(groupBooleanAc.items[0])).toEqual({ pricingType: 'fixed', price: 450 })
  })

  it('uses Product price and pricing-type overrides before the item default', () => {
    expect(resolveCustomizationItemPricing(groupPoaElectrical.items[0], configuration.itemOverrides[0])).toEqual({
      pricingType: 'fixed', price: 1
    })
    expect(resolveCustomizationItemPricing(groupBooleanAc.items[0], { itemKey: 'ac-unit', pricingType: 'included' })).toEqual({
      pricingType: 'included', price: 0
    })
    expect(resolveCustomizationItemPricing(groupBooleanAc.items[0], { itemKey: 'ac-unit', pricingType: 'poa' })).toEqual({
      pricingType: 'poa', price: undefined
    })
  })

  it('uses Product configurations, disables excluded items, and falls back to legacy groups', () => {
    const configured = resolveCustomizationGroups({ customizationConfigurations: [configuration] })
    expect(configured).toEqual([
      {
        ...groupPoaElectrical,
        items: [{ ...groupPoaElectrical.items[0], pricingType: 'fixed', price: 1 }]
      }
    ])

    expect(resolveCustomizationGroups({ customizationGroups: [groupBooleanAc] })).toEqual([groupBooleanAc])
  })

  it('rejects an override that does not identify an item in its Customization Group', () => {
    expect(() => resolveCustomizationGroups({
      customizationConfigurations: [{
        group: groupBooleanAc,
        itemOverrides: [{ itemKey: 'not-an-ac-item', enabled: false }]
      }]
    })).toThrow('not-an-ac-item')
  })

  const sizeRuleGroup: SanityCustomizationGroup = {
    _id: 'grp-size-rules',
    _type: 'customizationGroup',
    title: 'Electricity',
    identifier: 'electricity',
    selectionType: 'multiple',
    items: [
      {
        _key: 'two-light-points',
        title: 'Two light points',
        description: 'Item description',
        pricingType: 'fixed',
        price: 20,
        scope: 'sizeDependent'
      },
      {
        _key: 'four-sockets',
        title: 'Four double sockets',
        description: 'Socket description',
        pricingType: 'fixed',
        price: 40,
        scope: 'sizeDependent'
      }
    ]
  }

  const sizeRuleConfiguration = {
    group: sizeRuleGroup,
    itemOverrides: [{
      itemKey: 'two-light-points',
      pricingType: 'fixed' as const,
      price: 50,
      titleOverride: 'Product light points',
      descriptionOverride: 'Product description',
      sizeRules: [
        { sizeOptionKey: 'fixed-size', mode: 'fixed' as const, price: 80, titleOverride: 'Size light points' },
        { sizeOptionKey: 'included-size', mode: 'included' as const },
        { sizeOptionKey: 'poa-size', mode: 'poa' as const },
        { sizeOptionKey: 'inherit-size', mode: 'inherit' as const },
        { sizeOptionKey: 'unavailable-size', mode: 'unavailable' as const }
      ]
    }, {
      itemKey: 'four-sockets',
      sizeRules: [{ sizeOptionKey: 'unavailable-size', mode: 'unavailable' as const }]
    }]
  }

  it('gives selected Size Option fixed, included, and POA rules precedence over Product prices', () => {
    const product = { customizationConfigurations: [sizeRuleConfiguration] }

    expect(resolveCustomizationGroups(product, 'fixed-size')[0].items[0]).toMatchObject({
      pricingType: 'fixed', price: 80
    })
    expect(resolveCustomizationGroups(product, 'included-size')[0].items[0]).toMatchObject({
      pricingType: 'included', price: 0
    })
    expect(resolveCustomizationGroups(product, 'poa-size')[0].items[0]).toMatchObject({
      pricingType: 'poa', price: undefined
    })
  })

  it('lets inherit fall through Product overrides and then item defaults', () => {
    const product = { customizationConfigurations: [sizeRuleConfiguration] }
    const inherited = resolveCustomizationGroups(product, 'inherit-size')[0].items

    expect(inherited[0]).toMatchObject({ pricingType: 'fixed', price: 50 })
    expect(inherited[1]).toMatchObject({ pricingType: 'fixed', price: 40 })
  })

  it('uses selected Size Option text before Product text and item text', () => {
    const product = { customizationConfigurations: [sizeRuleConfiguration] }
    const fixed = resolveCustomizationGroups(product, 'fixed-size')[0].items[0]
    const inherited = resolveCustomizationGroups(product, 'inherit-size')[0].items[0]
    const defaulted = resolveCustomizationGroups(product, 'inherit-size')[0].items[1]

    expect(fixed).toMatchObject({ title: 'Size light points', description: 'Product description' })
    expect(inherited).toMatchObject({ title: 'Product light points', description: 'Product description' })
    expect(defaulted).toMatchObject({ title: 'Four double sockets', description: 'Socket description' })
  })

  it('filters unavailable items and removes groups left without any available items', () => {
    const product = { customizationConfigurations: [sizeRuleConfiguration] }
    expect(resolveCustomizationGroups(product, 'unavailable-size')).toEqual([])
  })

  it('rejects duplicate Size Option rules and Size Option rules for unknown items', () => {
    expect(() => resolveCustomizationGroups({
      customizationConfigurations: [{
        group: groupBooleanAc,
        itemOverrides: [{
          itemKey: 'ac-unit',
          sizeRules: [
            { sizeOptionKey: 'size-a', mode: 'included' },
            { sizeOptionKey: 'size-a', mode: 'poa' }
          ]
        }]
      }]
    }, 'size-a')).toThrow('size-a')

    expect(() => resolveCustomizationGroups({
      customizationConfigurations: [{
        group: groupBooleanAc,
        itemOverrides: [{ itemKey: 'unknown', sizeRules: [{ sizeOptionKey: 'size-a', mode: 'included' }] }]
      }]
    }, 'size-a')).toThrow('unknown')

    expect(() => resolveCustomizationGroups({
      sizes: [{ ...sizeFixed, _key: 'size-a' }],
      customizationConfigurations: [{
        group: groupBooleanAc,
        itemOverrides: [{ itemKey: 'ac-unit', sizeRules: [{ sizeOptionKey: 'missing-size', mode: 'included' }] }]
      }]
    }, 'size-a')).toThrow('missing-size')
  })

  it('rejects an unknown selected Size Option key when Product Size Options are available', () => {
    expect(() => resolveCustomizationGroups({
      sizes: [{ ...sizeFixed, _key: 'size-a' }],
      customizationConfigurations: [{ group: groupBooleanAc }]
    }, 'missing-size')).toThrow('missing-size')
  })

  it('validates Size Option rules on disabled item overrides', () => {
    expect(() => resolveCustomizationGroups({
      sizes: [{ ...sizeFixed, _key: 'size-a' }],
      customizationConfigurations: [{
        group: groupBooleanAc,
        itemOverrides: [{
          itemKey: 'ac-unit',
          enabled: false,
          sizeRules: [{ sizeOptionKey: 'missing-size', mode: 'included' }]
        }]
      }]
    }, 'size-a')).toThrow('missing-size')
  })
})
