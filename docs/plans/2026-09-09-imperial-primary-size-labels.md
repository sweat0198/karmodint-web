# Imperial-Primary Size Labels Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render and store every product footprint as whole-foot, largest-first values followed by metre dimensions in ascending order.

**Architecture:** Move conversion and label formatting into one dependency-free shared utility. Re-export the conversion helper through the existing catalogue type module, then consume the shared formatter from UI projections, seed generation, and a targeted Sanity migration.

**Tech Stack:** TypeScript, Nuxt 4, Vitest, Sanity client

---

### Task 1: Establish label formatter contracts

**Files:**
- Create: `tests/utils/sizeLabels.spec.ts`
- Modify: `tests/utils/sizeCards.spec.ts:150-176`

**Step 1: Write failing tests**

Assert the shared formatter returns `9ft × 7ft (2.15m × 2.70m)` for `2.15, 2.70`, preserves equal dimensions, and formats height as `8ft (2.40m)`. Update size-card expectations for the new label and height format.

**Step 2: Run tests to verify failure**

Run: `npm test -- tests/utils/sizeLabels.spec.ts tests/utils/sizeCards.spec.ts`

Expected: FAIL because shared formatter does not exist and cards are metric-first.

### Task 2: Share conversion and label formatting

**Files:**
- Create: `shared/utils/sizeLabels.ts`
- Modify: `app/types/catalog.ts:197-210`
- Modify: `app/utils/sizeCards.ts:1-76`

**Step 1: Implement minimal formatter**

Export whole-foot conversion, imperial-primary single-dimension formatting, and footprint formatting. Sort feet descending and metres ascending independently.

**Step 2: Wire UI projection**

Use the footprint formatter for `sizeLabel` and the single-dimension formatter for height specs. Keep both measurement units in search terms.

**Step 3: Run focused tests**

Run: `npm test -- tests/utils/sizeLabels.spec.ts tests/utils/sizeCards.spec.ts tests/sanity/typegen.spec.ts`

Expected: PASS.

### Task 3: Keep Sanity labels synchronized

**Files:**
- Modify: `scripts/catalogue/lib/manifest.ts:1-75`
- Create: `scripts/catalogue/format-size-labels.ts`
- Modify: `package.json:5-30`
- Modify: `sanity/schemas/objects/sizeOption.ts:9-15`
- Test: `tests/catalogue/buildSeed.spec.ts`

**Step 1: Update seed label generation**

Make `sizeLabel` call the shared footprint formatter and update seed expectations.

**Step 2: Add migration script**

Read product `_id` and every size `_key`, `lengthM`, `widthM`, and `label`; replace only changed `sizes[].label` values in one transaction. Support `--dry-run` with an exact changed-size count and sample labels.

**Step 3: Run migration dry-run**

Run: `npm run catalogue:format-size-labels -- --dry-run`

Expected: reports target dataset and pending label changes, with no remote write.

**Step 4: Update configured Sanity dataset**

Run: `npm run catalogue:format-size-labels`

Expected: commits only product documents with changed size labels.

**Step 5: Verify catalogue**

Run: `npm run catalogue:verify`

Expected: all catalogue checks pass against updated records.

### Task 4: Verify and commit

**Files:**
- Modify: all files above

**Step 1: Typecheck**

Run: `npx nuxi typecheck`

Expected: exit 0, or report unrelated existing diagnostics.

**Step 2: Run full suite**

Run: `npm test`

Expected: all tests pass.

**Step 3: Build**

Run: `npm run build`

Expected: exit 0.

**Step 4: Refresh graphs and review**

Run: `graphify update .`

Run: `code-review-graph update`

Review committed diff against the pre-work commit on standards and specification axes.

**Step 5: Commit**

```bash
git add app/types/catalog.ts app/utils/sizeCards.ts shared/utils/sizeLabels.ts \
  scripts/catalogue/lib/manifest.ts scripts/catalogue/format-size-labels.ts \
  sanity/schemas/objects/sizeOption.ts package.json tests
git commit -m "feat(catalogue): make size labels imperial-first"
```
