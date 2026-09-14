import { defineType, defineField } from 'sanity'

export const customizationItem = defineType({
  name: 'customizationItem',
  title: 'Customization Choice',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Option Title',
      type: 'string',
      description: 'e.g. "1 light, 2 double socket", "Customised electricity", "Disabled WC Unit"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'scope',
      title: 'Size Availability',
      type: 'string',
      description: 'Universal options apply to every size. Size-dependent options need one reviewed rule per Product size before publishing.',
      options: {
        list: [
          { title: 'Universal — same for every size', value: 'universal' },
          { title: 'Size-dependent — review each size', value: 'sizeDependent' }
        ],
        layout: 'radio'
      },
      initialValue: 'universal',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'pricingType',
      title: 'Pricing Model',
      type: 'string',
      options: {
        list: [
          { title: 'Fixed Additional Price (£)', value: 'fixed' },
          { title: 'Included / Standard (£0)', value: 'included' },
          { title: 'POA / Custom Quote Required', value: 'poa' }
        ],
        layout: 'radio'
      },
      initialValue: 'fixed',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'price',
      title: 'Additional Price (£)',
      type: 'number',
      description: 'Extra cost added to the unit price',
      hidden: ({ parent }) => parent?.pricingType === 'included' || parent?.pricingType === 'poa',
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          if (context.parent?.pricingType === 'fixed' && (value === undefined || value === null)) {
            return 'Price is required for fixed pricing model'
          }
          if (value !== undefined && value < 0) {
            return 'Price cannot be negative'
          }
          return true
        })
    }),
    defineField({
      name: 'requiresTextInput',
      title: 'Requires Custom Specification Note from Customer?',
      type: 'boolean',
      description: 'When selected, customer is prompted to specify their custom requirements (e.g. custom electrical layout).',
      initialValue: false
    }),
    defineField({
      name: 'textInputPlaceholder',
      title: 'Custom Input Placeholder',
      type: 'string',
      description: 'Placeholder prompt shown in quote builder, e.g. "Describe your custom electrical requirements..."',
      hidden: ({ parent }) => !parent?.requiresTextInput
    }),
    defineField({
      name: 'description',
      title: 'Description / Specifications',
      type: 'text',
      rows: 2,
      description: 'Brief details on what this option includes'
    }),
    defineField({
      name: 'image',
      title: 'Visual / Icon',
      type: 'image',
      options: { hotspot: true }
    })
  ],
  preview: {
    select: {
      title: 'title',
      pricingType: 'pricingType',
      price: 'price',
      requiresTextInput: 'requiresTextInput',
      media: 'image'
    },
    prepare({ title, pricingType, price, requiresTextInput, media }) {
      let priceLabel = '£0 (Included)'
      if (pricingType === 'fixed') {
        priceLabel = `+£${price?.toLocaleString() || 0}`
      } else if (pricingType === 'poa') {
        priceLabel = 'POA / Custom Quote'
      }

      const inputBadge = requiresTextInput ? ' [Custom Note]' : ''
      return {
        title: `${title || 'Unnamed Option'}${inputBadge}`,
        subtitle: priceLabel,
        media
      }
    }
  }
})
