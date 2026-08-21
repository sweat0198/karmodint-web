import { JSDOM } from 'jsdom'

/**
 * Parse an HTML string into a `Document`.
 *
 * happy-dom was the first choice — it is already a dev dependency for the Vitest environment — but
 * `@portabletext/block-tools` runs its Google Docs and Word preprocessors through
 * `document.evaluate`, and happy-dom implements no XPath. jsdom does, so it is the DOM for the
 * whole pipeline: the source-page extractor and the markdown conversion parse through this one
 * function rather than disagreeing about what an element is.
 */
export function parseHtml(html: string): Document {
  return new JSDOM(html).window.document
}
