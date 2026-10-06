import { describe, it, expect } from 'vitest'
import { portableTextToPlainText, toPortableTextNodes } from '~/utils/portableText'
import type { PortableTextBlock } from '~/types/portableText'

const span = (text: string, marks: string[] = []) => ({ _type: 'span' as const, text, marks })

const paragraph = (children: ReturnType<typeof span>[], extra: Record<string, unknown> = {}) => ({
  _type: 'block' as const,
  style: 'normal',
  markDefs: [],
  children,
  ...extra
})

describe('toPortableTextNodes', () => {
  it('keeps each text block with its style and its spans’ decorators', () => {
    const nodes = toPortableTextNodes([
      paragraph([span('Heading')], { style: 'h2' }),
      paragraph([span('Bold', ['strong']), span(' and '), span('both', ['strong', 'em'])])
    ])

    expect(nodes).toEqual([
      { kind: 'block', style: 'h2', spans: [{ text: 'Heading', decorators: [] }] },
      {
        kind: 'block',
        style: 'normal',
        spans: [
          { text: 'Bold', decorators: ['strong'] },
          { text: ' and ', decorators: [] },
          { text: 'both', decorators: ['strong', 'em'] }
        ]
      }
    ])
  })

  it('resolves a link annotation to its href', () => {
    const [node] = toPortableTextNodes([
      paragraph([span('modular kiosk', ['strong', 'l1'])], {
        markDefs: [{ _key: 'l1', _type: 'link', href: '/solutions/retail-and-food-service-kiosks/' }]
      })
    ])

    expect(node).toEqual({
      kind: 'block',
      style: 'normal',
      spans: [
        {
          text: 'modular kiosk',
          decorators: ['strong'],
          href: '/solutions/retail-and-food-service-kiosks/'
        }
      ]
    })
  })

  it('groups consecutive list items of one kind into a single list', () => {
    const nodes = toPortableTextNodes([
      paragraph([span('Intro')]),
      paragraph([span('One')], { listItem: 'bullet', level: 1 }),
      paragraph([span('Two')], { listItem: 'bullet', level: 1 }),
      paragraph([span('First')], { listItem: 'number', level: 1 }),
      paragraph([span('Outro')])
    ])

    expect(nodes.map((node) => node.kind)).toEqual(['block', 'list', 'list', 'block'])
    expect(nodes[1]).toEqual({
      kind: 'list',
      listItem: 'bullet',
      items: [[{ text: 'One', decorators: [] }], [{ text: 'Two', decorators: [] }]]
    })
    expect(nodes[2]).toMatchObject({ kind: 'list', listItem: 'number' })
  })

  it('passes image blocks through and ignores unknown block types', () => {
    const blocks = [
      { _type: 'image', asset: { _ref: 'image-abc-900x600-jpg' }, alt: 'A kiosk' },
      { _type: 'table' }
    ] as unknown as PortableTextBlock[]

    expect(toPortableTextNodes(blocks)).toEqual([
      { kind: 'image', assetRef: 'image-abc-900x600-jpg', alt: 'A kiosk', caption: undefined }
    ])
  })

  it('treats a missing body as empty', () => {
    expect(toPortableTextNodes(undefined)).toEqual([])
  })
})

describe('portableTextToPlainText', () => {
  it('joins block text with line breaks, dropping marks and images', () => {
    const text = portableTextToPlainText([
      paragraph([span('Here are some steps:')]),
      paragraph([span('Site Preparation:', ['strong']), span(' Level the land.')], {
        listItem: 'bullet'
      }),
      { _type: 'image', alt: 'x' } as PortableTextBlock,
      paragraph([span('Done.')])
    ])

    expect(text).toBe('Here are some steps:\nSite Preparation: Level the land.\nDone.')
  })
})
