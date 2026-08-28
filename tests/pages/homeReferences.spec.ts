import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('homepage references placement', () => {
  it('places references between catalogue and contact', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/pages/index.vue'),
      'utf-8'
    )

    const hero = source.indexOf('<HeroSection')
    const catalogue = source.indexOf('<ProductCatalogSection')
    const references = source.indexOf('<ReferencesSection')
    const contact = source.indexOf('<ContactSection')

    expect(hero).toBeGreaterThan(-1)
    expect(catalogue).toBeGreaterThan(hero)
    expect(references).toBeGreaterThan(catalogue)
    expect(contact).toBeGreaterThan(references)
  })
})
