import fs from 'node:fs'
import path from 'node:path'
import { repoPath } from './paths'

/**
 * The frontmatter half of a product copy file.
 *
 * Prose only. Sizes, renders and category references live in the manifest and are never repeated
 * here, so there is nothing for the two files to disagree about.
 */
export interface CopyFrontmatter {
  name: string
  slug: string
  shortDescription: string
  seoTitle: string
  seoDescription: string
  isFeatured: boolean
}

export interface ProductCopy {
  frontmatter: CopyFrontmatter
  /** The markdown body, ready for `markdownToPortableText`. */
  body: string
}

export const COPY_DIR = 'sanity/catalogue/copy'

const REQUIRED_KEYS = ['name', 'slug', 'shortDescription', 'seoTitle', 'seoDescription', 'isFeatured'] as const

const FRONTMATTER_DELIMITER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/**
 * Parse a copy file into frontmatter and body.
 *
 * The frontmatter is a flat list of `key: value` scalars — deliberately, because a copy file that
 * needed nested YAML would be a copy file that had started carrying structure. Values are taken
 * verbatim after the first colon, so a title may contain colons of its own.
 */
export function parseCopyFile(source: string, filename = '<copy>'): ProductCopy {
  const match = FRONTMATTER_DELIMITER.exec(source)
  if (!match) {
    throw new Error(`${filename}: missing the leading --- frontmatter block`)
  }

  const fields = new Map<string, string>()
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    const separator = line.indexOf(':')
    if (separator === -1) {
      throw new Error(`${filename}: frontmatter line is not "key: value" — ${line}`)
    }
    fields.set(line.slice(0, separator).trim(), line.slice(separator + 1).trim())
  }

  const missing = REQUIRED_KEYS.filter((key) => !fields.has(key) || fields.get(key) === '')
  if (missing.length > 0) {
    throw new Error(`${filename}: frontmatter is missing ${missing.join(', ')}`)
  }

  const isFeatured = fields.get('isFeatured')!
  if (isFeatured !== 'true' && isFeatured !== 'false') {
    throw new Error(`${filename}: isFeatured must be true or false, got "${isFeatured}"`)
  }

  const body = source.slice(match[0].length).trim()
  if (body === '') {
    throw new Error(`${filename}: has frontmatter but no body`)
  }

  return {
    frontmatter: {
      name: fields.get('name')!,
      slug: fields.get('slug')!,
      shortDescription: fields.get('shortDescription')!,
      seoTitle: fields.get('seoTitle')!,
      seoDescription: fields.get('seoDescription')!,
      isFeatured: isFeatured === 'true'
    },
    body
  }
}

export function loadCopyFile(copyFile: string): ProductCopy {
  const absolute = repoPath(path.posix.join(COPY_DIR, copyFile))
  return parseCopyFile(fs.readFileSync(absolute, 'utf-8'), copyFile)
}
