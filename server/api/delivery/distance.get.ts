import {
  lookupPostcode,
  calculateDrivingRoute,
  computeDeliveryFee,
  formatDuration,
  DEFAULT_ORIGIN_POSTCODE,
  type DeliveryPricingOptions
} from '~~/server/utils/distance'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const config = useRuntimeConfig()

  const originInput = (query.origin || query.originPostcode || DEFAULT_ORIGIN_POSTCODE) as string
  const destinationInput = (query.destination || query.destinationPostcode || query.postcode) as string

  if (!destinationInput) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing query parameter: "destination" (or "postcode") is required.'
    })
  }

  const mapboxToken = config.mapboxAccessToken || process.env.MAPBOX_ACCESS_TOKEN

  try {
    const [origin, destination] = await Promise.all([
      lookupPostcode(originInput),
      lookupPostcode(destinationInput)
    ])

    const route = await calculateDrivingRoute(origin, destination, mapboxToken)

    const pricingOptions: DeliveryPricingOptions | undefined =
      query.ratePerMile !== undefined || query.baseFee !== undefined
        ? {
            baseFee: query.baseFee ? Number(query.baseFee) : 0,
            ratePerMile: query.ratePerMile ? Number(query.ratePerMile) : 0,
            minimumFee: query.minimumFee ? Number(query.minimumFee) : 0
          }
        : undefined

    const deliveryFee = computeDeliveryFee(route.miles, pricingOptions)

    return {
      success: true,
      origin: {
        postcode: origin.postcode,
        latitude: origin.latitude,
        longitude: origin.longitude,
        district: origin.district,
        country: origin.country
      },
      destination: {
        postcode: destination.postcode,
        latitude: destination.latitude,
        longitude: destination.longitude,
        district: destination.district,
        country: destination.country
      },
      distance: {
        meters: route.meters,
        miles: route.miles,
        km: route.km
      },
      duration: {
        seconds: route.durationSeconds,
        minutes: Math.round(route.durationSeconds / 60),
        formatted: formatDuration(route.durationSeconds)
      },
      deliveryFee,
      provider: route.provider
    }
  } catch (err: any) {
    if (err.statusCode) throw err

    throw createError({
      statusCode: 422,
      statusMessage: err.message || 'Failed to calculate delivery distance.'
    })
  }
})
