import { describe, expect, it } from 'vitest'
import { publishableFaqs } from '~/utils/faqs'

const block = (text: string) => ({
  _type: 'block' as const,
  style: 'normal',
  markDefs: [],
  children: [{ _type: 'span' as const, text, marks: [] }]
})

describe('publishableFaqs', () => {
  it('keeps only entries with both question and answer text, in order', () => {
    const answered = { _key: 'a', question: 'What is a GRP kiosk?', answer: [block('A prefabricated structure.')] }

    expect(
      publishableFaqs([
        { _key: 'q', question: ' ', answer: [block('Orphan answer.')] },
        answered,
        { _key: 'b', question: 'Unanswered?', answer: [] },
        { _key: 'c', question: 'Blank answer?', answer: [block('   ')] }
      ])
    ).toEqual([answered])
  })

  it('is empty when there are no FAQs', () => {
    expect(publishableFaqs(null)).toEqual([])
    expect(publishableFaqs(undefined)).toEqual([])
  })
})
