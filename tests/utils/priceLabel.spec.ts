import { describe, expect, it } from 'vitest'
import {
  getPartialTotalLabel,
  getPriceLabel,
  getTotalLabel,
  getWeightLabel,
  hasPublishablePrice
} from '~~/shared/utils/priceLabel'

describe('getPriceLabel', () => {
  it('formats a priced amount as GBP', () => {
    expect(getPriceLabel({ price: 3240 })).toBe('£3,240')
  })

  it('is bare "POA" for a POA line, regardless of any stored price', () => {
    expect(getPriceLabel({ isPoa: true })).toBe('POA')
    expect(getPriceLabel({ price: 1000, isPoa: true })).toBe('POA')
  })

  it('treats a missing price as POA rather than an invented zero price', () => {
    expect(getPriceLabel({})).toBe('POA')
  })

  it('accepts a currency symbol override', () => {
    expect(getPriceLabel({ price: 100 }, '$')).toBe('$100')
  })
})

describe('getTotalLabel', () => {
  it('formats a priced total as GBP', () => {
    expect(getTotalLabel({ total: 3240, hasPoa: false })).toBe('£3,240')
  })

  it('appends "+ POA" when the total has POA extras on top of it (mixed POA and priced lines)', () => {
    expect(getTotalLabel({ total: 3240, hasPoa: true })).toBe('£3,240 + POA')
  })
})

describe('getPartialTotalLabel', () => {
  it('formats a priced aggregate as GBP', () => {
    expect(getPartialTotalLabel({ total: 3240, hasPoa: false })).toBe('£3,240')
  })

  it('keeps the known subtotal visible when sibling lines include POA', () => {
    expect(getPartialTotalLabel({ total: 3240, hasPoa: true })).toBe('£3,240 + POA')
  })
})

describe('hasPublishablePrice', () => {
  it('is false for a POA line even when a placeholder price is stored', () => {
    expect(hasPublishablePrice({ price: 0, isPoa: true })).toBe(false)
  })

  it('is false when no price has been supplied at all', () => {
    expect(hasPublishablePrice({ isPoa: false })).toBe(false)
  })

  it('is true for a priced, non-POA line', () => {
    expect(hasPublishablePrice({ price: 3240, isPoa: false })).toBe(true)
  })
})

describe('getWeightLabel', () => {
  it('omits the sentinel weight of 0 ("not yet supplied")', () => {
    expect(getWeightLabel(0)).toBeUndefined()
    expect(getWeightLabel(undefined)).toBeUndefined()
  })

  it('formats a supplied weight', () => {
    expect(getWeightLabel(450)).toBe('Weight: 450kg')
  })
})
