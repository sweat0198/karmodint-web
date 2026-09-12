import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GALLERY_SOURCE_ROOT,
  type GalleryClassification,
  type GalleryManifestItem,
  type GallerySourceRoot,
  type GallerySourceScope
} from './lib/model'
import { loadRootEnv } from './lib/env'
import { repoPath } from './lib/paths'
import { planGalleryAssets } from './lib/planAssets'
import { scanGallerySources } from './lib/scan'
import { manifestCsv, manifestJson, reviewReport } from './lib/serialize'
import { validateClassifications, validateManifest } from './lib/validate'

/**
 * Prepare the gallery package: read the external photo folders, plan them, and — only when asked —
 * copy bytes into the ignored local library beside the tracked metadata.
 *
 * Three modes, one code path. A dry run does everything a write does except touch the disk, so the
 * plan a human approves is literally the plan that gets executed. Nothing here talks to Sanity, and
 * the only filesystem verbs used against the source folder are `readdir`, `stat` and `readFile`.
 */

export const CLASSIFICATION_FILE = 'sanity/gallery/classification.json'
export const GALLERY_PACKAGE_ROOT = 'sanity/gallery'

/** Generated text artefacts, in the order the CLI reports them. */
const ARTEFACTS = ['manifest.json', 'manifest.csv', 'review-report.md'] as const

export interface PrepareGalleryOptions {
  /** The external photo folders, in the order they are read. Never stored in a tracked artefact. */
  sourceRoots: GallerySourceRoot[]
  /** Absolute path the copied binaries live under; the tracked artefacts sit in its parent. */
  outputRoot: string
  classificationFile: string
  mode: 'dry-run' | 'write' | 'verify'
}

export interface PrepareGalleryResult {
  mode: PrepareGalleryOptions['mode']
  scanned: number
  canonical: number
  exactDuplicatesCollapsed: number
  rightsReview: number
  heroIneligible: number
  copied: number
  skipped: number
  /** Output-relative paths present on disk that the plan does not name. Reported, never deleted. */
  unexpectedFiles: string[]
  /** Verification findings. Empty means the package on disk matches the plan. */
  problems: string[]
  items: GalleryManifestItem[]
  summary: string[]
}

export function loadClassifications(file: string = repoPath(CLASSIFICATION_FILE)): GalleryClassification[] {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as GalleryClassification[]
}

export async function prepareGallery(options: PrepareGalleryOptions): Promise<PrepareGalleryResult> {
  const { sourceRoots, outputRoot, classificationFile, mode } = options

  const classifications = loadClassifications(classificationFile)
  const classificationProblems = validateClassifications(classifications)
  if (classificationProblems.length > 0) {
    throw new Error(`Classification is invalid:\n  ${classificationProblems.join('\n  ')}`)
  }

  const { images, problems: scanProblems } = await scanGallerySources(
    sourceRoots,
    new Set(classifications.map((row) => row.sourcePath))
  )
  if (scanProblems.length > 0) {
    throw new Error(`Source images could not be read:\n  ${scanProblems.join('\n  ')}`)
  }

  const items = planGalleryAssets(images, classifications)

  // The generated manifest is checked before it is allowed to replace the tracked one: a planner
  // bug that produced, say, an upload-eligible review-required asset must never reach disk.
  const manifestProblems = validateManifest(items)
  if (manifestProblems.length > 0) {
    throw new Error(`Planned manifest is invalid:\n  ${manifestProblems.join('\n  ')}`)
  }

  const artefacts = buildArtefacts(items, images.length)
  const packageRoot = path.dirname(outputRoot)

  const copies = items.map((item) => ({
    item,
    from: images.find((image) => image.sourcePath === item.sourcePath)!.absolutePath,
    to: path.join(outputRoot, outputRelative(item.filePath))
  }))

  let copied = 0
  let skipped = 0
  const problems: string[] = []

  if (mode === 'write') {
    for (const copy of copies) {
      if (copyCanonical(copy.from, copy.to, copy.item)) copied += 1
      else skipped += 1
    }
    for (const [name, content] of Object.entries(artefacts)) {
      writeIfChanged(path.join(packageRoot, name), content)
    }
  }

  const unexpectedFiles = mode === 'dry-run' ? [] : findUnexpected(outputRoot, copies.map((copy) => outputRelative(copy.item.filePath)))

  if (mode === 'verify') {
    problems.push(...verify(copies, artefacts, packageRoot, unexpectedFiles))
  }

  const result: PrepareGalleryResult = {
    mode,
    scanned: images.length,
    canonical: items.length,
    exactDuplicatesCollapsed: images.length - items.length,
    rightsReview: items.filter((item) => item.rightsStatus === 'review-required').length,
    heroIneligible: items.filter((item) => !item.heroEligible).length,
    copied,
    skipped,
    unexpectedFiles,
    problems,
    items,
    summary: []
  }

  result.summary = summarise(result)
  return result
}

