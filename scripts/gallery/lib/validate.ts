import {
  GALLERY_SOURCE_ROOT,
  KEBAB_CASE,
  assetFilePath,
  categoryKey,
  heroEligibility,
  isGalleryFamily,
  isGalleryFlag,
  isGalleryRole,
  sameCategory,
  uploadEligibility,
  type GalleryCategory,
  type GalleryClassification,
  type GalleryManifestItem
} from './model'

/**
 * Every invariant the gallery package depends on, returned as a list of human-readable problems.
 *
 * Returned rather than thrown, matching `scripts/catalogue/lib/manifest.ts`: a 298-row audit with
 * four mistakes should report four mistakes, not the first one and a re-run.
 */

const CONFIDENCES = ['high', 'medium', 'low']
const RIGHTS_STATUSES = ['unknown', 'review-required']
const SHA256_HEX = /^[0-9a-f]{64}$/

/** Printable ASCII only. Prose in this package is English, so a Turkish letter is a mistake. */
const NON_ENGLISH = /[^\x20-\x7E]/

/**
 * Values that must never reach a tracked artefact.
 *
 * A decimal coordinate pair and a long digit run are what a pasted EXIF dump looks like, and the
 * whole point of the split is that precise location and camera identity stay in the ignored copies.
 */
const COORDINATE_PAIR = /-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}/
const LONG_DIGIT_RUN = /\d{8,}/
const ABSOLUTE_PATH = /^(?:\/|[A-Za-z]:[\\/])|(?:^|[\s"'(])\/Users\//

/** Keys a manifest item may carry. Anything else is metadata that escaped its layer. */
const MANIFEST_KEYS = new Set([
  'assetId', 'sha256', 'filePath', 'sourcePath', 'sourceAliases', 'family', 'useCase', 'project',
  'categories', 'title', 'alt', 'caption', 'order', 'role', 'confidence', 'flags', 'rightsStatus',
  'uploadEligible', 'heroEligible', 'possibleDuplicateAssetIds', 'format', 'width', 'height',
  'byteSize', 'capturedAt', 'hasExif'
])

/** Source-relative, `/`-separated, NFC, and unable to climb out of the source root. */
function sourcePathProblem(value: string): string | null {
  if (typeof value !== 'string' || value.trim() === '') return 'must be a non-empty string'
  if (value.startsWith('/') || /^[A-Za-z]:[\\/]/.test(value)) return 'must be source-relative, not absolute'
  if (value.includes('\\')) return 'must use "/" separators'
  if (value.split('/').some((segment) => segment === '..' || segment === '.' || segment === '')) {
    return 'must be a normalised path without "." or ".." segments'
  }
  if (value.normalize('NFC') !== value) return 'must be NFC-normalised'
  return null
}

function categoryProblems(category: GalleryCategory, where: string, field: string): string[] {
  const problems: string[] = []
  if (!isGalleryFamily(category.family)) {
    problems.push(`${where} ${field}family "${category.family}" is outside the approved taxonomy`)
  }
  if (!KEBAB_CASE.test(category.useCase)) {
    problems.push(`${where} ${field}useCase "${category.useCase}" must be kebab-case`)
  }
  if (!KEBAB_CASE.test(category.project)) {
    problems.push(`${where} ${field}project "${category.project}" must be kebab-case`)
  }
  return problems
}

function proseProblems(row: { title: string, alt: string, caption?: string }, where: string): string[] {
  const problems: string[] = []

  for (const field of ['title', 'alt'] as const) {
    const value = row[field]
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`${where} ${field} is required — every asset needs English prose`)
    } else if (NON_ENGLISH.test(value)) {
      problems.push(`${where} ${field} must be English ASCII prose, not the source language`)
    }
  }

  if (row.caption !== undefined) {
    if (row.caption.trim() === '') {
      problems.push(`${where} caption must be omitted rather than empty`)
    } else if (NON_ENGLISH.test(row.caption)) {
      problems.push(`${where} caption must be English ASCII prose, not the source language`)
    }
  }

  return problems
}

