import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import type { GalleryFormat, ScannedImage } from './model'
import { toSourcePath } from './paths'

/**
 * Read-only inspection of the external photo folder.
 *
 * Nothing in this module writes, renames or re-encodes. `sharp` appears only as a metadata reader:
 * no encoder call, no `toFile`, no `toBuffer`. The originals live in the user's Downloads folder
 * and are not ours to touch, so the scan's correctness bar is that the files are bit-identical
 * afterwards — which `tests/gallery/scan.spec.ts` asserts directly.
 */

const IMAGE_SUFFIXES = new Set(['.jpg', '.jpeg', '.png'])
const ACCEPTED_FORMATS: readonly string[] = ['jpeg', 'png']

export interface GallerySourceScan {
  images: ScannedImage[]
  /** Files that look like images but could not be read or decoded, named source-relative. */
  problems: string[]
}

/** Every image under `sourceRoot`, in a stable order, with its bytes and dimensions read once each. */
export async function scanGallerySource(sourceRoot: string): Promise<GallerySourceScan> {
  if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
    throw new Error(`Source folder does not exist: ${sourceRoot}`)
  }

  const sourcePaths = walk(sourceRoot)
    .sort((a, b) => a.localeCompare(b, 'en'))

  const images: ScannedImage[] = []
  const problems: string[] = []

  for (const sourcePath of sourcePaths) {
    const absolutePath = path.join(sourceRoot, sourcePath)
    try {
      images.push(await inspect(sourcePath, absolutePath))
    } catch (error) {
      problems.push(`${sourcePath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return { images, problems }
}

/**
 * Source-relative paths of every candidate image, recursively.
 *
 * Dot-files are skipped wholesale rather than `.DS_Store` by name: the folder came off a Mac and
 * carries whatever else the Finder left behind, none of which is photography.
 */
function walk(sourceRoot: string, directory: string = sourceRoot): string[] {
  const found: string[] = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const absolute = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      found.push(...walk(sourceRoot, absolute))
    } else if (entry.isFile() && IMAGE_SUFFIXES.has(path.extname(entry.name).toLowerCase())) {
      found.push(toSourcePath(sourceRoot, absolute))
    }
  }

  return found
}

async function inspect(sourcePath: string, absolutePath: string): Promise<ScannedImage> {
  const bytes = fs.readFileSync(absolutePath)
  const sha256 = createHash('sha256').update(bytes).digest('hex')

  const metadata = await sharp(absolutePath).metadata()

  if (!ACCEPTED_FORMATS.includes(metadata.format ?? '')) {
    throw new Error(`decoded as "${metadata.format ?? 'unknown'}", which the gallery package does not accept`)
  }
  if (!metadata.width || !metadata.height) {
    throw new Error('has no readable dimensions')
  }

  const exif = readExifFacts(metadata.exif)

  return {
    sourcePath,
    absolutePath,
    sha256,
    format: metadata.format as GalleryFormat,
    width: metadata.width,
    height: metadata.height,
    byteSize: bytes.byteLength,
    hasExif: metadata.exif !== undefined && metadata.exif.byteLength > 0,
    ...exif
  }
}

interface ExifFacts {
  capturedAt?: string
  hasGpsMetadata: boolean
  hasCameraSerial: boolean
  hasExifComment: boolean
}

const NO_EXIF: ExifFacts = { hasGpsMetadata: false, hasCameraSerial: false, hasExifComment: false }

const TAG = {
  dateTime: 0x0132,
  xpComment: 0x9c9c,
  exifIfdPointer: 0x8769,
  gpsIfdPointer: 0x8825,
  dngCameraSerial: 0xc62f,
  dateTimeOriginal: 0x9003,
  userComment: 0x9286,
  bodySerialNumber: 0xa431,
  gpsVersionId: 0x0000
} as const

const TYPE_SIZE: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 }

/**
 * What the EXIF blob contains, reduced to four facts.
 *
 * A deliberately small reader rather than a dependency: the only questions this package asks of
 * EXIF are "when" and "does this carry something private", and the answer to the second one must
 * never be the value itself. Any malformed blob answers "nothing" rather than failing the scan —
 * a photo with unreadable EXIF is still a photo.
 */
function readExifFacts(exif: Buffer | undefined): ExifFacts {
  if (!exif || exif.byteLength < 8) return NO_EXIF

  try {
    const tiff = exif.subarray(0, 6).toString('latin1') === 'Exif\0\0' ? 6 : 0
    const order = exif.readUInt16BE(tiff)
    if (order !== 0x4949 && order !== 0x4d4d) return NO_EXIF
    const little = order === 0x4949

    const u16 = (at: number) => (little ? exif.readUInt16LE(at) : exif.readUInt16BE(at))
    const u32 = (at: number) => (little ? exif.readUInt32LE(at) : exif.readUInt32BE(at))

    if (u16(tiff + 2) !== 42) return NO_EXIF

    const ifd0 = readIfd(exif, tiff, u32(tiff + 4), u16, u32)
    const exifIfd = readIfd(exif, tiff, ifd0.get(TAG.exifIfdPointer)?.longValue, u16, u32)
    const gpsIfd = readIfd(exif, tiff, ifd0.get(TAG.gpsIfdPointer)?.longValue, u16, u32)

    const captured = ascii(exif, exifIfd.get(TAG.dateTimeOriginal))
      ?? ascii(exif, ifd0.get(TAG.dateTime))

    return {
      capturedAt: toIsoLocal(captured),
      // A GPS IFD holding nothing but its version tag says only that a camera writes the block.
      hasGpsMetadata: [...gpsIfd.keys()].some((tag) => tag !== TAG.gpsVersionId),
      hasCameraSerial: hasValue(exif, exifIfd.get(TAG.bodySerialNumber))
        || hasValue(exif, ifd0.get(TAG.dngCameraSerial)),
      hasExifComment: hasValue(exif, exifIfd.get(TAG.userComment), 8)
        || hasValue(exif, ifd0.get(TAG.xpComment))
    }
  } catch {
    return NO_EXIF
  }
}

interface ExifEntry {
  type: number
  count: number
  /** Absolute offset of the value inside the EXIF buffer, wherever it ended up living. */
  valueAt: number
  byteLength: number
  /** The first LONG/SHORT, for the two pointer tags. */
  longValue: number
}

function readIfd(
  exif: Buffer,
  tiff: number,
  offset: number | undefined,
  u16: (at: number) => number,
  u32: (at: number) => number
): Map<number, ExifEntry> {
  const entries = new Map<number, ExifEntry>()
  if (offset === undefined) return entries

  const start = tiff + offset
  if (start + 2 > exif.byteLength) return entries

  const count = u16(start)
  for (let index = 0; index < count; index += 1) {
    const at = start + 2 + index * 12
    if (at + 12 > exif.byteLength) break

    const tag = u16(at)
    const type = u16(at + 2)
    const valueCount = u32(at + 4)
    const byteLength = (TYPE_SIZE[type] ?? 0) * valueCount
    // Values of four bytes or fewer live in the entry itself; anything larger is a pointer.
    const valueAt = byteLength > 4 ? tiff + u32(at + 8) : at + 8

    entries.set(tag, { type, count: valueCount, valueAt, byteLength, longValue: u32(at + 8) })
  }

  return entries
}

/** True when the tag exists and holds more than padding — an empty serial field is not a serial. */
function hasValue(exif: Buffer, entry: ExifEntry | undefined, ignoreLeading = 0): boolean {
  if (!entry || entry.byteLength <= ignoreLeading) return false
  if (entry.valueAt + entry.byteLength > exif.byteLength) return false

  const payload = exif.subarray(entry.valueAt + ignoreLeading, entry.valueAt + entry.byteLength)
  return payload.some((byte) => byte !== 0 && byte !== 0x20)
}

function ascii(exif: Buffer, entry: ExifEntry | undefined): string | undefined {
  if (!entry || entry.type !== 2 || entry.byteLength === 0) return undefined
  if (entry.valueAt + entry.byteLength > exif.byteLength) return undefined

  const value = exif.subarray(entry.valueAt, entry.valueAt + entry.byteLength)
    .toString('latin1')
    .replace(/\0.*$/, '')
    .trim()

  return value === '' ? undefined : value
}

/** EXIF writes `2024:03:09 11:22:33`, and carries no zone — so neither does the manifest. */
function toIsoLocal(value: string | undefined): string | undefined {
  const match = value?.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
  if (!match) return undefined

  const [, year, month, day, hour, minute, second] = match
  if (year === '0000' || month === '00' || day === '00') return undefined

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`
}
