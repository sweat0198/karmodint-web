import {
  PENDING_REDIRECT_GROUPS,
  REDIRECT_GROUPS,
  toRedirects
} from '../../../shared/migration/redirects'

/**
 * Every Legacy URL the migration redirects, shipped or still pending. Ported copy must link a
 * redirect's target, never its source, or each such link costs a 301 hop.
 */
export function loadRedirectSources(): Set<string> {
  return new Set(toRedirects([...REDIRECT_GROUPS, ...PENDING_REDIRECT_GROUPS]).map((redirect) => redirect.from))
}
