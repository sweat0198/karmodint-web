import { describe, expect, it } from 'vitest'
import { toReferenceTiles } from '~/utils/referenceTiles'
import type { ClientReference } from '~/types/reference'

const base: ClientReference = {
  _id: 'reference-w-hotel',
  companyName: 'W Hotel Edinburgh',
  location: 'Edinburgh, Scotland',
  website: 'https://example.com',
  logo: {
    _type: 'image',
    asset: { _type: 'reference', _ref: 'image-logo123-800x400-png' }
  }
}

describe('toReferenceTiles', () => {
  it('resolves a constrained Sanity CDN logo while preserving display content', () => {
    expect(toReferenceTiles([base], 'project1', 'production')).toEqual([
      {
        _id: base._id,
        companyName: base.companyName,
        location: base.location,
        website: base.website,
        logoUrl: 'https://cdn.sanity.io/images/project1/production/logo123-800x400.png?w=320&fit=max'
      }
    ])
  })

  it('drops records whose logo asset cannot resolve', () => {
    expect(
      toReferenceTiles([{ ...base, logo: { asset: { _type: 'reference', _ref: 'invalid' } } }], 'p', 'd')
    ).toEqual([])
  })

  it('accepts an unresolved Sanity query result', () => {
    expect(toReferenceTiles(null, 'project1', 'production')).toEqual([])
  })
})
