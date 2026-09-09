import { defineType, defineField, defineArrayMember } from 'sanity'
import { viewOptionList, validateExactlyOneTopView } from './productImageViews'

interface ProductDocumentContext {
  categories?: Array<{ _ref?: string }>
}

/** Portable containers may use a product-level representative render instead of per-size media. */
export function isPortableContainer(document: ProductDocumentContext | undefined): boolean {
  return document?.categories?.some((category) => category?._ref === 'category-containers') === true
}

/** Keep the legacy render/plan rule everywhere except portable-container size options. */
export function validateSizeImages(
  images: Array<{ view?: string }> | undefined,
  document: ProductDocumentContext | undefined
): true | string {
  if (isPortableContainer(document)) return true
  if (!images || images.length === 0) return 'Each size needs at least one render'
  return validateExactlyOneTopView(images)
}

export const sizeOption = defineType({
  name: 'sizeOption',
  title: 'Size Option',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Size Label',
      type: 'string',
      description: 'Display label, e.g. "20ft × 8ft (2.40m × 6.00m)" or "Compact Unit"',
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
      description: 'External height in meters (e.g. 2.6). Leave empty when not published.',
      validation: (Rule) => Rule.positive()
    }),
    defineField({
      name: 'weightKg',
      title: 'Weight (kg)',
      type: 'number',
      description: 'Unit weight in kg. Use 0 to record "not yet supplied" — it does not mean weightless.',
      // min(0) rather than positive(), so the 0 sentinel validates.
      validation: (Rule) => Rule.min(0)
    }),
    defineField({
      name: 'isPoa',
      title: 'Price on Application',
      type: 'boolean',
      description: 'No published price for this size — the quote builder shows POA instead of a figure.',
      initialValue: false
    }),
    defineField({
      name: 'price',
      title: 'Base Price (£)',
      type: 'number',
      description: 'Base indicative price for this specific size option',
      hidden: ({ parent }) => parent?.isPoa === true,
      validation: (Rule) =>
        Rule.custom((value, context: any) => {
          const isPoa = context.parent?.isPoa === true
          if (!isPoa && (value === undefined || value === null)) {
            return 'Price is required unless this size is marked Price on Application'
          }
          // Checked even when POA: the field is only hidden, so a stale negative can survive the
          // toggle being flipped on.
          if (value !== undefined && value !== null && value < 0) {
            return 'Price cannot be negative'
          }
          return true
        })
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Selection',
      type: 'boolean',
      description: 'Pre-select this size on the product page. Exactly one size per product must be the default.',
      initialValue: false
    }),
    defineField({
      name: 'images',
      title: 'Renders for this Size',
      type: 'array',
      description:
        'Every render depicts one particular size, so images belong to the size rather than the product. '
        + 'Ordered by the view vocabulary — the front elevation leads and is used as the thumbnail.',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'view',
              type: 'string',
              title: 'View',
              description: 'Which elevation this render shows. Drives the generated alt text.',
              options: { list: viewOptionList() },
              validation: (Rule) => Rule.required()
            },
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
          ],
          preview: {
            select: { view: 'view', alt: 'alt', media: 'asset' },
            prepare({ view, alt, media }) {
              const label = viewOptionList().find((v) => v.value === view)?.title
              return { title: label || 'No view set', subtitle: alt, media }
            }
          }
        })
      ],
      // The import writes each image's _key as its view name. Sanity enforces _key uniqueness
      // within an array, which makes duplicate views structurally impossible. Portable containers
      // alone may leave this empty when their product supplies representative photography.
      validation: (Rule) => Rule.custom((images: Array<{ view?: string }> | undefined, context: any) =>
        validateSizeImages(images, context.document)
      )
    })
  ],
  preview: {
    select: {
      title: 'label',
      lengthM: 'lengthM',
      widthM: 'widthM',
      price: 'price',
      isPoa: 'isPoa',
      isDefault: 'isDefault',
      media: 'images.0'
    },
    prepare({ title, lengthM, widthM, price, isPoa, isDefault, media }) {
      const dimStr = lengthM && widthM ? `(${lengthM}m × ${widthM}m)` : ''
      const defaultBadge = isDefault ? ' [DEFAULT]' : ''
      const priceLabel = isPoa ? 'POA' : `£${price?.toLocaleString() ?? 0}`
      return {
        title: `${title || 'Unnamed Size'}${defaultBadge}`,
        subtitle: `${priceLabel} ${dimStr}`,
        media
      }
    }
  }
})
