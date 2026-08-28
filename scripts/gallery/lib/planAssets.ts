import {
  GALLERY_FLAGS,
  METADATA_FLAG_BY_SCAN_FIELD,
  assetFilePath,
  categoryKey,
  heroEligibility,
  sameCategory,
  uploadEligibility,
  type GalleryCategory,
  type GalleryClassification,
  type GalleryFlag,
  type GalleryManifestItem,
  type ScannedImage
} from './model'

/**
 * Turn "what is on disk" plus "what a human decided" into the canonical asset list.
 *
 * Pure: no file is read, written or copied here. That separation is what lets the dry run be a
 * genuine rehearsal — the plan a `--write` run executes is the same object a dry run prints.
 */

interface DuplicateGroup {
  sha256: string
  members: { scan: ScannedImage, row: GalleryClassification }[]
  canonical: { scan: ScannedImage, row: GalleryClassification }
}

export function planGalleryAssets(
  scanned: ScannedImage[],
  classifications: GalleryClassification[]
): GalleryManifestItem[] {
  const rows = new Map(classifications.map((row) => [row.sourcePath, row]))
  const scans = new Map(scanned.map((image) => [image.sourcePath, image]))

  reconcile(scanned, classifications, rows, scans)

  const groups = groupByHash(scanned, rows)
  const assetIdBySource = new Map<string, `sha256:${string}`>()
  for (const group of groups) {
    for (const member of group.members) {
      assetIdBySource.set(member.scan.sourcePath, `sha256:${group.sha256}`)
    }
  }

  const items = groups.map((group) => toManifestItem(group, assetIdBySource))

  assertNoCollisions(items)

  return items.sort((a, b) =>
    a.family.localeCompare(b.family, 'en')
    || a.useCase.localeCompare(b.useCase, 'en')
    || a.project.localeCompare(b.project, 'en')
    || a.order - b.order
    || a.assetId.localeCompare(b.assetId, 'en'))
}

/**
 * Every scanned file must have a decision, and every decision must have a file.
 *
 * A stale row is as dangerous as a missing one: it usually means a source file was renamed outside
 * the repo, and silently dropping it would quietly shrink the package by one photo.
 */
