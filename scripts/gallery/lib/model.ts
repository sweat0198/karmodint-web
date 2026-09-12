/**
 * The gallery package's vocabulary.
 *
 * These photos are project photography, not product renders, so they deliberately share nothing
 * with `scripts/catalogue/`'s view vocabulary or Sanity asset ids. The package is schema-neutral:
 * a later gallery importer reads `manifest.json` and decides for itself what a document looks like.
 */

/**
 * Product families a photo can belong to.
 *
 * Closed, because a new family is a taxonomy decision that should surface as a failing validation
 * rather than as a new directory nobody reviewed. `others` is the honest answer when the family
 * cannot be proven from the photo — it is not a bucket for "not yet sorted".
 */
export const GALLERY_FAMILIES = [
  'containers',
  'prefabricated-houses',
  'cabins',
  'prefabricated-buildings',
  'steel-houses',
  'others'
] as const

export type GalleryFamily = typeof GALLERY_FAMILIES[number]

export type ClassificationConfidence = 'high' | 'medium' | 'low'

/**
 * Rights posture.
 *
 * `unknown` is the floor, not a pass: it records only that nobody has raised a concern, which is
 * where a photo sits until someone looks. `review-required` is the one status that blocks upload.
 *
 * `cleared` is the outcome of that look — provenance queried and confirmed with the owner of the
 * photograph — and exists so a settled question is not re-opened, and is never read as the mere
 * silence of `unknown`. Nothing reaches it without the evidence recorded beside the row, which is
 * what the `caption` field is for.
 */
export type RightsStatus = 'unknown' | 'review-required' | 'cleared'

export const GALLERY_ROLES = [
  'hero',
  'alternate-exterior',
  'aerial-context',
  'interior-wide',
  'interior-detail',
  'construction-progress',
  'transport-loading',
  'secondary'
] as const

export type GalleryRole = typeof GALLERY_ROLES[number]

export const GALLERY_FLAGS = [
  'low-resolution',
  'portrait',
  'nonstandard-aspect',
  'soft-or-hazy',
  'dark',
  'construction-progress',
  'overlay-or-watermark',
  'possible-duplicate',
  'people-or-privacy',
  'misclassified-source',
  'gps-metadata',
  'camera-serial-metadata',
  'exif-comment-metadata'
] as const

export type GalleryFlag = typeof GALLERY_FLAGS[number]

/**
 * Flags that disqualify a photo from leading a gallery.
 *
 * A flagged photo is still copied and still published-eligible — it simply cannot be the first
 * thing a visitor sees. `dark` and `people-or-privacy` are absent on purpose: darkness is a look,
 * and privacy is handled by `rightsStatus`, which blocks upload entirely rather than demoting.
 */
export const HERO_BLOCKING_FLAGS: readonly GalleryFlag[] = [
  'low-resolution',
  'portrait',
  'nonstandard-aspect',
  'soft-or-hazy',
  'construction-progress',
  'overlay-or-watermark'
]

/** Decoded formats the package accepts. Derived from pixels, never from a filename suffix. */
export type GalleryFormat = 'jpeg' | 'png'

/** File suffix a decoded format is written under. JPEG's four source spellings all normalise here. */
export const FORMAT_EXTENSION: Record<GalleryFormat, string> = {
  jpeg: 'jpg',
  png: 'png'
}

/** Repo-relative root the copied binaries live under. Git-ignored; the metadata beside it is not. */
export const GALLERY_SOURCE_ROOT = 'sanity/gallery/source'

/**
 * How much of one external folder belongs to the package.
 *
 * `all` is the posture for a folder that was assembled *as* the gallery's library: every image in
 * it is one somebody chose to hand over, so a file with no classification row is a file nobody
 * reviewed, and preparation stops. `classified` is the posture for a working archive that was never
 * assembled for us — a job folder holding every frame of a shoot — where the classification is the
 * pick list, and a file it does not name is simply not ours.
 *
 * The choice is per folder rather than global on purpose: relaxing the completeness check
 * everywhere would let a photo drop silently out of the library it was chosen for.
 */
export type GallerySourceScope = 'all' | 'classified'

/** One external folder the package reads photos out of. */
export interface GallerySourceRoot {
  /** Absolute path of the folder. Never stored in a tracked artefact. */
  path: string
  scope: GallerySourceScope
}

/**
 * One position in the taxonomy.
 *
 * `family` is closed; `useCase` and `project` are validated kebab-case strings so the taxonomy can
 * grow — a new use case or customer arrives with photography, not with a code release.
 */
export interface GalleryCategory {
  family: GalleryFamily
  useCase: string
  /** Customer or site slug, or `others` where identity cannot be proven. Never invented. */
  project: string
}

/**
 * A human decision about one source image, tracked in `sanity/gallery/classification.json`.
 *
 * There is one row per *source* file, including both halves of an exact duplicate pair — the
 * planner collapses those, but the audit record stays complete so a reviewer can see every file
 * that was looked at.
 */
