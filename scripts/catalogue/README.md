# Catalogue import pipeline

Turns the Karmod source pages plus the local render library into product documents in a Sanity
dataset. Built for GRP Cabin in ticket 02; tickets 03–06 add manifest rows and a copy file and
re-run the same three commands.

## Run order

```bash
pnpm catalogue:scrape                 # 33 pages -> .cache/karmod-source/ + source-extract.json
pnpm catalogue:assets --dry-run       # what would upload
pnpm catalogue:assets                 # renders -> Sanity assets, ids recorded per dataset
pnpm catalogue:import --dry-run       # builds sanity/seeds/products.ndjson, writes nothing
pnpm catalogue:import                 # createOrReplace into $SANITY_DATASET
pnpm catalogue:verify                 # reads the dataset back and checks it against the seed
pnpm typecheck:catalogue && pnpm test # both guards
```

The scrape is cached, so only the first run touches the network — tickets 03–06 need none.
`--refresh` forces a re-crawl.

## What owns what

| File | Owns |
|---|---|
| `lib/sourcePages.ts` | The 33 source URLs |
| `sanity/catalogue/source-extract.json` | Scraped headings, detail HTML, meta, specs — the audit trail behind every rewritten paragraph |
| `sanity/catalogue/manifest.json` | Structure: ids, slugs, category refs, sizes, dimensions, render folders, view lists. **No prose.** |
| `sanity/catalogue/copy/*.md` | Prose: frontmatter (name, slug, short description, SEO, featured) and the body. **No structure.** |
| `sanity/catalogue/assets/<dataset>.json` | Render path -> asset id, per dataset |
| `sanity/seeds/products.ndjson` | Generated. A pure function of the three above |
| `lib/verifyCatalogue.ts` | The whole-catalogue GROQ query and the checks run over its answer |

The manifest/copy split is the point: a size exists in exactly one file, so prose and structure
cannot disagree about which sizes there are or which renders belong to them.

## Idempotence

Document ids, size `_key`s, image `_key`s and Portable Text block keys are all derived, never
generated. Re-running produces a byte-identical NDJSON file, and `createOrReplace` replaces rather
than inserts. Assets are skipped when the dataset's manifest already names them, and Sanity dedupes
by content hash regardless — so a re-run costs nothing and changes nothing.

Asset ids are **not** portable between datasets. Promoting to production (ticket 08) is a genuine
re-upload against `sanity/catalogue/assets/production.json`.

## Verifying

`pnpm catalogue:verify` reads the catalogue back out of `$SANITY_DATASET` with one GROQ query and
checks it against the seed the repo would import — totals, cross-product uniqueness, category
resolution, POA pricing, the weight and height sentinels, and the guarantee that no size shows a
render it does not own. It exits non-zero on any failure, so it works as a gate as well as a report.

Two renders sharing one asset is expected, not a fault: Sanity derives asset ids from the content
hash, and the source publishes the same door photograph for two MetroCity sizes. That is why 120
image references sit over 119 assets. The check that matters is that no share is *unpredicted* — the
seed says which sizes point where, and the files behind a share are confirmed byte-identical.

The totals are checked against `EXPECTED_CATALOGUE`, a hand-written record of what each family
should amount to — not derived from the manifest. A manifest that silently lost a size would still
agree with a seed built from it, so a second, independent opinion is what makes "28 sizes" a real
check rather than a restatement of whatever the manifest currently says.

The query excludes Studio draft documents (`_id in path("drafts.**")`). Opening a product in the
Studio — as the ticket-07 spot-check does — creates a `drafts.` twin that copies every field,
`status: "published"` included; without the exclusion one Studio visit is read as a second product.

## Adding a product

1. `pnpm catalogue:scrape` — already cached, so this only rebuilds the extract.
2. Add the product's rows to `manifest.json`. `views` must match the render folder on disk exactly,
   in vocabulary order; the invariant tests enforce it.
3. Write `sanity/catalogue/copy/<slug>.md`.
4. Run the asset upload and the import.

## Prerequisites

`SANITY_PROJECT_ID`, `SANITY_DATASET` and a write `SANITY_API_TOKEN` in the root `.env`. Everything
except the upload and the import runs without them, `--dry-run` included.
