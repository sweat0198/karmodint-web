import fs from 'node:fs'
import { repoPath } from '../catalogue/lib/paths'

export const REDIRECT_MAP_PATH = 'docs/plans/2026-10-06-uk-migration-redirects.tsv'

/**
 * Every Legacy URL the migration redirects (first column of the redirect map: source, target,
 * code, origin). Ported copy must link a redirect's target, never its source, or each such link
 * costs a 301 hop.
 */
export function loadRedirectSources(file = repoPath(REDIRECT_MAP_PATH)): Set<string> {
  const sources = fs
    .readFileSync(file, 'utf-8')
    .split('\n')
    .map((line) => line.split('\t')[0]?.trim())
    .filter((source): source is string => Boolean(source) && source.startsWith('/'))
  return new Set(sources)
}
