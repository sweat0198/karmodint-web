// @vitest-environment jsdom

import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ReferencesMarquee from '~/components/ReferencesMarquee.vue'
import type { ReferenceTile } from '~/types/reference'

const tiles: ReferenceTile[] = [
  {
    _id: 'one',
    companyName: 'Linked Company',
    location: 'London',
    logoUrl: '/one.svg',
    website: 'https://example.com'
  },
  {
    _id: 'two',
    companyName: 'Static Company',
    logoUrl: '/two.svg'
  }
]

describe('ReferencesMarquee', () => {
  it('hides the whole section when empty', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: [] } })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders one accessible group and one hidden duplicate', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })

    expect(wrapper.get('h2').text()).toBe('Trusted by organisations worldwide')
    expect(wrapper.findAll('[data-reference-copy="original"] [data-reference-tile]')).toHaveLength(2)
    expect(wrapper.findAll('[data-reference-copy="duplicate"] [data-reference-tile]')).toHaveLength(2)
    expect(wrapper.get('[data-reference-copy="duplicate"]').attributes('aria-hidden')).toBe('true')
  })

  it('never renders tiles as links, even when a website is supplied', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })
    const original = wrapper.get('[data-reference-copy="original"]')

    expect(original.findAll('a')).toHaveLength(0)
    expect(original.text()).toContain('London')
  })

  it('keeps required motion safety contracts in scoped CSS', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/components/ReferencesMarquee.vue'),
      'utf-8'
    )

    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain('prefers-reduced-motion: reduce')
    expect(source).toContain('SCROLL_SPEED = 40')
  })

  it('renders labelled slide buttons on both sides', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })

    expect(wrapper.get('[data-reference-prev]').attributes('aria-label')).toBe(
      'Show previous references'
    )
    expect(wrapper.get('[data-reference-next]').attributes('aria-label')).toBe(
      'Show next references'
    )
    expect(wrapper.get('[data-reference-prev]').attributes('type')).toBe('button')
  })

  it('slides the scroller in both directions when arrows are clicked', async () => {
    const wrapper = mount(ReferencesMarquee, {
      props: { references: tiles },
      attachTo: document.body
    })
    const scroller = wrapper.get('[data-reference-scroller]').element as HTMLElement
    const scrollBy = vi.fn()
    scroller.scrollBy = scrollBy

    await wrapper.get('[data-reference-next]').trigger('click')
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 288, behavior: 'smooth' })

    await wrapper.get('[data-reference-prev]').trigger('click')
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -288, behavior: 'smooth' })

    wrapper.unmount()
  })
})
