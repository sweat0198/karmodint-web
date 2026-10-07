import { buildPageCopy, type FaqItemDocument, type PageCopyOptions } from '../catalogue/lib/pageCopy'
import type { PortableTextBlock } from '../catalogue/lib/portableText'
import type { SolutionCopy } from './data'

/** The `body` and `faqs` values one Solution gets. */
export interface SolutionCopyFields {
  slug: string
  body: PortableTextBlock[]
  faqs: FaqItemDocument[]
}

/**
 * Convert every Solution's copy files, or throw listing every problem.
 *
 * Held to the same rules as the Product Line seed (block-content whitelist, FAQ answers as
 * paragraphs and lists, internal links in `/` form and never a redirect source). Keys are scoped by
 * slug and deterministic, so a re-run writes identical values.
 */
export function buildSolutionCopy(entries: SolutionCopy[], options: PageCopyOptions): SolutionCopyFields[] {
  const problems: string[] = []
  const seen = new Set<string>()

  const copies = entries.map((entry) => {
    if (seen.has(entry.slug)) problems.push(`${entry.slug}: listed more than once`)
    seen.add(entry.slug)

    const { body, faqs, problems: copyProblems } = buildPageCopy(entry, entry.slug, options)
    for (const problem of copyProblems) problems.push(`${entry.slug}: ${problem}`)
    return { slug: entry.slug, body, faqs }
  })

  if (problems.length > 0) {
    throw new Error(`Solution copy is invalid:\n  ${problems.join('\n  ')}`)
  }
  return copies
}
