import { defineArrayMember, defineField, defineType } from 'sanity'
import { isStudioAdmin, validateProductLinePath, type StudioUser } from './objects/productLinePath'

interface ProductLinePathDocument {
  _id?: string
  parent?: { _ref?: string }
}

interface ProductLinePathClient {
  withConfig(config: { perspective: 'raw' }): {
    fetch<T>(query: string, params: { parentId: string; path: string; id: string }): Promise<T>
  }
}

export interface ProductLinePathValidationContext {
  document?: ProductLinePathDocument
  getClient(config: { apiVersion: string }): ProductLinePathClient
}

/**
 * The parent's path (its draft wins, since that is what the editor sees), whether any other
 * Product Line, draft or published, already holds `$path`, and the paths of this Product Line's
 * children (a child's draft wins over its published version). The document's own two versions are
 * excluded from the duplicate count, or every saved Product Line would collide with itself.
 */
const PATH_CONTEXT_QUERY = `{
  "parentPath": coalesce(
    *[_id == "drafts." + $parentId][0].path,
    *[_id == $parentId][0].path
  ),
  "duplicate": count(*[
    _type == "productLine" && path == $path && !(_id in [$id, "drafts." + $id])
  ]) > 0,
  "childPaths": *[
    _type == "productLine" && parent._ref == $id && defined(path) &&
    (_id in path("drafts.**") || !defined(*[_id == "drafts." + ^._id][0]._id))
  ].path
}`

/**
 * Studio's check on `path`: shape first, then the rules that need the dataset (uniqueness, the
 * parent's prefix, and the children kept under it). The pure rules live in
 * `objects/productLinePath.ts`, which the seed script shares.
 *
 * This and the admin-only `readOnly` lock run in the Studio form only. An API write (a script with
 * a write token) bypasses both, so nothing stops it moving a Kept URL (docs/LAUNCH_CHECKLIST.md).
 */
export async function checkProductLinePath(
  path: string | undefined,
  context: ProductLinePathValidationContext
): Promise<true | string> {
  const shape = validateProductLinePath(path)
  if (shape !== true) return shape

  const id = (context.document?._id ?? '').replace(/^drafts\./, '')
  const parentId = context.document?.parent?._ref ?? ''
  if (parentId && parentId === id) return 'A Product Line cannot be its own parent'

  const { parentPath, duplicate, childPaths } = await context
    .getClient({ apiVersion: '2025-02-19' })
    .withConfig({ perspective: 'raw' })
    .fetch<{ parentPath: string | null; duplicate: boolean; childPaths: string[] | null }>(PATH_CONTEXT_QUERY, {
      parentId,
      path: path!,
      id
    })

  if (parentId && !parentPath) return 'Set a path on the parent Product Line first'

  return validateProductLinePath(path, { parentPath, duplicate, childPaths: childPaths ?? [] })
}

/**
 * A Product Line page (ADR-004): one Kept URL presenting one construction type of unit, e.g.
 * `/grp-kiosk-cabin/`. Separate from `solution` because its URL is a fixed Legacy path, it nests
 * under a parent, it never appears in the `/solutions/` listing, and a hub has no products.
 */
export const productLineType = defineType({
  name: 'productLine',
  title: 'Product Line',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'The page heading (H1), and its label in menus and breadcrumbs.',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'path',
      title: 'Path',
      type: 'string',
      description:
        'The Kept URL this page is served at, e.g. "/portable-cabin/steel-cabin/". It must never move, so only a Studio admin can change it.',
      readOnly: ({ currentUser }: { currentUser?: StudioUser | null }) => !isStudioAdmin(currentUser),
      validation: (Rule) =>
        Rule.required().custom((path: string | undefined, context) =>
          checkProductLinePath(path, context as unknown as ProductLinePathValidationContext)
        )
    }),
    defineField({
      name: 'parent',
      title: 'Parent Product Line',
      type: 'reference',
      to: [{ type: 'productLine' }],
      description: 'Leave empty for a top-level page. A child page’s path sits under its parent’s path.'
    }),
    defineField({
      name: 'category',
      title: 'Catalogue Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description:
        'The page lists every product in this category and its subcategories. Leave empty for a hub page with no product grid.'
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      description: 'Displayed under the heading.',
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
      name: 'body',
      title: 'Page Copy',
      type: 'blockContent',
      description: 'The Legacy copy, word for word.',
      validation: (Rule) => Rule.required()
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
      description: 'Sort weight in the footer list (lower numbers appear first).',
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
      title: 'Path',
      name: 'pathAsc',
      by: [{ field: 'path', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'name',
      path: 'path',
      media: 'coverImage'
    },
    prepare({ title, path, media }) {
      return {
        title: title || 'Unnamed Product Line',
        subtitle: path,
        media
      }
    }
  }
})

export default productLineType
