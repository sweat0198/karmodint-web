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

/** Whether an item applies to every product size or needs an explicit size rule. */
export type CustomizationItemScope = 'universal' | 'sizeDependent'

/** Native Size Option rule states. `inherit` defers to the Product and item defaults. */
export type CustomizationAvailability = 'inherit' | 'fixed' | 'included' | 'poa' | 'unavailable'

/** Review state for a Size Option rule. Draft rules may remain pending until publish validation. */
export type CustomizationSizeRuleReviewStatus = 'pending' | 'reviewed'

/**
 * Editor-owned evidence that a Size Option rule was reviewed.
 *
 * `snapshot` is an intentionally opaque, human-readable record of what was reviewed; later
 * Studio validation can require it without coupling catalogue types to the Studio schema.
 */
export interface SanityCustomizationSizeRuleReview {
  status: CustomizationSizeRuleReviewStatus
  snapshot?: string
}

/** A Size Option-specific rule for one item, linked solely through the stable Size Option `_key`. */
export interface SanityCustomizationSizeRule {
  _key?: string
  sizeOptionKey: string
  mode: CustomizationAvailability
  /** Used only when `mode` is `fixed`. */
  price?: number
  titleOverride?: string
  descriptionOverride?: string
  review?: SanityCustomizationSizeRuleReview
}

export interface SanityCustomizationItem {
  _key?: string
  title: string
  pricingType: PricingType
  price?: number
  requiresTextInput?: boolean
  textInputPlaceholder?: string
  description?: string
  image?: SanityImage
  scope?: CustomizationItemScope
}

/** A Product-level override for one item from a reusable Customization Group. */
export interface SanityCustomizationItemOverride {
  _key?: string
  itemKey: string
  /** False removes this item from the Product's customer-facing group. */
  enabled?: boolean
  pricingType?: PricingType
  price?: number
  titleOverride?: string
  descriptionOverride?: string
  sizeRules?: SanityCustomizationSizeRule[]
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

export interface SanityProductCustomizationConfiguration {
  _key?: string
  group: SanityCustomizationGroup
  itemOverrides?: SanityCustomizationItemOverride[]
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
  /** Shared model render for portable containers when individual sizes have no render. */
  representativeImages?: SanityImage[]
  sizes: SanitySizeOption[]
  customizationGroups?: SanityCustomizationGroup[]
  customizationConfigurations?: SanityProductCustomizationConfiguration[]
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
import { METERS_TO_FEET, metersToFeet } from '~~/shared/utils/sizeLabels'

export { METERS_TO_FEET, metersToFeet }

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
