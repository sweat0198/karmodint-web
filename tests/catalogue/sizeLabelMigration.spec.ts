import { describe, expect, it } from 'vitest'
import { labelPatchSet, labelsToUpdate } from '../../scripts/catalogue/lib/sizeLabelMigration'

describe('size label migration', () => {
  it('plans only stale labels and produces label-only patches', () => {
    const changes = labelsToUpdate({
      _id: 'product-test',
      sizes: [
        { _key: 'stale', label: '2.15m x 2.70m', lengthM: 2.15, widthM: 2.7 },
        { _key: 'current', label: '9ft × 7ft (2.15m × 2.70m)', lengthM: 2.15, widthM: 2.7 }
      ]
    })

    expect(changes).toEqual([
      {
        productId: 'product-test',
        sizeKey: 'stale',
        from: '2.15m x 2.70m',
        to: '9ft × 7ft (2.15m × 2.70m)'
      }
    ])
    expect(labelPatchSet(changes)).toEqual({
      'sizes[_key == "stale"].label': '9ft × 7ft (2.15m × 2.70m)'
    })
  })

  it('is idempotent and rejects incomplete size data', () => {
    expect(
      labelsToUpdate({
        _id: 'product-test',
        sizes: [{ _key: 'current', label: '9ft × 7ft (2.15m × 2.70m)', lengthM: 2.15, widthM: 2.7 }]
      })
    ).toEqual([])

    expect(() => labelsToUpdate({ _id: 'product-test', sizes: [{ lengthM: 2.15, widthM: 2.7 }] }))
      .toThrow('Product product-test has a size without _key, lengthM, or widthM')
  })
})
