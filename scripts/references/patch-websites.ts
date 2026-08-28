/**
 * Patch the `website` field on the existing reference documents, without touching logos.
 *
 *   pnpm references:patch-websites --dry-run
 *   pnpm references:patch-websites
 */
import { REFERENCE_SEEDS } from './data'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const seeds = REFERENCE_SEEDS.filter((seed) => seed.website !== undefined)

  if (dryRun) {
    const dataset = readDataset()
    console.log(`references:patch-websites target: dataset "${dataset}" (dry run — no network write)`)
    for (const seed of seeds) {
      const id = seed.published ? seed.id : `drafts.${seed.id}`
      console.log(`would patch ${id} -> website: ${seed.website}`)
    }
    return
  }

  const target = readSanityTarget()
  const client = createSanityClient(target)

  let transaction = client.transaction()
  for (const seed of seeds) {
    const id = seed.published ? seed.id : `drafts.${seed.id}`
    transaction = transaction.patch(id, (patch) => patch.set({ website: seed.website }))
  }
  await transaction.commit()

  console.log(`patched websites in "${target.dataset}":`)
  for (const seed of seeds) {
    const id = seed.published ? seed.id : `drafts.${seed.id}`
    console.log(`patched   ${id} -> ${seed.website}`)
  }
}

runScript(main)
