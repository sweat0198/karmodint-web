import { defineField, defineType } from 'sanity'

export const clientReferenceType = defineType({
  name: 'clientReference',
  title: 'Reference',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional project, city, or regional qualifier.'
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] })
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Optional sort weight. Lower values appear first.'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'companyName', direction: 'asc' }
      ]
    },
    {
      title: 'Company Name (A-Z)',
      name: 'companyNameAsc',
      by: [{ field: 'companyName', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'location',
      media: 'logo'
    }
  }
})

export default clientReferenceType
