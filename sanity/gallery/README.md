# Sanity Gallery Photo Package

Deterministic preparation pipeline and metadata catalogue for Karmod International project photography.

## Purpose and Scope

This package organizes, classifies, and indexes project photography from external source directories into a clean, reproducible, and reviewable asset library under `sanity/gallery/`.

### Non-Goals

- **No Sanity Schema:** This change introduces no Sanity schema documents or index definitions.
- **No Sanity Uploads:** No assets are uploaded to Sanity or external CDNs in this phase.
- **No Frontend Changes:** No modifications to `app/pages/gallery.vue` or any web application UI.

Future gallery schema and uploader adapters should consume `manifest.json` as their source of truth—never crawling directory names or inferring metadata from filenames.

## Tracked vs. Ignored Files

- **Tracked in Git:**
  - `sanity/gallery/classification.json` — Human visual audit decisions and taxonomies for all 298 source images.
  - `sanity/gallery/manifest.json` — Canonical asset manifest (287 unique assets) with format, dimensions, SHA-256 digests, and metadata.
  - `sanity/gallery/manifest.csv` — Flat spreadsheet export for non-technical review.
  - `sanity/gallery/review-report.md` — Statistical summary and breakdown of rights, quality, and duplicate groups.
  - `sanity/gallery/README.md` — Package documentation.
- **Ignored by Git (`.gitignore`):**
  - `sanity/gallery/source/**` — Copied 783 MiB image binary files.

## Baseline Inventory and Deduplication

- **Source Inventory:** 298 readable image files (297 JPEG, 1 PNG).
- **Canonical Assets:** 287 SHA-256-unique canonical image files.
- **Exact Duplicate Pairs:** 11 exact byte-identical duplicate pairs collapsed to 1 canonical output each, with duplicate paths preserved in `sourceAliases`.
- **Visual Duplicates / Bursts:** 7 high-confidence visual duplicate pairs and burst sequences kept as separate files and linked via `possibleDuplicateAssetIds`.
- **Byte Preservation:** Source images are copied verbatim via `fs.copyFileSync`. No re-encoding, format conversion, resizing, or EXIF stripping occurs. Source originals in Downloads are never renamed, moved, deleted, or modified.

## Source Folder Scopes

The package reads from two kinds of external folder, and the difference is how much of the folder
belongs to it.

- **`--source` / `GALLERY_SOURCE_DIR` (scope `all`)** — a folder assembled *as* the gallery's
  library. Every image in it is one somebody chose to hand over, so a file with no row in
  `classification.json` is a file nobody reviewed, and preparation stops rather than dropping it.
- **`--curated-source` / `GALLERY_CURATED_SOURCE_DIR` (scope `classified`)** — a working job
  archive that was never assembled for us, holding every frame of a shoot. Here
  `classification.json` *is* the pick list: the named files are read, and the rest are never opened.

Source-relative paths are the key the classification is written against, so two folders may not
offer the same relative path. A clash is reported by name rather than resolved by folder order.

## Taxonomy and Category Model

Physical image output paths follow:

```text
sanity/gallery/source/<family>/<use-case>/<project-or-others>/<project-or-others>-NNN.<ext>
```

Allowed product families:
- `containers`
- `prefabricated-houses`
- `cabins`
- `prefabricated-buildings`
- `steel-houses`
- `others` (used for shared or unprovable steel/prefabricated houses)

Unknown project identities use `others`. Customer and project names are never invented without direct visual or filename evidence.

## Rights and Eligibility Rules

- `rightsStatus: 'review-required'` forces `uploadEligible: false`. Applied to all 54 retail/event kiosk photos and the school yard photo containing children.
- Quality flags (`low-resolution`, `portrait`, `nonstandard-aspect`, `soft-or-hazy`, `construction-progress`, `overlay-or-watermark`) force `heroEligible: false`.
- Privacy-sensitive EXIF data (GPS coordinates, camera serial numbers, comments) remain in the local image binaries but do not enter tracked JSON/CSV manifests.

## CLI Usage Commands

Configure the source folders in `.env`:
```bash
GALLERY_SOURCE_DIR="/Users/enesfurkanornek/Downloads/Proje Görselleri"
GALLERY_CURATED_SOURCE_DIR="/Users/enesfurkanornek/Downloads/Projeler"
```

Then run scripts directly (or pass `--source "<path>"` to override):

```bash
# Dry run: Scan source, plan assets, validate invariants without modifying disk
pnpm gallery:prepare

# Write mode: Copy canonical images to sanity/gallery/source/ and generate manifest files
pnpm gallery:prepare --write

# Verify mode: Read-only check comparing source, disk copies, and manifests
pnpm gallery:verify

# Override source folders explicitly if needed (both flags may be repeated)
pnpm gallery:prepare --source "/path/to/photos"
pnpm gallery:prepare --curated-source "/path/to/job/archive"

# Typecheck gallery pipeline
pnpm typecheck:gallery
```

## Importing Gallery Entries into Sanity

`scripts/gallery/data.ts` holds the curated selection of photos that become `galleryEntry`
documents, each with its category and gallery description. Titles and alt text are **not** repeated
there — they are read from `manifest.json` by `filePath`, so a copy correction made in
`classification.json` reaches the Studio on the next import.

```bash
# Print the planned documents without touching the network
pnpm gallery:import --dry-run

# Upload the images and create/replace the documents
pnpm gallery:import
```

Document IDs are deterministic (`galleryEntry-<category>-<project-or-use-case>-NNN`), so re-running
updates the same documents rather than duplicating them. `order` is never set; the schema falls back
to alphabetical ordering.

## Rights Statuses

- `unknown` — nobody has raised a concern. Upload eligible.
- `review-required` — provenance or privacy needs checking. **Blocks upload.**
- `cleared` — checked and confirmed with the client. Upload eligible.

`cleared` exists so a settled rights question is not re-opened, and so it is never confused with
`unknown`, which only records the absence of a concern. The importer refuses any photo that is not
upload eligible.
