import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { repoPath } from './paths'

/**
 * Repo-relative render path -> Sanity image asset id.
 *
 * Kept per dataset, because Sanity dedupes uploads by content hash *within* a dataset: the same
 * PNG uploaded to dev and to production is two asset documents with two ids. Promoting the
 * catalogue therefore means a real re-upload and a second manifest, not a copy of this one.
 */
export interface AssetManifest {
  dataset: string
  assets: Record<string, string>
}

export const ASSET_MANIFEST_DIR = 'sanity/catalogue/assets'

export function assetManifestFile(dataset: string): string {
  return path.posix.join(ASSET_MANIFEST_DIR, `${dataset}.json`)
}

/** Returns an empty manifest rather than throwing, so the first upload run has somewhere to start. */
export function loadAssetManifest(dataset: string): AssetManifest {
  const absolute = repoPath(assetManifestFile(dataset))
  if (!fs.existsSync(absolute)) return { dataset, assets: {} }

  const loaded = JSON.parse(fs.readFileSync(absolute, 'utf-8')) as AssetManifest
  if (loaded.dataset !== dataset) {
    throw new Error(
      `${assetManifestFile(dataset)} declares dataset "${loaded.dataset}" — asset ids are not portable between datasets`
    )
  }
  return loaded
}

/**
 * Content hash of one render.
 *
 * Sanity derives an asset id from the file's content, so two paths mapping to one id should always
 * be one picture. This is what lets that be checked rather than assumed — the manifest above is a
 * committed JSON file a human can edit.
 */
export function hashRender(renderPath: string): string {
  return createHash('sha256').update(fs.readFileSync(repoPath(renderPath))).digest('hex')
}

export function saveAssetManifest(manifest: AssetManifest): void {
  const absolute = repoPath(assetManifestFile(manifest.dataset))
  fs.mkdirSync(path.dirname(absolute), { recursive: true })

  // Sorted so the committed file has a stable diff regardless of upload order.
  const sorted = Object.fromEntries(
    Object.entries(manifest.assets).sort(([a], [b]) => a.localeCompare(b))
  )
  fs.writeFileSync(absolute, `${JSON.stringify({ dataset: manifest.dataset, assets: sorted }, null, 2)}\n`, 'utf-8')
}
