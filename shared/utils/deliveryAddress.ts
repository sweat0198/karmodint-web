export interface CompleteDeliveryAddress {
  townCity: string
  postcode: string
}

export function isCompleteDeliveryAddress(value: unknown): value is CompleteDeliveryAddress {
  if (!value || typeof value !== 'object') return false

  const address = value as { townCity?: unknown; postcode?: unknown }
  return typeof address.townCity === 'string'
    && address.townCity.trim().length > 0
    && typeof address.postcode === 'string'
    && address.postcode.trim().length > 0
}
