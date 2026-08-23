/**
 * Read the catalogue back out of a dataset and check it against what the catalogue is meant to be.
 *
 * Tickets 02–06 each verified one product. This verifies the catalogue: the totals, the
 * cross-product uniqueness and the imagery-isolation guarantee that only exist once all five
 * products are present. It is the gate in front of promoting to production.
 *
 *   pnpm catalogue:verify
 *   SANITY_DATASET=production pnpm catalogue:verify
 *
 * Exits non-zero if any check fails, so it can stand in a pipeline as well as in front of a human.
 */
import fs from 'node:fs'
import { hashRender, loadAssetManifest } from './lib/assets'
import { buildCatalogueSeed, SEED_FILE, toNdjson } from './lib/buildSeed'
import { loadCopyFile } from './lib/copy'
import { repoPath } from './lib/paths'
import { loadValidatedManifest, runScript } from './lib/runScript'
import { createSanityClient, readSanityTarget } from './lib/sanityEnv'
import {
  CATALOGUE_QUERY,
  checkSharedRenders,
  formatChecks,
  verifyCatalogue,
  type Check,
  type DatasetCatalogue
} from './lib/verifyCatalogue'

/**
 * The committed seed is what a reviewer reads and what ticket 08 promotes, so it has to be the file
 * the current manifest and copy actually produce — not a stale one from before the last edit.
 */
function checkSeedIsCurrent(expected: string): Check {
  const path = repoPath(SEED_FILE)
  const actual = fs.existsSync(path) ? fs.readFileSync(path, 'utf-8') : ''

  return {
    name: `${SEED_FILE} is current`,
    ok: actual === expected,
    detail: actual === expected
      ? 'the committed seed is exactly what manifest + copy + asset manifest build today'
      : 'the committed seed differs from a fresh build — re-run `pnpm catalogue:import --dry-run`'
  }
}

async function main(): Promise<void> {
  const manifest = loadValidatedManifest()
  const target = readSanityTarget()
  const assets = loadAssetManifest(target.dataset)
  const documents = buildCatalogueSeed(manifest, loadCopyFile, assets)

  const dataset = await createSanityClient(target).fetch<DatasetCatalogue>(CATALOGUE_QUERY)

  const checks = [
    ...verifyCatalogue(documents, dataset),
    checkSharedRenders(assets, hashRender),
    checkSeedIsCurrent(toNdjson(documents))
  ]

  console.log(`Catalogue in "${target.dataset}"\n`)
  console.log(formatChecks(checks))

  const failed = checks.filter((check) => !check.ok)
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`)

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

runScript(main)