export interface GalleryClassification extends GalleryCategory {
  /** Source-relative path, `/`-separated and NFC-normalised. Identifies the row. */
  sourcePath: string
  /** Additional valid classifications. The primary one above is where the file physically lands. */
  categories: GalleryCategory[]
  title: string
  alt: string
  caption?: string
  /** Position within the physical project group. Explicit, never inferred from directory order. */
  order: number
  role: GalleryRole
  confidence: ClassificationConfidence
  flags: GalleryFlag[]
  rightsStatus: RightsStatus
  /** Set on exactly one row of each exact-duplicate group: the one whose bytes are kept. */
  preferredCanonical?: boolean
  /** Source paths this image is visually near — re-encodes, crops, burst neighbours. */
  possibleDuplicateSources?: string[]
}

/**
 * What the scanner reads off one source file. Nothing here is a decision.
 *
 * The three `has*` booleans are the whole reason precise capture metadata never needs to be
 * transcribed: the scanner sees the coordinates and the serial, and reports only that they exist.
 */
export interface ScannedImage {
  sourcePath: string
  absolutePath: string
  sha256: string
  format: GalleryFormat
  width: number
  height: number
  byteSize: number
  /** `YYYY-MM-DDTHH:MM:SS` from EXIF, with no zone — the source carries none. */
  capturedAt?: string
  hasExif: boolean
  hasGpsMetadata: boolean
  hasCameraSerial: boolean
  hasExifComment: boolean
}

/** Metadata-presence flags the planner derives from a scan rather than from a human decision. */
export const METADATA_FLAG_BY_SCAN_FIELD = {
  hasGpsMetadata: 'gps-metadata',
  hasCameraSerial: 'camera-serial-metadata',
  hasExifComment: 'exif-comment-metadata'
} as const satisfies Record<string, GalleryFlag>

/**
 * One canonical asset in the tracked manifest.
 *
 * Deliberately carries no GPS coordinate, camera serial, or EXIF comment: those stay embedded in
 * the ignored image copies, and reach this layer only as warning flags.
 */
export interface GalleryManifestItem extends GalleryCategory {
  assetId: `sha256:${string}`
  sha256: string
  /** Repo-relative output path under {@link GALLERY_SOURCE_ROOT}. */
  filePath: string
  /** Source-relative path of the file whose bytes were copied. */
  sourcePath: string
  /** Source-relative paths of exact duplicates this file stands in for. */
  sourceAliases: string[]
  categories: GalleryCategory[]
  title: string
  alt: string
  caption?: string
  order: number
  role: GalleryRole
  confidence: ClassificationConfidence
  flags: GalleryFlag[]
  rightsStatus: RightsStatus
  /** False whenever rights are unresolved. An importer must not publish these automatically. */
  uploadEligible: boolean
  heroEligible: boolean
  possibleDuplicateAssetIds: string[]
  format: GalleryFormat
  width: number
  height: number
  byteSize: number
  capturedAt?: string
  hasExif: boolean
}

/** Slug shape for use case, project and generated filenames: lowercase ASCII, `-` separated. */
export const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isGalleryFamily(value: string): value is GalleryFamily {
  return (GALLERY_FAMILIES as readonly string[]).includes(value)
}

export function isGalleryRole(value: string): value is GalleryRole {
  return (GALLERY_ROLES as readonly string[]).includes(value)
}

export function isGalleryFlag(value: string): value is GalleryFlag {
  return (GALLERY_FLAGS as readonly string[]).includes(value)
}

export function sameCategory(a: GalleryCategory, b: GalleryCategory): boolean {
  return a.family === b.family && a.useCase === b.useCase && a.project === b.project
}

export function categoryKey(category: GalleryCategory): string {
  return `${category.family}/${category.useCase}/${category.project}`
}

/**
 * Whether a photo may lead a gallery.
 *
 * Derived rather than authored so the manifest cannot disagree with its own flags. Rights are not
 * part of it: a review-required photo is blocked at `uploadEligible`, which is the stronger gate.
 */
export function heroEligibility(flags: readonly GalleryFlag[], role: GalleryRole): boolean {
  if (flags.some((flag) => HERO_BLOCKING_FLAGS.includes(flag))) return false
  return role === 'hero' || role === 'alternate-exterior' || role === 'aerial-context'
    || role === 'interior-wide'
}

/**
 * Whether an importer may publish this photo without a human looking at it first.
 *
 * `cleared` is the outcome of that human check: a photo whose rights were queried and confirmed
 * with the client. It is distinct from `unknown`, which only means nobody has raised a concern.
 */
export function uploadEligibility(rightsStatus: RightsStatus): boolean {
  return rightsStatus === 'unknown' || rightsStatus === 'cleared'
}

/** `{project}-{NNN}.{ext}` — three digits so a project's files sort in sequence order. */
export function assetFileName(project: string, order: number, format: GalleryFormat): string {
  return `${project}-${String(order).padStart(3, '0')}.${FORMAT_EXTENSION[format]}`
}

/** Where one asset's bytes land, relative to the repo root. */
export function assetFilePath(category: GalleryCategory, order: number, format: GalleryFormat): string {
  return [
    GALLERY_SOURCE_ROOT,
    category.family,
    category.useCase,
    category.project,
    assetFileName(category.project, order, format)
  ].join('/')
}
