import fs from 'node:fs'
import { createClient, type SanityClient } from '@sanity/client'
import { repoPath } from './paths'

/**
 * Read one `KEY=value` line, or `null` for a blank or comment line.
 *
 * A quoted value is taken whole, up to its closing quote — API tokens contain `#` and `"` often
 * enough that treating everything after a `#` as a comment would silently truncate one, and a
 * truncated token fails as a 401 rather than as the missing-credential message below.
 */
export function parseEnvLine(line: string): { key: string, value: string } | null {
  const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/)
  if (!match) return null

  const [, key, rest] = match
  const quote = rest[0]

  if (quote === '"' || quote === "'") {
    const closing = rest.indexOf(quote, 1)
    // An unterminated quote means the rest of the line is the value; better a value that is too
    // long, which fails loudly, than one silently cut at a character the token legitimately holds.
    return { key, value: closing === -1 ? rest.slice(1) : rest.slice(1, closing) }
  }

  // Unquoted: a trailing comment must be whitespace-separated, so `re_ab#cd` stays intact.
  return { key, value: rest.replace(/\s+#.*$/, '').trim() }
}

/**
 * Load the root `.env` into `process.env`, mirroring what `sanity.cli.ts` does for the Studio.
 *
 * Existing environment variables win, so `SANITY_DATASET=production pnpm catalogue:import` targets
 * production without editing the file — which is how ticket 08's promotion is meant to run.
 */
export function loadRootEnv(): void {
  const envFile = repoPath('.env')
  if (!fs.existsSync(envFile)) return

  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const parsed = parseEnvLine(line)
    if (parsed && process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value
    }
  }
}

export interface SanityTarget {
  projectId: string
  dataset: string
  token: string
}

/**
 * Read the write credentials, failing with the missing name rather than a 401 from the API.
 *
 * The token is the one prerequisite a human has to supply; everything upstream of upload and import
 * runs without it.
 */
export function readSanityTarget(): SanityTarget {
  loadRootEnv()

  const projectId = process.env.SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET
  const token = process.env.SANITY_API_TOKEN

  const missing = [
    projectId ? null : 'SANITY_PROJECT_ID',
    dataset ? null : 'SANITY_DATASET',
    token ? null : 'SANITY_API_TOKEN (a write token)'
  ].filter((name): name is string => name !== null)

  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(', ')} in the root .env — required for any network write`)
  }

  return { projectId: projectId!, dataset: dataset!, token: token! }
}

/** Reads the dataset name without requiring a token, for dry runs. */
export function readDataset(): string {
  loadRootEnv()
  const dataset = process.env.SANITY_DATASET
  if (!dataset) throw new Error('Missing SANITY_DATASET in the root .env')
  return dataset
}

export function createWriteClient(target: SanityTarget): SanityClient {
  return createClient({
    projectId: target.projectId,
    dataset: target.dataset,
    token: target.token,
    apiVersion: '2024-10-01',
    useCdn: false
  })
}
