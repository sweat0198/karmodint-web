import { defineField, defineType } from 'sanity'

export function validateGalleryOrder(order: number | null | undefined): true | string {
  if (order === null || order === undefined) return true
  if (!Number.isInteger(order)) return 'Order must be a whole number'
  if (order <= 0) return 'Order must be greater than zero'
  return true
}

export const galleryEntryType = defineType({
  name: 'galleryEntry',
  title: 'Gallery Entry',
  type: 'document',
  fields: [
    defineField({
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for visitors who cannot see it.',
          validation: (Rule) => Rule.required()
        }
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Optional. Numbered entries display first; unnumbered entries follow alphabetically.',
      validation: (Rule) => Rule.custom(validateGalleryOrder)
    })
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: 'projectTitle', direction: 'asc' }
      ]
    },
    {
      title: 'Project Title (A-Z)',
      name: 'projectTitleAsc',
      by: [{ field: 'projectTitle', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'projectTitle',
      category: 'category.name',
      order: 'order',
      media: 'image'
    },
    prepare({ title, category, order, media }) {
      const position = order === null || order === undefined ? 'Unordered' : `#${order}`
      return {
        title: title || 'Untitled Gallery Entry',
        subtitle: `${position} • ${category || 'No category'}`,
        media
      }
    }
  }
})

export default galleryEntryType
