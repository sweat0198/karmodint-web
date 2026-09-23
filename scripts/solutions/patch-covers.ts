/**
 * Set `coverImage` on every Solution document from the selected covers in `scripts/solutions/data.ts`.
 *
 * Only `coverImage` is written; the Studio's other edits to each Solution are left alone. Uploads
 * are safe to repeat — Sanity keys an image asset by its content hash, so re-running reuses the
 * existing assets and rewrites the same references.
 *
 *   pnpm solutions:patch-covers --dry-run
 *   pnpm solutions:patch-covers
 *   SANITY_DATASET=production pnpm solutions:patch-covers
 */
import fs from 'node:fs'
import path from 'node:path'
import { SOLUTION_COVERS } from './data'
import { planCoverPatches, type SolutionRecord } from './planCoverPatches'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  const missingFiles = SOLUTION_COVERS.filter((cover) => !fs.existsSync(repoPath(cover.imagePath)))
  if (missingFiles.length > 0) {
    throw new Error(`Missing cover images:\n  ${missingFiles.map((cover) => cover.imagePath).join('\n  ')}`)
  }

  // Even a dry run reads the dataset, so it can check every Solution has a cover.
  const target = readSanityTarget()
  const client = createSanityClient(target)
  const solutions = await client.fetch<SolutionRecord[]>(
    '*[_type == "solution"]{_id, "slug": slug.current}',
    {},
    { perspective: 'raw' }
  )

  if (dryRun) {
    // Nothing is uploaded yet, so each image's own path stands in for its asset ID.
    const placeholders = Object.fromEntries(SOLUTION_COVERS.map((cover) => [cover.imagePath, cover.imagePath]))
    console.log(`solutions:patch-covers target: dataset "${target.dataset}" (dry run — no network write)`)
    for (const patch of planCoverPatches(SOLUTION_COVERS, solutions, placeholders)) {
      console.log(`would patch ${patch.documentId} -> ${patch.coverImage.asset._ref}`)
    }
    return
  }

  const assetIds: Record<string, string> = {}
  for (const cover of SOLUTION_COVERS) {
    const asset = await client.assets.upload('image', fs.createReadStream(repoPath(cover.imagePath)), {
      filename: path.basename(cover.imagePath)
    })
    assetIds[cover.imagePath] = asset._id
    console.log(`uploaded  ${cover.imagePath} -> ${asset._id}`)
  }

  const patches = planCoverPatches(SOLUTION_COVERS, solutions, assetIds)
  const transaction = client.transaction()
  for (const patch of patches) {
    transaction.patch(patch.documentId, (builder) => builder.set({ coverImage: patch.coverImage }))
  }
  await transaction.commit()

  for (const patch of patches) {
    console.log(`patched   ${patch.documentId} -> coverImage.asset = ${patch.coverImage.asset._ref}`)
  }
  console.log(`${patches.length} Solution documents updated in "${target.dataset}"`)
}

runScript(main)
