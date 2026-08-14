export interface SanityImage {
  _type?: 'image'
  asset?: {
    _ref: string
    _type: 'reference'
  }
  alt?: string
  caption?: string
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface SanitySlug {
  _type?: 'slug'
  current: string
}

export interface SanitySEO {
  metaTitle?: string
  metaDescription?: string
  ogImage?: SanityImage
  noIndex?: boolean
}

export interface SanitySizeOption {
  _key?: string
  label: string
  lengthM: number
  widthM: number
  heightM?: number
  price: number
  isDefault?: boolean
  floorPlanImage?: SanityImage
}

export type PricingType = 'fixed' | 'included' | 'poa'

export interface SanityCustomizationItem {
  _key?: string
  title: string
  pricingType: PricingType
  price?: number
  requiresTextInput?: boolean
  textInputPlaceholder?: string
  description?: string
  image?: SanityImage
}

export type CustomizationSelectionType = 'single' | 'multiple' | 'boolean'

export interface SanityCustomizationGroup {
  _id: string
  _type: 'customizationGroup'
  title: string
  identifier: SanitySlug | string
  selectionType: CustomizationSelectionType
  isMandatory?: boolean
  description?: string
  items: SanityCustomizationItem[]
  displayOrder?: number
}

export interface SanityCategory {
  _id: string
  _type: 'category'
  name: string
  slug: SanitySlug
  parent?: {
    _id: string
    name: string
    slug: SanitySlug
  } | null
  description?: string
  image?: SanityImage
  displayOrder?: number
  seo?: SanitySEO
}

export interface SanitySpecItem {
  _key?: string
  key: string
  value: string
  group?: 'structure' | 'thermal' | 'openings' | 'services' | 'finishes' | 'general' | string
}

export interface SanityProduct {
  _id: string
  _type: 'product'
  name: string
  slug: SanitySlug
  shortDescription?: string
  description?: any[] // Portable Text blocks
  categories: SanityCategory[]
  images: SanityImage[]
  sizes: SanitySizeOption[]
  customizationGroups?: SanityCustomizationGroup[]
  specifications?: SanitySpecItem[]
  isFeatured?: boolean
  status: 'published' | 'draft' | 'archived'
  seo?: SanitySEO
}

export type LeadStatus = 'new' | 'in_progress' | 'quote_sent' | 'won' | 'lost'

export interface SanitySelectedCustomization {
  groupTitle: string
  optionTitle: string
  price?: number
  isPoa?: boolean
  customNotes?: string
}

export interface SanityQuoteItem {
  _key?: string
  product?: {
    _ref: string
    _type: 'reference'
  }
  productTitle: string
  sizeLabel: string
  quantity: number
  unitPrice?: number
  isPoa?: boolean
  selectedCustomizations?: SanitySelectedCustomization[]
  subtotal?: number
}

export interface SanityQuoteEnquiry {
  _id?: string
  _type: 'quoteEnquiry'
  referenceNumber?: string
  status: LeadStatus
  customerName: string
  email: string
  phone: string
  company?: string
  deliveryLocation?: string
  customerNotes?: string
  items: SanityQuoteItem[]
  estimatedTotal?: number
  hasPoa?: boolean
  internalNotes?: string
  submittedAt?: string
}

// Unit Conversion Helpers for UI
export const METERS_TO_FEET = 3.28084

export function metersToFeet(meters: number): number {
  return Math.round(meters * METERS_TO_FEET * 10) / 10
}

export function formatMetricAndImperialDimension(meters: number): {
  metric: string
  imperial: string
} {
  const feet = metersToFeet(meters)
  return {
    metric: `${meters.toFixed(2)}m`,
    imperial: `${feet}ft`
  }
}

