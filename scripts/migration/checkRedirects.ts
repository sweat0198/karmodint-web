/**
 * Checks a live host against the redirect map (launch checklist step 13): every Redirect source answers its status and
 * `Location` in one hop, and every Kept URL answers 200. `_redirects` matches the trailing slash exactly, so each
 * source is requested in both forms, `/x/` and `/x` (docs/research/cloudflare-pages-redirects.md).
 */
import { redirectSourceForms, type Redirect } from '../../shared/migration/redirects'

export interface CheckOptions {
  /** Scheme and host to check, e.g. `https://karmodint-web.pages.dev`. */
  readonly origin: string
  readonly redirects: readonly Redirect[]
  readonly keptUrls: readonly string[]
  /** Requests in flight at once. */
  readonly concurrency?: number
}

export interface CheckFailure {
  /** The path requested. */
  readonly path: string
  readonly problem: string
}

export interface CheckReport {
  /** Paths requested: both forms of each source, then each Kept URL. */
  readonly checked: number
  readonly failures: CheckFailure[]
}

interface Hop {
  readonly status: number
  readonly location: string | null
}

/** One request, redirects not followed. */
async function request(url: URL): Promise<Hop> {
  const response = await fetch(url, { redirect: 'manual' })
  await response.body?.cancel()
  return { status: response.status, location: response.headers.get('location') }
}

const describeHop = ({ status, location }: Hop) => (location ? `${status} → ${location}` : `${status}`)
const isRedirect = ({ status, location }: Hop) => status >= 300 && status < 400 && location !== null

type Check = { path: string; run: () => Promise<string | undefined> }

/** Runs the checks `concurrency` at a time; failures keep the order of `checks`. */
async function runChecks(checks: Check[], concurrency: number): Promise<CheckFailure[]> {
  const problems: (string | undefined)[] = new Array(checks.length)
  let next = 0
  const worker = async () => {
    while (next < checks.length) {
      const index = next++
      try {
        problems[index] = await checks[index]!.run()
      } catch (error) {
        const cause = error instanceof Error && error.cause instanceof Error ? `: ${error.cause.message}` : ''
        problems[index] = `request failed: ${error instanceof Error ? error.message : String(error)}${cause}`
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, checks.length) }, worker))
  return checks.flatMap(({ path }, index) => (problems[index] ? [{ path, problem: problems[index]! }] : []))
}

export async function checkRedirects({
  origin,
  redirects,
  keptUrls,
  concurrency = 8
}: CheckOptions): Promise<CheckReport> {
  // Many sources share a target: request each target once.
  const targets = new Map<string, Promise<Hop>>()
  const requestTarget = (url: string) => {
    if (!targets.has(url)) targets.set(url, request(new URL(url)))
    return targets.get(url)!
  }

  const sourceCheck = (path: string, redirect: Redirect): Check => ({
    path,
    run: async () => {
      const requestUrl = new URL(path, origin)
      const hop = await request(requestUrl)
      const expectedTarget = new URL(redirect.to, origin).href
      const actualTarget = hop.location === null ? null : new URL(hop.location, requestUrl).href
      if (hop.status !== redirect.status || actualTarget !== expectedTarget) {
        return `expected ${redirect.status} → ${redirect.to}, got ${describeHop(hop)}`
      }
      const target = await requestTarget(expectedTarget)
      if (isRedirect(target)) return `chain: ${describeHop(hop)}, then ${describeHop(target)}`
      if (target.status !== 200) return `${describeHop(hop)}, which answers ${target.status}`
      return undefined
    }
  })

  const keptCheck = (path: string): Check => ({
    path,
    run: async () => {
      const hop = await request(new URL(path, origin))
      return hop.status === 200 ? undefined : `Kept URL: expected 200, got ${describeHop(hop)}`
    }
  })

  const checks = [
    ...redirects.flatMap((redirect) =>
      redirectSourceForms(redirect.from).map((path) => sourceCheck(path, redirect))
    ),
    ...keptUrls.map(keptCheck)
  ]
  return { checked: checks.length, failures: await runChecks(checks, concurrency) }
}
