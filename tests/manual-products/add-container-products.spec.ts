import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  fileURLToPath(new URL('../../scripts/manual-products/add-container-products.ts', import.meta.url)),
  'utf8'
)

describe('Portable Cabin manual product', () => {
  it.each([
    ['230x600', 4290],
    ['300x500', 5090],
    ['300x600', 5490],
    ['300x700', 5790]
  ])('sets %s to £%i plus VAT', (key, price) => {
    expect(source).toMatch(new RegExp(
      String.raw`key: '${key}'[\s\S]*?isPoa: false,[\s\S]*?price: ${price},`
    ))
  })
})
