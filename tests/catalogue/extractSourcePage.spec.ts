import { describe, it, expect } from 'vitest'
import { extractSourcePage } from '../../scripts/catalogue/lib/extractSourcePage'
import { SOURCE_PAGES, cacheFileName, type SourcePage } from '../../scripts/catalogue/lib/sourcePages'
import { parseEnvLine } from '../../scripts/catalogue/lib/sanityEnv'

const page: SourcePage = {
  productId: 'product-grp-cabin',
  sizeKey: '215x270',
  lang: 'en',
  url: 'https://karmodkabin.com/en/product/polyester-cabin-215x270/'
}

function pageHtml(detail: string, extras = ''): string {
  return `<!doctype html><html><head>
    <meta name="description" content="A durable cabin." />${extras}
  </head><body><h1>Polyester Cabin 215x270</h1>
  <div class="tab-content"><div class="tab-pane" id="detail">${detail}</div></div>
  </body></html>`
}

describe('Source page extraction', () => {
  it('lifts the heading, meta description and detail pane', () => {
    const extract = extractSourcePage(page, pageHtml('<h2>Heading</h2>\n<p>Body.</p>'))

    expect(extract.heading).toBe('Polyester Cabin 215x270')
    expect(extract.metaDescription).toBe('A durable cabin.')
    expect(extract.detailHtml).toBe('<h2>Heading</h2>\n<p>Body.</p>')
    expect(extract.url).toBe(page.url)
    expect(extract.sizeKey).toBe('215x270')
  })

  it('reads a spec list across the three colon conventions the source mixes', () => {
    // All three of these appear on real pages, sometimes within one list.
    const extract = extractSourcePage(page, pageHtml(`
      <h3>Technical Specifications</h3>
      <ol>
        <li><strong>Depth </strong>215 cm</li>
        <li><strong>Width</strong> 270 cm</li>
        <li><strong>Weight</strong>: 550 kg</li>
        <li><strong>Height:</strong> 240 cm</li>
      </ol>`))

    expect(extract.specs).toEqual([
      { label: 'Depth', value: '215 cm' },
      { label: 'Width', value: '270 cm' },
      { label: 'Weight', value: '550 kg' },
      { label: 'Height', value: '240 cm' }
    ])
  })

  it('ignores the prose lists that share the pane with the spec list', () => {
    const extract = extractSourcePage(page, pageHtml(`
      <h3>Highlights</h3>
      <ol><li><strong>Durable Structure:</strong> Long-lasting use.</li></ol>
      <h3>Technical Specifications</h3>
      <ol><li><strong>Weight</strong> 550 kg</li></ol>
      <h3>Usage Areas</h3>
      <ol><li><strong>Security Points:</strong> Site entrances.</li></ol>`))

    expect(extract.specs).toEqual([{ label: 'Weight', value: '550 kg' }])
  })

  it('returns no specs when the page publishes no spec list', () => {
    const extract = extractSourcePage(page, pageHtml('<h2>Wide Cabin 270x270</h2><p>Roomy.</p>'))
    expect(extract.specs).toEqual([])
  })

  it('records an empty detail pane rather than failing on it', () => {
    // Every English Panel page is like this — the reason ticket 03 translates from Turkish.
    const extract = extractSourcePage(page, pageHtml(''))
    expect(extract.detailHtml).toBe('')
    expect(extract.specs).toEqual([])
  })

  it('survives a page with no detail pane at all', () => {
    const extract = extractSourcePage(page, '<html><body><h1>Gone</h1></body></html>')
    expect(extract.detailHtml).toBe('')
    expect(extract.metaDescription).toBe('')
    expect(extract.specs).toEqual([])
  })
})

describe('Source page table', () => {
  it('covers all 33 pages: 28 English products plus the 5 Turkish Panel originals', () => {
    expect(SOURCE_PAGES).toHaveLength(33)
    expect(SOURCE_PAGES.filter((p) => p.lang === 'en')).toHaveLength(28)
    expect(SOURCE_PAGES.filter((p) => p.lang === 'tr')).toHaveLength(5)
    expect(SOURCE_PAGES.filter((p) => p.lang === 'tr').every((p) => p.productId === 'product-panel-cabin'))
      .toBe(true)
  })

  it('gives every page a distinct cache file, so none can overwrite another', () => {
    expect(new Set(SOURCE_PAGES.map(cacheFileName)).size).toBe(SOURCE_PAGES.length)
    expect(new Set(SOURCE_PAGES.map((p) => p.url)).size).toBe(SOURCE_PAGES.length)
  })
})

describe('Root .env parsing', () => {
  it('keeps a value containing a hash, which API tokens do', () => {
    expect(parseEnvLine('SANITY_API_TOKEN="sk#abc#def"'))
      .toEqual({ key: 'SANITY_API_TOKEN', value: 'sk#abc#def' })
    expect(parseEnvLine('SANITY_API_TOKEN=sk#abc#def'))
      .toEqual({ key: 'SANITY_API_TOKEN', value: 'sk#abc#def' })
  })

  it('strips a whitespace-separated trailing comment from an unquoted value', () => {
    expect(parseEnvLine('SANITY_DATASET=dev # the working dataset'))
      .toEqual({ key: 'SANITY_DATASET', value: 'dev' })
  })

  it('keeps a trailing comment out of a quoted value without truncating the value', () => {
    expect(parseEnvLine('SANITY_API_TOKEN="sk-abc" # write token'))
      .toEqual({ key: 'SANITY_API_TOKEN', value: 'sk-abc' })
  })

  it('ignores blank lines and comments', () => {
    expect(parseEnvLine('')).toBeNull()
    expect(parseEnvLine('# Sanity CMS Connection')).toBeNull()
  })
})
