import fs from 'node:fs'
import path from 'node:path'
import {
  PLAN_VIEW,
  PRODUCT_IMAGE_VIEW_VALUES,
  type ProductImageView
} from '../../../sanity/schemas/objects/productImageViews'
import { repoPath } from './paths'

/**
 * The catalogue manifest holds structure and nothing else — no prose.
 *
 * Prose lives in the per-product markdown files, and the split is the point: sizes, renders and
 * category references have exactly one home, so copy and structure cannot disagree about which
 * sizes exist or which renders belong to them.
 */
export interface ManifestSize {
  /** `AxB` token in centimetres, reading Depth A x Width B. Becomes the size option's `_key`. */
  key: string
  /** Depth in metres — the `A` of the key. */
  lengthM: number
  /** Width in metres — the `B` of the key. */
  widthM: number
  /** Omitted where the source publishes no height; `heightM` is validated `positive()`, so there is no 0 sentinel. */
  heightM?: number
  /** `0` means "not yet supplied", NOT weightless. */
  weightKg: number
  isPoa: boolean
  price: number
  isDefault: boolean
  sourceUrl: string
  /** Folder under the manifest's `renderRoot` holding this size's renders. */
  renderFolder: string
  /** Views present on disk, in vocabulary order. Gallery order, so `front` leads. */
  views: ProductImageView[]
}

export interface ManifestProduct {
  /** Deterministic document id — re-running the import replaces rather than duplicates. */
  id: string
  name: string
  slug: string
  /** Markdown file under `sanity/catalogue/copy/` carrying this product's frontmatter and body. */
  copyFile: string
  /**
   * Category document ids, parent first.
   *
   * The four cabin products name both the parent and their subcategory so a `references()` query
   * resolves at either level. Regenerated from here on every import, so the duplication cannot drift.
   */
  categories: string[]
  sizes: ManifestSize[]
}

export interface CatalogueManifest {
  /** Repo-relative directory the render folders sit under. */
  renderRoot: string
  products: ManifestProduct[]
}

export const MANIFEST_FILE = 'sanity/catalogue/manifest.json'

export function loadManifest(): CatalogueManifest {
  return JSON.parse(fs.readFileSync(repoPath(MANIFEST_FILE), 'utf-8')) as CatalogueManifest
}

/** Repo-relative path of one render. */
export function renderPath(manifest: CatalogueManifest, size: ManifestSize, view: ProductImageView): string {
  return path.posix.join(manifest.renderRoot, size.renderFolder, `${view}.png`)
}

/** Display label, derived rather than stored so it cannot disagree with the dimensions above it. */
export function sizeLabel(size: ManifestSize): string {
  return `${size.lengthM.toFixed(2)}m × ${size.widthM.toFixed(2)}m`
}

/** What a render folder holds: the recognised views, plus anything the vocabulary does not name. */
export interface RenderFolderContents {
  /** Views present, in vocabulary order — which is gallery order. */
  views: ProductImageView[]
  /**
   * PNG basenames outside the vocabulary.
   *
   * Reported rather than ignored: a render named `left.png` instead of `left-diagonal.png` would
   * otherwise be invisible to both the manifest and the import, and would surface as a size
   * quietly missing a photo nobody notices.
   */
  unrecognised: string[]
}

/** Returns `null` when the folder does not exist, which the validator reports on its own. */
export function readRenderFolder(
  manifest: CatalogueManifest,
  renderFolder: string
): RenderFolderContents | null {
  const dir = repoPath(path.posix.join(manifest.renderRoot, renderFolder))
  if (!fs.existsSync(dir)) return null

  const basenames = fs.readdirSync(dir)
    .filter((file) => file.endsWith('.png'))
    .map((file) => path.basename(file, '.png'))

  const present = new Set(basenames)
  return {
    views: PRODUCT_IMAGE_VIEW_VALUES.filter((view) => present.has(view)),
    unrecognised: basenames
      .filter((name) => !PRODUCT_IMAGE_VIEW_VALUES.includes(name as ProductImageView))
      .sort()
  }
}

/**
 * Every invariant the import depends on, as a list of human-readable problems.
 *
 * Returned rather than thrown so a test can name all of them at once, and so the import can refuse
 * to run with the full reason rather than the first one it tripped over.
 */
export function validateManifest(
  manifest: CatalogueManifest,
  readFolder: (renderFolder: string) => RenderFolderContents | null
    = (folder) => readRenderFolder(manifest, folder)
): string[] {
  const problems: string[] = []
  const seenIds = new Set<string>()
  const seenSlugs = new Set<string>()

  for (const product of manifest.products) {
    if (seenIds.has(product.id)) problems.push(`Duplicate product id "${product.id}"`)
    seenIds.add(product.id)

    if (seenSlugs.has(product.slug)) problems.push(`Duplicate product slug "${product.slug}"`)
    seenSlugs.add(product.slug)

    if (product.categories.length === 0) {
      problems.push(`${product.id} references no category`)
    }

    const defaults = product.sizes.filter((size) => size.isDefault)
    if (defaults.length !== 1) {
      problems.push(`${product.id} must have exactly one default size (found ${defaults.length})`)
    }

    const seenKeys = new Set<string>()
    for (const size of product.sizes) {
      const where = `${product.id} size "${size.key}"`

      if (seenKeys.has(size.key)) problems.push(`${where} is a duplicate key`)
      seenKeys.add(size.key)

      const planViews = size.views.filter((view) => view === PLAN_VIEW)
      if (planViews.length !== 1) {
        problems.push(`${where} must have exactly one "${PLAN_VIEW}" view (found ${planViews.length})`)
      }

      const unknown = size.views.filter((view) => !PRODUCT_IMAGE_VIEW_VALUES.includes(view))
      if (unknown.length > 0) {
        problems.push(`${where} lists views outside the vocabulary: ${unknown.join(', ')}`)
      }

      const onDisk = readFolder(size.renderFolder)
      if (onDisk === null) {
        problems.push(`${where} render folder "${size.renderFolder}" does not exist`)
      } else {
        if (onDisk.views.join(',') !== size.views.join(',')) {
          problems.push(
            `${where} lists views [${size.views.join(', ')}] but "${size.renderFolder}" holds `
            + `[${onDisk.views.join(', ')}] — the manifest must match the renders on disk, in vocabulary order`
          )
        }
        if (onDisk.unrecognised.length > 0) {
          problems.push(
            `${where} render folder "${size.renderFolder}" holds PNGs the view vocabulary does not name: `
            + `${onDisk.unrecognised.join(', ')} — rename them or the import will skip them silently`
          )
        }
      }

      if (size.isPoa && size.price !== 0) {
        problems.push(`${where} is POA, so its placeholder price must be 0 (found ${size.price})`)
      }
      if (size.heightM !== undefined && size.heightM <= 0) {
        problems.push(`${where} height must be positive or omitted — 0 is not a sentinel here`)
      }
      if (size.weightKg < 0) {
        problems.push(`${where} weight cannot be negative`)
      }
    }
  }

  return problems
}
