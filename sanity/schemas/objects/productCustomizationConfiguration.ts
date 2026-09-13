import { defineArrayMember, defineField, defineType } from 'sanity'

/** Product-specific controls for one reusable Customization Group. */
export const productCustomizationConfiguration = defineType({
  name: 'productCustomizationConfiguration',
  title: 'Product Customization Configuration',
  type: 'object',
  fields: [
    defineField({
      name: 'group',
      title: 'Customization Group',
      type: 'reference',
      to: [{ type: 'customizationGroup' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'itemOverrides',
      title: 'Item Overrides',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'productCustomizationItemOverride',
          title: 'Item Override',
          type: 'object',
          fields: [
            defineField({
              name: 'itemKey',
              title: 'Customization Item Key',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'enabled',
              title: 'Available for This Product',
              type: 'boolean',
              initialValue: true
            }),
            defineField({
              name: 'pricingType',
              title: 'Pricing Type Override',
              type: 'string',
              options: {
                list: [
                  { title: 'Fixed Additional Price (£)', value: 'fixed' },
                  { title: 'Included / Standard (£0)', value: 'included' },
                  { title: 'POA / Custom Quote Required', value: 'poa' }
                ],
                layout: 'radio'
              }
            }),
            defineField({
              name: 'price',
              title: 'Price Override (£)',
              type: 'number',
              hidden: ({ parent }) => parent?.pricingType !== 'fixed',
              validation: (Rule) => Rule.min(0)
            })
          ]
        })
      ]
    })
  ],
  preview: {
    select: { title: 'group.title', overrideCount: 'itemOverrides.length' },
    prepare({ title, overrideCount }) {
      return {
        title: title || 'Select a customization group',
        subtitle: `${overrideCount || 0} item override${overrideCount === 1 ? '' : 's'}`
      }
    }
  }
})
