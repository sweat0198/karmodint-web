import { ref, onMounted, onUnmounted } from 'vue'

export interface ParsedUkAddress {
  placeId: string
  formattedAddress: string
  addressLine1: string
  addressLine2: string
  townCity: string
  county: string
  postcode: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface AddressPrediction {
  placeId: string
  mainText: string
  secondaryText: string
  description: string
}

export interface UseGooglePlacesOptions {
  apiKey?: string
  countryCode?: string
  debounceMs?: number
  types?: string[]
}

/**
 * Parse Google Maps address_components into structured UK address format
 * Supports both Places API (New) { longText, shortText } and legacy { long_name, short_name }
 */
export function parseGoogleAddressComponents(
  components: Array<any> = [],
  formattedAddress: string = '',
  location?: { lat: () => number; lng: () => number } | { lat: number; lng: number } | any,
  placeId: string = ''
): ParsedUkAddress {
  let streetNumber = ''
  let premise = ''
  let subpremise = ''
  let route = ''
  let sublocality = ''
  let locality = ''
  let postalTown = ''
  let adminArea2 = ''
  let postalCode = ''
  let country = 'United Kingdom'

  for (const component of components) {
    const types: string[] = component.types || []
    const longName: string = component.longText || component.long_name || ''

    if (types.includes('street_number')) {
      streetNumber = longName
    } else if (types.includes('subpremise')) {
      subpremise = longName
    } else if (types.includes('premise')) {
      premise = longName
    } else if (types.includes('route')) {
      route = longName
    } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
      sublocality = longName
    } else if (types.includes('locality')) {
      locality = longName
    } else if (types.includes('postal_town')) {
      postalTown = longName
    } else if (types.includes('administrative_area_level_2')) {
      adminArea2 = longName
    } else if (types.includes('postal_code')) {
      postalCode = longName
    } else if (types.includes('country')) {
      country = longName
    }
  }

  // Build Address Line 1
  let line1 = ''
  if (subpremise) {
    line1 += `Flat ${subpremise}, `
  }
  if (premise && !streetNumber) {
    line1 += `${premise}, `
  }
  if (streetNumber && route) {
    line1 += `${streetNumber} ${route}`
  } else if (route) {
    line1 += route
  } else if (premise) {
    line1 = premise
  } else if (formattedAddress) {
    line1 = formattedAddress.split(',')[0] || ''
  }
  line1 = line1.trim().replace(/^,\s*|,\s*$/g, '')

  // Build Address Line 2
  const line2 = sublocality || (premise && streetNumber && route ? premise : '')

  // Town / City preference: postal_town > locality
  const townCity = postalTown || locality || adminArea2 || ''

  // County
  const county = adminArea2 && adminArea2 !== townCity ? adminArea2 : ''

  let coordinates: { lat: number; lng: number } | undefined
  if (location) {
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng
    if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
      coordinates = { lat, lng }
    }
  }

  return {
    placeId,
    formattedAddress,
    addressLine1: line1,
    addressLine2: line2,
    townCity,
    county,
    postcode: postalCode,
    country,
    coordinates
  }
}

// Global script loader promise to prevent duplicate injection
let scriptLoadPromise: Promise<void> | null = null

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as any).google?.maps) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    if (!apiKey) {
      reject(new Error('Google Maps API Key is missing.'))
      return
    }

    const script = document.createElement('script')
    script.id = 'google-maps-places-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&v=weekly`
    script.async = true
    script.defer = true

    script.onload = () => {
      resolve()
    }

    script.onerror = (err) => {
      scriptLoadPromise = null
      reject(new Error(`Failed to load Google Maps SDK: ${err}`))
    }

    document.head.appendChild(script)
  })

  return scriptLoadPromise
}

