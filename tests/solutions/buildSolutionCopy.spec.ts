import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildSolutionCopy } from '../../scripts/solutions/buildSolutionCopy'
import { SOLUTION_COPY, type SolutionCopy } from '../../scripts/solutions/data'
import type { PageCopyOptions } from '../../scripts/catalogue/lib/pageCopy'
import type { PortableTextBlock } from '../../scripts/catalogue/lib/portableText'
import { repoPath } from '../../scripts/catalogue/lib/paths'
import { loadRedirectSources } from '../../scripts/catalogue/lib/redirectSources'
import { PENDING_REDIRECT_GROUPS, REDIRECT_GROUPS, toRedirects } from '../../shared/migration/redirects'

const files: Record<string, string> = {
  'copy/site-offices.md': [
    'Our site cabins are ideal for [**portable cabins**](/portable-cabin/).',
    '',
    '## Site Cabin Sizes and Dimensions',
    '',
    '- **Variety of Sizes**: a range of sizes.',
    ''
  ].join('\n'),
  'copy/site-offices.faqs.md': ['## What is a site cabin?', '', 'A portable building.', ''].join('\n'),
  'copy/ticket.md': 'Ticket booths play a crucial role.\n'
}

const siteOffices: SolutionCopy = {
  slug: 'site-offices',
  legacyPath: '/site-cabin/',
  copyPath: 'copy/site-offices.md',
  faqsPath: 'copy/site-offices.faqs.md'
}

const ticket: SolutionCopy = {
  slug: 'ticket-information-and-service-kiosks',
  legacyPath: '/ticket-booths/',
  copyPath: 'copy/ticket.md'
}

function options(overrides: Partial<PageCopyOptions> = {}): PageCopyOptions {
  return {
    readFile: (path) => {
      if (!(path in files)) throw new Error(`no file ${path}`)
      return files[path]
    },
    redirectSources: new Set(['/site-cabin/', '/container/']),
    ...overrides
  }
}

