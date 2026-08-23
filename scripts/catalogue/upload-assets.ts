/**
 * Upload every render the manifest references and record its asset id.
 *
 * PNGs go up as-is. Sanity serves WebP and every other derivative from the original, so
 * pre-converting would discard the lossless master and gain nothing.
 *
 * Idempotent twice over: a render already recorded in the dataset's asset manifest is skipped
 * without a request, and Sanity dedupes by content hash anyway, so even `--force` re-attaches the
 * existing asset rather than creating a second one.
 *
 *   pnpm catalogue:assets [--dry-run] [--force]
 */
import fs from 'node:fs'
import { assetManifestFile, loadAssetManifest, saveAssetManifest } from './lib/assets'
import { renderPath } from './lib/manifest'
import { repoPath } from './lib/paths'
import { loadValidatedManifest, resolveDataset, runScript } from './lib/runScript'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const force = process.argv.includes('--force')

  const manifest = loadValidatedManifest()
  const dataset = resolveDataset(dryRun)
  const assetManifest = loadAssetManifest(dataset)

  const renders = manifest.products.flatMap((product) =>
    product.sizes.flatMap((size) => size.views.map((view) => renderPath(manifest, size, view)))
  )
  const pending = renders.filter((renderFile) => force || !assetManifest.assets[renderFile])

  console.log(
    `${renders.length} renders referenced, ${pending.length} to upload to "${dataset}"`
    + `${dryRun ? ' (dry run — no network write)' : ''}`
  )

  if (dryRun) {
    for (const renderFile of pending) console.log(`would upload  ${renderFile}`)
    return
  }

  const client = createSanityClient(readSanityTarget())

  for (const renderFile of pending) {
    const asset = await client.assets.upload('image', fs.createReadStream(repoPath(renderFile)), {
      // "cabin-grp-215x270-front.png" — the folder alone is ambiguous once every family is loaded.
      filename: renderFile.split('/').slice(-2).join('-')
    })
    assetManifest.assets[renderFile] = asset._id
    console.log(`uploaded  ${renderFile} -> ${asset._id}`)
  }

  saveAssetManifest(assetManifest)
  console.log(`\n${Object.keys(assetManifest.assets).length} assets recorded in ${assetManifestFile(dataset)}`)
}

runScript(main)
