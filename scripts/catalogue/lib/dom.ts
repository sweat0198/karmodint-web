import { JSDOM } from 'jsdom'

/**
 * Parse an HTML string into a `Document`.
 *
 * happy-dom was tried first, as the only DOM the repo had. It cannot serve this pipeline:
 * `@portabletext/block-tools` always runs its Google Docs and Word preprocessors, those find nodes
 * with `document.evaluate`, and happy-dom implements no XPath. jsdom does, and it is now the repo's
 * only DOM — the Vitest environment too, so tests and the pipeline share one implementation.
 *
 * The source-page extractor and the markdown conversion both parse through here, rather than
 * disagreeing about what an element is.
 */
export function parseHtml(html: string): Document {
  return new JSDOM(html).window.document
}
