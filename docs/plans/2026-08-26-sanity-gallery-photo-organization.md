# Sanity Gallery Photo Organization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and run a deterministic gallery-preparation pipeline that copies 287 unique project photos into an ignored repo-local source library and generates tracked, reviewable metadata for a future Sanity gallery import.

**Architecture:** A tracked `classification.json` records human visual decisions for all 298 source images. A TypeScript CLI scans the external folder, hashes and inspects images, validates every decision, collapses only exact duplicates, copies bytes verbatim into `sanity/gallery/source/`, and generates stable JSON, CSV, and Markdown outputs. No Sanity schema, upload call, or frontend integration enters this change.

**Tech Stack:** Node.js APIs, TypeScript, `jiti`, `sharp` metadata reads, Vitest, JSON/CSV/Markdown artifacts, SHA-256 from `node:crypto`.

---

## Execution rules

- Use `@superpowers:test-driven-development` for Tasks 1–6.
- Use `@superpowers:verification-before-completion` before claiming completion.
- Work around existing dirty-worktree changes. Touch only files listed here.
- Never delete, rename, move, or modify anything inside `/Users/enesfurkanornek/Downloads/Proje Görselleri`.
- Never call Sanity APIs.
- Do not change `app/pages/gallery.vue`, `sanity/schemas/`, or `scripts/catalogue/`.
- Do not commit unless the user separately requests a commit.

## Target file map

```text
.gitignore                                      MODIFY
package.json                                    MODIFY
tsconfig.gallery.json                           CREATE
scripts/gallery/prepare-gallery.ts              CREATE
scripts/gallery/lib/model.ts                    CREATE
scripts/gallery/lib/paths.ts                    CREATE
scripts/gallery/lib/scan.ts                     CREATE
scripts/gallery/lib/planAssets.ts               CREATE
scripts/gallery/lib/serialize.ts                CREATE
scripts/gallery/lib/validate.ts                 CREATE
tests/gallery/model.spec.ts                     CREATE
tests/gallery/scan.spec.ts                      CREATE
tests/gallery/planAssets.spec.ts                CREATE
tests/gallery/serialize.spec.ts                 CREATE
tests/gallery/prepareGallery.spec.ts            CREATE
sanity/gallery/classification.json              CREATE
sanity/gallery/manifest.json                    CREATE, GENERATED
sanity/gallery/manifest.csv                     CREATE, GENERATED
sanity/gallery/review-report.md                 CREATE, GENERATED
sanity/gallery/README.md                        CREATE
sanity/gallery/source/**                        CREATE LOCALLY, GIT-IGNORED
```

### Task 1: Define the gallery metadata contract and invariant validator

**Files:**

- Create: `scripts/gallery/lib/model.ts`
- Create: `scripts/gallery/lib/validate.ts`
- Create: `tests/gallery/model.spec.ts`

**Step 1: Write failing contract tests**

Cover these cases in `tests/gallery/model.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validateClassifications, validateManifest } from '../../scripts/gallery/lib/validate'

describe('gallery classification invariants', () => {
  it('rejects missing English title and alt text', () => {
    expect(validateClassifications([
      classification({ title: '', alt: '' })
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('title'),
      expect.stringContaining('alt')
    ]))
  })

  it('rejects paths outside the approved taxonomy', () => {
    expect(validateClassifications([
      classification({ family: 'temporary-buildings' as never })
    ])).toContainEqual(expect.stringContaining('family'))
  })

  it('forces rights-review assets out of automatic upload', () => {
    expect(validateManifest([
      manifestItem({ rightsStatus: 'review-required', uploadEligible: true })
    ])).toContainEqual(expect.stringContaining('uploadEligible'))
  })
})
```

Add small factory helpers inside the test file. Do not load the real 298-row classification in unit tests.

**Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run tests/gallery/model.spec.ts
```

Expected: FAIL because gallery model and validators do not exist.

**Step 3: Implement closed types and pure validation**

Define these core shapes in `model.ts`:

```ts
export const GALLERY_FAMILIES = [
  'containers',
  'prefabricated-houses',
  'cabins',
  'prefabricated-buildings',
  'steel-houses',
  'others'
] as const

export type GalleryFamily = typeof GALLERY_FAMILIES[number]
export type ClassificationConfidence = 'high' | 'medium' | 'low'
export type RightsStatus = 'unknown' | 'review-required'
export type GalleryRole =
  | 'hero'
  | 'alternate-exterior'
  | 'aerial-context'
  | 'interior-wide'
  | 'interior-detail'
  | 'construction-progress'
  | 'transport-loading'
  | 'secondary'

export type GalleryFlag =
  | 'low-resolution'
  | 'portrait'
  | 'nonstandard-aspect'
  | 'soft-or-hazy'
  | 'dark'
  | 'construction-progress'
  | 'overlay-or-watermark'
  | 'possible-duplicate'
  | 'people-or-privacy'
  | 'misclassified-source'
  | 'gps-metadata'
  | 'camera-serial-metadata'
  | 'exif-comment-metadata'

export interface GalleryCategory {
  family: GalleryFamily
  useCase: string
  project: string
}

export interface GalleryClassification extends GalleryCategory {
  sourcePath: string
  categories: GalleryCategory[]
  title: string
  alt: string
  caption?: string
  order: number
  role: GalleryRole
  confidence: ClassificationConfidence
  flags: GalleryFlag[]
  rightsStatus: RightsStatus
  preferredCanonical?: boolean
  possibleDuplicateSources?: string[]
}

export interface ScannedImage {
  sourcePath: string
  absolutePath: string
  sha256: string
  format: 'jpeg' | 'png'
  width: number
  height: number
  byteSize: number
  capturedAt?: string
  hasExif: boolean
}

export interface GalleryManifestItem extends GalleryCategory {
  assetId: `sha256:${string}`
  sha256: string
  filePath: string
  sourcePath: string
  sourceAliases: string[]
  categories: GalleryCategory[]
  title: string
  alt: string
  caption?: string
  order: number
  role: GalleryRole
  confidence: ClassificationConfidence
  flags: GalleryFlag[]
  rightsStatus: RightsStatus
  uploadEligible: boolean
  heroEligible: boolean
  possibleDuplicateAssetIds: string[]
  format: 'jpeg' | 'png'
  width: number
  height: number
  byteSize: number
  capturedAt?: string
  hasExif: boolean
}
```

Keep use-case and project as validated kebab-case strings, not closed unions. Taxonomy may expand later without a code release. `validate.ts` must return every problem, matching existing catalogue-validator style.

Validate:

- approved family;
- normalized repo-relative `sourcePath` without `..`;
- kebab-case use case/project;
- positive integer order;
- non-empty English title and alt;
- unique source paths;
- categories deduplicated;
- rights-review implies `uploadEligible: false`;
- hero role implies `heroEligible: true` unless a blocking flag exists;
- low-resolution, overlay/watermark, soft/hazy, construction-progress, and portrait/nonstandard flags imply `heroEligible: false`;
- no precise GPS, serial, or comment value exists in the manifest shape.

**Step 4: Run tests and typecheck**

Run:

```bash
pnpm vitest run tests/gallery/model.spec.ts
```

Expected: PASS.

**Step 5: Commit checkpoint**

If the user has authorized commits:

```bash
git add scripts/gallery/lib/model.ts scripts/gallery/lib/validate.ts tests/gallery/model.spec.ts
git commit -m "feat: define gallery asset metadata contract"
```

Otherwise leave changes staged nowhere.

### Task 2: Implement byte-safe source scanning

**Files:**

- Create: `scripts/gallery/lib/paths.ts`
- Create: `scripts/gallery/lib/scan.ts`
- Create: `tests/gallery/scan.spec.ts`

**Step 1: Write failing scanner tests**

Tests create a temporary directory, generate one JPEG and one PNG with `sharp`, add `.DS_Store`, and assert:

- only supported images return;
- source paths use `/` separators and NFC normalization;
- `.JPG` and `.jpeg` identify as JPEG;
- dimensions, byte size, SHA-256, format, and EXIF presence return;
- scan order is deterministic;
- unreadable or unsupported image payloads report a named error;
- source files remain byte-identical after scanning.

Core assertion:

```ts
const before = createHash('sha256').update(readFileSync(photo)).digest('hex')
const images = await scanGallerySource(sourceRoot)
const after = createHash('sha256').update(readFileSync(photo)).digest('hex')

