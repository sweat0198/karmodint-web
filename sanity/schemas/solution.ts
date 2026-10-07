import { defineType, defineField, defineArrayMember } from 'sanity'

interface SolutionProductEntry {
  product?: { _ref?: string }
  sizeOptionKey?: string
}

interface ReferencedProduct {
  _id: string
  name?: string
  sizes?: Array<{ _key?: string; label?: string }>
}

interface SolutionValidationClient {
  withConfig(config: { perspective: 'drafts' }): {
    fetch<T>(query: string, params: { productIds: string[] }): Promise<T>
  }
}

interface SolutionValidationContext {
  getClient(config: { apiVersion: string }): SolutionValidationClient
}

function describeSizeOptions(product: ReferencedProduct): string {
  const sizes = product.sizes ?? []
  return sizes.length === 0
    ? 'That product has no Size Options yet.'
    : sizes.map((size) => `${size._key || '(missing key)'} (${size.label || 'unnamed size'})`).join(', ')
}

/**
 * Every entry must name a real Size Option on a real Product, and name it only once.
 *
 * Studio supplies the referenced product records, which keeps this independently testable. The
 * uniqueness rule matters beyond tidiness: the solution page keys each card by
 * `${productId}-${sizeKey}`, which is also the quote-list id, so a repeated pair collides on both.
 */
export function validateSolutionProducts(
  entries: SolutionProductEntry[] | undefined,
  products: ReferencedProduct[]
): true | string {
  if (!entries || entries.length === 0) return true

  const productsById = new Map(products.map((product) => [product._id, product]))
  const seen = new Set<string>()

  for (const entry of entries) {
    const productId = entry.product?._ref
    if (!productId) return 'Each entry needs a Product'

    const product = productsById.get(productId)
    if (!product) return `Product "${productId}" no longer exists`

    if (!entry.sizeOptionKey) {
      return `"${product.name || productId}" needs a Size Option Key. Available: ${describeSizeOptions(product)}`
    }

    if (!(product.sizes ?? []).some((size) => size._key === entry.sizeOptionKey)) {
      return `Size Option "${entry.sizeOptionKey}" does not exist on "${product.name || productId}". Available: ${describeSizeOptions(product)}`
    }

    const pair = `${productId}::${entry.sizeOptionKey}`
    if (seen.has(pair)) {
      return `"${product.name || productId}" at Size Option "${entry.sizeOptionKey}" can be listed only once`
    }
    seen.add(pair)
  }

  return true
}

async function fetchReferencedProducts(
  entries: SolutionProductEntry[] | undefined,
  context: SolutionValidationContext
): Promise<ReferencedProduct[]> {
  const productIds = [
    ...new Set((entries ?? []).map((entry) => entry.product?._ref).filter((id): id is string => Boolean(id)))
  ]
  if (productIds.length === 0) return []

  return context
    .getClient({ apiVersion: '2025-02-19' })
    .withConfig({ perspective: 'drafts' })
    .fetch<ReferencedProduct[]>('*[_id in $productIds]{_id, name, sizes[]{_key, label}}', { productIds })
}

export const solutionType = defineType({
  name: 'solution',
  title: 'Solution',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Solution Name',
      type: 'string',
      description: 'e.g. "Construction Site Setup", "School Expansion", "Event Infrastructure"',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'The public URL for this solution, e.g. /solutions/construction-site-setup',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Displayed under the cover photo and on the solutions listing card.',
      validation: (Rule) => Rule.required().max(500)
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Photo',
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
      ],
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'products',
      title: 'Products in this Solution',
      type: 'array',
      of: [defineArrayMember({ type: 'solutionProduct' })],
      description:
        'Each entry is one Product at one of its Size Options. They appear on the page in this order.',
      validation: (Rule) =>
        Rule.required()
          .min(1)
          .custom(async (entries: SolutionProductEntry[] | undefined, context: SolutionValidationContext) =>
            validateSolutionProducts(entries, await fetchReferencedProducts(entries, context))
          )
    }),
    defineField({
      name: 'body',
      title: 'Page Copy',
      type: 'blockContent',
      description:
        'Long-form copy shown below the products. Optional: Solutions a Legacy URL now redirects to carry its Legacy copy, word for word.'
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
      description: 'Shown as an accordion, and as FAQPage structured data, when there is at least one.'
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Sort weight on the solutions listing (lower numbers appear first).',
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
      order: 'displayOrder',
      products: 'products',
      media: 'coverImage'
    },
    prepare({ title, order, products, media }) {
      const count = (products as unknown[] | undefined)?.length ?? 0
      const orderLabel = order !== undefined ? `[#${order}] ` : ''
      return {
        title: title || 'Unnamed Solution',
        subtitle: `${orderLabel}${count} product${count === 1 ? '' : 's'}`,
        media
      }
    }
  }
})

export default solutionType
