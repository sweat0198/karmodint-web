import { isSitePath } from '../../../shared/utils/sitePath'
import { markdownToPortableText, validatePortableText, type PortableTextBlock } from './portableText'

/**
 * Ported Legacy copy: a body markdown file and an optional FAQ markdown file, turned into the
 * `body` (blockContent) and `faqs` (faqItem[]) fields Product Lines and Solutions share.
 *
 * Body: h2/h3, lists, bold/italic and links; no images, no H1. FAQs: one `## question` section per
 * FAQ, its answer in paragraphs and lists only.
 */
export interface PageCopySource {
  copyPath: string
  faqsPath?: string
}

export interface PageCopyOptions {
  /** Reads a repo-relative copy file. */
  readFile: (path: string) => string
  /** Legacy URLs that redirect; ported copy must not link them. */
  redirectSources: Set<string>
}

export interface FaqItemDocument {
  _key: string
  _type: 'faqItem'
  question: string
  answer: PortableTextBlock[]
}

export interface PageCopy {
  body: PortableTextBlock[]
  faqs: FaqItemDocument[]
  /** Every rule the copy breaks; empty when it is fit to write. */
  problems: string[]
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
 * Convert one page's copy files, collecting every problem rather than stopping at the first.
 *
 * The copy is held to what Studio would accept (the block-content whitelist), FAQ answers to
 * paragraphs and lists, and internal links to the `/` form and never a redirect source, since each
 * such link would cost a 301 hop. `keyPrefix` scopes the deterministic block keys to one document.
 */
export function buildPageCopy(source: PageCopySource, keyPrefix: string, options: PageCopyOptions): PageCopy {
  const problems: string[] = []

  const body = markdownToPortableText(options.readFile(source.copyPath), keyPrefix)
  if (body.length === 0) problems.push(`${source.copyPath} has no copy`)
  for (const problem of validatePortableText(body)) problems.push(`body ${problem}`)
  for (const problem of linkProblems(body, options.redirectSources)) problems.push(`body ${problem}`)

  const faqs = source.faqsPath
    ? parseFaqMarkdown(options.readFile(source.faqsPath)).map((faq, index): FaqItemDocument => {
        const answer = markdownToPortableText(faq.answer, `${keyPrefix}-faq-${index}`)
        if (!faq.question || answer.length === 0) problems.push(`FAQ ${index + 1} needs a question and an answer`)
        for (const problem of validatePortableText(answer)) problems.push(`FAQ ${index + 1} ${problem}`)
        if (answer.some((block) => block.style !== undefined && block.style !== 'normal')) {
          problems.push(`FAQ ${index + 1} answer may only hold paragraphs and lists`)
        }
        for (const problem of linkProblems(answer, options.redirectSources)) problems.push(`FAQ ${index + 1} ${problem}`)
        return { _key: `faq-${index}`, _type: 'faqItem', question: faq.question, answer }
      })
    : []

  return { body, faqs, problems }
}
