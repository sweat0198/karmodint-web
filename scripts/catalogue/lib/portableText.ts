import { htmlToBlocks } from '@portabletext/block-tools'
import { compileSchema } from '@portabletext/schema'
import { marked } from 'marked'
import {
  BLOCK_CONTENT_DECORATOR_VALUES,
  BLOCK_CONTENT_LINK_ANNOTATION,
  BLOCK_CONTENT_LIST_VALUES,
  BLOCK_CONTENT_STYLE_VALUES
} from '../../../sanity/schemas/objects/blockContentSpec'
import { parseHtml } from './dom'

/**
 * The deserialiser schema, compiled from the same whitelist the Studio field uses.
 *
 * `@portabletext/block-tools` consumes HTML rather than markdown, so the pipeline is
 * markdown -> HTML -> Portable Text; the markdown is only ever an authoring convenience.
 */
const blockContentSchema = compileSchema({
  styles: BLOCK_CONTENT_STYLE_VALUES.map((name) => ({ name })),
  lists: BLOCK_CONTENT_LIST_VALUES.map((name) => ({ name })),
  decorators: BLOCK_CONTENT_DECORATOR_VALUES.map((name) => ({ name })),
  annotations: [
    {
      name: BLOCK_CONTENT_LINK_ANNOTATION.name,
      fields: [{ name: BLOCK_CONTENT_LINK_ANNOTATION.hrefField, type: 'string' }]
    }
  ]
})

/**
 * Deterministic keys, so re-running the import produces byte-identical documents.
 *
 * A random `_key` would make every re-run look like an edit to Sanity's history and would defeat
 * the idempotence the whole pipeline is built on.
 */
function sequentialKeys(prefix: string): () => string {
  let next = 0
  return () => `${prefix}-${next++}`
}

/**
 * Convert one product's markdown body into Portable Text.
 *
 * `keyPrefix` scopes the deterministic keys to a document — pass the product slug — so two
 * products converted in the same process do not share a counter and change each other's output by
 * being converted in a different order.
 */
export function markdownToPortableText(markdown: string, keyPrefix = 'block'): PortableTextBlock[] {
  const html = marked.parse(markdown, { async: false, gfm: true })

  return htmlToBlocks(html, blockContentSchema, {
    parseHtml,
    keyGenerator: sequentialKeys(keyPrefix)
  }) as PortableTextBlock[]
}

export interface PortableTextSpan {
  _type: 'span'
  _key?: string
  text: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: string
  _key?: string
  style?: string
  listItem?: string
  level?: number
  children?: PortableTextSpan[]
  markDefs?: Array<{ _key: string, _type: string, href?: string }>
}

/**
 * Every way the converted output could stray outside the block-content whitelist.
 *
 * This is the real guard on the conversion: `block-tools` will happily emit a `h1` or a `table`
 * that the Studio field would then refuse to render, and nothing else in the pipeline would notice.
 * Problems are collected rather than thrown so one run names all of them.
 */
export function validatePortableText(blocks: PortableTextBlock[]): string[] {
  const problems: string[] = []

  blocks.forEach((block, index) => {
    const where = `block ${index}`

    if (block._type !== 'block') {
      problems.push(`${where} has type "${block._type}" — only text blocks are allowed`)
      return
    }

    if (block.style !== undefined && !BLOCK_CONTENT_STYLE_VALUES.includes(block.style)) {
      problems.push(`${where} uses style "${block.style}", which is outside the whitelist`)
    }

    if (block.listItem !== undefined && !BLOCK_CONTENT_LIST_VALUES.includes(block.listItem)) {
      problems.push(`${where} uses list "${block.listItem}", which is outside the whitelist`)
    }

    const annotationKeys = new Set((block.markDefs ?? []).map((markDef) => markDef._key))

    for (const markDef of block.markDefs ?? []) {
      if (markDef._type !== BLOCK_CONTENT_LINK_ANNOTATION.name) {
        problems.push(`${where} carries a "${markDef._type}" annotation; only link is allowed`)
      }
    }

    for (const child of block.children ?? []) {
      if (child._type !== 'span') {
        problems.push(`${where} holds a "${child._type}" child; only spans are allowed`)
        continue
      }
      for (const mark of child.marks ?? []) {
        if (BLOCK_CONTENT_DECORATOR_VALUES.includes(mark)) continue
        if (annotationKeys.has(mark)) continue
        problems.push(`${where} uses mark "${mark}", which is neither a whitelisted decorator nor a declared annotation`)
      }
    }
  })

  return problems
}
