// @vitest-environment jsdom

import fs from 'node:fs'
import path from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
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
    expect(wrapper.get('[data-reference-copy="duplicate"] a').attributes('tabindex')).toBe('-1')
  })

  it('opens websites safely and leaves missing websites non-interactive', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })
    const original = wrapper.get('[data-reference-copy="original"]')
    const link = original.get('a')

    expect(link.attributes()).toMatchObject({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer'
    })
    expect(original.findAll('a')).toHaveLength(1)
    expect(original.text()).toContain('London')
  })

  it('keeps required motion safety contracts in scoped CSS', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/components/ReferencesMarquee.vue'),
      'utf-8'
    )

    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain('animation-play-state: paused')
    expect(source).toContain('40s linear infinite')
  })
})