expect(images[0].sha256).toBe(before)
expect(after).toBe(before)
```

**Step 2: Run tests and verify failure**

```bash
pnpm vitest run tests/gallery/scan.spec.ts
```

Expected: FAIL because scanner does not exist.

**Step 3: Implement scanner**

`paths.ts` should expose a repo-root resolver equivalent to `scripts/catalogue/lib/paths.ts`, scoped to gallery code. `scan.ts` must:

1. Recursively walk the supplied absolute source root.
2. Ignore `.DS_Store` and non-image extensions.
3. Sort source-relative paths with `localeCompare('en')` after NFC normalization.
4. Read each file once for SHA-256 and byte size.
5. Call `sharp(absolutePath).metadata()` only for metadata; never call an encoder or `toFile()`.
6. Accept only decoded `jpeg` and `png` formats.
7. Return problems with source-relative paths rather than silently skipping failures.

Do not hardcode the user's absolute Downloads path in source code. It enters through `--source`.

**Step 4: Run scanner tests**

```bash
pnpm vitest run tests/gallery/scan.spec.ts
```

Expected: PASS.

**Step 5: Commit checkpoint**

```bash
git add scripts/gallery/lib/paths.ts scripts/gallery/lib/scan.ts tests/gallery/scan.spec.ts
git commit -m "feat: scan gallery source images safely"
```

Run only with commit authorization.

### Task 3: Plan canonical assets, taxonomy paths, and exact deduplication

**Files:**

- Create: `scripts/gallery/lib/planAssets.ts`
- Create: `tests/gallery/planAssets.spec.ts`

**Step 1: Write failing planner tests**

Cover:

- singleton image produces one output;
- two equal hashes produce one canonical output plus one `sourceAliases` entry;
- duplicate group without exactly one `preferredCanonical` fails;
- seven visually similar but different hashes remain separate;
- secondary categories merge without duplicate rows;
- `.jpeg`/`.JPG` output becomes `.jpg`; PNG remains `.png`;
- output follows `sanity/gallery/source/<family>/<use-case>/<project>/<project>-NNN.<ext>`;
- an occupied output path or repeated order inside one physical group fails;
- rights-review forces upload ineligible;
- quality flags force hero ineligible but never remove the item;
- possible-duplicate source links resolve to stable asset IDs.

Example exact-dedup assertion:

```ts
const planned = planGalleryAssets(
  [scan({ sourcePath: 'A/1.jpg', sha256: SAME }), scan({ sourcePath: 'B/2.JPG', sha256: SAME })],
  [
    classification({ sourcePath: 'A/1.jpg', preferredCanonical: true }),
    classification({ sourcePath: 'B/2.JPG', categories: [secondaryCategory] })
  ]
)

