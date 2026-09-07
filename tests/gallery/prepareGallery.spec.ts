import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { GalleryClassification } from '../../scripts/gallery/lib/model'
import { parseArgs, prepareGallery } from '../../scripts/gallery/prepare-gallery'

let root: string
let sourceRoot: string
let packageRoot: string
let outputRoot: string
let classificationFile: string

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-cli-'))
  sourceRoot = path.join(root, 'source-photos')
  packageRoot = path.join(root, 'package')
  outputRoot = path.join(packageRoot, 'source')
  classificationFile = path.join(packageRoot, 'classification.json')
  fs.mkdirSync(sourceRoot, { recursive: true })
  fs.mkdirSync(packageRoot, { recursive: true })
})

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true })
})

async function writeJpeg(relative: string, tint: number) {
  const absolute = path.join(sourceRoot, relative)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  await sharp({
    create: { width: 60, height: 40, channels: 3, background: { r: tint, g: 90, b: 160 } }
  }).jpeg().toFile(absolute)
  return absolute
}

function classification(overrides: Partial<GalleryClassification> & Pick<GalleryClassification, 'sourcePath'>): GalleryClassification {
  return {
    family: 'containers',
    useCase: 'dormitory',
    project: 'kiptas-vaditepe',
    categories: [],
    title: 'Container dormitory block',
    alt: 'White container dormitory units in two rows on a gravel site.',
    order: 1,
    role: 'hero',
    confidence: 'high',
    flags: [],
    rightsStatus: 'unknown',
    ...overrides
  }
}

function writeClassification(rows: GalleryClassification[]) {
  fs.writeFileSync(classificationFile, `${JSON.stringify(rows, null, 2)}\n`)
}

/** Two photos and one exact duplicate of the first — the smallest shape of the real package. */
async function seedSource() {
  await writeJpeg('Konteyner/Yatakhane/1.jpg', 10)
  await writeJpeg('Konteyner/Yatakhane/2.jpg', 200)
  fs.mkdirSync(path.join(sourceRoot, 'Konteyner/Ofis'), { recursive: true })
  fs.copyFileSync(path.join(sourceRoot, 'Konteyner/Yatakhane/1.jpg'), path.join(sourceRoot, 'Konteyner/Ofis/copy.JPG'))

  writeClassification([
    classification({ sourcePath: 'Konteyner/Yatakhane/1.jpg', order: 1, preferredCanonical: true }),
    classification({ sourcePath: 'Konteyner/Yatakhane/2.jpg', order: 2, role: 'alternate-exterior' }),
    classification({
      sourcePath: 'Konteyner/Ofis/copy.JPG',
      useCase: 'office',
      order: 1,
      role: 'secondary'
    })
  ])
}

function run(mode: 'dry-run' | 'write' | 'verify') {
  return prepareGallery({ sourceRoot, outputRoot, classificationFile, mode })
}

function sha256Of(absolute: string): string {
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
}

const CANONICAL_ONE = 'containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-001.jpg'
const CANONICAL_TWO = 'containers/dormitory/kiptas-vaditepe/kiptas-vaditepe-002.jpg'

describe('prepareGallery dry run', () => {
  it('plans the package and writes nothing', async () => {
    await seedSource()

    const result = await run('dry-run')

    expect(result).toMatchObject({
      mode: 'dry-run',
      scanned: 3,
      canonical: 2,
      exactDuplicatesCollapsed: 1,
      copied: 0,
      skipped: 0
    })
    expect(result.summary.join('\n')).toContain('canonical')
    expect(fs.existsSync(outputRoot)).toBe(false)
    expect(fs.existsSync(path.join(packageRoot, 'manifest.json'))).toBe(false)
  })

  it('refuses an invalid classification before creating any output directory', async () => {
    await seedSource()
    writeClassification([
      classification({ sourcePath: 'Konteyner/Yatakhane/1.jpg', title: '', preferredCanonical: true }),
      classification({ sourcePath: 'Konteyner/Yatakhane/2.jpg', order: 2 }),
      classification({ sourcePath: 'Konteyner/Ofis/copy.JPG', useCase: 'office', order: 1 })
    ])

    await expect(run('write')).rejects.toThrow(/title/)
    expect(fs.existsSync(outputRoot)).toBe(false)
  })

  it('refuses a source folder the classification does not cover', async () => {
    await seedSource()
    await writeJpeg('Konteyner/Yatakhane/3.jpg', 90)

    await expect(run('dry-run')).rejects.toThrow(/Konteyner\/Yatakhane\/3\.jpg/)
  })
})

