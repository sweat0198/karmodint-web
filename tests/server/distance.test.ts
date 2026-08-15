import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  normalizePostcode,
  formatDuration,
  calculateHaversineRoadDistance,
  computeDeliveryFee,
  lookupPostcode,
  calculateDrivingRoute,
  DEFAULT_ORIGIN_POSTCODE,
  type PostcodeResult
} from '~~/server/utils/distance'

describe('UK Distance & Delivery Utils', () => {
  describe('normalizePostcode', () => {
    it('trims and capitalizes postcodes', () => {
      expect(normalizePostcode('  sw1a 1aa  ')).toBe('SW1A 1AA')
      expect(normalizePostcode('ec1v 9lb')).toBe('EC1V 9LB')
      expect(normalizePostcode('')).toBe('')
    })
  })

  describe('formatDuration', () => {
    it('formats durations under 1 hour', () => {
      expect(formatDuration(1800)).toBe('30 mins')
      expect(formatDuration(60)).toBe('1 min')
    })

    it('formats durations over 1 hour', () => {
      expect(formatDuration(3600)).toBe('1 hr')
      expect(formatDuration(5400)).toBe('1 hr 30 mins')
      expect(formatDuration(7200)).toBe('2 hrs')
      expect(formatDuration(8100)).toBe('2 hrs 15 mins')
    })
  })

  describe('calculateHaversineRoadDistance', () => {
    it('calculates distance between London and Birmingham with road winding factor', () => {
      // London (51.5074, -0.1278) to Birmingham (52.4862, -1.8904) ~ 100-130 miles driving
      const res = calculateHaversineRoadDistance(51.5074, -0.1278, 52.4862, -1.8904)
      expect(res.miles).toBeGreaterThan(100)
      expect(res.miles).toBeLessThan(160)
      expect(res.km).toBeGreaterThan(160)
      expect(res.durationSeconds).toBeGreaterThan(0)
    })
  })

  describe('computeDeliveryFee', () => {
    it('returns undefined if no pricing options provided', () => {
      expect(computeDeliveryFee(50)).toBeUndefined()
    })

    it('calculates flat rate per mile + base fee', () => {
      const fee = computeDeliveryFee(50, {
        baseFee: 100,
        ratePerMile: 2.5
      })
      expect(fee).toBeDefined()
      expect(fee?.total).toBe(225) // 100 + (50 * 2.5 = 125) = 225
      expect(fee?.breakdown.baseFee).toBe(100)
      expect(fee?.breakdown.mileageFee).toBe(125)
    })

    it('applies minimum fee threshold when calculation is lower', () => {
      const fee = computeDeliveryFee(5, {
        baseFee: 20,
        ratePerMile: 2,
        minimumFee: 150
      })
      expect(fee?.total).toBe(150)
    })
  })

  describe('lookupPostcode', () => {
    it('fetches real coordinates from postcodes.io for default company postcode LE14 4AJ', async () => {
      const result = await lookupPostcode(DEFAULT_ORIGIN_POSTCODE)
      expect(result.postcode).toBe('LE14 4AJ')
      expect(result.latitude).toBeCloseTo(52.813, 1)
      expect(result.longitude).toBeCloseTo(-0.813, 1)
      expect(result.country).toBe('England')
    })

    it('fetches real coordinates from postcodes.io for valid UK postcode', async () => {
      const result = await lookupPostcode('SW1A 1AA')
      expect(result.postcode).toBe('SW1A 1AA')
      expect(result.latitude).toBeCloseTo(51.501, 1)
      expect(result.longitude).toBeCloseTo(-0.141, 1)
    })

    it('throws descriptive error for completely invalid postcode', async () => {
      await expect(lookupPostcode('INVALID999')).rejects.toThrow(/not found/)
    })
  })

  describe('calculateDrivingRoute with providers', () => {
    const origin: PostcodeResult = {
      postcode: 'SW1A 1AA',
      latitude: 51.501,
      longitude: -0.141
    }
    const destination: PostcodeResult = {
      postcode: 'B1 1BB',
      latitude: 52.477,
      longitude: -1.901
    }

    it('falls back to OSRM or Haversine when no Mapbox token', async () => {
      const route = await calculateDrivingRoute(origin, destination)
      expect(route.miles).toBeGreaterThan(90)
      expect(route.durationSeconds).toBeGreaterThan(0)
      expect(['osrm', 'haversine_fallback']).toContain(route.provider)
    })

    it('uses Mapbox when valid token provided', async () => {
      const mockRoute = {
        code: 'Ok',
        routes: [{ distance: 160934.4, duration: 7200 }]
      }

      const originalFetch = globalThis.fetch
      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('api.mapbox.com')) {
          return Promise.resolve({
            json: () => Promise.resolve(mockRoute)
          })
        }
        return originalFetch(url)
      })

      const route = await calculateDrivingRoute(origin, destination, 'pk.mocktoken')
      expect(route.provider).toBe('mapbox')
      expect(route.miles).toBe(100)
      expect(route.durationSeconds).toBe(7200)

      globalThis.fetch = originalFetch
    })
  })
})
