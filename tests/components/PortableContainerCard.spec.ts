// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { mount, flushPromises } from '@vue/test-utils'
import type { PortableContainerCard as PortableContainerCardModel } from '~/utils/portableContainerCards'

(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined }

const { useQuoteStore } = await import('~/stores/quote')
const PortableContainerCard = (await import('~/components/PortableContainerCard.vue')).default

const card: PortableContainerCardModel = {
  cardId: 'portable-product-k1002', productId: 'product-k1002', productName: 'K1002 Portable Cabin',
  productSlug: 'k1002-portable-cabin', shortDescription: '', categorySlugs: ['containers'],
  categoryNames: ['Portable Cabins'], sizeSearchTerms: [], lowestPrice: 9000, isPoaOnly: false,
  representativeImage: { alt: 'K1002 representative image', asset: { _type: 'reference', _ref: 'image-k1002-jpg' } },
  sizes: [
    { sizeKey: '300x700', sourceLabel: '3m × 7m', sizeLabel: '23ft × 10ft (3.00m × 7.00m)', specs: [], lengthM: 7, widthM: 3, price: 9000, isPoa: false, planImage: null, images: [] },
    { sizeKey: '300x900', sourceLabel: '3m × 9m', sizeLabel: '30ft × 10ft (3.00m × 9.00m)', specs: [], lengthM: 9, widthM: 3, price: undefined, isPoa: true, planImage: null, images: [] }
  ]
}

describe('PortableContainerCard', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows every available size, representative-image context, and the lowest configured price', () => {
    const wrapper = mount(PortableContainerCard, { props: { card }, global: { plugins: [createPinia()] } })

    expect(wrapper.text()).toContain('23ft × 10ft (3.00m × 7.00m)')
    expect(wrapper.text()).toContain('30ft × 10ft (3.00m × 9.00m)')
    expect(wrapper.text()).toContain('Representative image')
    expect(wrapper.text()).toContain('From £9,000')
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['Choose size & customize'])
  })

  it('starts an unresolved selection and opens Customize', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/customize', component: { template: '<div />' } }]
    })
    await router.push('/customize')
    await router.isReady()
    const wrapper = mount(PortableContainerCard, { props: { card }, global: { plugins: [createPinia(), router] } })

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(useQuoteStore().items[0]).toMatchObject({ hasSelectedSize: false, sizeKey: '' })
    expect(router.currentRoute.value.path).toBe('/customize')
  })
})
