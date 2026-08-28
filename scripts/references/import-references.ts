/**
 * Upload the local reference logos and import deterministic reference documents.
 *
 *   pnpm references:import --dry-run
 *   pnpm references:import
 */
import fs from 'node:fs'
import path from 'node:path'
import { REFERENCE_SEEDS } from './data'
import { buildReferenceDocuments } from './buildDocuments'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

function validateLogoPaths(): void {
  for (const seed of REFERENCE_SEEDS) {
    const logoPath = repoPath(seed.logoPath)
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Missing reference logo: ${seed.logoPath}`)
    }
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')

  validateLogoPaths()

  const dataset = dryRun ? readDataset() : readSanityTarget().dataset
  const publishedCount = REFERENCE_SEEDS.filter((seed) => seed.published).length
  const draftCount = REFERENCE_SEEDS.length - publishedCount

  console.log(
    `references target: dataset "${dataset}"${dryRun ? ' (dry run — no network write)' : ''}`
  )
  console.log(`documents: ${REFERENCE_SEEDS.length} (${publishedCount} published, ${draftCount} drafts)`)
  console.log(`base IDs: ${REFERENCE_SEEDS.map((seed) => seed.id).join(', ')}`)

  if (dryRun) return

  const target = readSanityTarget()
  const client = createSanityClient(target)
  const assetIds: Record<string, string> = {}

  for (const seed of REFERENCE_SEEDS) {
    const asset = await client.assets.upload('image', fs.createReadStream(repoPath(seed.logoPath)), {
      filename: path.basename(seed.logoPath)
    })
    assetIds[seed.logoPath] = asset._id
    console.log(`uploaded  ${seed.logoPath} -> ${asset._id}`)
  }

  const documents = buildReferenceDocuments(REFERENCE_SEEDS, assetIds)
  let transaction = client.transaction()
  for (const document of documents) {
    transaction = transaction.createOrReplace(document)
  }
  await transaction.commit()

  console.log(`imported into "${dataset}":`)
  for (const document of documents) {
    console.log(`created   ${document._id}${document._id.startsWith('drafts.') ? ' (draft)' : ''}`)
  }
}

runScript(main)
