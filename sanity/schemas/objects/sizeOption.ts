import { defineType, defineField } from 'sanity'

export const sizeOption = defineType({
  name: 'sizeOption',
  title: 'Size Option',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Size Label',
      type: 'string',
      description: 'Display label, e.g. "2.40m x 6.00m" or "Compact Unit"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'lengthM',
      title: 'Length (meters)',
      type: 'number',
      description: 'External length in meters (e.g. 6.0)',
      validation: (Rule) => Rule.required().positive()
    }),
    defineField({
      name: 'widthM',
      title: 'Width (meters)',
      type: 'number',
      description: 'External width in meters (e.g. 2.4)',
      validation: (Rule) => Rule.required().positive()
    }),
    defineField({
      name: 'heightM',
      title: 'Height (meters)',
      type: 'number',
      description: 'External height in meters (e.g. 2.6)',
      validation: (Rule) => Rule.positive()
    }),
    defineField({
      name: 'price',
      title: 'Base Price (£)',
      type: 'number',
      description: 'Base indicative price for this specific size option',
      validation: (Rule) => Rule.required().min(0)
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Selection',
      type: 'boolean',
      description: 'Pre-select this size on the product page',
      initialValue: false
    }),
    defineField({
      name: 'floorPlanImage',
      title: 'Floor Plan / Technical Drawing',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          initialValue: 'Floor plan diagram'
        }
      ]
    })
  ],
  preview: {
    select: {
      title: 'label',
      lengthM: 'lengthM',
      widthM: 'widthM',
      price: 'price',
      isDefault: 'isDefault',
      media: 'floorPlanImage'
    },
    prepare({ title, lengthM, widthM, price, isDefault, media }) {
      const dimStr = lengthM && widthM ? `(${lengthM}m × ${widthM}m)` : ''
      const defaultBadge = isDefault ? ' [DEFAULT]' : ''
      return {
        title: `${title || 'Unnamed Size'}${defaultBadge}`,
        subtitle: `£${price?.toLocaleString() || 0} ${dimStr}`,
        media
      }
    }
  }
})
