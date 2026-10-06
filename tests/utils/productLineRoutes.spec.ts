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
})
