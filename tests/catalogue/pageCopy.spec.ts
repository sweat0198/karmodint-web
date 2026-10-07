import { describe, expect, it } from 'vitest'
import { parseFaqMarkdown } from '../../scripts/catalogue/lib/pageCopy'

describe('parseFaqMarkdown', () => {
  it('splits `## question` sections into questions and their answer markdown', () => {
    const markdown = [
      '## How big is it?',
      '',
      'Sizes vary:',
      '',
      '- **Small:** one desk.',
      '- **Large:** a team.',
      '',
      '## Is it insulated?',
      '',
      'Yes.',
      ''
    ].join('\n')

    expect(parseFaqMarkdown(markdown)).toEqual([
      { question: 'How big is it?', answer: 'Sizes vary:\n\n- **Small:** one desk.\n- **Large:** a team.' },
      { question: 'Is it insulated?', answer: 'Yes.' }
    ])
  })
})