describe('buildSolutionCopy', () => {
  it('turns each entry into Portable Text body and faqItem FAQs', () => {
    const [copy] = buildSolutionCopy([siteOffices], options())

    expect(copy.slug).toBe('site-offices')
    expect(copy.body.map((block) => block.style)).toEqual(['normal', 'h2', 'normal'])
    expect(copy.body[0].markDefs).toEqual([expect.objectContaining({ _type: 'link', href: '/portable-cabin/' })])
    expect(copy.body[2].listItem).toBe('bullet')
    expect(copy.faqs).toEqual([
      {
        _key: 'faq-0',
        _type: 'faqItem',
        question: 'What is a site cabin?',
        answer: [expect.objectContaining({ _type: 'block', style: 'normal' })]
      }
    ])
  })

  it('gives an entry without a FAQ file an empty FAQ list', () => {
    expect(buildSolutionCopy([ticket], options())[0].faqs).toEqual([])
  })

  it('is deterministic, so a re-run writes identical values', () => {
    expect(buildSolutionCopy([siteOffices, ticket], options())).toEqual(
      buildSolutionCopy([siteOffices, ticket], options())
    )
  })

  it('keeps block keys unique across Solutions', () => {
    const keys = buildSolutionCopy([siteOffices, ticket], options()).flatMap((copy) =>
      copy.body.map((block) => block._key)
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('rejects ported copy that links a redirect source, naming the Solution', () => {
    files['copy/redirecting.md'] = 'See our [site cabins](/site-cabin/).\n'
    expect(() => buildSolutionCopy([{ ...ticket, copyPath: 'copy/redirecting.md' }], options())).toThrow(
      /ticket-information-and-service-kiosks: body link "\/site-cabin\/" is a redirect source/
    )
  })

  it('rejects an FAQ answer that is not paragraphs or lists', () => {
    files['copy/heading.faqs.md'] = '## Question?\n\n### A heading inside an answer\n'
    expect(() => buildSolutionCopy([{ ...siteOffices, faqsPath: 'copy/heading.faqs.md' }], options())).toThrow(
      /FAQ 1 answer may only hold paragraphs and lists/
    )
  })

  it('rejects empty copy and a Solution listed twice', () => {
    files['copy/empty.md'] = '\n'
    expect(() => buildSolutionCopy([{ ...ticket, copyPath: 'copy/empty.md' }], options())).toThrow(/has no copy/)
    expect(() => buildSolutionCopy([ticket, ticket], options())).toThrow(/listed more than once/)
  })
})

describe('SOLUTION_COPY', () => {
  const realOptions = (): PageCopyOptions => ({
    readFile: (path) => fs.readFileSync(repoPath(path), 'utf-8'),
    redirectSources: loadRedirectSources()
  })
  const built = () => buildSolutionCopy(SOLUTION_COPY, realOptions())
  const copyOf = (slug: string) => built().find((copy) => copy.slug === slug)!
  const plainText = (blocks: PortableTextBlock[]) =>
    blocks.map((block) => (block.children ?? []).map((child) => child.text).join('')).join('\n')
  const headings = (blocks: PortableTextBlock[]) =>
    blocks.filter((block) => block.style === 'h2' || block.style === 'h3').map((block) => plainText([block]))

  // docs/plans/2026-10-06-uk-migration-design.md, "Solution changes".
  it('ports the copy of one primary Legacy URL per Solution, each URL now redirecting to that Solution', () => {
    expect(SOLUTION_COPY.map((entry) => [entry.slug, entry.legacyPath])).toEqual([
      ['retail-and-food-service-kiosks', '/outdoor-and-retail-kiosk/'],
      ['accommodation-units', '/farm-workers-accommodation/'],
      ['security-gatehouses-and-access-control', '/security-gatehouse-security-guardhouse/'],
      ['site-offices', '/site-cabin/'],
      ['welfare-and-wc-units', '/portable-cabin/portable-toilet-and-shower-cabin/'],
      ['car-park-valet-and-weighbridge-cabins', '/car-park-kiosk-and-parking-booths/'],
      ['ticket-information-and-service-kiosks', '/ticket-booths/'],
      ['garden-rooms-and-garden-offices', '/garden-office/']
    ])

    const redirects = new Map(toRedirects([...REDIRECT_GROUPS, ...PENDING_REDIRECT_GROUPS]).map((r) => [r.from, r.to]))
    for (const entry of SOLUTION_COPY) {
      expect(redirects.get(entry.legacyPath), entry.legacyPath).toBe(`/solutions/${entry.slug}/`)
    }
  })

  it('builds every committed copy file cleanly, with no link to a redirect source', () => {
    expect(built().map((copy) => copy.slug)).toEqual(SOLUTION_COPY.map((entry) => entry.slug))
    for (const copy of built()) expect(copy.body.length, copy.slug).toBeGreaterThan(0)
  })

  it('carries retained Legacy FAQs with questions word for word after client sign-off', () => {
    expect(Object.fromEntries(built().map((copy) => [copy.slug, copy.faqs.length]))).toEqual({
      'retail-and-food-service-kiosks': 17,
      'accommodation-units': 0,
      'security-gatehouses-and-access-control': 0,
      'site-offices': 4,
      'welfare-and-wc-units': 3,
      'car-park-valet-and-weighbridge-cabins': 0,
      'ticket-information-and-service-kiosks': 0,
      'garden-rooms-and-garden-offices': 0
    })
    expect(copyOf('site-offices').faqs.map((faq) => faq.question)).toEqual([
      'What is a site cabin?',
      'What size are site cabins?',
      'What size is a site container office?',
      'What are the dimensions of a 20ft site cabin?'
    ])
  })

  it('keeps the Legacy heading structure', () => {
    expect(headings(copyOf('ticket-information-and-service-kiosks').body)).toEqual([
      'Ticket Booths Sizes',
      'Used Ticket Booths Disadvantages'
    ])
    expect(headings(copyOf('site-offices').body)).toEqual([
      'Site Accommodation Units for Sale or Hire?',
      'Site Office for Sale',
      'Site Accommodation for Sale',
      'Temporary Site Accommodation and Site Office Specialist Karmod',
      'Karmod Benefits in Construction Site Accommodation',
      'Site Cabin Sizes and Dimensions',
      'Site Cabin Prices for Sale',
      'Customizable Construction Site Sleeping Accommodation',
      'Site Cabin Usage Areas'
    ])
  })

  it('omits the detailed toilet product claims removed in client sign-off #32', () => {
    const text = plainText(copyOf('welfare-and-wc-units').body)
    expect(text).not.toMatch(/camping|chemical|flush/i)
    expect(text).toContain('Single Portable Toilet for Sale:')
    expect(text).toContain('Portable Outdoor Toilet for Sale:')
  })

  it('omits chemical tank and emptying FAQs removed in client sign-off #32', () => {
    const copy = copyOf('welfare-and-wc-units')
    expect(copy.faqs.map((faq) => faq.question)).toEqual([
      'How much do portable toilets cost?',
      'What is a portable toilet?',
      'How to use a portable toilet?'
    ])
    expect(plainText(copy.faqs.flatMap((faq) => faq.answer))).not.toMatch(/chemical|tank|emptying|emptied/i)
  })

  // Karmod sells new units only (Legacy /site-cabin/: "we do not offer second-hand products or rentals").
  it('omits remaining kiosk rental and used-sales implications after client sign-off #32', () => {
    const copy = copyOf('retail-and-food-service-kiosks')
    expect(plainText(copy.body)).not.toContain('whether it’s to rent, own, or venture into the world of used kiosks')
    expect(plainText(copy.body)).not.toContain('rent another in a different city')
    expect(plainText(copy.faqs.flatMap((faq) => faq.answer))).not.toContain('buy or rent a retail kiosk')
  })

  it('cuts the retail kiosk page’s stale claims that Karmod rents kiosks or sells used ones', () => {
    const text = plainText(copyOf('retail-and-food-service-kiosks').body)
    for (const stale of [
      'rent a retail kiosk, or even find a used retail kiosk for sale',
      'from retail kiosk rental to purchase',
      'rental retail kiosk options',
      'Each used retail kiosk for sale',
      'retail kiosk rental agreement',
      'used retail kiosks for sale',
      'even a used retail kiosk'
    ]) {
      expect(text, stale).not.toContain(stale)
    }
    expect(text).toContain('From retail kiosk builders to retail kiosk suppliers, Karmod has partnerships across the board.')
  })
})
