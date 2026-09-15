// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CustomizationImage from '~/components/customization/CustomizationImage.vue'

describe('CustomizationImage', () => {
  it('passes a live Sanity asset to the native Sanity image component', () => {
    const wrapper = mount(CustomizationImage, {
      props: {
        image: { asset: { _ref: 'image-live-hash-100x100-png', _type: 'reference' } },
        alt: 'Live customization'
      },
      global: {
        stubs: {
          SanityImage: { props: ['asset', 'alt'], template: '<img data-testid="sanity-image" :alt="alt">' }
        }
      }
    })

    expect(wrapper.get('[data-testid="sanity-image"]').attributes('alt')).toBe('Live customization')
  })
})