describe('prepareGallery write', () => {
  it('copies canonical bytes verbatim and generates every artefact', async () => {
    await seedSource()

    const result = await run('write')

    expect(result).toMatchObject({ mode: 'write', canonical: 2, copied: 2, skipped: 0 })
    expect(fs.existsSync(path.join(outputRoot, CANONICAL_ONE))).toBe(true)
    expect(fs.existsSync(path.join(outputRoot, CANONICAL_TWO))).toBe(true)
    expect(fs.existsSync(path.join(packageRoot, 'manifest.json'))).toBe(true)
    expect(fs.existsSync(path.join(packageRoot, 'manifest.csv'))).toBe(true)
    expect(fs.existsSync(path.join(packageRoot, 'review-report.md'))).toBe(true)

    expect(sha256Of(path.join(outputRoot, CANONICAL_ONE)))
      .toBe(sha256Of(path.join(sourceRoot, 'Konteyner/Yatakhane/1.jpg')))
    expect(sha256Of(path.join(outputRoot, CANONICAL_TWO)))
      .toBe(sha256Of(path.join(sourceRoot, 'Konteyner/Yatakhane/2.jpg')))
  })

  it('leaves every source file in place and unchanged', async () => {
    await seedSource()
    const before = fs.readdirSync(path.join(sourceRoot, 'Konteyner/Yatakhane')).sort()
    const beforeHash = sha256Of(path.join(sourceRoot, 'Konteyner/Yatakhane/1.jpg'))

    await run('write')

    expect(fs.readdirSync(path.join(sourceRoot, 'Konteyner/Yatakhane')).sort()).toEqual(before)
    expect(fs.existsSync(path.join(sourceRoot, 'Konteyner/Ofis/copy.JPG'))).toBe(true)
    expect(sha256Of(path.join(sourceRoot, 'Konteyner/Yatakhane/1.jpg'))).toBe(beforeHash)
  })

  it('writes one file per canonical asset, never one per source file', async () => {
    await seedSource()

    await run('write')

    const written = fs.readdirSync(outputRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
    expect(written).toHaveLength(2)
  })

  it('is idempotent: a second write copies nothing and regenerates identical text', async () => {
    await seedSource()
    await run('write')
    const artefacts = ['manifest.json', 'manifest.csv', 'review-report.md']
      .map((name) => fs.readFileSync(path.join(packageRoot, name), 'utf-8'))
    const imageMtime = fs.statSync(path.join(outputRoot, CANONICAL_ONE)).mtimeMs

    const result = await run('write')

    expect(result).toMatchObject({ copied: 0, skipped: 2 })
    expect(fs.statSync(path.join(outputRoot, CANONICAL_ONE)).mtimeMs).toBe(imageMtime)
    expect(['manifest.json', 'manifest.csv', 'review-report.md']
      .map((name) => fs.readFileSync(path.join(packageRoot, name), 'utf-8'))).toEqual(artefacts)
  })

  it('refuses to overwrite an occupied output path whose bytes differ', async () => {
    await seedSource()
    await run('write')
    const occupied = path.join(outputRoot, CANONICAL_ONE)
    fs.writeFileSync(occupied, 'someone else was here')

    await expect(run('write')).rejects.toThrow(new RegExp(CANONICAL_ONE.replaceAll('/', '\\/')))
    expect(fs.readFileSync(occupied, 'utf-8')).toBe('someone else was here')
  })
})

describe('prepareGallery verify', () => {
  it('passes on a freshly written package and changes nothing', async () => {
    await seedSource()
    await run('write')
    const before = sha256Of(path.join(packageRoot, 'manifest.json'))

    const result = await run('verify')

    expect(result.problems).toEqual([])
    expect(result.mode).toBe('verify')
    expect(result.copied).toBe(0)
    expect(sha256Of(path.join(packageRoot, 'manifest.json'))).toBe(before)
  })

  it('detects a missing output file', async () => {
    await seedSource()
    await run('write')
    fs.rmSync(path.join(outputRoot, CANONICAL_TWO))

    const result = await run('verify')

    expect(result.problems.join('\n')).toContain(CANONICAL_TWO)
    expect(result.problems.join('\n')).toMatch(/missing/i)
  })

  it('detects changed bytes without repairing them', async () => {
    await seedSource()
    await run('write')
    fs.writeFileSync(path.join(outputRoot, CANONICAL_ONE), 'tampered')

    const result = await run('verify')

    expect(result.problems.join('\n')).toContain(CANONICAL_ONE)
    expect(fs.readFileSync(path.join(outputRoot, CANONICAL_ONE), 'utf-8')).toBe('tampered')
  })

  it('reports an unexpected output file without deleting it', async () => {
    await seedSource()
    await run('write')
    const stray = path.join(outputRoot, 'containers/dormitory/kiptas-vaditepe/stray.jpg')
    fs.writeFileSync(stray, 'stray')

    const result = await run('verify')

    expect(result.problems.join('\n')).toContain('stray.jpg')
    expect(result.unexpectedFiles).toContain('containers/dormitory/kiptas-vaditepe/stray.jpg')
    expect(fs.existsSync(stray)).toBe(true)
  })

  it('detects a stale generated artefact', async () => {
    await seedSource()
    await run('write')
    fs.writeFileSync(path.join(packageRoot, 'manifest.csv'), 'assetId\n')

    const result = await run('verify')

    expect(result.problems.join('\n')).toContain('manifest.csv')
  })
})

describe('parseArgs', () => {
  let tmpFolder: string
  const originalEnv = { ...process.env }

  beforeEach(() => {
    tmpFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-parse-args-'))
    delete process.env.GALLERY_SOURCE_DIR
    delete process.env.GALLERY_SOURCE_PATH
  })

  afterEach(() => {
    fs.rmSync(tmpFolder, { recursive: true, force: true })
    process.env = { ...originalEnv }
  })

  it('uses --source flag when provided', () => {
    const args = parseArgs(['--source', tmpFolder])
    expect(args.sourceRoot).toBe(tmpFolder)
    expect(args.mode).toBe('dry-run')
  })

  it('falls back to GALLERY_SOURCE_DIR from environment when --source is absent', () => {
    process.env.GALLERY_SOURCE_DIR = tmpFolder
    const args = parseArgs([])
    expect(args.sourceRoot).toBe(tmpFolder)
  })

  it('prioritizes --source CLI argument over GALLERY_SOURCE_DIR', () => {
    const otherFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'other-folder-'))
    process.env.GALLERY_SOURCE_DIR = otherFolder

    try {
      const args = parseArgs(['--source', tmpFolder])
      expect(args.sourceRoot).toBe(tmpFolder)
    } finally {
      fs.rmSync(otherFolder, { recursive: true, force: true })
    }
  })

  it('throws helpful error if source is missing from both CLI and environment', () => {
    expect(() => parseArgs([])).toThrowError(/Pass the photo folder explicitly.*GALLERY_SOURCE_DIR/)
  })

  it('throws error if source is not an absolute path', () => {
    process.env.GALLERY_SOURCE_DIR = 'relative/path/to/photos'
    expect(() => parseArgs([])).toThrowError(/must be an absolute path/)
  })

  it('throws error if source folder does not exist', () => {
    process.env.GALLERY_SOURCE_DIR = '/non/existent/path/for/sure'
    expect(() => parseArgs([])).toThrowError(/not an existing folder/)
  })

  it('resolves verify and write modes properly', () => {
    process.env.GALLERY_SOURCE_DIR = tmpFolder
    expect(parseArgs(['--verify']).mode).toBe('verify')
    expect(parseArgs(['--write']).mode).toBe('write')
  })
})

