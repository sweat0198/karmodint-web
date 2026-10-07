# Sanity dev to production promotion

Completed 2026-10-07 for project `ah8qitl4`. Scope: published website content. Unpublished dev drafts remain in dev. No production documents were deleted and no system documents were promoted.

## Before and after

Both datasets already contained the same 96 published website documents. Ninety-one matched before promotion. Five differed:

| Document | Fields promoted |
| --- | --- |
| `productLine-grp-kiosk-cabin` | `coverImage` |
| `productLine-portable-cabin` | `coverImage` |
| `productLine-bulletproof-cabin` | `coverImage` |
| `solution-retail-and-food-service-kiosks` | `body`, `faqs` |
| `solution-welfare-and-wc-units` | `body`, `faqs` |

Uploaded three missing hero assets from the locally generated originals. Each original matched the dev asset's SHA-1 and size, and each upload was checked again. Asset references were mapped using the returned production asset IDs.

Five field patches committed together with revision guards in transaction `EYUMzAnp80IYi3vO29TA9W`. Production had 348 documents before and 351 after; the increase consists of the three image asset documents.

## Verification

- All 96 published website documents match dev, excluding revision and timestamp metadata.
- All strong references on published website content resolve within production.
- All non-target production documents are unchanged.
- Six dev drafts remain unpublished and were not copied. Production had no drafts before or after.
- Production site rebuild and deployment are separate and were not performed by this migration.

## Local recovery files

Private, ignored files under `.scratch/sanity-promotion/2026-10-07/`:

- `production-before.ndjson`: raw document snapshot before promotion, including the previous covers and solution copy.
- `dev-before.ndjson`: source snapshot.
- `comparison.json`: reviewed differences and reference checks.
- `assets/`: byte-verified copies of the three new hero originals.
- `production-after.ndjson`: verified destination snapshot.
- `verification.json`: transaction and verification results.
- `inspect.mjs` and `promote.mjs`: one-time execution scripts tied to these snapshots.

Existing production asset documents were retained. The before snapshot contains their original references; this is a document backup, not a full binary asset archive. Recovery should restore only the five affected documents' original fields and use current revision guards to avoid overwriting later edits.

## Source guidance

- [Sanity export API](https://www.sanity.io/docs/http-reference/export): dataset document snapshots and asset documents.
- [Sanity bulk import](https://www.sanity.io/docs/content-lake/importing-data): upload assets to the target dataset and use returned references; Studio schema validation does not run automatically for API writes.
- [Sanity image transformations](https://www.sanity.io/docs/content-lake/image-urls): image CDN responses can be transformed; authenticated `dlRaw` requests obtain originals. This migration used locally verified originals instead.
