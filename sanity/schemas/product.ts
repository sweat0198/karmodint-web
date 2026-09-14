import { defineType, defineField, defineArrayMember } from 'sanity'

/**
 * A product must nominate exactly one size as the pre-selected default.
 *
 * Card thumbnails read the default size's first render, so zero defaults leaves a product with no
 * image to show and two makes the choice arbitrary.
 *
 * Returns `true` for absent or empty sizes — that is the `required().min(1)` rule's job to report.
 */
export function validateExactlyOneDefaultSize(
  sizes: Array<{ isDefault?: boolean }> | undefined,
  document?: { categories?: Array<{ _ref?: string }> }
): true | string {
  if (!sizes || sizes.length === 0) return true

  // Portable customers choose deliberately in Customize, so Studio must not force an arbitrary
  // pre-selected size. Existing products retain the exactly-one invariant.
  if (document?.categories?.some((category) => category?._ref === 'category-containers')) return true

  const defaultCount = sizes.filter((size) => size?.isDefault === true).length
  if (defaultCount === 1) return true

  return `Exactly one size must be marked as the default selection (found ${defaultCount})`
}

interface ValidationSizeOption {
  _key?: string
  label?: string
  lengthM?: number
  widthM?: number
  heightM?: number
}

interface ValidationSizeRule {
  sizeOptionKey?: string
  mode?: 'inherit' | 'fixed' | 'included' | 'poa' | 'unavailable'
  price?: number
  titleOverride?: string
  descriptionOverride?: string
  review?: { status?: 'pending' | 'reviewed'; snapshot?: string }
}

interface ValidationItemOverride {
  itemKey?: string
  enabled?: boolean
  sizeRules?: ValidationSizeRule[]
}

interface ValidationConfiguration {
  group?: { _ref?: string }
  itemOverrides?: ValidationItemOverride[]
}

interface ValidationGroup {
  _id: string
  isMandatory?: boolean
  items?: Array<{ _key?: string; scope?: 'universal' | 'sizeDependent' }>
}

interface ProductCustomizationValidationDocument {
  status?: string
  sizes?: ValidationSizeOption[]
  customizationGroups?: Array<{ _ref?: string }>
  customizationConfigurations?: ValidationConfiguration[]
}

/** Stable evidence for a reviewed Size Option rule. Update the review if any dimension changes. */
export function createSizeRuleSnapshot(size: ValidationSizeOption, rule: ValidationSizeRule): string {
  return JSON.stringify({
    sizeOptionKey: size._key ?? null,
    lengthM: size.lengthM ?? null,
    widthM: size.widthM ?? null,
    heightM: size.heightM ?? null,
    mode: rule.mode ?? null,
    price: rule.price ?? null,
    titleOverride: rule.titleOverride ?? null,
    descriptionOverride: rule.descriptionOverride ?? null
  })
}

function describeProductSizeOptions(sizes: ValidationSizeOption[]): string {
  return sizes.length === 0
    ? 'No Size Options have been added.'
    : sizes.map((size) => `${size._key || '(missing key)'} (${size.label || 'unnamed size'})`).join(', ')
}

/**
 * Publish-only integrity checks for native Product customization rules.
 *
 * Drafts deliberately remain editable with incomplete rules. Studio supplies the referenced group
 * records, which keeps this function deterministic and independently testable.
 */
