import { categoryKey, type GalleryManifestItem } from './model'

/**
 * The three tracked artefacts: a manifest for machines, a CSV for spreadsheets, a report for people.
 *
 * All three are regenerated in full on every write, so their only defensible property is that the
 * same plan produces the same bytes. Everything here sorts explicitly and writes keys in a declared
 * order rather than trusting object construction order, so a diff means a decision changed.
 */

/** Manifest key order. Declared once so JSON output cannot drift with the planner's internals. */
const ITEM_KEYS: readonly (keyof GalleryManifestItem)[] = [
  'assetId', 'sha256', 'filePath', 'sourcePath', 'sourceAliases', 'family', 'useCase', 'project',
  'categories', 'title', 'alt', 'caption', 'order', 'role', 'confidence', 'flags', 'rightsStatus',
  'uploadEligible', 'heroEligible', 'possibleDuplicateAssetIds', 'format', 'width', 'height',
  'byteSize', 'capturedAt', 'hasExif'
]

export const CSV_COLUMNS = [
  'assetId', 'filePath', 'sourcePath', 'sourceAliases', 'family', 'useCase', 'project', 'categories',
  'title', 'alt', 'caption', 'order', 'role', 'confidence', 'flags', 'rightsStatus', 'uploadEligible',
  'heroEligible', 'possibleDuplicateAssetIds', 'format', 'width', 'height', 'byteSize', 'capturedAt',
  'hasExif'
] as const

export interface GalleryManifest {
  /** Readable source images the package accounts for, canonical plus collapsed duplicates. */
  sourceImageCount: number
  canonicalAssetCount: number
  exactDuplicatesCollapsed: number
  assets: GalleryManifestItem[]
}

export function galleryManifest(items: GalleryManifestItem[]): GalleryManifest {
  const collapsed = items.reduce((total, item) => total + item.sourceAliases.length, 0)
  return {
    sourceImageCount: items.length + collapsed,
    canonicalAssetCount: items.length,
    exactDuplicatesCollapsed: collapsed,
    assets: items
  }
}

export function manifestJson(items: GalleryManifestItem[]): string {
  const manifest = galleryManifest(items)
  return `${JSON.stringify({ ...manifest, assets: manifest.assets.map(orderKeys) }, null, 2)}\n`
}

/** Rebuild an item with keys in declared order, dropping absent optionals rather than writing null. */
function orderKeys(item: GalleryManifestItem): Record<string, unknown> {
  const ordered: Record<string, unknown> = {}
  for (const key of ITEM_KEYS) {
    if (item[key] !== undefined) ordered[key] = item[key]
  }
  return ordered
}

export function manifestCsv(items: GalleryManifestItem[]): string {
  const rows = items.map((item) => CSV_COLUMNS.map((column) => cell(item, column)).map(escape).join(','))
  return `${[CSV_COLUMNS.join(','), ...rows].join('\n')}\n`
}

function cell(item: GalleryManifestItem, column: typeof CSV_COLUMNS[number]): string {
  switch (column) {
    case 'sourceAliases':
      return [...item.sourceAliases].sort((a, b) => a.localeCompare(b, 'en')).join('|')
    case 'categories':
      return item.categories.map(categoryKey).sort((a, b) => a.localeCompare(b, 'en')).join('|')
    case 'flags':
      return [...item.flags].sort((a, b) => a.localeCompare(b, 'en')).join('|')
    case 'possibleDuplicateAssetIds':
      return [...item.possibleDuplicateAssetIds].sort((a, b) => a.localeCompare(b, 'en')).join('|')
    default: {
      const value = item[column]
      return value === undefined ? '' : String(value)
    }
  }
}

