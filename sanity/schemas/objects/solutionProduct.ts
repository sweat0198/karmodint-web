import { defineType, defineField } from 'sanity'

export const solutionProduct = defineType({
  name: 'solutionProduct',
  title: 'Solution Product',
  type: 'object',
  fields: [
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'sizeOptionKey',
      title: 'Size Option Key',
      type: 'string',
      description:
        'Which of the product\'s Size Options this solution recommends. Copy the key from the '
        + 'product\'s Size Options list — saving an unknown key reports the available ones.',
      validation: (Rule) => Rule.required()
    })
  ],
  preview: {
    select: {
      productName: 'product.name',
      sizeOptionKey: 'sizeOptionKey',
      media: 'product.sizes.0.images.0'
    },
    prepare({ productName, sizeOptionKey, media }) {
      return {
        title: productName || 'No product selected',
        subtitle: sizeOptionKey ? `Size: ${sizeOptionKey}` : 'No size chosen',
        media
      }
    }
  }
})

export default solutionProduct
