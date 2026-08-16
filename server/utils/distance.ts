export interface PostcodeResult {
  postcode: string
  latitude: number
  longitude: number
  district?: string
  region?: string
  country?: string
}

/**
 * Default dispatch warehouse / headquarters origin postcode for UK delivery calculations
 * (Unit 4 Fairfield Industrial Estate, Waltham On The Wolds, Melton Mowbray)
 */
export const DEFAULT_ORIGIN_POSTCODE = 'LE14 4AJ' as const
export const DEFAULT_ORIGIN_NAME = 'Karmod UK Dispatch Centre' as const

export interface DistanceCalculationResult {
  origin: PostcodeResult
  destination: PostcodeResult
  distance: {
    meters: number
    miles: number
    km: number
  }
  duration: {
    seconds: number
    minutes: number
    formatted: string
  }
  provider: 'mapbox' | 'osrm' | 'haversine_fallback'
  deliveryFee?: {
    total: number
    currency: 'GBP'
    breakdown: {
      baseFee: number
      mileageFee: number
      ratePerMile: number
      distanceMiles: number
    }
  }
}

export interface DeliveryPricingOptions {
  baseFee?: number
  ratePerMile?: number
  minimumFee?: number
}

/**
 * Format duration in seconds into human-readable text (e.g. "1 hr 25 mins" or "45 mins")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60)
  if (mins < 60) {
    return `${mins} min${mins === 1 ? '' : 's'}`
  }
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  if (remainingMins === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`
  }
  return `${hours} hr${hours === 1 ? '' : 's'} ${remainingMins} min${remainingMins === 1 ? '' : 's'}`
}

/**
 * Normalizes UK Postcode (removes excess spaces, uppercases)
 */
export function normalizePostcode(postcode: string): string {
  if (!postcode) return ''
  return postcode.trim().toUpperCase()
}

/**
 * Look up UK Postcode coordinates and details via postcodes.io (100% free)
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeResult> {
  const clean = normalizePostcode(postcode).replace(/\s+/g, '')

  if (!clean || clean.length < 2) {
    throw new Error('Please provide a valid UK postcode')
  }

  // 1. Try full postcode lookup
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`)
    const data = await res.json()

    if (data.status === 200 && data.result) {
      return {
        postcode: data.result.postcode,
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        district: data.result.admin_district,
        region: data.result.region,
        country: data.result.country
      }
    }
  } catch (err: any) {
    // If network error, continue to outcode fallback
  }

  // 2. Try partial/outcode lookup (e.g. "SW1A", "EC1", "B1")
  try {
    const outcodeRes = await fetch(`https://api.postcodes.io/outcodes/${encodeURIComponent(clean)}`)
    const outcodeData = await outcodeRes.json()

    if (outcodeData.status === 200 && outcodeData.result) {
      return {
        postcode: outcodeData.result.outcode,
        latitude: outcodeData.result.latitude,
        longitude: outcodeData.result.longitude,
        district: outcodeData.result.admin_district?.[0],
        country: outcodeData.result.country?.[0]
      }
    }
  } catch (err: any) {
    // Handled below
  }

  throw new Error(`UK postcode '${postcode}' not found. Please check spelling.`)
}

/**
 * Extract UK postcode from a string if present (e.g. "10 Downing St, London SW1A 2AA" -> "SW1A 2AA")
 */
export function extractPostcodeFromString(text: string): string | null {
  if (!text || typeof text !== 'string') return null
  const trimmed = text.trim()

  // 1. Match full UK postcode (e.g. SW1A 1AA, LE14 4AJ, EC1V 9LB, M1 1AE)
  const fullPostcodeRegex = /\b([A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2})\b/i
  const match = trimmed.match(fullPostcodeRegex)
  if (match && match[1]) {
    return match[1].trim().toUpperCase()
  }

  // 2. Match outcode/area code at the boundary (e.g. "SW1A", "LE14", "B1")
  const outcodeRegex = /\b([A-Z]{1,2}[0-9][A-Z0-9]?)\b/i
  const outcodeMatch = trimmed.match(outcodeRegex)
  if (outcodeMatch && outcodeMatch[1]) {
    return outcodeMatch[1].trim().toUpperCase()
  }

  return null
}

/**
 * Resolves location to a PostcodeResult from either:
 * 1. Postcode string (e.g. "LE14 4AJ", "SW1A 2AA")
 * 2. Full address string with embedded postcode (e.g. "10 Downing St, London SW1A 2AA, UK")
 * 3. Object with coordinates { lat, lng } or { latitude, longitude } and optional postcode/address
 */