function validateCustomizationRules(
  document: ProductCustomizationValidationDocument | undefined,
  groups: ValidationGroup[],
): true | string {
  const sizes = document?.sizes ?? []
  const sizeKeys = new Set<string>()
  for (const size of sizes) {
    if (!size._key) return 'Each Product Size Option needs a stable key before publishing'
    if (sizeKeys.has(size._key)) return `Product has more than one Size Option "${size._key}"`
    sizeKeys.add(size._key)
  }

  const groupsById = new Map(groups.map((group) => [group._id, group]))
  for (const configuration of document?.customizationConfigurations ?? []) {
    const groupId = configuration.group?._ref
    if (!groupId) continue

    const group = groupsById.get(groupId)
    if (!group) return `Customization Group "${groupId}" no longer exists`

    const items = group.items ?? []
    const itemsByKey = new Map(items.flatMap((item) => item._key ? [[item._key, item] as const] : []))
    const overridesByKey = new Map<string, ValidationItemOverride>()

    for (const override of configuration.itemOverrides ?? []) {
      if (!override.itemKey) return 'Customization Product override does not identify an item'
      if (!itemsByKey.has(override.itemKey)) {
        return `Customization Item "${override.itemKey}" does not exist in the selected Customization Group`
      }
      if (overridesByKey.has(override.itemKey)) {
        return `Customization Item "${override.itemKey}" can have only one override`
      }
      overridesByKey.set(override.itemKey, override)

      const rulesBySizeKey = new Set<string>()
      for (const rule of override.sizeRules ?? []) {
        if (!rule.sizeOptionKey || !sizeKeys.has(rule.sizeOptionKey)) {
          return rule.sizeOptionKey
            ? `Size Option "${rule.sizeOptionKey}" does not exist on this Product. Available Size Options: ${describeProductSizeOptions(sizes)}`
            : `A Size Option rule needs a Size Option Key. Available Size Options: ${describeProductSizeOptions(sizes)}`
        }
        if (rulesBySizeKey.has(rule.sizeOptionKey)) {
          return `Size Option "${rule.sizeOptionKey}" can have only one rule for this Customization Item`
        }
        rulesBySizeKey.add(rule.sizeOptionKey)

        if (rule.review?.status !== 'reviewed') {
          return `Size Option rule for "${override.itemKey}" at "${rule.sizeOptionKey}" must be reviewed before publishing`
        }
        const size = sizes.find((candidate) => candidate._key === rule.sizeOptionKey)!
        if (rule.review.snapshot !== createSizeRuleSnapshot(size, rule)) {
          return `Size Option rule for "${override.itemKey}" at "${rule.sizeOptionKey}" must be reviewed again because dimensions changed`
        }
      }
    }

    for (const item of items) {
      if (!item._key || item.scope !== 'sizeDependent') continue
      const override = overridesByKey.get(item._key)
      if (override?.enabled === false) continue
      const reviewedSizeKeys = new Set(
        (override?.sizeRules ?? [])
          .filter((rule) => rule.review?.status === 'reviewed')
          .map((rule) => rule.sizeOptionKey)
      )
      const missingSizeKey = sizes.find((size) => size._key && !reviewedSizeKeys.has(size._key))?._key
      if (missingSizeKey) {
        return `Size-dependent Customization Item "${item._key}" needs a reviewed rule for Size Option "${missingSizeKey}"`
      }
    }

    if (group.isMandatory) {
      for (const size of sizes) {
        const hasAvailableItem = items.some((item) => {
          if (!item._key) return false
          const override = overridesByKey.get(item._key)
          if (override?.enabled === false) return false
          return override?.sizeRules?.find((rule) => rule.sizeOptionKey === size._key)?.mode !== 'unavailable'
        })
        if (!hasAvailableItem) {
          return `Mandatory Customization Group "${groupId}" has no available items for Size Option "${size._key}"`
        }
      }
    }
  }

  const configuredGroupIds = new Set(
    (document?.customizationConfigurations ?? [])
      .map((configuration) => configuration.group?._ref)
      .filter((groupId): groupId is string => Boolean(groupId))
  )
  for (const legacyGroupReference of document?.customizationGroups ?? []) {
    const groupId = legacyGroupReference._ref
    if (!groupId || configuredGroupIds.has(groupId)) continue
    const group = groupsById.get(groupId)
    if (group?.items?.some((item) => item.scope === 'sizeDependent')) {
      return `Customization Group "${groupId}" contains size-dependent items and requires Product customization rules before publishing`
    }
  }

  return true
}

export function validatePublishedCustomizationRules(
  document: ProductCustomizationValidationDocument | undefined,
  groups: ValidationGroup[],
): true | string {
  return document?.status === 'published' ? validateCustomizationRules(document, groups) : true
}

/** Keep drafts editable while showing the same publish blockers in the Studio. */
export function getCustomizationConfigurationWarning(
  document: ProductCustomizationValidationDocument | undefined,
  groups: ValidationGroup[],
): true | string {
  if (document?.status !== 'draft') return true

  return validateCustomizationRules(document, groups)
}

async function fetchProductCustomizationGroups(
  document: ProductCustomizationValidationDocument,
  context: any,
): Promise<ValidationGroup[]> {
  const groupIds = [...new Set([
    ...(document.customizationConfigurations ?? []).map((configuration) => configuration.group?._ref),
    ...(document.customizationGroups ?? []).map((group) => group._ref)
  ].filter((groupId): groupId is string => Boolean(groupId)))]
  if (groupIds.length === 0) return []

  return context
    .getClient({ apiVersion: '2025-02-19' })
    .withConfig({ perspective: 'drafts' })
    .fetch<ValidationGroup[]>(
      '*[_id in $groupIds]{_id, isMandatory, items[]{_key, scope}}',
      { groupIds }
    )
}

