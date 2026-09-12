/**
 * Upload the curated gallery photos and import their `galleryEntry` documents.
 *
 *   pnpm gallery:import --dry-run
 *   pnpm gallery:import
 */
import fs from 'node:fs'
import path from 'node:path'
import { GALLERY_SEEDS } from './data'
import { buildGalleryDocuments, type GalleryManifestEntry } from './buildGalleryDocuments'
import { repoPath } from './lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

const MANIFEST = 'sanity/gallery/manifest.json'

function readManifest(): GalleryManifestEntry[] {
  const file = repoPath(MANIFEST)
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${MANIFEST} — run "pnpm gallery:prepare --write" first`)
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8')).assets as GalleryManifestEntry[]
}

function validateSelection(manifest: GalleryManifestEntry[]): void {
  const ids = new Set<string>()
  for (const seed of GALLERY_SEEDS) {
    if (ids.has(seed.id)) throw new Error(`Duplicate gallery seed id: ${seed.id}`)
    ids.add(seed.id)

    if (!fs.existsSync(repoPath(seed.filePath))) {
      throw new Error(`Missing image on disk: ${seed.filePath}`)
    }
  }
  // Surfaces a stale selection as a named list rather than one error at a time.
  const known = new Set(manifest.map((entry) => entry.filePath))
  const unknown = GALLERY_SEEDS.filter((seed) => !known.has(seed.filePath))
  if (unknown.length > 0) {
    throw new Error(`Not in the manifest:\n  ${unknown.map((s) => s.filePath).join('\n  ')}`)
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const manifest = readManifest()
  validateSelection(manifest)

  const dataset = dryRun ? readDataset() : readSanityTarget().dataset
  const byCategory = new Map<string, number>()
  for (const seed of GALLERY_SEEDS) {
    byCategory.set(seed.categoryId, (byCategory.get(seed.categoryId) ?? 0) + 1)
  }

  console.log(
    `gallery target: dataset "${dataset}"${dryRun ? ' (dry run — no network write)' : ''}`
  )
  console.log(`entries: ${GALLERY_SEEDS.length}`)
  for (const [categoryId, count] of byCategory) console.log(`  ${categoryId}: ${count}`)

  if (dryRun) {
    // Build with placeholder asset ids so a dry run still exercises every invariant the real
    // import depends on — missing manifest rows and uncleared rights fail here, not mid-upload.
    const placeholders = Object.fromEntries(
      GALLERY_SEEDS.map((seed) => [seed.filePath, `image-placeholder-${seed.id}`])
    )
    const documents = buildGalleryDocuments(GALLERY_SEEDS, manifest, placeholders)
    console.log('\nplanned documents:')
    for (const document of documents) {
      console.log(`  ${document._id}`)
      console.log(`      title: ${document.projectTitle}`)
      console.log(`      alt:   ${document.image.alt}`)
      console.log(`      desc:  ${document.description}`)
    }
    return
  }

  const target = readSanityTarget()
  const client = createSanityClient(target)
  const assetIds: Record<string, string> = {}

  for (const seed of GALLERY_SEEDS) {
    const asset = await client.assets.upload(
      'image',
      fs.createReadStream(repoPath(seed.filePath)),
      { filename: path.basename(seed.filePath) }
    )
    assetIds[seed.filePath] = asset._id
    console.log(`uploaded  ${seed.filePath} -> ${asset._id}`)
  }

  const documents = buildGalleryDocuments(GALLERY_SEEDS, manifest, assetIds)
  let transaction = client.transaction()
  for (const document of documents) transaction = transaction.createOrReplace(document)
  await transaction.commit()

  console.log(`\nimported ${documents.length} entries into "${dataset}"`)
}

runScript(main)