export async function resolveLocation(input: any): Promise<PostcodeResult> {
  if (!input) {
    throw new Error('Location input is required')
  }

  // Case 1: Object with coordinates or properties
  if (typeof input === 'object') {
    const lat = Number(input.latitude ?? input.lat ?? input.coordinates?.lat)
    const lng = Number(input.longitude ?? input.lng ?? input.coordinates?.lng)
    const postcode =
      input.postcode ||
      (typeof input.formattedAddress === 'string'
        ? extractPostcodeFromString(input.formattedAddress)
        : '') ||
      ''

    if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
      return {
        postcode: postcode ? normalizePostcode(postcode) : 'DELIVERY-SITE',
        latitude: lat,
        longitude: lng,
        district: input.district || input.townCity || input.county || '',
        region: input.region || '',
        country: input.country || 'United Kingdom'
      }
    }

    if (postcode) {
      return lookupPostcode(postcode)
    }

    if (input.formattedAddress && typeof input.formattedAddress === 'string') {
      return resolveLocation(input.formattedAddress)
    }

    if (input.destinationPostcode || input.destination || input.postcode) {
      return resolveLocation(input.destinationPostcode || input.destination || input.postcode)
    }
  }

  // Case 2: String input
  if (typeof input === 'string') {
    const trimmed = input.trim()
    if (!trimmed) {
      throw new Error('Please provide a valid location or postcode')
    }

    // If string has commas or is longer than standard UK postcode (typically <= 8 chars), extract postcode first
    if (trimmed.includes(',') || trimmed.length > 8) {
      const extracted = extractPostcodeFromString(trimmed)
      if (extracted) {
        return await lookupPostcode(extracted)
      }
    }

    // Try direct postcode lookup
    try {
      return await lookupPostcode(trimmed)
    } catch (directErr) {
      // Fallback: try extracting postcode
      const extracted = extractPostcodeFromString(trimmed)
      if (extracted && extracted !== trimmed) {
        return await lookupPostcode(extracted)
      }
      throw directErr
    }
  }

  throw new Error('Unable to resolve delivery location coordinates')
}

/**
 * Fallback straight-line (Haversine) calculation with road factor multiplier (~1.3x)
 */
export function calculateHaversineRoadDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { meters: number; miles: number; km: number; durationSeconds: number } {
  const R = 6371000 // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const straightLineMeters = R * c

  // Standard UK winding road conversion factor ~1.30
  const roadMeters = Math.round(straightLineMeters * 1.3)
  const miles = Math.round((roadMeters / 1609.344) * 10) / 10
  const km = Math.round((roadMeters / 1000) * 10) / 10

  // Estimated driving speed ~ 45 mph (72.4 km/h) = 20 m/s
  const durationSeconds = Math.round(roadMeters / 20)

  return { meters: roadMeters, miles, km, durationSeconds }
}

/**
 * Driving distance calculation via Mapbox Directions API, falling back to OSRM / Haversine
 */
export async function calculateDrivingRoute(
  origin: PostcodeResult,
  destination: PostcodeResult,
  mapboxToken?: string
): Promise<{
  meters: number
  miles: number
  km: number
  durationSeconds: number
  provider: 'mapbox' | 'osrm' | 'haversine_fallback'
}> {
  // Strategy 1: Mapbox Directions API (Primary if token available)
  if (mapboxToken && mapboxToken.trim() !== '' && mapboxToken !== 'dummy_token') {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false&access_token=${mapboxToken}`
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
      const data = await res.json()

      if (data.code === 'Ok' && data.routes?.[0]) {
        const route = data.routes[0]
        const meters = Math.round(route.distance)
        return {
          meters,
          miles: Math.round((meters / 1609.344) * 10) / 10,
          km: Math.round((meters / 1000) * 10) / 10,
          durationSeconds: Math.round(route.duration),
          provider: 'mapbox'
        }
      }
    } catch (err: any) {
      console.warn('[Distance API] Mapbox call failed or timed out, falling back to OSRM:', err?.message)
    }
  }

  // Strategy 2: OSRM Public Routing Server (Free, no token required)
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=false`
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) })
    const data = await res.json()

    if (data.code === 'Ok' && data.routes?.[0]) {
      const route = data.routes[0]
      const meters = Math.round(route.distance)
      return {
        meters,
        miles: Math.round((meters / 1609.344) * 10) / 10,
        km: Math.round((meters / 1000) * 10) / 10,
        durationSeconds: Math.round(route.duration),
        provider: 'osrm'
      }
    }
  } catch (err: any) {
    console.warn('[Distance API] OSRM public server failed or timed out, falling back to Haversine:', err?.message)
  }

  // Strategy 3: Geometric Haversine fallback with UK winding factor
  const fallback = calculateHaversineRoadDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude
  )

  return {
    ...fallback,
    provider: 'haversine_fallback'
  }
}

/**
 * Calculates delivery fee based on distance and pricing tier options
 */
export function computeDeliveryFee(
  distanceMiles: number,
  options?: DeliveryPricingOptions
): DistanceCalculationResult['deliveryFee'] | undefined {
  if (!options || (options.baseFee === undefined && options.ratePerMile === undefined)) {
    return undefined
  }

  const baseFee = options.baseFee ?? 0
  const ratePerMile = options.ratePerMile ?? 0
  const minimumFee = options.minimumFee ?? 0

  const mileageFee = Math.round(distanceMiles * ratePerMile * 100) / 100
  const rawTotal = baseFee + mileageFee
  const total = Math.max(minimumFee, Math.round(rawTotal * 100) / 100)

  return {
    total,
    currency: 'GBP',
    breakdown: {
      baseFee,
      mileageFee,
      ratePerMile,
      distanceMiles
    }
  }
}