function reconcile(
  scanned: ScannedImage[],
  classifications: GalleryClassification[],
  rows: Map<string, GalleryClassification>,
  scans: Map<string, ScannedImage>
): void {
  const problems: string[] = []

  for (const image of scanned) {
    if (!rows.has(image.sourcePath)) {
      problems.push(`${image.sourcePath}: scanned but not classified`)
    }
  }
  for (const row of classifications) {
    if (!scans.has(row.sourcePath)) {
      problems.push(`${row.sourcePath}: classified but not present in the source folder`)
    }
    for (const link of row.possibleDuplicateSources ?? []) {
      if (!scans.has(link)) {
        problems.push(`${row.sourcePath}: possibleDuplicateSources names "${link}", which was not scanned`)
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Classification does not match the source folder:\n  ${problems.join('\n  ')}`)
  }
}

/** One group per distinct SHA-256. Byte-identical files are one asset, however many copies exist. */
function groupByHash(
  scanned: ScannedImage[],
  rows: Map<string, GalleryClassification>
): DuplicateGroup[] {
  const byHash = new Map<string, { scan: ScannedImage, row: GalleryClassification }[]>()

  for (const image of scanned) {
    const member = { scan: image, row: rows.get(image.sourcePath)! }
    byHash.set(image.sha256, [...(byHash.get(image.sha256) ?? []), member])
  }

  const problems: string[] = []
  const groups: DuplicateGroup[] = []

  for (const [sha256, members] of byHash) {
    const preferred = members.filter((member) => member.row.preferredCanonical === true)
    const where = members.map((member) => member.scan.sourcePath).join(', ')

    if (members.length === 1) {
      if (preferred.length > 0) {
        problems.push(`${where}: preferredCanonical is set on an image with no exact duplicate`)
      }
      groups.push({ sha256, members, canonical: members[0]! })
      continue
    }

    if (preferred.length !== 1) {
      problems.push(
        `${where}: an exact duplicate group needs exactly one preferredCanonical row `
        + `(found ${preferred.length})`
      )
      continue
    }

    groups.push({ sha256, members, canonical: preferred[0]! })
  }

  if (problems.length > 0) {
    throw new Error(`Exact duplicate groups are unresolved:\n  ${problems.join('\n  ')}`)
  }

  return groups
}

function toManifestItem(
  group: DuplicateGroup,
  assetIdBySource: Map<string, `sha256:${string}`>
): GalleryManifestItem {
  const { canonical, members } = group
  const { row, scan } = canonical
  const assetId: `sha256:${string}` = `sha256:${group.sha256}`

  const possibleDuplicateAssetIds = [...new Set(
    members
      .flatMap((member) => member.row.possibleDuplicateSources ?? [])
      .map((source) => assetIdBySource.get(source)!)
      .filter((id) => id !== assetId)
  )].sort()

  // A duplicate's non-canonical half was still classified, so its own taxonomy position is a real
  // secondary classification — dropping it would lose the reason the file existed in two folders.
  const categories = mergeCategories(row, [
    ...members.flatMap((member) => member.row.categories),
    ...members.filter((member) => member !== canonical).map((member) => member.row)
  ])

  const flags = mergeFlags([
    ...members.flatMap((member) => member.row.flags),
    ...derivedFlags(scan),
    ...(possibleDuplicateAssetIds.length > 0 ? (['possible-duplicate'] as const) : [])
  ])

  // Strictest posture wins: if either copy of a file needs review, the surviving copy needs review.
  const rightsStatus = members.some((member) => member.row.rightsStatus === 'review-required')
    ? 'review-required'
    : row.rightsStatus

  return {
    assetId,
    sha256: group.sha256,
    filePath: assetFilePath(row, row.order, scan.format),
    sourcePath: row.sourcePath,
    sourceAliases: members
      .filter((member) => member !== canonical)
      .map((member) => member.scan.sourcePath)
      .sort((a, b) => a.localeCompare(b, 'en')),
    family: row.family,
    useCase: row.useCase,
    project: row.project,
    categories,
    title: row.title,
    alt: row.alt,
    ...(row.caption === undefined ? {} : { caption: row.caption }),
    order: row.order,
    role: row.role,
    confidence: row.confidence,
    flags,
    rightsStatus,
    uploadEligible: uploadEligibility(rightsStatus),
    heroEligible: heroEligibility(flags, row.role),
    possibleDuplicateAssetIds,
    format: scan.format,
    width: scan.width,
    height: scan.height,
    byteSize: scan.byteSize,
    ...(scan.capturedAt === undefined ? {} : { capturedAt: scan.capturedAt }),
    hasExif: scan.hasExif
  }
}

/** Secondary classifications, deduplicated and never repeating the primary one. */
function mergeCategories(primary: GalleryCategory, extras: GalleryCategory[]): GalleryCategory[] {
  const merged = new Map<string, GalleryCategory>()

  for (const extra of extras) {
    const category: GalleryCategory = {
      family: extra.family,
      useCase: extra.useCase,
      project: extra.project
    }
    if (sameCategory(category, primary)) continue
    merged.set(categoryKey(category), category)
  }

  return [...merged.values()].sort((a, b) => categoryKey(a).localeCompare(categoryKey(b), 'en'))
}

/** Flags in vocabulary order, so a re-run of the pipeline cannot reshuffle a tracked line. */
function mergeFlags(flags: readonly GalleryFlag[]): GalleryFlag[] {
  const present = new Set(flags)
  return GALLERY_FLAGS.filter((flag) => present.has(flag))
}

/** Capture-metadata warnings, read off the bytes rather than transcribed by a human. */
function derivedFlags(scan: ScannedImage): GalleryFlag[] {
  return Object.entries(METADATA_FLAG_BY_SCAN_FIELD)
    .filter(([field]) => scan[field as keyof typeof METADATA_FLAG_BY_SCAN_FIELD])
    .map(([, flag]) => flag)
}

/** Two assets cannot share a file, and two photos in one project cannot share a sequence number. */
function assertNoCollisions(items: GalleryManifestItem[]): void {
  const problems: string[] = []
  const owners = new Map<string, string>()
  const orders = new Map<string, string>()

  for (const item of items) {
    const owner = owners.get(item.filePath)
    if (owner) {
      problems.push(`${item.filePath}: planned for both ${owner} and ${item.sourcePath}`)
    }
    owners.set(item.filePath, item.sourcePath)

    const orderKey = `${categoryKey(item)}#${item.order}`
    const holder = orders.get(orderKey)
    if (holder) {
      problems.push(
        `${categoryKey(item)}: order ${item.order} is claimed by both ${holder} and ${item.sourcePath}`
      )
    }
    orders.set(orderKey, item.sourcePath)
  }

  if (problems.length > 0) {
    throw new Error(`Planned output collides:\n  ${problems.join('\n  ')}`)
  }
}