/** RFC 4180: quote a field holding a comma, quote, CR or LF, and double any quote inside it. */
function escape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function reviewReport(items: GalleryManifestItem[], sourceCount: number): string {
  const collapsed = items.reduce((total, item) => total + item.sourceAliases.length, 0)
  const count = (predicate: (item: GalleryManifestItem) => boolean) => items.filter(predicate).length

  const totals: [string, number][] = [
    ['Source images', sourceCount],
    ['Canonical assets', items.length],
    ['Exact duplicates collapsed', collapsed],
    ['Possible duplicates flagged', count((item) => item.possibleDuplicateAssetIds.length > 0)],
    ['Rights review required', count((item) => item.rightsStatus === 'review-required')],
    ['Upload eligible', count((item) => item.uploadEligible)],
    ['Hero eligible', count((item) => item.heroEligible)],
    ['Not hero eligible', count((item) => !item.heroEligible)],
    ['Low resolution', count((item) => item.flags.includes('low-resolution'))],
    ['People or privacy', count((item) => item.flags.includes('people-or-privacy'))],
    ['Construction progress', count((item) => item.flags.includes('construction-progress'))],
    ['Overlay or watermark', count((item) => item.flags.includes('overlay-or-watermark'))],
    ['Carries EXIF', count((item) => item.hasExif)],
    ['Carries GPS metadata', count((item) => item.flags.includes('gps-metadata'))],
    ['Carries camera serial metadata', count((item) => item.flags.includes('camera-serial-metadata'))],
    ['Carries EXIF comment metadata', count((item) => item.flags.includes('exif-comment-metadata'))]
  ]

  const byConfidence = ['high', 'medium', 'low'] as const
  const taxonomy = new Map<string, number>()
  for (const item of items) {
    taxonomy.set(categoryKey(item), (taxonomy.get(categoryKey(item)) ?? 0) + 1)
  }

  const review = items
    .filter((item) => item.rightsStatus === 'review-required')
    .map((item) => `- \`${item.filePath}\` — ${item.title}${item.caption ? ` (${item.caption})` : ''}`)

  const notHero = items
    .filter((item) => !item.heroEligible)
    .map((item) => `- \`${item.filePath}\` — ${item.flags.join(', ') || item.role}`)

  return [
    '# Gallery preparation review report',
    '',
    'Generated by `pnpm gallery:prepare --write`. Do not edit by hand — edit',
    '`sanity/gallery/classification.json` and regenerate.',
    '',
    '## Totals',
    '',
    '| Measure | Count |',
    '| --- | --- |',
    ...totals.map(([label, value]) => `| ${label} | ${value} |`),
    '',
    '## Confidence',
    '',
    '| Confidence | Assets |',
    '| --- | --- |',
    ...byConfidence.map((band) => `| ${band} | ${count((item) => item.confidence === band)} |`),
    '',
    '## Taxonomy',
    '',
    '| Family | Use case | Project | Assets |',
    '| --- | --- | --- | --- |',
    ...[...taxonomy.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'en'))
      .map(([key, value]) => `| ${key.split('/').join(' | ')} | ${value} |`),
    '',
    '## Rights review queue',
    '',
    'These assets are copied and catalogued, and carry `uploadEligible: false`. An importer must not',
    'publish them until a human clears their rights and privacy status.',
    '',
    ...(review.length > 0 ? review : ['_None._']),
    '',
    '## Not hero eligible',
    '',
    'Retained in full, but blocked from leading a gallery by the flags below.',
    '',
    ...(notHero.length > 0 ? notHero : ['_None._']),
    '',
    '## Guarantees',
    '',
    '- Source files were read only. Nothing under the source folder was renamed, moved, deleted or rewritten.',
    '- Copies are byte-identical to their sources, so pixels and EXIF are retained exactly as shot.',
    '- Precise GPS coordinates, camera serial numbers and EXIF comments stay inside the ignored image',
    '  copies. Only the presence flags above reach this tracked report.',
    '- Only byte-identical files were collapsed. Visually similar images remain separate assets and',
    '  cross-reference each other through `possibleDuplicateAssetIds`.',
    '- Rights-review assets are retained with `uploadEligible: false`, never dropped.',
    '- Weak assets are retained with `heroEligible: false`, never dropped.',
    '- No Sanity upload was performed, and no Sanity schema exists for these assets yet.',
    ''
  ].join('\n')
}
