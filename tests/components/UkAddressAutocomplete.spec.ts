// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import UkAddressAutocomplete from '~/components/UkAddressAutocomplete.vue'

vi.mock('~/composables/useGooglePlacesAutocomplete', () => ({
  useGooglePlacesAutocomplete: () => ({
    predictions: ref([]),
    isSearching: ref(false),
    search: vi.fn(),
    getPlaceDetails: vi.fn(),
    clearPredictions: vi.fn(),
    resetSessionToken: vi.fn()
  })
}))

describe('UkAddressAutocomplete', () => {
  it('shows the manually edited destination after returning to address search', async () => {
    const wrapper = mount(UkAddressAutocomplete, {
      props: {
        modelValue: {
          placeId: 'place-a',
          formattedAddress: '10 Old Road, Nottingham, NG1 1AA',
          addressLine1: '10 Old Road',
          addressLine2: '',
          townCity: 'Nottingham',
          county: '',
          postcode: 'NG1 1AA',
          country: 'United Kingdom'
        },
        required: true,
        showManualToggle: true
      }
    })

    await wrapper.get('button').trigger('click')
    await wrapper.get('input[placeholder="Building name, number and street"]').setValue('20 New Road')
    await wrapper.get('input[placeholder="e.g. London or Manchester"]').setValue('Manchester')
    await wrapper.get('input[placeholder="e.g. SW1A 2AA"]').setValue('M1 1AA')
    await wrapper.get('button').trigger('click')
    await nextTick()

    expect(wrapper.get('input[role="combobox"]').element.value).toBe('20 New Road, Manchester, M1 1AA')
  })
})
