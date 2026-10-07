import { describe, expect, it } from 'vitest'
import { executeGroq } from '../utils/groqRunner'
import { SITEMAP_DOCUMENTS_QUERY, type SitemapDocuments } from '~~/server/utils/sitemap'

const solution = (id: string, slug: string | undefined, extra: Record<string, unknown> = {}) => ({
  _id: id,
  _type: 'solution',
  name: id,
  ...(slug ? { slug: { _type: 'slug', current: slug } } : {}),
  ...extra
})

const productLine = (id: string, path: string | undefined, extra: Record<string, unknown> = {}) => ({
  _id: id,
  _type: 'productLine',
  name: id,
  ...(path ? { path } : {}),
  ...extra
})

const dataset = [
  solution('solution-site-offices', 'site-offices'),
  solution('solution-events', 'events', { seo: { noIndex: false } }),
  solution('solution-hidden', 'hidden', { seo: { noIndex: true } }),
  solution('drafts.solution-draft-only', 'draft-only'),
  solution('solution-no-slug', undefined),
  productLine('productLine-portable-cabin', '/portable-cabin/'),
  productLine('productLine-steel-cabin', '/portable-cabin/steel-cabin/', { seo: { metaTitle: 'Steel' } }),
  productLine('productLine-hidden', '/hidden-line/', { seo: { noIndex: true } }),
  productLine('drafts.productLine-draft', '/draft-line/'),
  productLine('productLine-no-path', undefined),
  { _id: 'product-1', _type: 'product', name: 'Not a page', slug: { _type: 'slug', current: 'not-a-page' } }
]

describe('SITEMAP_DOCUMENTS_QUERY', () => {
  it('reads every published, indexable Solution slug and Product Line path, sorted', async () => {
    const result = await executeGroq<SitemapDocuments>(SITEMAP_DOCUMENTS_QUERY, {}, dataset)

    expect(result).toEqual({
      solutionSlugs: ['events', 'site-offices'],
      productLinePaths: ['/portable-cabin/', '/portable-cabin/steel-cabin/']
    })
  })
})
