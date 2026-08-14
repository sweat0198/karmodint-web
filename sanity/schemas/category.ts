import { defineType, defineField } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Category Name',
      type: 'string',
      description: 'e.g. "Portable Cabins", "Kiosks", "Security Gatehouses"',
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
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Leave blank for top-level category, or select a parent category for subcategories.',
      validation: (Rule) =>
        Rule.custom((parentRef: any, context: any) => {
          if (parentRef && parentRef._ref === context.document._id) {
            return 'A category cannot be its own parent'
          }
          return true
        })
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Overview description displayed on the category listing page.'
    }),
    defineField({
      name: 'image',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for SEO and accessibility.',
          validation: (Rule) => Rule.required()
        }
      ]
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Sort weight (lower numbers appear first, e.g. 1, 2, 3)',
      initialValue: 10
    }),
    defineField({
      name: 'seo',
      title: 'SEO Metadata',
      type: 'seo'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }]
    },
    {
      title: 'Name (A-Z)',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      parentName: 'parent.name',
      order: 'displayOrder',
      media: 'image'
    },
    prepare({ title, parentName, order, media }) {
      const hierarchy = parentName ? `${parentName} → ${title}` : `${title} (Top Level)`
      const orderLabel = order !== undefined ? `[#${order}]` : ''
      return {
        title: hierarchy,
        subtitle: `${orderLabel} Category`,
        media
      }
    }
  }
})

export default categoryType
