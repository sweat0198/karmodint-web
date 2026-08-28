/**
 * Patch the `logo` field on one reference document, without touching the other seven.
 *
 * `references:import` is the wrong tool for a single swapped logo: it re-uploads all eight assets
 * and `createOrReplace`s every document, discarding whatever the Studio has changed since. This
 * uploads one seed's logo and patches only that document's asset reference.
 *
 *   pnpm references:patch-logo --id=reference-canary-wharf-management --dry-run
 *   pnpm references:patch-logo --id=reference-canary-wharf-management
 */
import fs from 'node:fs'
import path from 'node:path'
import { REFERENCE_SEEDS } from './data'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

function readSeedId(): string {
  const flag = process.argv.find((argument) => argument.startsWith('--id='))
  const id = flag?.slice('--id='.length)

  if (!id) {
    throw new Error(
      `Missing --id=<seed id>. Known IDs:\n  ${REFERENCE_SEEDS.map((seed) => seed.id).join('\n  ')}`
    )
  }

  return id
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const seedId = readSeedId()
  const seed = REFERENCE_SEEDS.find((candidate) => candidate.id === seedId)

  if (!seed) {
    throw new Error(
      `Unknown seed "${seedId}". Known IDs:\n  ${REFERENCE_SEEDS.map((candidate) => candidate.id).join('\n  ')}`
    )
  }

  const logoPath = repoPath(seed.logoPath)
  if (!fs.existsSync(logoPath)) {
    throw new Error(`Missing reference logo: ${seed.logoPath}`)
  }

  // Drafts live under a `drafts.` prefix; patching the published ID of an unpublished document
  // would fail rather than silently write to the wrong place, but name it correctly regardless.
  const documentId = seed.published ? seed.id : `drafts.${seed.id}`

  if (dryRun) {
    console.log(
      `references:patch-logo target: dataset "${readDataset()}" (dry run — no network write)`
    )
    console.log(`would upload ${seed.logoPath}`)
    console.log(`would patch  ${documentId} -> logo.asset`)
    return
  }

  const target = readSanityTarget()
  const client = createSanityClient(target)

  const asset = await client.assets.upload('image', fs.createReadStream(logoPath), {
    filename: path.basename(seed.logoPath)
  })
  console.log(`uploaded  ${seed.logoPath} -> ${asset._id}`)

  await client
    .patch(documentId)
    .set({ logo: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
    .commit()

  console.log(`patched   ${documentId} -> logo.asset = ${asset._id} in "${target.dataset}"`)
}

runScript(main)
