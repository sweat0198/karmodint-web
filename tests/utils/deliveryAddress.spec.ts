import { describe, expect, it } from 'vitest'
import { isCompleteDeliveryAddress } from '~~/shared/utils/deliveryAddress'

describe('isCompleteDeliveryAddress', () => {
  it('accepts a parsed destination with town/city and postcode', () => {
    expect(isCompleteDeliveryAddress({ townCity: 'Nottingham', postcode: 'NG1 1AA' })).toBe(true)
  })

  it.each([
    '',
    'Nottingham NG1 1AA',
    { townCity: '', postcode: 'NG1 1AA' },
    { townCity: 'Nottingham', postcode: '' },
    null
  ])('rejects an incomplete or unstructured destination: %j', (destination) => {
    expect(isCompleteDeliveryAddress(destination)).toBe(false)
  })
})
