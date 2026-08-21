/**
 * The block-content whitelist, as plain data.
 *
 * Two things need it and must never disagree: the Studio schema in `blockContent.ts`, and the
 * markdown-to-Portable-Text conversion in the catalogue import, which compiles the same lists into
 * a deserialiser schema and then validates its own output against them. Stating it once means an
 * editor and the importer are held to the same rules.
 *
 * Deliberately no `sanity` import here — the import pipeline runs from the repo root, where the
 * Studio package is not resolvable.
 */

export interface BlockContentOption {
  title: string
  value: string
}

export const BLOCK_CONTENT_STYLES: BlockContentOption[] = [
  { title: 'Normal', value: 'normal' },
  { title: 'H2', value: 'h2' },
  { title: 'H3', value: 'h3' },
  { title: 'H4', value: 'h4' },
  { title: 'Quote', value: 'blockquote' }
]

export const BLOCK_CONTENT_LISTS: BlockContentOption[] = [
  { title: 'Bullet', value: 'bullet' },
  { title: 'Numbered', value: 'number' }
]

export const BLOCK_CONTENT_DECORATORS: BlockContentOption[] = [
  { title: 'Strong', value: 'strong' },
  { title: 'Emphasis', value: 'em' },
  { title: 'Code', value: 'code' }
]

/**
 * The only annotation a mark may point at, and its sole field.
 *
 * The two consumers declare the field's *type* differently and must — the Studio wants a `url`
 * with a scheme rule an editor is held to, the deserialiser wants a plain string it can fill from
 * an `href` attribute. The name is the part that has to agree, so only the name lives here.
 */
export const BLOCK_CONTENT_LINK_ANNOTATION = { title: 'URL', name: 'link', hrefField: 'href' } as const

export const BLOCK_CONTENT_STYLE_VALUES = BLOCK_CONTENT_STYLES.map((style) => style.value)
export const BLOCK_CONTENT_LIST_VALUES = BLOCK_CONTENT_LISTS.map((list) => list.value)
export const BLOCK_CONTENT_DECORATOR_VALUES = BLOCK_CONTENT_DECORATORS.map((decorator) => decorator.value)
