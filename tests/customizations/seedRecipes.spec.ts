import { describe, expect, it } from 'vitest'
import {
  cabinCustomizationConfigurations,
  containerCustomizationConfigurations
} from '../../scripts/customizations/lib/seedRecipes'

describe('customization seed recipes', () => {
  it('assigns Electricity, Heater, and AC to cabins, disabling elec-2', () => {
    expect(cabinCustomizationConfigurations()).toEqual([
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
    ])
  })

  it('assigns Electricity, Heater, AC, WC, and Kitchen to containers', () => {
    expect(containerCustomizationConfigurations()).toEqual([
      {
        _key: 'electricity',
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: 'customizationGroup-electricity' }
      },
      {
        _key: 'heater',
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: 'customizationGroup-heater' }
      },
      {
        _key: 'ac',
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: 'customizationGroup-ac' }
      },
      {
        _key: 'wc',
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: 'customizationGroup-wc' }
      },
      {
        _key: 'kitchen',
        _type: 'productCustomizationConfiguration',
        group: { _type: 'reference', _ref: 'customizationGroup-kitchen' }
      }
    ])
  })

  it('returns independent configuration objects for each use', () => {
    const first = cabinCustomizationConfigurations()
    first[0].itemOverrides![0].enabled = true

    expect(cabinCustomizationConfigurations()[0].itemOverrides![0].enabled).toBe(false)
  })
})
