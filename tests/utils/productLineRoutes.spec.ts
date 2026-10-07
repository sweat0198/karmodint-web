import { describe, expect, it, vi } from 'vitest'
import { PRODUCT_LINE_PATHS_QUERY, productLinePrerenderRoutes } from '~~/shared/utils/productLineRoutes'

describe('productLinePrerenderRoutes', () => {
  it('asks the dataset for every Product Line path and returns them sorted, in `/` form', async () => {
    const fetch = vi.fn(async () => ['/portable-cabin/steel-cabin/', '/grp-kiosk-cabin/', '/portable-cabin/'])

    expect(await productLinePrerenderRoutes(fetch)).toEqual([
      '/grp-kiosk-cabin/',
      '/portable-cabin/',
      '/portable-cabin/steel-cabin/'
    ])
    expect(fetch).toHaveBeenCalledWith(PRODUCT_LINE_PATHS_QUERY)
  })

  it('drops empty and duplicate entries', async () => {
    const fetch = async () => ['/grp-kiosk-cabin/', null, '', '/grp-kiosk-cabin/']
    expect(await productLinePrerenderRoutes(fetch)).toEqual(['/grp-kiosk-cabin/'])
  })

  it('fails the build when the dataset cannot be read, rather than silently dropping Kept URLs', async () => {
    const fetch = async () => {
      throw new Error('network down')
    }
    await expect(productLinePrerenderRoutes(fetch)).rejects.toThrow(/Product Line paths.*network down/)
  })

  it('fails the build naming the seed when a required Product Line is not in the dataset', async () => {
    const fetch = async () => ['/grp-kiosk-cabin/']
    const run = productLinePrerenderRoutes(fetch, {
      required: ['/grp-kiosk-cabin/', '/portable-cabin/', '/panel-cabin/']
    })

    await expect(run).rejects.toThrow(/\/portable-cabin\/, \/panel-cabin\//)
    await expect(run).rejects.toThrow(/pnpm product-lines:seed/)
  })

  it('fails the build naming the seed when the dataset still has a Product Line at a redirect source', async () => {
    const fetch = async () => ['/portable-cabin/', '/portable-cabin/jackleg-cabin/']
    const run = productLinePrerenderRoutes(fetch, {
      redirectSources: ['/portable-cabin/jackleg-cabin/', '/container/']
    })

    await expect(run).rejects.toThrow(/at redirect sources: \/portable-cabin\/jackleg-cabin\/\./)
    await expect(run).rejects.toThrow(/pnpm product-lines:seed/)
  })

  it('passes when every required Product Line is in the dataset', async () => {
    const fetch = async () => ['/portable-cabin/', '/grp-kiosk-cabin/']
    expect(await productLinePrerenderRoutes(fetch, { required: ['/grp-kiosk-cabin/', '/portable-cabin/'] })).toEqual([
      '/grp-kiosk-cabin/',
      '/portable-cabin/'
    ])
  })
})
