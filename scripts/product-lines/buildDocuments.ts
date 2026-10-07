import { validateProductLinePath } from '../../sanity/schemas/objects/productLinePath'
import { isKeptUrl } from '../../shared/migration/keptUrls'
import { buildPageCopy, type FaqItemDocument, type PageCopyOptions } from '../catalogue/lib/pageCopy'
import type { PortableTextBlock } from '../catalogue/lib/portableText'
import type { ProductLineSeed } from './data'

export interface BuildOptions extends PageCopyOptions {
  /** Uploaded image asset id per cover `imagePath`. A dry run passes placeholders. */
  assetIds: Record<string, string>
}

interface Reference {
  _type: 'reference'
  _ref: string
}

export interface ProductLineDocument {
  _id: string
  _type: 'productLine'
  name: string
  path: string
  parent?: Reference
  category?: Reference
  description: string
  coverImage: { _type: 'image'; asset: Reference; alt: string }
  body: PortableTextBlock[]
  faqs?: FaqItemDocument[]
  displayOrder: number
  seo: { _type: 'seo'; metaTitle: string; metaDescription: string }
}

const reference = (id: string): Reference => ({ _type: 'reference', _ref: id })

/**
 * Turn the seeds into `productLine` documents, or throw listing every problem.
 *
 * The seed is held to the same rules Studio enforces (path shape, parent prefix, uniqueness, the
 * block-content whitelist) so nothing reaches the dataset that an editor could not have saved, and
 * every path must be one of the migration's Kept URLs.
 * Keys are deterministic, so re-running produces identical documents.
 */
export function buildProductLineDocuments(
  seeds: ProductLineSeed[],
  options: BuildOptions
): ProductLineDocument[] {
  const problems: string[] = []
  const seedsById = new Map(seeds.map((seed) => [seed.id, seed]))
  const seenPaths = new Set<string>()

  const documents = seeds.map((seed): ProductLineDocument => {
    const report = (problem: string) => problems.push(`${seed.id}: ${problem}`)

    const parent = seed.parentId ? seedsById.get(seed.parentId) : undefined
    if (seed.parentId && !parent) report(`parent "${seed.parentId}" is not a seeded Product Line`)

    const pathCheck = validateProductLinePath(seed.path, {
      parentPath: parent?.path,
      duplicate: seenPaths.has(seed.path)
    })
    if (pathCheck !== true) report(pathCheck)
    else if (!isKeptUrl(seed.path)) report(`"${seed.path}" is not a Kept URL (shared/migration/keptUrls.ts)`)
    seenPaths.add(seed.path)

    if (seed.description.length > 500) report('description is longer than 500 characters')

    const assetId = options.assetIds[seed.cover.imagePath]
    if (!assetId) report(`no uploaded cover for ${seed.cover.imagePath}`)

    const { body, faqs, problems: copyProblems } = buildPageCopy(seed, seed.id, options)
    for (const problem of copyProblems) report(problem)

    return {
      _id: seed.id,
      _type: 'productLine',
      name: seed.name,
      path: seed.path,
      ...(seed.parentId ? { parent: reference(seed.parentId) } : {}),
      ...(seed.categoryId ? { category: reference(seed.categoryId) } : {}),
      description: seed.description,
      coverImage: { _type: 'image', asset: reference(assetId ?? ''), alt: seed.cover.alt },
      body,
      ...(faqs.length > 0 ? { faqs } : {}),
      displayOrder: seed.displayOrder,
      seo: { _type: 'seo', ...seed.seo }
    }
  })

  if (problems.length > 0) {
    throw new Error(`Product Line seeds are invalid:\n  ${problems.join('\n  ')}`)
  }
  return documents
}
