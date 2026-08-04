export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule: any) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    {
      name: 'basePrice',
      title: 'Indicative Base Price (£)',
      type: 'number'
    },
    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    {
      name: 'specs',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'key', title: 'Feature / Spec Name', type: 'string' },
            { name: 'value', title: 'Value / Dimension', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'variants',
      title: 'Variants & Add-ons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Variant Label', type: 'string' },
            { name: 'priceModifier', title: 'Price Modifier (£)', type: 'number' },
            { name: 'description', title: 'Variant Description', type: 'string' }
          ]
        }
      ]
    }
  ]
}
