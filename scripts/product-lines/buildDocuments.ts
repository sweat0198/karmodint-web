import { validateProductLinePath } from '../../sanity/schemas/objects/productLinePath'
import { isKeptUrl } from '../../shared/migration/keptUrls'
import { isSitePath } from '../../shared/utils/sitePath'
import {
  markdownToPortableText,
  validatePortableText,
  type PortableTextBlock
} from '../catalogue/lib/portableText'
import type { ProductLineSeed } from './data'

export interface BuildOptions {
  /** Reads a repo-relative copy file. */
  readFile: (path: string) => string
  /** Uploaded image asset id per cover `imagePath`. A dry run passes placeholders. */
  assetIds: Record<string, string>
  /** Legacy URLs that redirect; ported copy must not link them. */
  redirectSources: Set<string>
}

interface Reference {
  _type: 'reference'
  _ref: string
}

export interface FaqItemDocument {
  _key: string
  _type: 'faqItem'
  question: string
  answer: PortableTextBlock[]
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

/** One `## question` section per FAQ; everything up to the next `## ` line is its answer. */
export function parseFaqMarkdown(markdown: string): Array<{ question: string; answer: string }> {
  const sections = markdown.split(/^## /m).slice(1)
  return sections.map((section) => {
    const newline = section.indexOf('\n')
    const question = (newline === -1 ? section : section.slice(0, newline)).trim()
    const answer = newline === -1 ? '' : section.slice(newline + 1).trim()
    return { question, answer }
  })
}

const reference = (id: string): Reference => ({ _type: 'reference', _ref: id })

function linkProblems(blocks: PortableTextBlock[], redirectSources: Set<string>): string[] {
  const problems: string[] = []
  for (const block of blocks) {
    for (const markDef of block.markDefs ?? []) {
      const href = markDef.href ?? ''
      if (!href.startsWith('/')) continue
      const pathname = href.split(/[?#]/)[0]
      if (!isSitePath(pathname)) problems.push(`link "${href}" must end in "/" (ADR-003)`)
      if (redirectSources.has(pathname)) {
        problems.push(`link "${pathname}" is a redirect source; link its target instead`)
      }
    }
  }
  return problems
}

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

    const body = markdownToPortableText(options.readFile(seed.copyPath), seed.id)
    if (body.length === 0) report(`${seed.copyPath} has no copy`)
    for (const problem of validatePortableText(body)) report(`body ${problem}`)
    for (const problem of linkProblems(body, options.redirectSources)) report(`body ${problem}`)

    const faqs = seed.faqsPath
      ? parseFaqMarkdown(options.readFile(seed.faqsPath)).map((faq, index): FaqItemDocument => {
          const answer = markdownToPortableText(faq.answer, `${seed.id}-faq-${index}`)
          if (!faq.question || answer.length === 0) report(`FAQ ${index + 1} needs a question and an answer`)
          for (const problem of validatePortableText(answer)) report(`FAQ ${index + 1} ${problem}`)
          if (answer.some((block) => block.style !== undefined && block.style !== 'normal')) {
            report(`FAQ ${index + 1} answer may only hold paragraphs and lists`)
          }
          for (const problem of linkProblems(answer, options.redirectSources)) report(`FAQ ${index + 1} ${problem}`)
          return { _key: `faq-${index}`, _type: 'faqItem', question: faq.question, answer }
        })
      : []

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
