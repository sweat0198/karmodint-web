/**
 * Single source of truth for Karmod International company metadata,
 * official registered address, contact channels, and SEO Schema.org definitions.
 */

export interface PostalAddressDefinition {
  streetAddress: string
  addressLocality: string
  addressRegion: string
  postalCode: string
  addressCountry: 'GB'
}

export interface CoordinatesDefinition {
  latitude: number
  longitude: number
}

export interface ContactPointDefinition {
  phoneDisplay: string
  phoneRaw: string
  phoneTelHref: string
  whatsAppNumber: string
  whatsAppDisplay: string
  whatsAppUrl: string
  salesEmail: string
  supportEmail: string
  openingHours: string
}

export interface SocialLinksDefinition {
  facebook: string
  linkedin: string
  pinterest: string
  instagram: string
}

export const COMPANY_ADDRESS = {
  line1: 'Unit 4 Fairfield Industrial Estate, Fair Farm Drive, Melton Road',
  locality: 'Waltham On The Wolds',
  town: 'Melton Mowbray',
  region: 'Leicestershire',
  country: 'England',
  countryCode: 'GB',
  postcode: 'LE14 4AJ',
  full: 'Unit 4 Fairfield Industrial Estate Fair Farm Drive Melton Road, Waltham On The Wolds, Melton Mowbray, England, LE14 4AJ',
  formatted: 'Unit 4 Fairfield Industrial Estate, Fair Farm Drive, Melton Road, Waltham On The Wolds, Melton Mowbray, LE14 4AJ'
} as const

export type CompanyAddress = typeof COMPANY_ADDRESS

export const COMPANY_COORDINATES = {
  latitude: 52.813677,
  longitude: -0.813535
} as const satisfies CoordinatesDefinition

export type CompanyCoordinates = typeof COMPANY_COORDINATES

export const COMPANY_CONTACT = {
  phoneDisplay: '0116 403 0143',
  phoneRaw: '+441164030143',
  phoneTelHref: 'tel:+441164030143',
  whatsAppNumber: '447824810226',
  whatsAppDisplay: '+44 7824 810226',
  whatsAppUrl: 'https://wa.me/447824810226',
  salesEmail: 'info@karmodint.co.uk',
  supportEmail: 'info@karmodint.co.uk',
  openingHours: 'Mon - Fri, 8:00 AM - 6:00 PM GMT'
} as const satisfies ContactPointDefinition

export const COMPANY_SOCIAL = {
  facebook: 'https://www.facebook.com/karmodint/',
  linkedin: 'https://www.linkedin.com/company/karmodint/',
  pinterest: 'https://uk.pinterest.com/karmodint/',
  instagram: 'https://www.instagram.com/karmodint/'
} as const satisfies SocialLinksDefinition

export const COMPANY_MAPS = {
  googleMapsEmbedUrl:
    'https://maps.google.com/maps?q=Karmod+International,+Unit+4+Fairfield+Industrial+Estate,+Fair+Farm+Drive,+Melton+Road,+Waltham+On+The+Wolds,+Melton+Mowbray+LE14+4AJ&t=&z=14&ie=UTF8&iwloc=&output=embed',
  googleMapsDirectionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=LE14+4AJ'
} as const

export const COMPANY_DETAILS = {
  name: 'Karmod International',
  legalName: 'Karmod International Ltd',
  tradingName: 'Karmod Modular UK',
  tagline: 'Delivering high-quality, precision-engineered modular building solutions across the United Kingdom.',
  address: COMPANY_ADDRESS,
  coordinates: COMPANY_COORDINATES,
  contact: COMPANY_CONTACT,
  social: COMPANY_SOCIAL,
  maps: COMPANY_MAPS
} as const

export type CompanyDetails = typeof COMPANY_DETAILS

/**
 * Returns Schema.org PostalAddress structured object for SEO JSON-LD
 */
export function getCompanyPostalAddressSchema() {
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: COMPANY_ADDRESS.line1,
    addressLocality: `${COMPANY_ADDRESS.locality}, ${COMPANY_ADDRESS.town}`,
    addressRegion: COMPANY_ADDRESS.region,
    postalCode: COMPANY_ADDRESS.postcode,
    addressCountry: COMPANY_ADDRESS.countryCode
  }
}
