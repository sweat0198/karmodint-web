import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { repoPath } from '../../scripts/catalogue/lib/paths'

type CategorySeed = {
  _id: string
  name: string
  slug: { current: string }
  parent?: { _ref: string }
  seo?: { metaTitle?: string; metaDescription?: string }
}

function readSeeds(file: string): CategorySeed[] {
  return fs.readFileSync(repoPath(`sanity/seeds/${file}`), 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line) as CategorySeed)
}

describe('UK catalogue category naming', () => {
  it('uses buyer-facing names while preserving category URLs', () => {
    const categories = readSeeds('categories.ndjson')

    expect(categories.map(({ _id, name, slug }) => ({ _id, name, slug: slug.current }))).toEqual([
      { _id: 'category-containers', name: 'Portable Cabins', slug: 'containers' },
      { _id: 'category-cabin', name: 'Gatehouses & Kiosks', slug: 'cabin' },
      { _id: 'category-bulletproof', name: 'Bulletproof', slug: 'bulletproof' }
    ])
  })

  it('uses UK buyer language for portable-cabin subcategories', () => {
    const subcategories = readSeeds('subcategories.ndjson')

    expect(subcategories.map(({ name }) => name)).toEqual([
      'Site Offices',
      'Storage Units',
      'Accommodation Units',
      'Canteen & Catering Units'
    ])
    expect(subcategories.every(({ parent }) => parent?._ref === 'category-containers')).toBe(true)
  })
})