export const productType = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      description: 'e.g. "Standard Portable Office Cabin 6m", "Security Gatehouse 2x2"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Excerpt / Teaser',
      type: 'text',
      rows: 2,
      description: 'Quick 1-2 sentence overview for product cards and search snippets.'
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description',
      type: 'blockContent',
      description: 'Comprehensive product description, build quality, features, and use-cases.'
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'category' }]
        })
      ],
      description: 'Assign this product to one or more categories/subcategories.',
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'lifestyleImages',
      title: 'Lifestyle Photography (optional)',
      type: 'array',
      description:
        'Genuinely size-agnostic photography only — installed units in context, people using them. '
        + 'Anything depicting one particular unit belongs on that size, not here.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              description: 'Important for SEO and accessibility.',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'representativeImages',
      title: 'Representative Product Images',
      type: 'array',
      description:
        'Shared model photography for Portable Cabins. These images are labelled representative and do not imply a floor plan or exact size.',
      hidden: ({ document }) => !document?.categories?.some((category: any) => category?._ref === 'category-containers'),
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption'
            }
          ]
        })
      ]
    }),
    defineField({
      name: 'sizes',
      title: 'Size Options (Mandatory)',
      type: 'array',
      of: [defineArrayMember({ type: 'sizeOption' })],
      description: 'At least one size option must be defined, with its own renders and dimensions.',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom((sizes: Array<{ isDefault?: boolean }> | undefined, context: any) =>
            validateExactlyOneDefaultSize(sizes, context.document)
          )
    }),
    defineField({
      name: 'customizationGroups',
      title: 'Customization Options & Add-ons',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'customizationGroup' }]
        })
      ],
      description: 'Select which global customization groups (Electricity, Heater, WC, Kitchen, etc.) apply to this product.'
    }),
    defineField({
      name: 'customizationConfigurations',
      title: 'Customization Configurations',
      type: 'array',
      of: [defineArrayMember({ type: 'productCustomizationConfiguration' })],
      description: 'Product-specific groups and item availability or pricing overrides. Takes precedence over legacy Customization Options & Add-ons.',
      validation: (Rule) => [
        Rule.custom(async (configurations: ValidationConfiguration[] | undefined, context: any) => {
          const document = {
            ...context.document,
            customizationConfigurations: configurations
          } as ProductCustomizationValidationDocument
          if (document.status !== 'draft') return true
          return getCustomizationConfigurationWarning(document, await fetchProductCustomizationGroups(document, context))
        }).warning(),
        Rule.custom(async (configurations: ValidationConfiguration[] | undefined, context: any) => {
          const document = {
            ...context.document,
            customizationConfigurations: configurations
          } as ProductCustomizationValidationDocument
          if (document.status !== 'published') return true
          return validatePublishedCustomizationRules(document, await fetchProductCustomizationGroups(document, context))
        })
      ]
    }),
    defineField({
      name: 'specifications',
      title: 'Technical Specifications',
      type: 'array',
      of: [defineArrayMember({ type: 'specItem' })],
      description: 'Structured key-value specs (e.g. Wall Insulation, Frame, Roof, Doors).'
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Display this product on the home page or category highlights section.',
      initialValue: false
    }),
    defineField({
      name: 'status',
      title: 'Product Status',
      type: 'string',
      options: {
        list: [
          { title: 'Published / Available', value: 'published' },
          { title: 'Draft / Hidden', value: 'draft' },
          { title: 'Archived / Discontinued', value: 'archived' }
        ],
        layout: 'radio'
      },
      initialValue: 'published',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo'
    })
  ],
  orderings: [
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'name', direction: 'asc' }
      ]
    }
  ],
  preview: {
    select: {
      title: 'name',
      status: 'status',
      isFeatured: 'isFeatured',
      sizes: 'sizes'
    },
    prepare({ title, status, isFeatured, sizes }) {
      const sizeList: any[] = sizes || []

      // Thumbnail comes from the default size's leading render — the reason exactly one size
      // must be flagged default.
      const defaultSize = sizeList.find((s: any) => s?.isDefault === true) ?? sizeList[0]
      const media = defaultSize?.images?.[0]

      // POA sizes carry a placeholder price of 0; counting them would render "From £0".
      const prices = sizeList
        .filter((s: any) => s?.isPoa !== true)
        .map((s: any) => s?.price)
        .filter((p: any) => typeof p === 'number')

      const lowestPrice = prices.length > 0 ? Math.min(...prices) : null
      let priceText = 'Price not set'
      if (lowestPrice !== null) {
        priceText = `From £${lowestPrice.toLocaleString()}`
      } else if (sizeList.length > 0) {
        priceText = 'POA'
      }
      const badges = [
        isFeatured ? '★ Featured' : null,
        status !== 'published' ? `[${status?.toUpperCase()}]` : null
      ].filter(Boolean).join(' ')

      return {
        title: badges ? `${title} ${badges}` : title || 'Unnamed Product',
        subtitle: `${priceText} • ${sizeList.length} size(s)`,
        media
      }
    }
  }
})

export default productType
