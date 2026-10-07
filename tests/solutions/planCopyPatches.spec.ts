import { describe, expect, it } from 'vitest'
import type { SolutionCopyFields } from '../../scripts/solutions/buildSolutionCopy'
import { planCopyPatches } from '../../scripts/solutions/planCopyPatches'

const paragraph = (key: string) => ({
  _key: key,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span' as const, text: key, marks: [] }]
})

const siteOffices: SolutionCopyFields = {
  slug: 'site-offices',
  body: [paragraph('site-offices-0')],
  faqs: [{ _key: 'faq-0', _type: 'faqItem', question: 'What is a site cabin?', answer: [paragraph('a-0')] }]
}

const ticket: SolutionCopyFields = { slug: 'ticket-information-and-service-kiosks', body: [paragraph('ticket-0')], faqs: [] }

const solutions = [
  { _id: 'solution-site-offices', slug: 'site-offices' },
  { _id: 'drafts.solution-site-offices', slug: 'site-offices' },
  { _id: 'solution-ticket', slug: 'ticket-information-and-service-kiosks' },
  { _id: 'solution-canteens', slug: 'canteens-and-break-rooms' }
]

describe('planCopyPatches', () => {
  it('sets body and FAQs on the published document and its pending draft', () => {
    const patches = planCopyPatches([siteOffices], solutions)

    expect(patches.map((patch) => patch.documentId)).toEqual(['solution-site-offices', 'drafts.solution-site-offices'])
    expect(patches[0]).toEqual({
      documentId: 'solution-site-offices',
      set: { body: siteOffices.body, faqs: siteOffices.faqs },
      unset: []
    })
  })

  // Re-running after the Legacy copy's FAQs were dropped must clear stale FAQs, not keep them.
  it('unsets FAQs on a Solution whose Legacy copy had none, so a re-run converges', () => {
    const [patch] = planCopyPatches([ticket], solutions)
    expect(patch).toEqual({ documentId: 'solution-ticket', set: { body: ticket.body }, unset: ['faqs'] })
  })

  it('leaves Solutions without Legacy copy untouched', () => {
    const ids = planCopyPatches([siteOffices, ticket], solutions).map((patch) => patch.documentId)
    expect(ids).not.toContain('solution-canteens')
  })

  it('fails when a Solution with copy is missing from the dataset', () => {
    expect(() => planCopyPatches([siteOffices], [])).toThrow(/No Solution with slug "site-offices"/)
  })
})
