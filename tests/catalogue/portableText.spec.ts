import { describe, it, expect } from 'vitest'
import {
  markdownToPortableText,
  validatePortableText,
  type PortableTextBlock
} from '../../scripts/catalogue/lib/portableText'
import { loadCopyFile, parseCopyFile } from '../../scripts/catalogue/lib/copy'
import { loadManifest } from '../../scripts/catalogue/lib/manifest'

const manifest = loadManifest()

describe('Markdown to Portable Text conversion', () => {
  it('converts every committed copy file into Portable Text the block-content field accepts', () => {
    for (const product of manifest.products) {
      const { body } = loadCopyFile(product.copyFile)
      const blocks = markdownToPortableText(body, product.slug)

      expect(blocks.length).toBeGreaterThan(0)
      expect(validatePortableText(blocks)).toEqual([])
    }
  })

  it('maps the whitelisted markdown constructs onto their block-content equivalents', () => {
    const blocks = markdownToPortableText(
      [
        '## Heading two',
        '',
        '### Heading three',
        '',
        '#### Heading four',
        '',
        'A **strong** and *emphasised* paragraph with `code` and a [link](https://example.com).',
        '',
        '> A quotation.',
        '',
        '- bullet one',
        '- bullet two',
        '',
        '1. numbered one',
        '2. numbered two'
      ].join('\n')
    )

    expect(validatePortableText(blocks)).toEqual([])

    const styles = blocks.filter((block) => block.listItem === undefined).map((block) => block.style)
    expect(styles).toEqual(expect.arrayContaining(['h2', 'h3', 'h4', 'normal', 'blockquote']))

    const lists = blocks.filter((block) => block.listItem !== undefined).map((block) => block.listItem)
    expect(lists).toEqual(['bullet', 'bullet', 'number', 'number'])

    const marks = blocks.flatMap((block) => block.children ?? []).flatMap((child) => child.marks ?? [])
    expect(marks).toEqual(expect.arrayContaining(['strong', 'em', 'code']))
  })

  it('carries a link through as a link annotation rather than a bare decorator', () => {
    const blocks = markdownToPortableText('See the [spec sheet](https://example.com/spec).')

    const markDefs = blocks.flatMap((block) => block.markDefs ?? [])
    expect(markDefs).toHaveLength(1)
    expect(markDefs[0]._type).toBe('link')
    expect(markDefs[0].href).toBe('https://example.com/spec')

    const linked = blocks
      .flatMap((block) => block.children ?? [])
      .find((child) => child.text === 'spec sheet')
    expect(linked?.marks).toContain(markDefs[0]._key)
  })

  it('produces the same keys on every run, so re-importing is not an edit', () => {
    const markdown = '## Heading\n\nA paragraph.\n\n- one\n- two'
    expect(markdownToPortableText(markdown, 'grp-cabin'))
      .toEqual(markdownToPortableText(markdown, 'grp-cabin'))
  })

  it('scopes keys by prefix so two products cannot collide', () => {
    const first = markdownToPortableText('A paragraph.', 'a')
    const second = markdownToPortableText('A paragraph.', 'b')
    expect(first[0]._key).not.toBe(second[0]._key)
  })
})

describe('Block-content whitelist validation', () => {
  it('accepts a whitelisted block', () => {
    const block: PortableTextBlock = {
      _type: 'block',
      _key: 'b0',
      style: 'h2',
      markDefs: [],
      children: [{ _type: 'span', _key: 'b1', text: 'Heading', marks: ['strong'] }]
    }
    expect(validatePortableText([block])).toEqual([])
  })

  it('rejects a style outside the whitelist', () => {
    const block: PortableTextBlock = {
      _type: 'block',
      style: 'h1',
      children: [{ _type: 'span', text: 'Too big' }]
    }
    expect(validatePortableText([block])).toContainEqual(expect.stringContaining('style "h1"'))
  })

  it('rejects a block that is not a text block, such as an inlined image', () => {
    expect(validatePortableText([{ _type: 'image' }])).toContainEqual(
      expect.stringContaining('only text blocks are allowed')
    )
  })

  it('rejects a list type outside the whitelist', () => {
    const block: PortableTextBlock = {
      _type: 'block',
      style: 'normal',
      listItem: 'checkbox',
      children: [{ _type: 'span', text: 'Done' }]
    }
    expect(validatePortableText([block])).toContainEqual(expect.stringContaining('list "checkbox"'))
  })

  it('rejects a mark that is neither a whitelisted decorator nor a declared annotation', () => {
    const block: PortableTextBlock = {
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', text: 'Struck', marks: ['strike-through'] }]
    }
    expect(validatePortableText([block])).toContainEqual(
      expect.stringContaining('mark "strike-through"')
    )
  })

  it('rejects an annotation type other than link', () => {
    const block: PortableTextBlock = {
      _type: 'block',
      style: 'normal',
      markDefs: [{ _key: 'm0', _type: 'internalLink' }],
      children: [{ _type: 'span', text: 'Elsewhere', marks: ['m0'] }]
    }
    expect(validatePortableText([block])).toContainEqual(
      expect.stringContaining('"internalLink" annotation')
    )
  })
})

describe('Product copy files', () => {
  it('carries frontmatter that agrees with the manifest', () => {
    for (const product of manifest.products) {
      const { frontmatter } = loadCopyFile(product.copyFile)
      expect(frontmatter.name).toBe(product.name)
      expect(frontmatter.slug).toBe(product.slug)
      expect(frontmatter.shortDescription.length).toBeGreaterThan(0)
      expect(frontmatter.seoTitle.length).toBeGreaterThan(0)
      expect(frontmatter.seoDescription.length).toBeGreaterThan(0)
    }
  })

  it('keeps structure out of the frontmatter', () => {
    for (const product of manifest.products) {
      const source = loadCopyFile(product.copyFile)
      expect(Object.keys(source.frontmatter).sort()).toEqual([
        'isFeatured',
        'name',
        'seoDescription',
        'seoTitle',
        'shortDescription',
        'slug'
      ])
    }
  })

  it('reads a value containing a colon verbatim', () => {
    const copy = parseCopyFile(
      [
        '---',
        'name: GRP Cabin',
        'slug: grp-cabin',
        'shortDescription: Short.',
        'seoTitle: GRP Cabin: polyester kiosks',
        'seoDescription: Meta.',
        'isFeatured: false',
        '---',
        '',
        'Body.'
      ].join('\n')
    )
    expect(copy.frontmatter.seoTitle).toBe('GRP Cabin: polyester kiosks')
    expect(copy.frontmatter.isFeatured).toBe(false)
    expect(copy.body).toBe('Body.')
  })

  it('refuses a file whose frontmatter is incomplete', () => {
    expect(() => parseCopyFile('---\nname: Only a name\n---\n\nBody.', 'broken.md'))
      .toThrow(/missing slug, shortDescription/)
  })

  it('refuses a file with no frontmatter at all', () => {
    expect(() => parseCopyFile('# Just a body', 'broken.md')).toThrow(/missing the leading ---/)
  })
})
