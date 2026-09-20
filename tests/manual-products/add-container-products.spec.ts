import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  CONTAINER_PRODUCTS,
  manualProductCustomizationConfigurations,
} from '../../scripts/manual-products/add-container-products'

const source = readFileSync(
  fileURLToPath(new URL('../../scripts/manual-products/add-container-products.ts', import.meta.url)),
  'utf8'
)

describe('Portable Cabin manual product', () => {
  it('assigns optional Electricity, Heater, AC, WC, and Kitchen configuration groups', () => {
    expect(source).toContain("import { containerCustomizationConfigurations } from '../customizations/lib/seedRecipes'")
    expect(source).toContain('customizationConfigurations: manualProductCustomizationConfigurations(product)')
    const product = CONTAINER_PRODUCTS[0]
    const configurations = manualProductCustomizationConfigurations(product)
    expect(configurations.map((configuration) => configuration.group._ref)).toEqual([
      'customizationGroup-electricity',
      'customizationGroup-heater',
      'customizationGroup-ac',
      'customizationGroup-wc',
      'customizationGroup-kitchen'
    ])
    expect(configurations[0].itemOverrides?.[0].sizeRules?.map((rule) => rule.price))
      .toEqual([950, 950, 1050, 1050])
  })

  it.each([
    ['230x600', 4290],
    ['300x500', 5090],
    ['300x600', 5490],
    ['300x700', 5790]
  ])('sets %s to £%i plus VAT', (key, price) => {
    expect(source).toMatch(new RegExp(
      String.raw`key: '${key}'[\s\S]*?isPoa: false,[\s\S]*?price: ${price},`
    ))
  })
})
