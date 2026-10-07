import type { SolutionCopyFields } from './buildSolutionCopy'
import type { SolutionRecord } from './planCoverPatches'

export interface CopyPatch {
  documentId: string
  set: Pick<SolutionCopyFields, 'body'> & Partial<Pick<SolutionCopyFields, 'faqs'>>
  unset: Array<'faqs'>
}

const isDraft = (id: string): boolean => id.startsWith('drafts.')

/**
 * One patch per Solution document (published and draft alike) that has Legacy copy.
 *
 * `body` is replaced whole. `faqs` is set when the Legacy copy had any and unset otherwise, so a
 * re-run always converges on the committed copy files. A pending draft is patched too, or
 * publishing it later would bring back its stale copy. Solutions without Legacy copy are never
 * touched; a Solution with copy but no document fails the run instead of silently skipping it.
 */
export function planCopyPatches(copies: SolutionCopyFields[], solutions: SolutionRecord[]): CopyPatch[] {
  return copies.flatMap((copy) => {
    const documents = solutions
      .filter((solution) => solution.slug === copy.slug)
      .sort((a, b) => Number(isDraft(a._id)) - Number(isDraft(b._id)))
    if (documents.length === 0) throw new Error(`No Solution with slug "${copy.slug}" in the dataset`)

    const hasFaqs = copy.faqs.length > 0
    return documents.map((document) => ({
      documentId: document._id,
      set: hasFaqs ? { body: copy.body, faqs: copy.faqs } : { body: copy.body },
      unset: hasFaqs ? [] : ['faqs' as const]
    }))
  })
}
