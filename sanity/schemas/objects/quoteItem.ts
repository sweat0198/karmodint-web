import { defineType, defineField } from 'sanity'

export const quoteItem = defineType({
  name: 'quoteItem',
  title: 'Quote Line Item',
  type: 'object',
  fields: [
    defineField({
      name: 'product',
      title: 'Product Reference',
      type: 'reference',
      to: [{ type: 'product' }]
    }),
    defineField({
      name: 'productTitle',
      title: 'Product Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'sizeOptionKey',
      title: 'Size Option Key',
      type: 'string',
      description: 'The confirmed Size Option\'s stable key, for tracing this line back to the catalogue.'
    }),
    defineField({
      name: 'sizeLabel',
      title: 'Chosen Size',
      type: 'string',
      description: 'e.g. "2.40m x 6.00m (Standard)"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      initialValue: 1,
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'unitPrice',
      title: 'Estimated Unit Price (£)',
      type: 'number',
      description: 'Base size price + fixed add-ons at submission time'
    }),
    defineField({
      name: 'isPoa',
      title: 'Requires Custom Quote (POA)?',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'selectedCustomizations',
      title: 'Selected Customizations & Add-ons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'groupId', title: 'Customization Group Identity', type: 'string' },
            { name: 'groupTitle', title: 'Group (e.g. Electricity)', type: 'string' },
            { name: 'itemKey', title: 'Customization Item Key', type: 'string' },
            { name: 'optionTitle', title: 'Option (e.g. 2 light 4 socket)', type: 'string' },
            { name: 'price', title: 'Confirmed Price (£, ex VAT)', type: 'number' },
            { name: 'isPoa', title: 'POA Flag', type: 'boolean' },
            {
              name: 'pricingType',
              title: 'Pricing Type',
              type: 'string',
              options: { list: ['fixed', 'included', 'poa'] }
            },
            {
              name: 'priceSource',
              title: 'Price Source',
              type: 'string',
              description: 'Which precedence tier decided this price at submission time.',
              options: { list: ['sizeRule', 'productOverride', 'itemDefault'] }
            },
            { name: 'customNotes', title: 'Custom Specification Notes', type: 'string' }
          ]
        }
      ]
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal (£)',
      type: 'number'
    })
  ],
  preview: {
    select: {
      title: 'productTitle',
      size: 'sizeLabel',
      qty: 'quantity',
      subtotal: 'subtotal',
      isPoa: 'isPoa'
    },
    prepare({ title, size, qty, subtotal, isPoa }) {
      const priceStr = isPoa ? 'Custom POA' : `£${subtotal?.toLocaleString() || 0}`
      return {
        title: `${qty}x ${title || 'Unnamed Item'}`,
        subtitle: `${size || 'Standard Size'} • ${priceStr}`
      }
    }
  }
})
