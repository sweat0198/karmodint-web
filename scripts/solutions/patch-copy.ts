/**
 * Set `body` and `faqs` on the eight Solutions a Legacy URL now redirects to (issue #26), from the
 * copy files listed in `SOLUTION_COPY` (`scripts/solutions/data.ts`).
 *
 *   pnpm solutions:patch-copy --dry-run           # validate the copy; list patches when .env has a token
 *   pnpm solutions:patch-copy --dry-run --print   # also print every patch as JSON
 *   pnpm solutions:patch-copy                     # write to $SANITY_DATASET
 *   SANITY_DATASET=production pnpm solutions:patch-copy
 *
 * Only `body` and `faqs` are written (`faqs` is unset where the Legacy copy had none); every other
 * field, and every other Solution, is left alone. Re-running converges on the committed copy, and
 * discards Studio edits made to those two fields since the last run.
 */
import fs from 'node:fs'
import { SOLUTION_COPY } from './data'
import { buildSolutionCopy, type SolutionCopyFields } from './buildSolutionCopy'
import { planCopyPatches } from './planCopyPatches'
import type { SolutionRecord } from './planCoverPatches'
import { loadRedirectSources } from '../catalogue/lib/redirectSources'
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget, type SanityTarget } from '../catalogue/lib/sanityEnv'
import { runScript } from '../catalogue/lib/runScript'

// Release versions (`versions.*`) belong to scheduled releases, not to this migration.
const SOLUTIONS_QUERY = '*[_type == "solution" && !(_id in path("versions.**"))]{_id, "slug": slug.current}'

function summarise(copy: SolutionCopyFields): string {
  return `${copy.slug}: ${copy.body.length} body blocks, ${copy.faqs.length} FAQs`
}

/** The write target, or null when the token is missing: a dry run then validates the copy offline. */
function readTargetForDryRun(): SanityTarget | null {
  try {
    return readSanityTarget()
  } catch {
    return null
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run')
  const print = process.argv.includes('--print')

  const copies = buildSolutionCopy(SOLUTION_COPY, {
    readFile: (file: string) => fs.readFileSync(repoPath(file), 'utf-8'),
    redirectSources: loadRedirectSources()
  })

  if (dryRun) {
    const target = readTargetForDryRun()
    console.log(`solutions:patch-copy target: dataset "${target?.dataset ?? readDataset()}" (dry run — no network write)`)
    for (const copy of copies) console.log(`copy ok   ${summarise(copy)}`)

    if (!target) {
      console.log('No SANITY_API_TOKEN: the dataset was not read, so no document ids are listed.')
      if (print) console.log(JSON.stringify(copies, null, 2))
      return
    }

    const solutions = await createSanityClient(target).fetch<SolutionRecord[]>(SOLUTIONS_QUERY, {}, { perspective: 'raw' })
    const patches = planCopyPatches(copies, solutions)
    for (const patch of patches) {
      const fields = [...Object.keys(patch.set).map((field) => `set ${field}`), ...patch.unset.map((field) => `unset ${field}`)]
      console.log(`would patch ${patch.documentId}: ${fields.join(', ')}`)
    }
    if (print) console.log(JSON.stringify(patches, null, 2))
    return
  }

  const target = readSanityTarget()
  const client = createSanityClient(target)
  const solutions = await client.fetch<SolutionRecord[]>(SOLUTIONS_QUERY, {}, { perspective: 'raw' })
  const patches = planCopyPatches(copies, solutions)

  const transaction = client.transaction()
  for (const patch of patches) {
    transaction.patch(patch.documentId, (builder) => {
      const withSet = builder.set(patch.set)
      return patch.unset.length > 0 ? withSet.unset(patch.unset) : withSet
    })
  }
  await transaction.commit()

  for (const patch of patches) console.log(`patched   ${patch.documentId}`)
  console.log(`${patches.length} Solution documents updated in "${target.dataset}"`)
}

runScript(main)
