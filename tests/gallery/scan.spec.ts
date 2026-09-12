import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { GallerySourceRoot } from '../../scripts/gallery/lib/model'
import { scanGallerySources } from '../../scripts/gallery/lib/scan'

let sourceRoot: string

beforeEach(() => {
  sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-scan-'))
})

afterEach(() => {
  fs.rmSync(sourceRoot, { recursive: true, force: true })
})

/** A solid-colour JPEG, large enough that its dimensions are worth asserting on. */
async function writeJpeg(relative: string, options: { width?: number, height?: number, exif?: boolean } = {}) {
  const absolute = path.join(sourceRoot, relative)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })

  let image = sharp({
    create: {
      width: options.width ?? 40,
      height: options.height ?? 30,
      channels: 3,
      background: { r: 12, g: 120, b: 200 }
    }
  })

  if (options.exif) {
    image = image.withExif({
      IFD0: { Make: 'TestCam' },
      IFD2: { DateTimeOriginal: '2024:03:09 11:22:33', BodySerialNumber: 'SN-TEST-1' },
      IFD3: { GPSLatitudeRef: 'N' }
    })
  }

  await image.jpeg().toFile(absolute)
  return absolute
}

async function writePng(relative: string) {
  const absolute = path.join(sourceRoot, relative)
  fs.mkdirSync(path.dirname(absolute), { recursive: true })
  await sharp({
    create: { width: 20, height: 20, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 1 } }
  }).png().toFile(absolute)
  return absolute
}

function sha256Of(absolute: string): string {
  return createHash('sha256').update(fs.readFileSync(absolute)).digest('hex')
}

/** The common case: one folder, every image in it, so the pick list is irrelevant. */
function scanGallerySource(root: string) {
  return scanGallerySources([{ path: root, scope: 'all' }], new Set())
}

function root(path: string, scope: GallerySourceRoot['scope']): GallerySourceRoot {
  return { path, scope }
}

describe('scanGallerySources', () => {
  it('returns only supported images and ignores filesystem noise', async () => {
    await writeJpeg('Konteyner/a.jpg')
    await writePng('Kabin/b.png')
    fs.writeFileSync(path.join(sourceRoot, '.DS_Store'), 'noise')
    fs.writeFileSync(path.join(sourceRoot, 'Konteyner/.DS_Store'), 'noise')
    fs.writeFileSync(path.join(sourceRoot, 'notes.txt'), 'not an image')

    const { images, problems } = await scanGallerySource(sourceRoot)

    expect(problems).toEqual([])
    expect(images.map((image) => image.sourcePath)).toEqual(['Kabin/b.png', 'Konteyner/a.jpg'])
  })

  it('reads dimensions, byte size, hash, format and EXIF presence', async () => {
    const absolute = await writeJpeg('Konteyner/a.jpg', { width: 64, height: 48, exif: true })

    const { images } = await scanGallerySource(sourceRoot)
    const image = images[0]!

    expect(image).toMatchObject({
      sourcePath: 'Konteyner/a.jpg',
      absolutePath: absolute,
      sha256: sha256Of(absolute),
      format: 'jpeg',
      width: 64,
      height: 48,
      byteSize: fs.statSync(absolute).size,
      hasExif: true
    })
    expect(image.capturedAt).toBe('2024-03-09T11:22:33')
    expect(image.hasCameraSerial).toBe(true)
    expect(image.hasGpsMetadata).toBe(true)
  })

  it('reports no capture metadata when a file carries no EXIF', async () => {
    await writePng('Kabin/b.png')

    const { images } = await scanGallerySource(sourceRoot)

    expect(images[0]).toMatchObject({
      format: 'png',
      hasExif: false,
      hasGpsMetadata: false,
      hasCameraSerial: false,
      hasExifComment: false
    })
    expect(images[0]!.capturedAt).toBeUndefined()
  })

  it('identifies every JPEG suffix spelling as one format', async () => {
    await writeJpeg('a.jpg')
    await writeJpeg('b.JPG', { width: 41 })
    await writeJpeg('c.jpeg', { width: 42 })
    await writeJpeg('d.JPEG', { width: 43 })

    const { images } = await scanGallerySource(sourceRoot)

    expect(images).toHaveLength(4)
    expect(images.every((image) => image.format === 'jpeg')).toBe(true)
  })

  it('returns source-relative paths with "/" separators, NFC-normalised', async () => {
    const decomposed = 'Şantiye'
    await writeJpeg(path.join(decomposed, 'a.jpg'))

    const { images } = await scanGallerySource(sourceRoot)

    expect(images[0]!.sourcePath).toBe(`${decomposed.normalize('NFC')}/a.jpg`)
    expect(images[0]!.sourcePath.includes('\\')).toBe(false)
  })

  it('scans in a deterministic order regardless of directory order', async () => {
    await writeJpeg('Konteyner/Yatakhane/b.jpg')
    await writeJpeg('Konteyner/Ofis/a.jpg')
    await writeJpeg('Kabin/WC/c.jpg')

    const first = await scanGallerySource(sourceRoot)
    const second = await scanGallerySource(sourceRoot)

    expect(first.images.map((image) => image.sourcePath)).toEqual([
      'Kabin/WC/c.jpg',
      'Konteyner/Ofis/a.jpg',
      'Konteyner/Yatakhane/b.jpg'
    ])
    expect(second.images.map((image) => image.sourcePath))
      .toEqual(first.images.map((image) => image.sourcePath))
  })

  it('names an unreadable image instead of skipping it', async () => {
    await writeJpeg('good.jpg')
    fs.writeFileSync(path.join(sourceRoot, 'broken.jpg'), Buffer.from('not an image at all'))

    const { images, problems } = await scanGallerySource(sourceRoot)

    expect(images.map((image) => image.sourcePath)).toEqual(['good.jpg'])
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('broken.jpg')
  })

  it('names an image whose decoded format is outside the accepted set', async () => {
    const absolute = path.join(sourceRoot, 'sneaky.jpg')
    await sharp({ create: { width: 10, height: 10, channels: 3, background: '#fff' } })
      .webp()
      .toFile(absolute)

    const { images, problems } = await scanGallerySource(sourceRoot)

    expect(images).toEqual([])
    expect(problems[0]).toContain('sneaky.jpg')
    expect(problems[0]).toContain('webp')
  })

  it('leaves every source file byte-identical', async () => {
    const photo = await writeJpeg('Konteyner/a.jpg', { exif: true })
    const before = createHash('sha256').update(fs.readFileSync(photo)).digest('hex')
    const beforeStat = fs.statSync(photo)

    const { images } = await scanGallerySource(sourceRoot)

    const after = createHash('sha256').update(fs.readFileSync(photo)).digest('hex')
    expect(images[0]!.sha256).toBe(before)
    expect(after).toBe(before)
    expect(fs.statSync(photo).size).toBe(beforeStat.size)
    expect(fs.statSync(photo).mtimeMs).toBe(beforeStat.mtimeMs)
  })

  it('refuses a source root that does not exist', async () => {
    await expect(scanGallerySource(path.join(sourceRoot, 'missing')))
      .rejects.toThrow(/missing/)
  })
})

