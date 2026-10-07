import fs from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  buildProductLineDocuments,
  parseFaqMarkdown,
  type BuildOptions
} from '../../scripts/product-lines/buildDocuments'
import { PRODUCT_LINE_SEEDS, type ProductLineSeed } from '../../scripts/product-lines/data'
import { loadRedirectSources } from '../../scripts/product-lines/redirectSources'
import { repoPath } from '../../scripts/catalogue/lib/paths'

const files: Record<string, string> = {
  'copy/hub.md': 'Hub copy.\n',
  'copy/steel.md': [
    '## Built in steel',
    '',
    'A [**portable building**](/portable-cabin/) for any site.',
    ''
  ].join('\n'),
  'copy/steel.faqs.md': [
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
}

const hub: ProductLineSeed = {
  id: 'productLine-portable-cabin',
  name: 'Portable Cabin',
  path: '/portable-cabin/',
  description: 'Hub description.',
  cover: { imagePath: 'covers/hub.jpg', alt: 'A hub' },
  copyPath: 'copy/hub.md',
  displayOrder: 20,
  seo: { metaTitle: 'Portable Cabin | Legacy', metaDescription: 'Legacy hub description.' }
}

const steel: ProductLineSeed = {
  id: 'productLine-steel-cabin',
  name: 'Steel Cabin',
  path: '/portable-cabin/steel-cabin/',
  parentId: hub.id,
  categoryId: 'category-containers',
  description: 'Steel description.',
  cover: { imagePath: 'covers/steel.jpg', alt: 'A steel cabin' },
  copyPath: 'copy/steel.md',
  faqsPath: 'copy/steel.faqs.md',
  displayOrder: 30,
  seo: { metaTitle: 'Steel Cabin | Legacy', metaDescription: 'Legacy steel description.' }
}

function options(overrides: Partial<BuildOptions> = {}): BuildOptions {
  return {
    readFile: (path) => {
      if (!(path in files)) throw new Error(`no file ${path}`)
      return files[path]
    },
    assetIds: { 'covers/hub.jpg': 'image-hub-1376x768-jpg', 'covers/steel.jpg': 'image-steel-1376x768-jpg' },
    redirectSources: new Set(['/container/']),
    ...overrides
  }
}

describe('parseFaqMarkdown', () => {
  it('splits `## question` sections into questions and their answer markdown', () => {
    expect(parseFaqMarkdown(files['copy/steel.faqs.md'])).toEqual([
      { question: 'How big is it?', answer: 'Sizes vary:\n\n- **Small:** one desk.\n- **Large:** a team.' },
      { question: 'Is it insulated?', answer: 'Yes.' }
    ])
  })
})

describe('buildProductLineDocuments', () => {
  it('builds one productLine document per seed, with references, cover, copy, FAQs and SEO', () => {
    const [, document] = buildProductLineDocuments([hub, steel], options())

    expect(document).toMatchObject({
      _id: 'productLine-steel-cabin',
      _type: 'productLine',
      name: 'Steel Cabin',
      path: '/portable-cabin/steel-cabin/',
      parent: { _type: 'reference', _ref: 'productLine-portable-cabin' },
      category: { _type: 'reference', _ref: 'category-containers' },
      description: 'Steel description.',
      coverImage: {
        _type: 'image',
        asset: { _type: 'reference', _ref: 'image-steel-1376x768-jpg' },
        alt: 'A steel cabin'
      },
      displayOrder: 30,
      seo: { _type: 'seo', metaTitle: 'Steel Cabin | Legacy', metaDescription: 'Legacy steel description.' }
    })

    expect(document.body[0]).toMatchObject({ _type: 'block', style: 'h2' })
    const linked = document.body[1]
    expect(linked.markDefs).toEqual([
      expect.objectContaining({ _type: 'link', href: '/portable-cabin/' })
    ])

    expect(document.faqs?.map((faq) => [faq._type, faq.question])).toEqual([
      ['faqItem', 'How big is it?'],
      ['faqItem', 'Is it insulated?']
    ])
    expect(document.faqs?.[0]._key).toBeTruthy()
    expect(document.faqs?.[0].answer.filter((block) => block.listItem === 'bullet')).toHaveLength(2)
  })

  it('leaves out parent, category and FAQs a seed does not set', () => {
    const [document] = buildProductLineDocuments([hub], options())
    expect(document).not.toHaveProperty('parent')
    expect(document).not.toHaveProperty('category')
    expect(document).not.toHaveProperty('faqs')
  })

  it('is deterministic, so a re-run is not an edit', () => {
    expect(buildProductLineDocuments([hub, steel], options())).toEqual(
      buildProductLineDocuments([hub, steel], options())
    )
  })

  it('rejects a path Studio would reject, naming the seed', () => {
    expect(() =>
      buildProductLineDocuments([{ ...hub, path: '/Portable-Cabin' }], options())
    ).toThrow(/productLine-portable-cabin.*start and end/)
  })

  it('rejects a child path that is not under its parent', () => {
    expect(() =>
      buildProductLineDocuments([hub, { ...steel, path: '/steel-cabin/' }], options())
    ).toThrow(/productLine-steel-cabin.*under its parent/)
  })

  it('rejects two seeds sharing a path', () => {
    expect(() =>
      buildProductLineDocuments([hub, { ...hub, id: 'productLine-copy' }], options())
    ).toThrow(/already used/)
  })

  it('rejects a parent that is not another seed', () => {
    expect(() => buildProductLineDocuments([steel], options())).toThrow(
      /parent "productLine-portable-cabin" is not a seeded Product Line/
    )
  })

  it('rejects a link to a Legacy URL that now redirects, so ported copy never links a 301', () => {
    files['copy/redirecting.md'] = 'See [containers](/container/).\n'
    expect(() =>
      buildProductLineDocuments([{ ...hub, copyPath: 'copy/redirecting.md' }], options())
    ).toThrow(/"\/container\/" is a redirect source/)
  })

  it('rejects an internal link that is not in `/` form', () => {
    files['copy/slashless.md'] = 'See [cabins](/portable-cabin).\n'
    expect(() =>
      buildProductLineDocuments([{ ...hub, copyPath: 'copy/slashless.md' }], options())
    ).toThrow(/"\/portable-cabin" must end in "\/"/)
  })

  it('rejects a path that is not one of the migration’s Kept URLs', () => {
    expect(() =>
      buildProductLineDocuments([{ ...hub, path: '/new-landing-page/' }], options())
    ).toThrow(/"\/new-landing-page\/" is not a Kept URL/)
  })

  it('rejects a seed whose cover was not uploaded', () => {
    expect(() => buildProductLineDocuments([hub], options({ assetIds: {} }))).toThrow(
      /no uploaded cover for covers\/hub\.jpg/
    )
  })
})

describe('PRODUCT_LINE_SEEDS', () => {
  const realOptions = (): BuildOptions => ({
    readFile: (path) => fs.readFileSync(repoPath(path), 'utf-8'),
    assetIds: Object.fromEntries(PRODUCT_LINE_SEEDS.map((seed) => [seed.cover.imagePath, 'image-x-10x10-jpg'])),
    redirectSources: loadRedirectSources()
  })

  it('builds every committed seed cleanly, with each cover image on disk', () => {
    expect(buildProductLineDocuments(PRODUCT_LINE_SEEDS, realOptions()).length).toBe(PRODUCT_LINE_SEEDS.length)
    for (const seed of PRODUCT_LINE_SEEDS) {
      expect(fs.existsSync(repoPath(seed.cover.imagePath)), seed.cover.imagePath).toBe(true)
    }
  })

  it('seeds every Product Line Kept URL, with its Legacy name, title and description, parent and catalogue section', () => {
    const documents = buildProductLineDocuments(PRODUCT_LINE_SEEDS, realOptions())
    const byId = new Map(documents.map((doc) => [doc._id, doc]))
    const rows = documents
      .map((doc) => [doc.path, doc.name, doc.parent ? byId.get(doc.parent._ref)?.path : undefined, doc.category?._ref])
      .sort(([a], [b]) => String(a).localeCompare(String(b)))

    expect(rows).toEqual([
      ['/bulletproof-cabin/', 'Bulletproof Cabin', undefined, 'category-bulletproof'],
      ['/grp-kiosk-cabin/', 'GRP Kiosk Cabin', undefined, 'category-cabin-grp'],
      ['/modular-buildings/', 'Modular Buildings', undefined, undefined],
      ['/panel-cabin/', 'Panel Cabin', undefined, 'category-cabin-composite'],
      ['/portable-cabin/', 'Portable Cabin', undefined, 'category-containers'],
      ['/portable-cabin/flat-pack-cabins/', 'Flat Pack Cabin', '/portable-cabin/', 'category-containers'],
      ['/portable-cabin/jackleg-cabin/', 'Jackleg Cabin', '/portable-cabin/', 'category-containers'],
      ['/portable-cabin/portable-classroom/', 'Portable Classroom', '/portable-cabin/', 'category-containers'],
      ['/portable-cabin/portable-house/', 'Portable House', '/portable-cabin/', 'category-containers'],
      ['/portable-cabin/steel-cabin/', 'Steel Cabin', '/portable-cabin/', 'category-containers']
    ])

    expect(Object.fromEntries(documents.map((doc) => [doc.path, doc.seo.metaTitle]))).toMatchObject({
      '/modular-buildings/': 'Modular Building for Sale UK from Manufacturer Company',
      '/portable-cabin/': 'Portable Cabin for Sale | Affordable Prices and Big Projects',
      '/portable-cabin/steel-cabin/': 'Best Steel Cabin Prices for Sale UK from Manufacturer',
      '/portable-cabin/flat-pack-cabins/': 'Best Flat Pack Cabin for Sale UK | Prices and Sizes',
      '/portable-cabin/jackleg-cabin/': 'Best Jackleg Cabin Prices for Sale UK from Manufacturer',
      '/portable-cabin/portable-classroom/': 'Portable Classroom for Sale | Mobile Nursery Building Cost',
      '/portable-cabin/portable-house/': 'Portable House Cabin for Sale | Projects and Prices',
      '/panel-cabin/': 'Panel Cabin for Sale | Security or Retail',
      '/bulletproof-cabin/': 'Bulletproof Cabin Prices for Sale | Armoured Security Cabin'
    })
    expect(byId.get('productLine-panel-cabin')?.seo.metaDescription).toBe(
      'Versatile panel cabins for security or retail use, offering superior insulation, quick setup, and durability. Available in multiple sizes.'
    )
  })

  it('ports the Legacy FAQs, minus the stale USD price answers', () => {
    const faqCounts = Object.fromEntries(
      buildProductLineDocuments(PRODUCT_LINE_SEEDS, realOptions()).map((doc) => [doc.path, doc.faqs?.length ?? 0])
    )

    expect(faqCounts).toEqual({
      '/modular-buildings/': 9,
      '/portable-cabin/': 7,
      '/portable-cabin/steel-cabin/': 0,
      '/portable-cabin/flat-pack-cabins/': 5,
      '/portable-cabin/jackleg-cabin/': 2,
      '/portable-cabin/portable-classroom/': 14,
      '/portable-cabin/portable-house/': 8,
      '/grp-kiosk-cabin/': 3,
      '/panel-cabin/': 0,
      '/bulletproof-cabin/': 0
    })
  })

  it('ports /grp-kiosk-cabin/ with its Legacy title, description, copy and FAQs, listing Cabin › GRP', () => {
    const document = buildProductLineDocuments(PRODUCT_LINE_SEEDS, realOptions()).find(
      (doc) => doc.path === '/grp-kiosk-cabin/'
    )

    expect(document).toMatchObject({
      _id: 'productLine-grp-kiosk-cabin',
      name: 'GRP Kiosk Cabin',
      category: { _ref: 'category-cabin-grp' },
      seo: {
        metaTitle: 'GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int',
        metaDescription:
          'When it comes to providing quality, innovative solutions for a wide range of applications the UK is home to some of the finest GRP kiosks.'
      }
    })
    expect(document).not.toHaveProperty('parent')

    const headings = document!.body.filter((block) => block.style === 'h2' || block.style === 'h3')
    expect(headings.map((block) => block.children?.map((child) => child.text).join(''))).toEqual([
      'Transparent Quality: GRP Kiosk Prices in the UK',
      'Discover Value: GRP Kiosk Price List for Your Budget',
      'Unmatched Craftsmanship: Leading GRP Kiosk Manufacturer in the UK',
      'Unveiling Perfection: GRP Kiosk Specification Breakdown',
      'Size Matters: Exploring GRP Kiosk Sizes for Your Needs'
    ])
    expect(document!.faqs?.map((faq) => faq.question)).toEqual([
      'How to install a GRP kiosk?',
      'What size is a GRP kiosk?',
      'What is a GRP kiosk?'
    ])
  })
})
