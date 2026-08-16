import { describe, it, expect } from 'vitest'
import { parseGoogleAddressComponents } from '~~/app/composables/useGooglePlacesAutocomplete'

describe('parseGoogleAddressComponents', () => {
  it('parses standard UK street address (e.g. 10 Downing Street, London)', () => {
    const components = [
      { long_name: '10', short_name: '10', types: ['street_number'] },
      { long_name: 'Downing Street', short_name: 'Downing St', types: ['route'] },
      { long_name: 'Westminster', short_name: 'Westminster', types: ['sublocality', 'sublocality_level_1'] },
      { long_name: 'London', short_name: 'London', types: ['postal_town'] },
      { long_name: 'Greater London', short_name: 'Greater London', types: ['administrative_area_level_2'] },
      { long_name: 'SW1A 2AA', short_name: 'SW1A 2AA', types: ['postal_code'] },
      { long_name: 'United Kingdom', short_name: 'GB', types: ['country'] }
    ]

    const result = parseGoogleAddressComponents(
      components,
      '10 Downing St, London SW1A 2AA, UK',
      { lat: () => 51.503364, lng: () => -0.127625 },
      'ChIJp93'
    )

    expect(result.placeId).toBe('ChIJp93')
    expect(result.addressLine1).toBe('10 Downing Street')
    expect(result.addressLine2).toBe('Westminster')
    expect(result.townCity).toBe('London')
    expect(result.county).toBe('Greater London')
    expect(result.postcode).toBe('SW1A 2AA')
    expect(result.country).toBe('United Kingdom')
    expect(result.coordinates?.lat).toBeCloseTo(51.503, 2)
    expect(result.coordinates?.lng).toBeCloseTo(-0.127, 2)
  })

  it('parses subpremise / flat numbers (e.g. Flat 4B, 15 High Street)', () => {
    const components = [
      { long_name: '4B', short_name: '4B', types: ['subpremise'] },
      { long_name: '15', short_name: '15', types: ['street_number'] },
      { long_name: 'High Street', short_name: 'High St', types: ['route'] },
      { long_name: 'Melton Mowbray', short_name: 'Melton Mowbray', types: ['postal_town'] },
      { long_name: 'Leicestershire', short_name: 'Leicestershire', types: ['administrative_area_level_2'] },
      { long_name: 'LE14 4AJ', short_name: 'LE14 4AJ', types: ['postal_code'] },
      { long_name: 'United Kingdom', short_name: 'GB', types: ['country'] }
    ]

    const result = parseGoogleAddressComponents(components, 'Flat 4B, 15 High Street, Melton Mowbray')

    expect(result.addressLine1).toBe('Flat 4B, 15 High Street')
    expect(result.townCity).toBe('Melton Mowbray')
    expect(result.county).toBe('Leicestershire')
    expect(result.postcode).toBe('LE14 4AJ')
  })

  it('handles premise names without street numbers (e.g. Unit 5 Enterprise Park)', () => {
    const components = [
      { long_name: 'Unit 5 Enterprise Park', short_name: 'Unit 5', types: ['premise'] },
      { long_name: 'Station Road', short_name: 'Station Rd', types: ['route'] },
      { long_name: 'Leicester', short_name: 'Leicester', types: ['postal_town'] },
      { long_name: 'LE1 1AA', short_name: 'LE1 1AA', types: ['postal_code'] }
    ]

    const result = parseGoogleAddressComponents(components, 'Unit 5 Enterprise Park, Station Road, Leicester')

    expect(result.addressLine1).toBe('Unit 5 Enterprise Park, Station Road')
    expect(result.townCity).toBe('Leicester')
    expect(result.postcode).toBe('LE1 1AA')
  })

  it('gracefully falls back when components are incomplete', () => {
    const result = parseGoogleAddressComponents([], 'Somewhere, UK')
    expect(result.addressLine1).toBe('Somewhere')
    expect(result.postcode).toBe('')
    expect(result.country).toBe('United Kingdom')
  })
})
