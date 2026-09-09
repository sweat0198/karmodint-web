// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SizeSelector from '~/components/customization/SizeSelector.vue'

const sizes = [
  { sizeKey: '300x700', sizeLabel: '23ft × 10ft (3.00m × 7.00m)', isPoa: false, price: 9000 },
  { sizeKey: '300x900', sizeLabel: '30ft × 10ft (3.00m × 9.00m)', isPoa: true, price: undefined }
]

describe('SizeSelector', () => {
  it('requires an explicit accessible choice and exposes POA accurately', () => {
    const wrapper = mount(SizeSelector, { props: { sizes, modelValue: '' } })

    expect(wrapper.get('select').attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Choose a size before continuing to quote review.')
    expect(wrapper.text()).toContain('£9,000')
    expect(wrapper.text()).toContain('Price on application')
  })

  it('emits the chosen configured size key', async () => {
    const wrapper = mount(SizeSelector, { props: { sizes, modelValue: '' } })

    await wrapper.get('select').setValue('300x700')

    expect(wrapper.emitted('update:modelValue')).toEqual([['300x700']])
  })
})
