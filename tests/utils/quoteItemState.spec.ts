import { describe, expect, it } from 'vitest'
import { moveQuoteItemState } from '~/utils/quoteItemState'

describe('moveQuoteItemState', () => {
  it('moves local customizer state when a configuration-safe line receives a new id', () => {
    const state = { provisional: { heating: ['electric'] } }

    moveQuoteItemState(state, 'provisional', 'selected-config')

    expect(state).toEqual({ 'selected-config': { heating: ['electric'] } })
  })
})
