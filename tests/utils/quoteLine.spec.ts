import { describe, expect, it } from 'vitest'
import { getQuoteLineFinancials, getQuoteLineId, getQuoteLinesTotal, requiresSizeSelection } from '~~/shared/utils/quoteLine'

describe('getQuoteLineId', () => {
  it('uses a selector-safe deterministic identifier for a portable configuration', () => {
    const line = {
      productId: 'product-k1002', sizeKey: '300x700', productName: 'K1002', productSlug: 'k1002',
      sizeLabel: '3m × 7m', quantity: 1, isPortableContainer: true, hasSelectedSize: true,
      configState: { heating: ['electric'] }, customizationNotes: { heating: 'Urgent' }
    }

    expect(getQuoteLineId(line)).toMatch(/^product-k1002-300x700-config-[a-f0-9]+$/)
    expect(getQuoteLineId({ ...line, configState: { heating: ['gas'] } })).not.toBe(getQuoteLineId(line))
  })

  it('rejects a portable line marked selected when it has no concrete size key', () => {
    expect(requiresSizeSelection({ isPortableContainer: true, hasSelectedSize: true, sizeKey: '' })).toBe(true)
  })

  it('gives an ordinary Product + Size Option line the same plain id whether or not it is portable', () => {
    const line = {
      productId: 'product-grp-cabin', sizeKey: '150x150', productName: 'GRP Cabin', productSlug: 'grp-cabin',
      sizeLabel: '1.50m × 1.50m', quantity: 1
    }

    expect(getQuoteLineId(line)).toBe('product-grp-cabin-150x150')
  })

  it('appends a configuration-derived id to a customized non-portable line, same as a portable one', () => {
    const line = {
      productId: 'product-grp-cabin', sizeKey: '150x150', productName: 'GRP Cabin', productSlug: 'grp-cabin',
      sizeLabel: '1.50m × 1.50m', quantity: 1,
      configState: { finish: 'anthracite' }, customizationNotes: {}
    }

    expect(getQuoteLineId(line)).toMatch(/^product-grp-cabin-150x150-config-[a-f0-9]+$/)
  })

  it('treats an explicit "None" selection as a configuration decision, distinct from no selection at all', () => {
    const unconfigured = {
      productId: 'product-grp-cabin', sizeKey: '150x150', productName: 'GRP Cabin', productSlug: 'grp-cabin',
      sizeLabel: '1.50m × 1.50m', quantity: 1
    }
    const explicitNone = { ...unconfigured, configState: { finish: null } }

    expect(getQuoteLineId(explicitNone)).not.toBe(getQuoteLineId(unconfigured))
  })
})

describe('getQuoteLineFinancials', () => {
  it('prices from basePrice when there is no customized total', () => {
    const financials = getQuoteLineFinancials({ basePrice: 1000, quantity: 2 })

    expect(financials.unitPrice).toBe(1000)
    expect(financials.lineTotal).toBe(2000)
  })

  it('prefers the customized total over the price captured at add time', () => {
    const financials = getQuoteLineFinancials({ basePrice: 1000, customTotal: 1250, quantity: 2 })

    expect(financials.unitPrice).toBe(1250)
    expect(financials.lineTotal).toBe(2500)
  })

  it('prices at 0 when neither a base price nor a customized total is set', () => {
    const financials = getQuoteLineFinancials({ quantity: 3 })

    expect(financials.unitPrice).toBe(0)
    expect(financials.lineTotal).toBe(0)
  })

  it('reads the stored isPoa flag rather than inferring it from a missing price', () => {
    expect(getQuoteLineFinancials({ quantity: 1, isPoa: true }).isPoa).toBe(true)
    expect(getQuoteLineFinancials({ quantity: 1, isPoa: false }).isPoa).toBe(false)
    // No stored flag at all: a line with a price is not POA just because the flag is absent.
    expect(getQuoteLineFinancials({ quantity: 1, basePrice: 1000 }).isPoa).toBe(false)
  })

  it('does not treat a POA line\'s missing price as a reason to zero out its current price', () => {
    // A POA line can still carry an estimate; POA-ness and price are decided independently.
    const financials = getQuoteLineFinancials({ basePrice: 1000, isPoa: true, quantity: 1 })

    expect(financials.isPoa).toBe(true)
    expect(financials.unitPrice).toBe(1000)
  })
})

describe('getQuoteLinesTotal', () => {
  it('sums every line\'s current lineTotal', () => {
    const total = getQuoteLinesTotal([
      { basePrice: 1000, quantity: 2 },
      { basePrice: 500, customTotal: 750, quantity: 1 }
    ])

    expect(total).toBe(2000 + 750)
  })

  it('includes POA lines at their current price', () => {
    const total = getQuoteLinesTotal([{ basePrice: 1000, isPoa: true, quantity: 1 }])

    expect(total).toBe(1000)
  })

  it('is 0 for an empty Quote List', () => {
    expect(getQuoteLinesTotal([])).toBe(0)
  })
})
