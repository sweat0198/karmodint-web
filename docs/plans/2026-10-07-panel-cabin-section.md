# Panel Cabin Catalogue Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Point `/panel-cabin/` at Cabin › Panel (the Insulated Panel section) and prove the header routes Panel and Composite entries correctly.

**Architecture:** Keep Product Line routing data-driven. Change the Product Line seed's category reference, then cover the resulting header mapping using its existing category-to-Product-Line matcher. Update the migration design to match the recorded client decision.

**Tech Stack:** TypeScript, Vue 3, Nuxt 4, Vitest, Sanity seed scripts, Markdown.

---

### Task 1: Add failing seed regression

**Files:**
- Modify: `tests/product-lines/buildDocuments.spec.ts`

**Step 1: Write the failing test**

Change the expected `/panel-cabin/` catalogue section from `category-cabin-composite` to `category-cabin-panel`.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/product-lines/buildDocuments.spec.ts`

Expected: FAIL showing the seed still returns `category-cabin-composite`.

### Task 2: Add failing header routing regression

**Files:**
- Modify: `tests/components/AppHeader.spec.ts`

**Step 1: Model both cabin sections**

Add Panel (the Insulated Panel section) and Composite children to the Cabin fixture. Add the `/panel-cabin/` Product Line fixture with its current Composite category assignment.

**Step 2: Assert the requested destinations**

Assert desktop and mobile Panel links target `/panel-cabin/`. Assert Composite retains `/products/?category=cabin&subcategory=composite`.

**Step 3: Run test to verify it fails**

Run: `pnpm vitest run tests/components/AppHeader.spec.ts`

Expected: FAIL because the old fixture assigns `/panel-cabin/` to Composite.

### Task 3: Align seed, header fixture and migration design

**Files:**
- Modify: `scripts/product-lines/data.ts`
- Modify: `tests/components/AppHeader.spec.ts`
- Modify: `docs/plans/2026-10-06-uk-migration-design.md`

**Step 1: Change the seed category**

Set `productLine-panel-cabin.categoryId` to `category-cabin-panel`.

**Step 2: Mirror corrected data in the header fixture**

Set the `/panel-cabin/` fixture's `categoryId` to `category-cabin-panel`.

**Step 3: Update the Kept URL table**

Change `/panel-cabin/` from Cabin › Composite to Cabin › Insulated Panel.

**Step 4: Run targeted tests**

Run: `pnpm vitest run tests/product-lines/buildDocuments.spec.ts tests/components/AppHeader.spec.ts`

Expected: PASS.

**Step 5: Run Product Line typechecking**

Run: `pnpm typecheck:product-lines`

Expected: exit 0.

**Step 6: Run seed dry run**

Run: `pnpm product-lines:seed --dry-run`

Expected: exit 0 and `productLine-panel-cabin` reports `category category-cabin-panel`.

### Task 4: Verify, refresh graphs and commit

**Files:**
- Verify all changed files.

**Step 1: Run full tests**

Run: `pnpm test`

Expected: all tests pass.

**Step 2: Run project typecheck**

Run: `pnpm exec nuxi typecheck`

Expected: exit 0.

**Step 3: Check diff and whitespace**

Run: `git diff --check && git diff --stat`

Expected: no whitespace errors; only issue #30 files changed.

**Step 4: Refresh knowledge graphs**

Run: `graphify update .` and `code-review-graph update` when available.

**Step 5: Review against standards and issue #30**

Use `mattpocock-skills:code-review` with fixed point `0525cf2` and resolve valid findings.

**Step 6: Commit**

```bash
git add docs/plans/2026-10-07-panel-cabin-section.md docs/plans/2026-10-06-uk-migration-design.md scripts/product-lines/data.ts tests/product-lines/buildDocuments.spec.ts tests/components/AppHeader.spec.ts
git commit -m "fix: align panel cabin catalogue section"
```
