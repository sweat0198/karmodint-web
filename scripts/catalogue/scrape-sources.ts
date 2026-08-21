/**
 * Fetch every source page once, cache the raw HTML, and write the committed extract.
 *
 * The cache is what makes tickets 03-06 network-free: after one run, re-running this script and the
 * whole pipeline behind it touches no external host. Pass `--refresh` to force a re-crawl.
 *
 *   pnpm catalogue:scrape [--refresh]
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { SOURCE_PAGES, cacheFileName, type SourcePage } from './lib/sourcePages'
import { extractSourcePage, type SourceExtract } from './lib/extractSourcePage'
import { repoPath } from './lib/paths'
import { runScript } from './lib/runScript'

const CACHE_DIR = '.cache/karmod-source'
const EXTRACT_FILE = 'sanity/catalogue/source-extract.json'

/** Courtesy gap between requests to a site that owes us nothing. */
const REQUEST_DELAY_MS = 1500

const USER_AGENT
  = 'karmodint-web catalogue import (one-off crawl; contact info@karmodint.co.uk)'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function cachePath(page: SourcePage): string {
  return repoPath(CACHE_DIR, cacheFileName(page))
}

async function readCached(page: SourcePage): Promise<string | null> {
  try {
    return await fs.readFile(cachePath(page), 'utf-8')
  } catch {
    return null
  }
}

async function fetchPage(page: SourcePage): Promise<string> {
  const response = await fetch(page.url, { headers: { 'user-agent': USER_AGENT } })
  if (!response.ok) {
    throw new Error(`${page.url} returned ${response.status} ${response.statusText}`)
  }
  return response.text()
}

async function main(): Promise<void> {
  const refresh = process.argv.includes('--refresh')

  await fs.mkdir(repoPath(CACHE_DIR), { recursive: true })
  await fs.mkdir(path.dirname(repoPath(EXTRACT_FILE)), { recursive: true })

  const extracts: SourceExtract[] = []
  let fetched = 0

  for (const page of SOURCE_PAGES) {
    let html = refresh ? null : await readCached(page)

    if (html === null) {
      // Only sleep between real requests — a fully cached run should not crawl at crawl speed.
      if (fetched > 0) await sleep(REQUEST_DELAY_MS)
      html = await fetchPage(page)
      await fs.writeFile(cachePath(page), html, 'utf-8')
      fetched += 1
      console.log(`fetched  ${page.url}`)
    } else {
      console.log(`cached   ${page.url}`)
    }

    extracts.push(extractSourcePage(page, html))
  }

  await fs.writeFile(repoPath(EXTRACT_FILE), `${JSON.stringify(extracts, null, 2)}\n`, 'utf-8')

  console.log(
    `\n${extracts.length} pages (${fetched} fetched, ${extracts.length - fetched} cached) -> ${EXTRACT_FILE}`
  )

  // Worth surfacing rather than leaving to be rediscovered: the five English Panel pages are
  // genuinely blank at source, which is why ticket 03 translates from the Turkish originals.
  const empty = extracts.filter((extract) => extract.detailHtml === '')
  if (empty.length > 0) {
    console.log(`${empty.length} pages have an empty detail pane: ${empty.map((e) => e.url).join(', ')}`)
  }
}

runScript(main)