function flagAndRoleProblems(
  row: { role: string, flags: string[], confidence: string, rightsStatus: string },
  where: string
): string[] {
  const problems: string[] = []

  if (!isGalleryRole(row.role)) problems.push(`${where} role "${row.role}" is not a known role`)

  const seenFlags = new Set<string>()
  for (const flag of row.flags) {
    if (!isGalleryFlag(flag)) problems.push(`${where} flag "${flag}" is not a known flag`)
    if (seenFlags.has(flag)) problems.push(`${where} flag "${flag}" is repeated`)
    seenFlags.add(flag)
  }

  if (!CONFIDENCES.includes(row.confidence)) {
    problems.push(`${where} confidence "${row.confidence}" must be high, medium or low`)
  }
  if (!RIGHTS_STATUSES.includes(row.rightsStatus)) {
    problems.push(`${where} rightsStatus "${row.rightsStatus}" must be unknown or review-required`)
  }

  return problems
}

/** Secondary categories add classifications; repeating the primary one adds nothing. */
function secondaryCategoryProblems(
  primary: GalleryCategory,
  categories: GalleryCategory[],
  where: string
): string[] {
  const problems: string[] = []
  const seen = new Set<string>()

  for (const [index, extra] of categories.entries()) {
    problems.push(...categoryProblems(extra, where, `categories[${index}].`))

    const key = categoryKey(extra)
    if (sameCategory(extra, primary)) {
      problems.push(`${where} categories[${index}] repeats the primary category "${key}"`)
    }
    if (seen.has(key)) {
      problems.push(`${where} categories lists "${key}" twice`)
    }
    seen.add(key)
  }

  return problems
}

/** Human decisions, checked before anything reads a byte off disk. */
export function validateClassifications(rows: GalleryClassification[]): string[] {
  const problems: string[] = []
  const seenPaths = new Set<string>()

  for (const row of rows) {
    const where = `${row.sourcePath}:`

    const pathProblem = sourcePathProblem(row.sourcePath)
    if (pathProblem) problems.push(`${where} sourcePath ${pathProblem}`)

    if (seenPaths.has(row.sourcePath)) {
      problems.push(`${where} sourcePath is classified more than once`)
    }
    seenPaths.add(row.sourcePath)

    problems.push(...categoryProblems(row, where, ''))
    problems.push(...secondaryCategoryProblems(row, row.categories, where))
    problems.push(...proseProblems(row, where))
    problems.push(...flagAndRoleProblems(row, where))

    if (!Number.isInteger(row.order) || row.order < 1) {
      problems.push(`${where} order must be a positive integer (found ${row.order})`)
    }

    const links = row.possibleDuplicateSources ?? []
    const seenLinks = new Set<string>()
    for (const link of links) {
      const linkProblem = sourcePathProblem(link)
      if (linkProblem) problems.push(`${where} possibleDuplicateSources "${link}" ${linkProblem}`)
      if (link === row.sourcePath) {
        problems.push(`${where} possibleDuplicateSources points at itself`)
      }
      if (seenLinks.has(link)) {
        problems.push(`${where} possibleDuplicateSources lists "${link}" twice`)
      }
      seenLinks.add(link)
    }
  }

  const known = new Set(rows.map((row) => row.sourcePath))
  for (const row of rows) {
    for (const link of row.possibleDuplicateSources ?? []) {
      if (!known.has(link)) {
        problems.push(`${row.sourcePath}: possibleDuplicateSources "${link}" is not a classified source`)
      }
    }
  }

  return problems
}

/** Walks every string a manifest item carries, so a leak cannot hide in an array or a nested category. */
function* strings(value: unknown, trail: string): Generator<[string, string]> {
  if (typeof value === 'string') {
    yield [trail, value]
  } else if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) yield* strings(entry, `${trail}[${index}]`)
  } else if (value !== null && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) yield* strings(entry, `${trail}.${key}`)
  }
}

