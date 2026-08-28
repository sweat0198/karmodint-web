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

/**
 * Which elevation a render depicts. Mirrors the closed vocabulary in
 * `sanity/schemas/objects/productImageViews.ts` — type only, so nothing in the app bundles the
 * Studio schema at runtime.
 */
export type ProductImageView =
  | 'front'
  | 'left-diagonal'
  | 'right-diagonal'
  | 'right'
  | 'back'
  | 'interior'
  | 'door'
  | 'top'

/**
 * A render belonging to one size option.
 *
 * `_key` is the view name. Sanity enforces `_key` uniqueness within an array, so this makes a
 * duplicate view structurally impossible rather than merely invalid.
 */
export interface SanitySizeImage extends SanityImage {
  _key?: ProductImageView
  view: ProductImageView
  alt: string
}

/**
 * One frame in an image carousel, already resolved to a URL.
 *
 * Resolution happens at the call site rather than inside the carousel, because the frames come
 * from two unrelated places: Sanity asset refs on the catalog, and plain static paths for the
 * customize page's fallback renders.
 */
export interface CarouselImage {
  src: string
  alt: string
}

export interface SanitySizeOption {
  _key?: string
  label: string
  lengthM: number
  widthM: number
  heightM?: number
  /** Unit weight in kg. `0` means "not yet supplied", NOT weightless — do not render it as "0 kg". */
  weightKg?: number
  /** When true, `price` is a placeholder and the UI must show POA instead of a figure. */
  isPoa?: boolean
  price: number
  isDefault?: boolean
  images: SanitySizeImage[]
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
  /** Size-agnostic photography only. Per-size renders live on the size option. */
  lifestyleImages?: SanityImage[]
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

