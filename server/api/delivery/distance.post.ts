import {
  lookupPostcode,
  calculateDrivingRoute,
  computeDeliveryFee,
  formatDuration,
  DEFAULT_ORIGIN_POSTCODE,
  type DeliveryPricingOptions
} from '~~/server/utils/distance'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const originInput = body?.originPostcode || body?.origin || DEFAULT_ORIGIN_POSTCODE
  const destinationInput = body?.destinationPostcode || body?.destination || body?.postcode

  if (!destinationInput || typeof destinationInput !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request: "destinationPostcode" (or "postcode") is required.'
    })
  }

  const mapboxToken = config.mapboxAccessToken || process.env.MAPBOX_ACCESS_TOKEN

  try {
    // 1. Resolve coordinates for both postcodes via postcodes.io
    const [origin, destination] = await Promise.all([
      lookupPostcode(originInput),
      lookupPostcode(destinationInput)
    ])

    // 2. Calculate driving route distance & duration
    const route = await calculateDrivingRoute(origin, destination, mapboxToken)

    // 3. Compute delivery fee if pricing parameters provided
    const pricingOptions: DeliveryPricingOptions | undefined =
      body?.ratePerMile !== undefined || body?.baseFee !== undefined || body?.pricing
        ? {
            baseFee: Number(body.baseFee ?? body.pricing?.baseFee ?? 0),
            ratePerMile: Number(body.ratePerMile ?? body.pricing?.ratePerMile ?? 0),
            minimumFee: Number(body.minimumFee ?? body.pricing?.minimumFee ?? 0)
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
