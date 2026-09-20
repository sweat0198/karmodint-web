import { describe, expect, it } from 'vitest'
import {
  evaluateCustomizationConstraints,
  reconcileCustomizationConstraints,
} from '../../app/utils/customizationConstraints'
import type { SanityCustomizationGroup } from '../../app/types/catalog'

const requiresStandard = [{
  groupId: 'electricity',
  groupTitle: 'Electricity',
  itemKey: 'standard-electrical-pack',
}]

const groups: SanityCustomizationGroup[] = [{
  _id: 'electricity',
  _type: 'customizationGroup',
  title: 'Electricity',
  identifier: 'electricity',
  selectionType: 'multiple',
  maxSelections: 2,
  items: [{
    _key: 'standard-electrical-pack',
    title: 'Standard Electrical Pack',
    pricingType: 'fixed',
    price: 950,
  }, {
    _key: 'blue-male-socket',
    title: 'Blue Male Socket',
    pricingType: 'fixed',
    price: 75,
    selectionRequirements: requiresStandard,
  }, {
    _key: 'custom-electricity',
    title: 'Customised Electricity',
    pricingType: 'poa',
    requiresTextInput: true,
    selectionRequirements: requiresStandard,
  }],
}, {
  _id: 'air-conditioning',
  _type: 'customizationGroup',
  title: 'Air Conditioning',
  identifier: 'air-conditioning',
  selectionType: 'boolean',
  items: [{
    _key: 'ac-std',
    title: 'Air Conditioning Unit',
    pricingType: 'fixed',
    price: 2950,
    selectionRequirements: requiresStandard,
  }],
}]

describe('customization selection constraints', () => {
  it('keeps dependent choices visible but disabled until their requirement is selected', () => {
    const result = evaluateCustomizationConstraints(groups, {})

    expect(result.groups).toHaveLength(2)
    expect(result.groups[0].items).toMatchObject([
      { _key: 'standard-electrical-pack', selectionDisabled: false },
      {
        _key: 'blue-male-socket',
        selectionDisabled: true,
        selectionDisabledReason: 'Requires Standard Electrical Pack',
      },
      {
        _key: 'custom-electricity',
        selectionDisabled: true,
        selectionDisabledReason: 'Requires Standard Electrical Pack',
      },
    ])
    expect(result.groups[1].items[0]).toMatchObject({
      selectionDisabled: true,
      selectionDisabledReason: 'Requires Standard Electrical Pack',
    })
  })

  it('enables dependent choices when Standard Electrical Pack is selected', () => {
    const result = evaluateCustomizationConstraints(groups, {
      electricity: ['standard-electrical-pack'],
    })

    expect(result.groups.flatMap((group) => group.items)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _key: 'blue-male-socket', selectionDisabled: false }),
        expect.objectContaining({ _key: 'custom-electricity', selectionDisabled: false }),
        expect.objectContaining({ _key: 'ac-std', selectionDisabled: false }),
      ]),
    )
  })

  it('disables remaining choices after a multiple group reaches its selection limit', () => {
    const result = evaluateCustomizationConstraints(groups, {
      electricity: ['standard-electrical-pack', 'blue-male-socket'],
    })

    const item = result.groups[0].items.find((candidate) => candidate._key === 'custom-electricity')

    expect(item).toMatchObject({ selectionDisabled: true })
    expect(item).not.toHaveProperty('selectionDisabledReason')
  })

  it('clears dependent selections and notes after Standard Electrical Pack is removed', () => {
    const result = reconcileCustomizationConstraints(groups, {
      electricity: ['blue-male-socket', 'custom-electricity'],
      'air-conditioning': true,
    }, {
      'electricity:custom-electricity': 'Extra sockets near both desks',
      'electricity:blue-male-socket': 'unused note',
    })

    expect(result.selections).toEqual({
      electricity: [],
      'air-conditioning': false,
    })
    expect(result.notes).toEqual({})
    expect(result.removedTitles).toEqual([
      'Blue Male Socket',
      'Customised Electricity',
      'Air Conditioning Unit',
    ])
  })

  it('trims a tampered group above its maximum using item order', () => {
    const result = reconcileCustomizationConstraints(groups, {
      electricity: ['standard-electrical-pack', 'blue-male-socket', 'custom-electricity'],
    }, {})

    expect(result.selections.electricity).toEqual([
      'standard-electrical-pack',
      'blue-male-socket',
    ])
    expect(result.removedTitles).toEqual(['Customised Electricity'])
  })

  it('rejects duplicate item keys independently of the maximum', () => {
    const result = evaluateCustomizationConstraints(groups, {
      electricity: ['standard-electrical-pack', 'standard-electrical-pack'],
    })

    expect(result.violations).toEqual([
      expect.objectContaining({
        groupId: 'electricity',
        itemKey: 'standard-electrical-pack',
        reason: 'duplicateSelection',
      }),
    ])
  })

  it('deduplicates a repeated choice without removing the valid selection', () => {
    const result = reconcileCustomizationConstraints(groups, {
      electricity: ['standard-electrical-pack', 'standard-electrical-pack'],
    }, {})

    expect(result.selections.electricity).toEqual(['standard-electrical-pack'])
    expect(result.removedTitles).toEqual([])
  })

  it('continues enforcing the maximum after duplicate cleanup', () => {
    const result = reconcileCustomizationConstraints(groups, {
      electricity: [
        'standard-electrical-pack',
        'blue-male-socket',
        'custom-electricity',
        'custom-electricity',
      ],
    }, {})

    expect(result.selections.electricity).toEqual([
      'standard-electrical-pack',
      'blue-male-socket',
    ])
    expect(result.removedTitles).toEqual(['Customised Electricity'])
  })
})