describe('scanGallerySources across several folders', () => {
  let second: string

  beforeEach(() => {
    second = fs.mkdtempSync(path.join(os.tmpdir(), 'gallery-scan-second-'))
  })

  afterEach(() => {
    fs.rmSync(second, { recursive: true, force: true })
  })

  async function writeJpegUnder(base: string, relative: string, width = 40) {
    const absolute = path.join(base, relative)
    fs.mkdirSync(path.dirname(absolute), { recursive: true })
    await sharp({
      create: { width, height: 30, channels: 3, background: { r: 12, g: 120, b: 200 } }
    }).jpeg().toFile(absolute)
    return absolute
  }

  it('merges folders into one source-path-ordered list', async () => {
    await writeJpegUnder(sourceRoot, 'Kabin/b.jpg')
    await writeJpegUnder(second, 'Arca/a.jpg', 41)

    const { images, problems } = await scanGallerySources(
      [root(sourceRoot, 'all'), root(second, 'all')],
      new Set()
    )

    expect(problems).toEqual([])
    expect(images.map((image) => image.sourcePath)).toEqual(['Arca/a.jpg', 'Kabin/b.jpg'])
  })

  it('orders the merged list by source path, not by the order folders were passed', async () => {
    await writeJpegUnder(sourceRoot, 'Kabin/b.jpg')
    await writeJpegUnder(second, 'Arca/a.jpg', 41)

    const forwards = await scanGallerySources([root(sourceRoot, 'all'), root(second, 'all')], new Set())
    const backwards = await scanGallerySources([root(second, 'all'), root(sourceRoot, 'all')], new Set())

    expect(backwards.images.map((image) => image.sourcePath))
      .toEqual(forwards.images.map((image) => image.sourcePath))
  })

  it('takes only classified files from a classified-scope folder', async () => {
    await writeJpegUnder(second, 'Arca/wanted.jpg')
    await writeJpegUnder(second, 'Arca/contact-sheet.jpg', 41)

    const { images, problems } = await scanGallerySources(
      [root(second, 'classified')],
      new Set(['Arca/wanted.jpg'])
    )

    expect(problems).toEqual([])
    expect(images.map((image) => image.sourcePath)).toEqual(['Arca/wanted.jpg'])
  })

  it('never filters an all-scope folder by the pick list', async () => {
    await writeJpegUnder(sourceRoot, 'Kabin/a.jpg')
    await writeJpegUnder(sourceRoot, 'Kabin/b.jpg', 41)

    const { images } = await scanGallerySources([root(sourceRoot, 'all')], new Set(['Kabin/a.jpg']))

    expect(images.map((image) => image.sourcePath)).toEqual(['Kabin/a.jpg', 'Kabin/b.jpg'])
  })

  it('does not read a file a classified-scope folder holds but nobody picked', async () => {
    await writeJpegUnder(second, 'Arca/wanted.jpg')
    fs.writeFileSync(path.join(second, 'Arca/broken.jpg'), Buffer.from('not an image at all'))

    const { images, problems } = await scanGallerySources(
      [root(second, 'classified')],
      new Set(['Arca/wanted.jpg'])
    )

    expect(images.map((image) => image.sourcePath)).toEqual(['Arca/wanted.jpg'])
    expect(problems).toEqual([])
  })

  it('names a source path two folders both answer to rather than picking one', async () => {
    await writeJpegUnder(sourceRoot, 'Kabin/a.jpg')
    await writeJpegUnder(second, 'Kabin/a.jpg', 41)

    const { images, problems } = await scanGallerySources(
      [root(sourceRoot, 'all'), root(second, 'all')],
      new Set()
    )

    expect(images).toHaveLength(1)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain('Kabin/a.jpg')
    expect(problems[0]).toContain(second)
  })

  it('refuses a source root that does not exist', async () => {
    await expect(scanGallerySources([root(path.join(sourceRoot, 'missing'), 'all')], new Set()))
      .rejects.toThrow(/missing/)
  })
})