export function useGooglePlacesAutocomplete(options: UseGooglePlacesOptions = {}) {
  let runtimeApiKey = ''
  try {
    if (typeof useRuntimeConfig === 'function') {
      const config = useRuntimeConfig()
      runtimeApiKey = config.public?.googleMapsApiKey || ''
    }
  } catch {
    // Non-Nuxt / test context fallback
  }

  const apiKey = options.apiKey || runtimeApiKey || ''
  const countryCode = options.countryCode || 'gb'
  const debounceMs = options.debounceMs ?? 350
  const searchTypes = options.types || ['address']

  const predictions = ref<AddressPrediction[]>([])
  const isSearching = ref(false)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  let autocompleteService: any = null
  let placesService: any = null
  let sessionToken: any = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  async function init() {
    if (typeof window === 'undefined') return
    if (isLoaded.value) return

    if (!apiKey) {
      error.value = 'Google Maps API key not configured'
      return
    }

    try {
      await loadGoogleMapsScript(apiKey)
      const google = (window as any).google
      if (google?.maps) {
        if (google.maps.importLibrary) {
          try {
            await google.maps.importLibrary('places')
          } catch {
            // Fallback if importLibrary not supported
          }
        }
        isLoaded.value = true
        error.value = null
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to initialize Google Maps'
    }
  }

  function getSessionToken() {
    const google = (window as any).google
    if (!sessionToken && google?.maps?.places?.AutocompleteSessionToken) {
      sessionToken = new google.maps.places.AutocompleteSessionToken()
    }
    return sessionToken
  }

  function resetSessionToken() {
    sessionToken = null
  }

  function search(query: string) {
    if (debounceTimer) clearTimeout(debounceTimer)

    if (!query || query.trim().length < 2) {
      predictions.value = []
      isSearching.value = false
      return
    }

    debounceTimer = setTimeout(async () => {
      if (!isLoaded.value) {
        await init()
      }

      const google = (window as any).google
      if (!google?.maps?.places) {
        return
      }

      isSearching.value = true
      error.value = null

      const currentToken = getSessionToken()

      // 1. Primary: Places API (New) via AutocompleteSuggestion
      if (google.maps.places.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        try {
          const newRequest: any = {
            input: query.trim(),
            includedRegionCodes: [countryCode.toLowerCase()],
            sessionToken: currentToken
          }

          const response = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(newRequest)
          isSearching.value = false
          const suggestions = response?.suggestions || []

          predictions.value = suggestions
            .filter((s: any) => s.placePrediction)
            .map((s: any) => {
              const p = s.placePrediction
              const placeId = p.placeId || p.id || ''
              let mainText = ''
              let secondaryText = ''
              let description = ''

              if (p.structuredFormat) {
                mainText = p.structuredFormat.mainText?.text || ''
                secondaryText = p.structuredFormat.secondaryText?.text || ''
              } else if (p.mainText) {
                mainText = typeof p.mainText === 'string' ? p.mainText : p.mainText?.text || ''
                secondaryText = typeof p.secondaryText === 'string' ? p.secondaryText : p.secondaryText?.text || ''
              }

              if (p.text) {
                description = typeof p.text === 'string' ? p.text : p.text?.text || ''
              }

              if (!description) {
                description = mainText ? (secondaryText ? `${mainText}, ${secondaryText}` : mainText) : ''
              }
              if (!mainText) {
                mainText = description
              }

              return {
                placeId,
                mainText,
                secondaryText,
                description
              }
            })
          return
        } catch (err: any) {
          // If Places API (New) fails, proceed to legacy fallback
          console.warn('Places API (New) fetch error, attempting fallback:', err)
        }
      }

      // 2. Legacy Fallback: AutocompleteService
      try {
        if (!autocompleteService) {
          autocompleteService = new google.maps.places.AutocompleteService()
        }

        const legacyRequest: any = {
          input: query.trim(),
          componentRestrictions: { country: countryCode },
          types: searchTypes,
          sessionToken: currentToken
        }

        autocompleteService.getPlacePredictions(
          legacyRequest,
          (results: any[], status: any) => {
            isSearching.value = false
            if (status === google?.maps?.places?.PlacesServiceStatus?.OK && results) {
              predictions.value = results.map((item) => ({
                placeId: item.place_id,
                mainText: item.structured_formatting?.main_text || item.description,
                secondaryText: item.structured_formatting?.secondary_text || '',
                description: item.description
              }))
            } else {
              predictions.value = []
            }
          }
        )
      } catch (legacyErr: any) {
        isSearching.value = false
        predictions.value = []
        error.value = legacyErr?.message || 'Autocomplete failed'
      }
    }, debounceMs)
  }

  async function getPlaceDetails(placeId: string): Promise<ParsedUkAddress | null> {
    if (!isLoaded.value) {
      await init()
    }

    const google = (window as any).google
    if (!google?.maps?.places) return null

    // 1. Primary: Places API (New) via Place.fetchFields
    if (google.maps.places.Place) {
      try {
        const place = new google.maps.places.Place({ id: placeId })
        await place.fetchFields({
          fields: ['id', 'formattedAddress', 'addressComponents', 'location']
        })
        resetSessionToken()

        if (place.formattedAddress || (place.addressComponents && place.addressComponents.length > 0)) {
          return parseGoogleAddressComponents(
            place.addressComponents || [],
            place.formattedAddress || '',
            place.location,
            place.id || placeId
          )
        }
      } catch (err) {
        console.warn('Place.fetchFields error, attempting legacy PlacesService fallback:', err)
      }
    }

    // 2. Legacy Fallback: PlacesService
    if (!placesService) {
      const dummyDiv = document.createElement('div')
      placesService = new google.maps.places.PlacesService(dummyDiv)
    }

    return new Promise((resolve) => {
      const request = {
        placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
        sessionToken: getSessionToken()
      }

      placesService.getDetails(request, (place: any, status: any) => {
        resetSessionToken()

        if (status === google?.maps?.places?.PlacesServiceStatus?.OK && place) {
          const parsed = parseGoogleAddressComponents(
            place.address_components,
            place.formatted_address,
            place.geometry?.location,
            place.place_id
          )
          resolve(parsed)
        } else {
          resolve(null)
        }
      })
    })
  }

  function clearPredictions() {
    predictions.value = []
    isSearching.value = false
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  onMounted(() => {
    init()
  })

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return {
    predictions,
    isSearching,
    isLoaded,
    error,
    search,
    getPlaceDetails,
    clearPredictions,
    resetSessionToken,
    init
  }
}

