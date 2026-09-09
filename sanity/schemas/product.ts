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
  sizes: Array<{ isDefault?: boolean }> | undefined
): true | string {
  if (!sizes || sizes.length === 0) return true

  const defaultCount = sizes.filter((size) => size?.isDefault === true).length
  if (defaultCount === 1) return true

  return `Exactly one size must be marked as the default selection (found ${defaultCount})`
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
          .custom((sizes: Array<{ isDefault?: boolean }> | undefined) =>
            validateExactlyOneDefaultSize(sizes)
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
