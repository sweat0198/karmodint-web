# Sanity Gallery Photo Organization Design

**Date:** 2026-08-26

**Status:** Approved

**Scope:** Prepare project photography for a later Sanity gallery import. Do not create a Sanity schema, upload assets, or change the website gallery.

## Goal

Turn `/Users/enesfurkanornek/Downloads/Proje Görselleri` into a deterministic, reviewable gallery package under `sanity/gallery/`. Copy images without deleting sources or changing their bytes, classify every image, collapse only byte-identical duplicates, and commit metadata while keeping the 783 MiB image library out of Git.

## Source facts

- 300 source files: 298 readable images and two `.DS_Store` files.
- 297 JPEG images and one PNG image; mixed `.jpg`, `.jpeg`, `.JPG`, and `.png` suffixes.
- 783.3 MiB total.
- 11 exact duplicate pairs, leaving 287 SHA-256-unique images.
- Seven additional re-encoded/cropped duplicate pairs plus burst-like shots. These remain as separate files and receive `possible-duplicate` flags.
- 244 files contain EXIF; 21 contain GPS coordinates; 57 contain camera serial numbers. EXIF stays in the local copies for this phase.
- 54 kiosk/event photos and one school image need rights/privacy review. They remain in the package but are blocked from automatic upload.

## Chosen architecture

Use three layers:

1. `sanity/gallery/classification.json` is the tracked human decision layer. It accounts for all 298 source images and records taxonomy, project grouping, order, English title/alt/caption, confidence, flags, rights status, and canonical preference for exact duplicates.
2. `scripts/gallery/` is a deterministic preparation pipeline. It scans the external source, reads bytes and image metadata, computes SHA-256 hashes, validates the classification, plans canonical output paths, and copies bytes only when `--write` is explicit.
3. `sanity/gallery/manifest.json`, `manifest.csv`, and `review-report.md` are tracked generated outputs. `sanity/gallery/source/` contains 287 copied binaries and is ignored by Git.

This follows the existing catalogue pipeline's strongest conventions—typed manifests, deterministic IDs, dry-run behavior, invariant tests, and stable sorted output—without coupling gallery photos to product-render vocabulary or Sanity dataset asset IDs.

## Rejected approaches

### Put images under `public/images/gallery/`

Rejected. `public/` is already 105 MiB. Adding 783 MiB would make every Cloudflare Pages build stage and deploy the library before any gallery integration exists.

### Manually rename and copy files without tooling

Rejected. Twenty-eight basename collision groups, Unicode filenames, exact duplicates, and overlapping categories make a manual-only result hard to audit or reproduce.

### Build the Sanity schema and uploader now

Rejected. Gallery document/index requirements remain intentionally unsettled. The package should be schema-neutral and ready for later adapter code.

## Directory and taxonomy model

Physical images use:

```text
sanity/gallery/source/<family>/<use-case>/<project-or-others>/<project-or-others>-NNN.<ext>
```

Allowed families:

- `containers`
- `prefabricated-houses`
- `cabins`
- `prefabricated-buildings`
- `steel-houses`
- `others`

Key use cases remain separate where requested. Container `construction-site` and `dormitory` photos do not merge even when their source projects overlap. Shared or visually unprovable steel/prefabricated homes use `others`. Unknown project identities use project slug `others`; customer names are never invented.

A physical file has one primary taxonomy path. `categories[]` carries additional valid classifications. `sourceAliases[]` carries every source-relative path represented by an exact duplicate's canonical file.

## Identity, naming, and deduplication

- `assetId` is the full SHA-256 digest prefixed with `sha256:`.
- JPEG suffixes normalize to `.jpg`; PNG remains `.png`.
- File bytes are copied verbatim. No resizing, recompression, metadata stripping, or format conversion occurs.
- File names follow `{project-slug}-{NNN}.{ext}`.
- Sequence is explicit in classification data, not inferred from filesystem order.
- Exact SHA-256 duplicates collapse to one canonical file. The classification must mark the preferred canonical source.
- Visually similar/re-encoded files remain separate and cross-reference one another through `possibleDuplicateAssetIds`.

## Metadata contract

Every canonical manifest item contains:

- stable asset ID and SHA-256 hash;
- repo-relative output path;
- canonical source-relative path and source aliases;
- width, height, byte size, format, and optional capture timestamp;
- primary family, use case, project, and additional categories;
- English title and factual alt text;
- optional caption;
- sequence number and role;
- classification confidence;
- quality, privacy, provenance, and possible-duplicate flags;
- `rightsStatus`, `uploadEligible`, and `heroEligible`.

Rules:

- `review-required` always forces `uploadEligible: false`.
- Weak/low-resolution/progress/watermarked images remain copied but force `heroEligible: false`.
- `unknown` is the default rights status; nothing becomes `cleared` without external evidence.
- Precise GPS, camera serials, and EXIF comments do not enter tracked manifests. Only warning flags do. Embedded metadata remains in ignored image copies.

## Safety and failure behavior

- Default command is dry-run. Disk writes require `--write`.
- Source files are never renamed, moved, deleted, or modified.
- Existing output files may be overwritten only when their SHA-256 matches the newly planned source. A mismatched collision stops the run.
- Missing classification rows, stale classification paths, invalid slugs, duplicate output paths, incomplete duplicate canonical choices, and missing title/alt text stop the run before copying.
- Generated JSON, CSV, and Markdown use stable sorting and trailing newlines.
- A verify mode compares source inventory, copied bytes, and tracked manifests without changing files.

## Success criteria

- 298 source images accounted for exactly once by classification.
- 287 SHA-256-unique canonical assets planned and copied.
- 11 exact duplicate pairs represented as aliases, not extra binaries.
- All copied hashes equal source hashes; EXIF remains intact as a consequence of byte identity.
- Every asset has English title and factual alt text.
- Rights-review assets remain present and have `uploadEligible: false`.
- Weak assets remain present and cannot become heroes.
- `sanity/gallery/source/` is ignored; metadata/docs remain trackable.
- No Sanity, app gallery, or product catalogue code changes.