/** The generated manifest, checked before it replaces the tracked one. */
export function validateManifest(items: GalleryManifestItem[]): string[] {
  const problems: string[] = []
  const seenAssetIds = new Set<string>()
  const seenFilePaths = new Set<string>()
  /** Source path -> the item that claims it, canonical or alias. A file belongs to exactly one asset. */
  const sourceOwners = new Map<string, string>()

  for (const item of items) {
    const where = `${item.filePath}:`

    if (!SHA256_HEX.test(item.sha256)) {
      problems.push(`${where} sha256 must be 64 lowercase hex characters`)
    }
    if (item.assetId !== `sha256:${item.sha256}`) {
      problems.push(`${where} assetId "${item.assetId}" does not match its sha256`)
    }
    if (seenAssetIds.has(item.assetId)) {
      problems.push(`${where} assetId "${item.assetId}" appears twice — exact duplicates must collapse`)
    }
    seenAssetIds.add(item.assetId)

    problems.push(...categoryProblems(item, where, ''))
    problems.push(...secondaryCategoryProblems(item, item.categories, where))
    problems.push(...proseProblems(item, where))
    problems.push(...flagAndRoleProblems(item, where))

    if (!Number.isInteger(item.order) || item.order < 1) {
      problems.push(`${where} order must be a positive integer (found ${item.order})`)
    }

    if (!item.filePath.startsWith(`${GALLERY_SOURCE_ROOT}/`)) {
      problems.push(`${where} filePath must sit under ${GALLERY_SOURCE_ROOT}/`)
    } else {
      const expected = assetFilePath(item, item.order, item.format)
      if (item.filePath !== expected) {
        problems.push(`${where} filePath must be "${expected}" — it is derived from taxonomy, order and decoded format`)
      }
    }
    if (seenFilePaths.has(item.filePath)) {
      problems.push(`${where} filePath is claimed by two assets`)
    }
    seenFilePaths.add(item.filePath)

    for (const source of [item.sourcePath, ...item.sourceAliases]) {
      const pathProblem = sourcePathProblem(source)
      if (pathProblem) problems.push(`${where} sourcePath "${source}" ${pathProblem}`)

      const owner = sourceOwners.get(source)
      if (owner) problems.push(`${where} source "${source}" is already represented by ${owner}`)
      sourceOwners.set(source, item.filePath)
    }

    if (item.uploadEligible !== uploadEligibility(item.rightsStatus)) {
      problems.push(
        `${where} uploadEligible must be ${uploadEligibility(item.rightsStatus)} for rightsStatus `
        + `"${item.rightsStatus}" — review-required assets never upload automatically`
      )
    }
    if (item.heroEligible !== heroEligibility(item.flags, item.role)) {
      problems.push(
        `${where} heroEligible must be ${heroEligibility(item.flags, item.role)} for role `
        + `"${item.role}" with flags [${item.flags.join(', ')}]`
      )
    }

    for (const link of item.possibleDuplicateAssetIds) {
      if (!/^sha256:[0-9a-f]{64}$/.test(link)) {
        problems.push(`${where} possibleDuplicateAssetIds "${link}" is not an asset id`)
      }
      if (link === item.assetId) {
        problems.push(`${where} possibleDuplicateAssetIds points at itself`)
      }
    }

    for (const dimension of ['width', 'height', 'byteSize'] as const) {
      if (!Number.isInteger(item[dimension]) || item[dimension] < 1) {
        problems.push(`${where} ${dimension} must be a positive integer (found ${item[dimension]})`)
      }
    }

    for (const key of Object.keys(item)) {
      if (!MANIFEST_KEYS.has(key)) {
        problems.push(`${where} carries "${key}", which the manifest shape does not allow — capture metadata stays in the ignored copies`)
      }
    }

    for (const [trail, value] of strings(item, '')) {
      const field = trail.replace(/^\./, '')
      if (ABSOLUTE_PATH.test(value)) {
        problems.push(`${where} ${field} contains an absolute path — tracked artefacts stay machine-independent`)
      }
      if (COORDINATE_PAIR.test(value)) {
        problems.push(`${where} ${field} contains GPS coordinates — only the gps-metadata flag belongs here`)
      }
      if (
        LONG_DIGIT_RUN.test(value)
        && field !== 'sha256'
        && !field.startsWith('assetId')
        && !field.startsWith('possibleDuplicateAssetIds')
        && !field.startsWith('sourcePath')
        && !field.startsWith('sourceAliases')
        && !field.startsWith('filePath')
      ) {
        problems.push(`${where} ${field} contains a serial-length digit run — only the camera-serial-metadata flag belongs here`)
      }
    }
  }

  return problems
}
