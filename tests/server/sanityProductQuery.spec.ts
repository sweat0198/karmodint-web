import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchProductsForValidation } from '~~/server/utils/sanityProductQuery'

describe('fetchProductsForValidation', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('projects Product Customization Configurations without the removed legacy group relation', async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: [] })
    })
    vi.stubGlobal('fetch', fetch)

    await expect(fetchProductsForValidation(['product-1'], {
      projectId: 'project', dataset: 'dataset'
    })).resolves.toEqual(new Map())

    const query = new URL(fetch.mock.calls[0][0]).searchParams.get('query')
    expect(query).toContain('customizationConfigurations')
    expect(query).not.toContain('customizationGroups')
  })
})