function buildArtefacts(items: GalleryManifestItem[], sourceCount: number): Record<string, string> {
  return {
    'manifest.json': manifestJson(items),
    'manifest.csv': manifestCsv(items),
    'review-report.md': reviewReport(items, sourceCount)
  }
}

/** `sanity/gallery/source/a/b.jpg` -> `a/b.jpg`, so a test can point `outputRoot` anywhere. */
function outputRelative(filePath: string): string {
  return filePath.slice(GALLERY_SOURCE_ROOT.length + 1)
}

/**
 * Copy one canonical image, and refuse to destroy anything.
 *
 * An occupied path whose bytes already match is the idempotent case and is skipped without a write.
 * An occupied path whose bytes differ is a real collision — two photos claiming one filename — and
 * the only safe response is to stop and name it, because overwriting would silently lose a photo.
 *
 * Returns whether bytes were copied.
 */
function copyCanonical(from: string, to: string, item: GalleryManifestItem): boolean {
  if (fs.existsSync(to)) {
    const existing = createHash('sha256').update(fs.readFileSync(to)).digest('hex')
    if (existing === item.sha256) return false

    throw new Error(
      `Refusing to overwrite ${item.filePath}: it holds different bytes (${existing.slice(0, 12)}…) `
      + `than the planned source ${item.sourcePath} (${item.sha256.slice(0, 12)}…). `
      + 'Resolve the collision by hand — this command never replaces an image it did not plan.'
    )
  }

  fs.mkdirSync(path.dirname(to), { recursive: true })
  // copyFileSync, never rename: the source folder is the user's, and must survive untouched.
  fs.copyFileSync(from, to)
  return true
}

/** Rewrite a generated artefact only when its bytes change, so re-runs leave mtimes alone. */
function writeIfChanged(file: string, content: string): void {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf-8') === content) return
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

/** Output-relative paths on disk that the plan does not name. Reported, never removed. */
function findUnexpected(outputRoot: string, planned: string[]): string[] {
  if (!fs.existsSync(outputRoot)) return []

  const expected = new Set(planned)
  const found: string[] = []

  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (entry.isFile()) {
        const relative = path.relative(outputRoot, absolute).split(path.sep).join('/')
        if (!expected.has(relative)) found.push(relative)
      }
    }
  }

  walk(outputRoot)
  return found.sort((a, b) => a.localeCompare(b, 'en'))
}

/** Read-only comparison of the package on disk against the plan just built from the source folder. */
function verify(
  copies: { item: GalleryManifestItem, to: string }[],
  artefacts: Record<string, string>,
  packageRoot: string,
  unexpectedFiles: string[]
): string[] {
  const problems: string[] = []

  for (const { item, to } of copies) {
    if (!fs.existsSync(to)) {
      problems.push(`${item.filePath}: missing — re-run with --write`)
      continue
    }
    const actual = createHash('sha256').update(fs.readFileSync(to)).digest('hex')
    if (actual !== item.sha256) {
      problems.push(
        `${item.filePath}: bytes differ from source ${item.sourcePath} `
        + `(found ${actual.slice(0, 12)}…, expected ${item.sha256.slice(0, 12)}…)`
      )
    }
  }

  for (const relative of unexpectedFiles) {
    problems.push(`${GALLERY_SOURCE_ROOT}/${relative}: unexpected file the plan does not name`)
  }

  for (const name of ARTEFACTS) {
    const file = path.join(packageRoot, name)
    if (!fs.existsSync(file)) {
      problems.push(`${name}: missing — re-run with --write`)
    } else if (fs.readFileSync(file, 'utf-8') !== artefacts[name]) {
      problems.push(`${name}: stale — regenerate with --write`)
    }
  }

  return problems
}

