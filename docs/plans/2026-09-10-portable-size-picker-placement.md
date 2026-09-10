# Portable Size Picker Placement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show the portable-container size picker in the customization panel immediately before the demo-data notice, while selected-size imagery uses the ordinary product carousel only.

**Architecture:** Add an optional named slot to `ProductCustomizer` at the right-panel seam before the existing notice. The Customize page supplies `SizeSelector` only for portable lines. Remove the now-redundant `floorPlan` path from the catalogue type, quote line/store, and customizer so a selected size uses its ordinary image frames like other products.

**Tech Stack:** Vue 3, Nuxt, Pinia, Vitest, TypeScript.

---

### Task 1: Prove the right-panel insertion seam

**Files:**
- Modify: `tests/components/ProductCustomizer.spec.ts`
- Modify: `app/components/customization/ProductCustomizer.vue:309-335`

**Step 1: Write the failing test**

Mount `ProductCustomizer` with a `before-demo-notice` slot and `showDemoNotice: true`; assert the slot marker occurs before the demo notice.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/components/ProductCustomizer.spec.ts`
Expected: FAIL because the named slot is not rendered.

**Step 3: Write minimal implementation**

Render `<slot name="before-demo-notice" />` as the first element inside the right panel's padded content.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/components/ProductCustomizer.spec.ts`
Expected: PASS.

### Task 2: Supply picker and remove floor-plan-only data

**Files:**
- Modify: `app/pages/customize/index.vue:252-272`
- Modify: `app/components/customization/ProductCustomizer.vue:13-40,278-286`
- Modify: `app/stores/quote.ts:126-155`
- Modify: `shared/utils/quoteLine.ts:20-23`
- Modify: `app/queries/catalog.ts`
- Modify: `app/utils/portableContainerCards.ts`
- Test: `tests/components/ProductCustomizer.spec.ts`
- Test: `tests/stores/quote.spec.ts`

**Step 1: Write failing tests**

Assert a selected portable size no longer stores a floor-plan field. Remove the old floor-plan render assertion, replacing it with an assertion that no floor-plan test id renders.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/components/ProductCustomizer.spec.ts tests/stores/quote.spec.ts`
Expected: FAIL because the floor-plan payload and section still exist.

**Step 3: Write minimal implementation**

Pass `SizeSelector` through the named slot. Remove `floorPlan` from the query/card/store/quote/customizer interfaces and template. Keep selected size `images` as the sole preview source.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/components/ProductCustomizer.spec.ts tests/stores/quote.spec.ts`
Expected: PASS.

### Task 3: Regression verification

**Files:**
- Test: `tests/components/SizeSelector.spec.ts`
- Test: `tests/utils/portableContainerCards.spec.ts`

**Step 1: Run focused UI tests**

Run: `pnpm test tests/components/ProductCustomizer.spec.ts tests/components/SizeSelector.spec.ts tests/stores/quote.spec.ts tests/utils/portableContainerCards.spec.ts`
Expected: PASS.

**Step 2: Typecheck and run full suite**

Run: `pnpm exec nuxi typecheck && pnpm test`
Expected: existing `ReferencesSection.vue` typecheck error remains isolated; all Vitest tests pass.

**Step 3: Build and review**

Run: `pnpm build`, then run `$mattpocock-skills:code-review` against the implementation commits.

**Step 4: Commit**

```bash
git add app shared tests docs/plans
git commit -m "feat(customize): move portable size picker"
```