expect(planned).toHaveLength(1)
expect(planned[0].sourcePath).toBe('A/1.jpg')
expect(planned[0].sourceAliases).toEqual(['B/2.JPG'])
expect(planned[0].categories).toContainEqual(secondaryCategory)
```

**Step 2: Run tests and verify failure**

```bash
pnpm vitest run tests/gallery/planAssets.spec.ts
```

Expected: FAIL because planner does not exist.

**Step 3: Implement pure planner**

Implement `planGalleryAssets(scanned, classifications)` as a pure function:

1. Validate one classification per scanned source path and reject stale rows.
2. Group scans by full SHA-256.
3. For duplicate groups, require exactly one `preferredCanonical: true`; use its physical taxonomy and prose.
4. Merge aliases, flags, and secondary categories from every duplicate member.
5. Assign `assetId` as `sha256:<full digest>`.
6. Resolve possible-duplicate source paths after all hash groups exist.
7. Derive extension from decoded format, never source suffix.
8. Derive eligibility from rights and quality rules; never use eligibility to filter output.
9. Sort output by family, use case, project, order, then asset ID.

Do not copy files in this module.

**Step 4: Run planner tests**

```bash
pnpm vitest run tests/gallery/planAssets.spec.ts
```

Expected: PASS.

**Step 5: Commit checkpoint**

```bash
git add scripts/gallery/lib/planAssets.ts tests/gallery/planAssets.spec.ts
git commit -m "feat: plan canonical gallery assets"
```

Run only with commit authorization.

### Task 4: Serialize deterministic JSON, CSV, and review output

**Files:**

- Create: `scripts/gallery/lib/serialize.ts`
- Create: `tests/gallery/serialize.spec.ts`

**Step 1: Write failing serializer tests**

Assert:

- JSON is two-space-indented, stable, and ends with newline;
- CSV has one canonical asset per row;
- arrays use `|`-joined stable values;
- commas, quotes, and newlines escape per RFC 4180;
- no absolute source path appears;
- review report totals exact duplicates, possible duplicates, rights review, low resolution, non-hero assets, confidence bands, and taxonomy counts;
- repeated serialization is byte-identical.

Use this CSV column order:

```text
assetId,filePath,sourcePath,sourceAliases,family,useCase,project,categories,title,alt,caption,order,role,confidence,flags,rightsStatus,uploadEligible,heroEligible,possibleDuplicateAssetIds,format,width,height,byteSize,capturedAt,hasExif
```

**Step 2: Run tests and verify failure**

```bash
pnpm vitest run tests/gallery/serialize.spec.ts
```

Expected: FAIL because serializer does not exist.

**Step 3: Implement serializers**

Export:

```ts
export function manifestJson(items: GalleryManifestItem[]): string
export function manifestCsv(items: GalleryManifestItem[]): string
export function reviewReport(items: GalleryManifestItem[], sourceCount: number): string
```

The report must explicitly state:

- source count;
- canonical count;
- exact duplicates collapsed;
- EXIF retained in local source copies;
- rights-review files retained but blocked from automatic upload;
- weak files retained but excluded from hero use;
- no Sanity upload performed.

**Step 4: Run serializer tests**

```bash
pnpm vitest run tests/gallery/serialize.spec.ts
```

Expected: PASS.

**Step 5: Commit checkpoint**

```bash
git add scripts/gallery/lib/serialize.ts tests/gallery/serialize.spec.ts
git commit -m "feat: serialize gallery preparation artifacts"
```

Run only with commit authorization.

### Task 5: Build safe dry-run, write, and verify CLI modes

**Files:**

- Create: `scripts/gallery/prepare-gallery.ts`
- Create: `tests/gallery/prepareGallery.spec.ts`
- Create: `tsconfig.gallery.json`
- Modify: `package.json`

**Step 1: Write failing integration tests**

Use a temporary source and output root. Test:

1. Default mode prints a plan and creates nothing.
2. `--write` creates parent directories, copies canonical files, and writes all generated artifacts.
3. Source paths still exist after write.
4. Copied SHA-256 equals source SHA-256, proving EXIF and pixels were retained byte-for-byte.
5. Existing output with matching hash is skipped idempotently.
6. Existing output with mismatched hash stops without overwrite.
7. `--verify` detects missing files, changed bytes, unexpected files, and stale manifests.
8. Invalid classifications stop before any output directory is created.

Expose a testable function instead of making all behavior live in top-level CLI code:

```ts
export interface PrepareGalleryOptions {
  sourceRoot: string
  outputRoot: string
  classificationFile: string
  mode: 'dry-run' | 'write' | 'verify'
}

