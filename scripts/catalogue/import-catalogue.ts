/**
 * Build the product NDJSON seed and import it into the configured dataset.
 *
 * The seed is a pure function of manifest + copy + asset manifest, so the file it writes is the
 * whole of what gets imported and can be reviewed on its own. Document ids and every `_key` are
 * derived, so a re-run replaces documents rather than duplicating them.
 *
 *   pnpm catalogue:import [--dry-run]
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadAssetManifest } from './lib/assets'
import { buildCatalogueSeed, SEED_FILE, toNdjson } from './lib/buildSeed'
import { loadCopyFile } from './lib/copy'
import { repoPath } from './lib/paths'
import { loadValidatedManifest, resolveDataset, runScript } from './lib/runScript'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'
import type { SeedProduct } from './lib/buildSeed'

function countImages(documents: SeedProduct[]): number {
  return documents.reduce(
    (total, document) =>
      total + document.sizes.reduce((sizeTotal, size) => sizeTotal + size.images.length, 0),
    0
  )
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  const manifest = loadValidatedManifest()
  const dataset = resolveDataset(dryRun)
  const documents = buildCatalogueSeed(manifest, loadCopyFile, loadAssetManifest(dataset))

  const seedPath = repoPath(SEED_FILE)
  fs.mkdirSync(path.dirname(seedPath), { recursive: true })
  fs.writeFileSync(seedPath, toNdjson(documents), 'utf-8')

  const sizeCount = documents.reduce((total, document) => total + document.sizes.length, 0)
  console.log(
    `${documents.length} product(s), ${sizeCount} sizes, ${countImages(documents)} image references -> ${SEED_FILE}`
  )

  if (dryRun) {
    console.log('dry run — nothing written to Sanity')
    return
  }

  // One transaction, so a failure part-way leaves the dataset as it was rather than half-imported.
  const client = createSanityClient(readSanityTarget())
  let transaction = client.transaction()
  for (const document of documents) {
    transaction = transaction.createOrReplace(document)
  }
  await transaction.commit()

  console.log(`imported into "${dataset}": ${documents.map((document) => document._id).join(', ')}`)
}

runScript(main)
