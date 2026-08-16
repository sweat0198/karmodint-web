import { ref, onUnmounted } from 'vue'
import type { ParsedUkAddress } from './useGooglePlacesAutocomplete'

export interface DistanceCalculationData {
  success: boolean
  origin: {
    postcode: string
    latitude: number
    longitude: number
    district?: string
    country?: string
  }
  destination: {
    postcode: string
    latitude: number
    longitude: number
    district?: string
    country?: string
  }
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
  provider: 'mapbox' | 'osrm' | 'haversine_fallback'
}

export function useDeliveryDistance() {
  const distanceResult = ref<DistanceCalculationData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastResolvedKey = ref<string>('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let abortController: AbortController | null = null

  function extractKey(address: string | ParsedUkAddress | any): string {
    if (!address) return ''
    if (typeof address === 'string') return address.trim()
    if (typeof address === 'object') {
      if (address.coordinates?.lat && address.coordinates?.lng) {
        return `${address.coordinates.lat.toFixed(4)},${address.coordinates.lng.toFixed(4)}`
      }
      if (address.postcode) return address.postcode.trim()
      if (address.formattedAddress) return address.formattedAddress.trim()
    }
    return String(address)
  }

  function hasSufficientAddressInfo(address: string | ParsedUkAddress | any): boolean {
    if (!address) return false
    if (typeof address === 'string') {
      // Must have at least 3 chars (e.g. outcode like "LE14" or "SW1")
      return address.trim().length >= 3
    }
    if (typeof address === 'object') {
      if (address.coordinates?.lat && address.coordinates?.lng) return true
      if (address.postcode && address.postcode.trim().length >= 2) return true
      if (address.formattedAddress && address.formattedAddress.trim().length >= 4) return true
    }
    return false
  }

  async function calculateDistance(
    address: string | ParsedUkAddress | any,
    options: { immediate?: boolean; debounceMs?: number } = {}
  ) {
    const { immediate = false, debounceMs = 400 } = options

    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    if (!hasSufficientAddressInfo(address)) {
      if (!address) {
        reset()
      }
      return
    }

    const currentKey = extractKey(address)
    if (currentKey && currentKey === lastResolvedKey.value && distanceResult.value) {
      // Already calculated for this address
      return
    }

    const execute = async () => {
      // Cancel any ongoing fetch
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      isLoading.value = true
      error.value = null

      try {
        let payload: any = {}

        if (typeof address === 'string') {
          payload = { destination: address.trim() }
        } else if (typeof address === 'object') {
          if (address.coordinates?.lat && address.coordinates?.lng) {
            payload = {
              destination: {
                latitude: address.coordinates.lat,
                longitude: address.coordinates.lng,
                postcode: address.postcode || '',
                formattedAddress: address.formattedAddress || ''
              }
            }
          } else if (address.postcode) {
            payload = { destination: address.postcode.trim() }
          } else if (address.formattedAddress) {
            payload = { destination: address.formattedAddress }
          } else {
            payload = { destination: address }
          }
        }

        const res = await $fetch<DistanceCalculationData>('/api/delivery/distance', {
          method: 'POST',
          body: payload,
          signal: abortController.signal
        })

        if (res && res.success) {
          distanceResult.value = res
          lastResolvedKey.value = currentKey
          error.value = null
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        console.warn('[useDeliveryDistance] Calculation note:', err?.data?.statusMessage || err?.message)
        error.value = err?.data?.statusMessage || err?.message || 'Could not calculate distance for this address'
      } finally {
        isLoading.value = false
      }
    }

    if (immediate) {
      await execute()
    } else {
      debounceTimer = setTimeout(execute, debounceMs)
    }
  }

  function reset() {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    distanceResult.value = null
    isLoading.value = false
    error.value = null
    lastResolvedKey.value = ''
  }

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    if (abortController) abortController.abort()
  })

  return {
    distanceResult,
    isLoading,
    error,
    calculateDistance,
    reset
  }
}