export async function prepareGallery(options: PrepareGalleryOptions): Promise<PrepareGalleryResult>
```

**Step 2: Run tests and verify failure**

```bash
pnpm vitest run tests/gallery/prepareGallery.spec.ts
```

Expected: FAIL because CLI does not exist.

**Step 3: Implement CLI and filesystem boundary**

CLI contract:

```text
pnpm gallery:prepare --source <absolute-folder>          # dry-run
pnpm gallery:prepare --source <absolute-folder> --write  # copy + generate
pnpm gallery:verify --source <absolute-folder>           # read-only verification
```

Implementation rules:

- Require an absolute, existing `--source` directory.
- Refuse simultaneous `--write` and `--verify`.
- Default output root is `sanity/gallery/source`.
- Default classification file is `sanity/gallery/classification.json`.
- Generated artifacts go beside source: `sanity/gallery/manifest.json`, `.csv`, and `review-report.md`.
- Use `fs.copyFileSync`; never `rename`, `unlink`, or an image encoder.
- Before replacing a generated text artifact, build all outputs in memory and validate the full plan.
- Before copying over an existing image, hash it. Skip equal content; throw on unequal content.
- Verify that output contains exactly planned paths; report unexpected files without deleting them.
- Print concise totals: scanned, canonical, exact duplicates collapsed, rights-review, hero-ineligible, files copied/skipped.

Add scripts to `package.json`:

```json
"gallery:prepare": "jiti scripts/gallery/prepare-gallery.ts",
"gallery:verify": "jiti scripts/gallery/prepare-gallery.ts --verify",
"typecheck:gallery": "tsc -p tsconfig.gallery.json"
```

Create `tsconfig.gallery.json` with the same strict compiler settings as `tsconfig.catalogue.json`, including only `scripts/gallery/**/*.ts` and `tests/gallery/**/*.ts`.

**Step 4: Run focused verification**

```bash
pnpm vitest run tests/gallery/prepareGallery.spec.ts
pnpm typecheck:gallery
```

Expected: both PASS.

**Step 5: Commit checkpoint**

```bash
git add package.json tsconfig.gallery.json scripts/gallery/prepare-gallery.ts tests/gallery/prepareGallery.spec.ts
git commit -m "feat: add safe gallery preparation command"
```

Run only with commit authorization.

### Task 6: Encode the approved 298-image visual classification

**Files:**

- Create: `sanity/gallery/classification.json`
- Extend: `tests/gallery/model.spec.ts`

**Step 1: Add a failing real-classification structure test**

The test loads the tracked classification file without touching Downloads and asserts:

```ts
it('records one decision for every audited source image', () => {
  const rows = loadClassification()
  expect(rows).toHaveLength(298)
  expect(new Set(rows.map((row) => row.sourcePath)).size).toBe(298)
  expect(validateClassifications(rows)).toEqual([])
})
```

Also assert every row has English title and alt, every source suffix is an accepted source suffix, and project/customer names appear only where source filenames or visual evidence support them.

**Step 2: Run test and verify failure**

```bash
pnpm vitest run tests/gallery/model.spec.ts
```

Expected: FAIL because classification file does not exist.

**Step 3: Populate all 298 rows from the completed visual audit**

Apply these approved taxonomy rules:

- `containers`: `disaster-relief`, `dormitory`, `standard-product`, `residential`, `office`, `construction-site`.
- `prefabricated-houses`: `residential`.
- `cabins`: `retail-event-kiosk`, `security-guard`, `wc-shower`.
- `prefabricated-buildings`: `office`, `education`, `accommodation`, `sports-social`, `construction-site`, `dining`, `sanitary`.
- `steel-houses`: `residential`.
- `others`: shared/unprovable homes or other uncertain family; use project `others` when project identity is unknown.

Required reclassifications:

- Move all former `Konteyner/Metropol` photos to `cabins/security-guard`.
- Move the FC Barcelona office-folder image to `cabins/retail-event-kiosk`.
- Move standard-folder camp/site images out of `standard-product`.
- Move the compound aerial out of container residential.
- Split the former prefabricated-hotel folder across accommodation, sports/social, education, and dining based on visual evidence.
- Keep container construction-site and dormitory physical groups separate per the user's decision, even where project tags overlap.
- Place visually unprovable shared steel/prefabricated home assets under `others/residential` and retain both source classifications in `categories[]`.

Sequence each project with this default:

```text
01 finished exterior/hero
02 alternate exterior
03 aerial/site context
04 interior wide
05 interior/detail
80 construction progress
90 transport/loading
```

For large camps, aerial scale may lead. For retail, front/service view leads and crowd/context follows. Assign unique integer `order` values inside every physical project group.

Rights and quality rules:

- Mark all 54 retail/event kiosk images `review-required`; add `people-or-privacy` where visible people/faces occur.
- Mark the school-yard image containing children `review-required`.
- Mark the Bailey Cooper/UK Kiosks provenance file `review-required` and preserve the warning in caption/report metadata.
- Apply the eight known low-resolution flags.
- Apply portrait/nonstandard, dark, soft/hazy, overlay/watermark, construction-progress, and misclassified-source flags from the visual audit.
- Record the seven high-confidence visual duplicate relations plus burst pairs as possible duplicates; do not mark them canonical duplicates.
- For each of the 11 SHA duplicate pairs, set `preferredCanonical: true` on exactly one source row using strongest classification and resolution.

Write factual English alt text. Do not infer company, location, construction system, or customer when uncertain. Leave caption absent when it adds no verified information.

**Step 4: Run classification tests**

```bash
pnpm vitest run tests/gallery/model.spec.ts
```

Expected: PASS with 298 valid, unique source rows.

**Step 5: Commit checkpoint**

```bash
git add sanity/gallery/classification.json tests/gallery/model.spec.ts
git commit -m "data: classify gallery source photography"
```

Run only with commit authorization.

### Task 7: Protect binaries and document the package

**Files:**

- Modify: `.gitignore`
- Create: `sanity/gallery/README.md`

**Step 1: Write the ignore rule before copying any real image**

Add:

```gitignore
# Gallery preparation: local byte-preserving image copies; metadata remains tracked.
sanity/gallery/source/
```

Do not ignore `sanity/gallery/` broadly.

**Step 2: Verify ignore behavior with a harmless temporary probe**

Create a temporary file only inside the target source directory, run:

```bash
git check-ignore -v sanity/gallery/source/.ignore-probe
```

Expected: output names the new `.gitignore` rule. Remove only the known probe file afterward; never run a broad recursive delete.

**Step 3: Write package documentation**

`sanity/gallery/README.md` must explain:

- purpose and non-goals;
- tracked versus ignored files;
- exact dry-run/write/verify commands;
- source folder must be passed explicitly;
- 298 source / 287 canonical expected baseline;
- byte-preserving copy and retained EXIF;
- exact versus possible duplicate policy;
- taxonomy and `others` behavior;
- rights/upload/hero flags;
- no Sanity upload occurs;
- future gallery schema/uploader should consume `manifest.json`, never crawl filenames.

**Step 4: Verify only intended files appear to Git**

```bash
git status --short -- .gitignore sanity/gallery
```

Expected: `.gitignore`, README, classification, and generated metadata appear; `sanity/gallery/source/**` does not.

**Step 5: Commit checkpoint**

```bash
git add .gitignore sanity/gallery/README.md
git commit -m "docs: define gallery source package workflow"
```

Run only with commit authorization.

### Task 8: Dry-run against the real source and generate the package

**Files:**

- Create locally, ignored: `sanity/gallery/source/**`
- Create, generated: `sanity/gallery/manifest.json`
- Create, generated: `sanity/gallery/manifest.csv`
- Create, generated: `sanity/gallery/review-report.md`

**Step 1: Run real dry-run**

```bash
pnpm gallery:prepare --source "/Users/enesfurkanornek/Downloads/Proje Görselleri"
```

Expected:

- 298 readable images scanned;
- 287 canonical assets planned;
- 11 exact duplicate files collapsed into aliases;
- zero writes;
- no missing/stale classification rows;
- no path collisions.

If counts differ, stop. Do not weaken expected-count guards or silently skip files. Reconcile the named paths first.

**Step 2: Generate byte-preserving copies and metadata**

```bash
pnpm gallery:prepare --source "/Users/enesfurkanornek/Downloads/Proje Görselleri" --write
```

Expected: 287 canonical files copied; manifests/report written; source files untouched.

**Step 3: Run independent verification mode**

```bash
pnpm gallery:verify --source "/Users/enesfurkanornek/Downloads/Proje Görselleri"
```

Expected:

- PASS;
- 298 classification rows;
- 287 output images;
- every output hash matches its canonical source;
- no unexpected output files;
- generated JSON/CSV/report match current planning output.

**Step 4: Inspect audit outputs**

Review:

- every `review-required` item is retained and `uploadEligible: false`;
- every blocking quality flag has `heroEligible: false`;
- all exact duplicate aliases retain their source category information;
- all 287 items have English titles and factual alt text;
- no tracked artifact contains the absolute Downloads path, GPS coordinate values, camera serial values, or EXIF comments;
- filenames use lowercase ASCII kebab-case and three-digit sequence numbers.

**Step 5: Re-run write mode for idempotence**

```bash
pnpm gallery:prepare --source "/Users/enesfurkanornek/Downloads/Proje Görselleri" --write
```

Expected: zero image copies changed; generated text byte-identical.

**Step 6: Commit checkpoint**

```bash
git add sanity/gallery/manifest.json sanity/gallery/manifest.csv sanity/gallery/review-report.md
git commit -m "data: prepare gallery photo metadata"
```

Run only with commit authorization. Ignored source images must never be force-added.

### Task 9: Full verification and graph refresh

**Files:** None expected beyond graph outputs ignored by repository rules.

**Step 1: Run focused gallery gates**

```bash
pnpm typecheck:gallery
pnpm vitest run tests/gallery
pnpm gallery:verify --source "/Users/enesfurkanornek/Downloads/Proje Görselleri"
```

Expected: all PASS.

**Step 2: Run repository regression suite**

```bash
pnpm test
pnpm typecheck:catalogue
```

Expected: all PASS. Existing unrelated dirty-worktree failures must be reported separately; do not modify unrelated files to hide them.

**Step 3: Confirm Git boundary**

```bash
git status --short
git check-ignore -v sanity/gallery/source/
```

Expected: generated metadata/code/tests are visible; image binaries remain ignored.

**Step 4: Refresh required project graphs**

```bash
graphify update .
code-review-graph update
```

Expected: both graph indexes update successfully. If the code-review graph CLI is unavailable, report that limitation explicitly; do not claim it refreshed.

**Step 5: Review change impact**

Use `@mattpocock-skills:code-review` or the code-review graph tools against the final diff. Confirm:

- no Sanity network path exists;
- no app/frontend files changed;
- no source deletion path exists;
- no image encoder exists in the preparation write path;
- output collision handling refuses destructive overwrite;
- tracked artifacts contain no absolute/private metadata values;
- all accepted design counts and flags hold.

## Final handoff

Report:

- source/canonical/exact-duplicate counts;
- rights-review and hero-ineligible counts;
- paths to manifest, CSV, report, README, and ignored source root;
- test/typecheck/verify results;
- confirmation that Downloads originals remain unchanged;
- confirmation that no Sanity upload or frontend change occurred.

Do not report completion until `pnpm gallery:verify` confirms byte identity and the full test gates pass.
