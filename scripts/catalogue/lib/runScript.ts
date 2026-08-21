import { loadManifest, validateManifest, type CatalogueManifest } from './manifest'
import { readDataset, readSanityTarget } from './sanityEnv'

/**
 * Load the manifest and refuse to go further if any invariant is broken.
 *
 * Both the upload and the import start here rather than trusting the file, because a manifest that
 * names a render which is not on disk would otherwise surface as a half-finished upload or a
 * document referencing an asset that was never created.
 */
export function loadValidatedManifest(): CatalogueManifest {
  const manifest = loadManifest()
  const problems = validateManifest(manifest)
  if (problems.length > 0) {
    throw new Error(`Manifest is invalid:\n  ${problems.join('\n  ')}`)
  }
  return manifest
}

/**
 * The dataset a run targets.
 *
 * A dry run reads the name without demanding a write token, which is what lets everything up to
 * the first network write happen before a human has supplied one.
 */
export function resolveDataset(dryRun: boolean): string {
  return dryRun ? readDataset() : readSanityTarget().dataset
}

/**
 * Run a CLI entry point, reporting failures as a message rather than a stack trace.
 *
 * The errors these scripts throw are written for a human — a missing token, a manifest problem
 * list — and a stack above them only buries the sentence that matters.
 */
export function runScript(main: () => Promise<void>): void {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
