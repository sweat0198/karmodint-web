import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('homepage references placement', () => {
  it('keeps the Legacy section order: categories, catalogue, about, references, company, contact', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'app/pages/index.vue'),
      'utf-8'
    )

    const order = [
      '<HeroSection',
      '<HomeCategoriesSection',
      '<ProductCatalogSection',
      '<HomeAboutSection',
      '<ReferencesSection',
      '<HomeCompanySection',
      '<ContactSection',
    ].map((tag) => source.indexOf(tag))

    expect(order[0]).toBeGreaterThan(-1)
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(order).not.toContain(-1)
  })
})