function summarise(result: PrepareGalleryResult): string[] {
  const lines = [
    `mode                        ${result.mode}`,
    `source images scanned       ${result.scanned}`,
    `canonical assets planned    ${result.canonical}`,
    `exact duplicates collapsed  ${result.exactDuplicatesCollapsed}`,
    `rights review required      ${result.rightsReview}`,
    `hero ineligible             ${result.heroIneligible}`
  ]

  if (result.mode === 'write') {
    lines.push(`images copied               ${result.copied}`)
    lines.push(`images already present      ${result.skipped}`)
  }
  if (result.mode === 'dry-run') {
    lines.push('nothing was written — re-run with --write to copy images and generate metadata')
  }
  if (result.mode === 'verify') {
    lines.push(`unexpected output files     ${result.unexpectedFiles.length}`)
    lines.push(result.problems.length === 0 ? 'verification PASSED' : `verification FAILED (${result.problems.length})`)
  }

  return lines
}

interface CliArgs {
  sourceRoots: GallerySourceRoot[]
  outputRoot: string
  classificationFile: string
  mode: PrepareGalleryOptions['mode']
}

/** Every `--name value` occurrence, so a folder flag can be passed more than once. */
function flagValues(argv: string[], name: string): string[] {
  const values: string[] = []
  for (const [index, argument] of argv.entries()) {
    if (argument !== `--${name}`) continue
    const value = argv[index + 1]
    if (value !== undefined && !value.startsWith('--')) values.push(value)
  }
  return values
}

export function parseArgs(argv: string[]): CliArgs {
  const flag = (name: string) => flagValues(argv, name)[0]

  /**
   * The folders one flag names, at that flag's scope.
   *
   * Flags win over the environment per scope, so overriding the library folder on the command line
   * does not silently drop the curated one configured in `.env`, or the other way round. The
   * environment names one folder per scope; passing several is a command-line affair.
   */
  const rootsFor = (
    flagName: string,
    scope: GallerySourceScope,
    ...configured: (string | undefined)[]
  ): GallerySourceRoot[] => {
    const passed = flagValues(argv, flagName)
    if (passed.length > 0) return passed.map((path) => ({ path, scope }))

    const fallback = configured.find((value) => value !== undefined && value !== '')
    return fallback === undefined ? [] : [{ path: fallback, scope }]
  }

  const write = argv.includes('--write')
  const check = argv.includes('--verify')

  const sourceRoots: GallerySourceRoot[] = [
    ...rootsFor('source', 'all', process.env.GALLERY_SOURCE_DIR, process.env.GALLERY_SOURCE_PATH),
    ...rootsFor('curated-source', 'classified', process.env.GALLERY_CURATED_SOURCE_DIR)
  ]

  if (sourceRoots.length === 0) {
    throw new Error('Pass the photo folder explicitly: --source "<absolute folder>" or set GALLERY_SOURCE_DIR in .env')
  }
  for (const root of sourceRoots) {
    if (!path.isAbsolute(root.path)) {
      throw new Error(`Photo source folder must be an absolute path (got "${root.path}")`)
    }
    if (!fs.existsSync(root.path) || !fs.statSync(root.path).isDirectory()) {
      throw new Error(`Photo source folder is not an existing folder: ${root.path}`)
    }
  }
  if (write && check) {
    throw new Error('--write and --verify are opposites: verification never changes files')
  }

  return {
    sourceRoots,
    outputRoot: flag('output') ?? repoPath(GALLERY_SOURCE_ROOT),
    classificationFile: flag('classification') ?? repoPath(CLASSIFICATION_FILE),
    mode: write ? 'write' : check ? 'verify' : 'dry-run'
  }
}

async function main(): Promise<void> {
  loadRootEnv()
  const result = await prepareGallery(parseArgs(process.argv.slice(2)))

  console.log(result.summary.join('\n'))

  if (result.problems.length > 0) {
    console.error(`\n${result.problems.length} problem(s):\n  ${result.problems.join('\n  ')}`)
    process.exitCode = 1
  }
}

// Only when run as a script: the tests import `prepareGallery` directly.
if (process.argv[1] && fs.existsSync(process.argv[1])
  && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
