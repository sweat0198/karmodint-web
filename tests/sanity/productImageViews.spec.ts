import { describe, it, expect } from 'vitest'
import {
  PRODUCT_IMAGE_VIEWS,
  PRODUCT_IMAGE_VIEW_VALUES,
  viewOptionList,
  altPhraseForView,
  validateExactlyOneTopView,
  type ProductImageView
} from '../../sanity/schemas/objects/productImageViews'
import { validateExactlyOneDefaultSize } from '../../sanity/schemas/product'

describe('Product image view vocabulary', () => {
  it('defines the eight closed-vocabulary views in gallery order', () => {
    expect(PRODUCT_IMAGE_VIEW_VALUES).toEqual([
      'front',
      'left-diagonal',
      'right-diagonal',
      'right',
      'back',
      'interior',
      'door',
      'top'
    ])
  })

  it('leads with the front view so size previews pick it up first', () => {
    expect(PRODUCT_IMAGE_VIEW_VALUES[0]).toBe('front')
  })

  it('carries a title and an alt phrase for every view', () => {
    for (const view of PRODUCT_IMAGE_VIEWS) {
      expect(view.title.length).toBeGreaterThan(0)
      expect(view.altPhrase.length).toBeGreaterThan(0)
    }
  })

  it('exposes an option list shaped for a Sanity string field', () => {
    const list = viewOptionList()
    expect(list).toHaveLength(8)
    expect(list[0]).toEqual({ title: 'Front', value: 'front' })
    expect(list[7]).toEqual({ title: 'Plan / top-down', value: 'top' })
  })

  it('resolves alt phrases used by the templated alt text', () => {
    expect(altPhraseForView('front')).toBe('front view')
    expect(altPhraseForView('left-diagonal')).toBe('three-quarter view from the left')
    expect(altPhraseForView('top')).toBe('plan view from above')
  })

  it('returns an empty alt phrase for an unknown view rather than throwing', () => {
    expect(altPhraseForView('nonsense' as ProductImageView)).toBe('')
  })
})

describe('validateExactlyOneTopView', () => {
  it('accepts a gallery holding a single plan view', () => {
    expect(validateExactlyOneTopView([{ view: 'front' }, { view: 'top' }])).toBe(true)
  })

  it('rejects a gallery with no plan view', () => {
    expect(validateExactlyOneTopView([{ view: 'front' }, { view: 'back' }])).toBe(
      'Each size needs exactly one image with the "Plan / top-down" view (found 0)'
    )
  })

  it('rejects a gallery with two plan views', () => {
    expect(validateExactlyOneTopView([{ view: 'top' }, { view: 'top' }])).toBe(
      'Each size needs exactly one image with the "Plan / top-down" view (found 2)'
    )
  })

  it('defers to the required/min rules when the gallery is absent', () => {
    expect(validateExactlyOneTopView(undefined)).toBe(true)
    expect(validateExactlyOneTopView([])).toBe(true)
  })
})

describe('validateExactlyOneDefaultSize', () => {
  it('accepts exactly one default size', () => {
    expect(
      validateExactlyOneDefaultSize([{ isDefault: true }, { isDefault: false }])
    ).toBe(true)
  })

  it('rejects zero default sizes', () => {
    expect(validateExactlyOneDefaultSize([{ isDefault: false }, {}])).toBe(
      'Exactly one size must be marked as the default selection (found 0)'
    )
  })

  it('rejects two default sizes', () => {
    expect(
      validateExactlyOneDefaultSize([{ isDefault: true }, { isDefault: true }])
    ).toBe('Exactly one size must be marked as the default selection (found 2)')
  })

  it('defers to the required/min rules when sizes are absent', () => {
    expect(validateExactlyOneDefaultSize(undefined)).toBe(true)
    expect(validateExactlyOneDefaultSize([])).toBe(true)
  })
})
