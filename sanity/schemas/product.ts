import { defineType, defineField, defineArrayMember } from 'sanity'

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
      name: 'images',
      title: 'Product Images (3-4 recommended)',
      type: 'array',
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
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'sizes',
      title: 'Size Options (Mandatory)',
      type: 'array',
      of: [defineArrayMember({ type: 'sizeOption' })],
      description: 'At least one size option must be defined with dimensions and base price.',
      validation: (Rule) => Rule.required().min(1)
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
      sizes: 'sizes',
      media: 'images.0'
    },
    prepare({ title, status, isFeatured, sizes, media }) {
      const prices = (sizes || [])
        .map((s: any) => s?.price)
        .filter((p: any) => typeof p === 'number')

      const lowestPrice = prices.length > 0 ? Math.min(...prices) : null
      const priceText = lowestPrice !== null ? `From £${lowestPrice.toLocaleString()}` : 'Price not set'
      const badges = [
        isFeatured ? '★ Featured' : null,
        status !== 'published' ? `[${status?.toUpperCase()}]` : null
      ].filter(Boolean).join(' ')

      return {
        title: badges ? `${title} ${badges}` : title || 'Unnamed Product',
        subtitle: `${priceText} • ${sizes?.length || 0} size(s)`,
        media
      }
    }
  }
})

export default productType
