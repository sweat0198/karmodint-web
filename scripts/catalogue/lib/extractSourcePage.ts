import type { SourceLang, SourcePage } from './sourcePages'
import { parseHtml as defaultParseHtml } from './dom'

/** One `Label: value` row lifted off a source page's specification list. */
export interface SourceSpec {
  label: string
  value: string
}

/**
 * Everything the rewrite and the manifest need from one source page.
 *
 * `detailHtml` is kept verbatim rather than reduced to text so a reviewer can trace any rewritten
 * paragraph back to the markup it came from.
 */
export interface SourceExtract {
  productId: string
  sizeKey: string
  lang: SourceLang
  url: string
  heading: string
  metaDescription: string
  detailHtml: string
  specs: SourceSpec[]
}

/** The detail tab-pane every product page renders, empty or not. */
const DETAIL_PANE_SELECTOR = '#detail'

/** Matches the heading that introduces the spec list, in either language. */
const SPEC_HEADING = /technical specification|teknik özellik/i

function textOf(node: Element | null | undefined): string {
  return (node?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

/**
 * Split one spec row into label and value.
 *
 * The source is inconsistent about where the colon lives — `<strong>Weight</strong>: 350 kg`,
 * `<strong>Depth </strong>150 cm` and `<strong>Height:</strong> 240 cm` all appear within a single
 * list — so the bold run is the boundary and the colon is only a fallback.
 */
function splitSpecRow(item: Element): SourceSpec | null {
  const raw = textOf(item)
  const bold = textOf(item.querySelector('strong, b'))

  if (bold !== '' && raw.startsWith(bold)) {
    return {
      label: bold.replace(/:$/, '').trim(),
      value: raw.slice(bold.length).replace(/^:/, '').trim()
    }
  }

  const separator = raw.indexOf(':')
  if (separator === -1) return null
  return { label: raw.slice(0, separator).trim(), value: raw.slice(separator + 1).trim() }
}

/**
 * Read the specification list, if the page publishes one.
 *
 * Anchored on the heading rather than on "the first list in the pane", because every page also
 * carries Highlights and Usage Areas lists in the same markup — and those are prose, not data.
 * Returns an empty array when no such heading exists, which is the case on all but four pages.
 */
function extractSpecs(pane: Element): SourceSpec[] {
  const headings = Array.from(pane.querySelectorAll('h2, h3, h4'))
  const specHeading = headings.find((heading) => SPEC_HEADING.test(textOf(heading)))
  if (!specHeading) return []

  const list = specHeading.nextElementSibling
  if (!list || !['OL', 'UL'].includes(list.tagName)) return []

  return Array.from(list.querySelectorAll('li'))
    .map(splitSpecRow)
    .filter((spec): spec is SourceSpec => spec !== null && spec.label !== '' && spec.value !== '')
}

/**
 * Turn one fetched page into its committed extract record.
 *
 * Pure given a parser, so the scrape cache is the only thing standing between a test and a real
 * source page.
 */
export function extractSourcePage(
  page: SourcePage,
  html: string,
  parseHtml: (html: string) => Document = defaultParseHtml
): SourceExtract {
  const document = parseHtml(html)
  const pane = document.querySelector(DETAIL_PANE_SELECTOR)

  return {
    productId: page.productId,
    sizeKey: page.sizeKey,
    lang: page.lang,
    url: page.url,
    heading: textOf(document.querySelector('h1')),
    metaDescription: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() ?? '',
    detailHtml: pane?.innerHTML.trim() ?? '',
    specs: pane ? extractSpecs(pane) : []
  }
}
