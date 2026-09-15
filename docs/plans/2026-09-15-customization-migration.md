# Customization Migration Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate every legacy Product customization reference to Product Customization Configurations, then remove legacy and demo runtime paths without altering customer prices or configuration semantics.

**Architecture:** A pure migration planner will convert a Product's ordered legacy group references into ordered configuration objects and reject duplicate, mixed, or invalid states. A script loads source Products and groups, creates a report before any mutation, then applies only clean plans transactionally. The application and Studio schema consume only configuration objects after migration.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Sanity, Vitest.

---

### Task 1: Add pure migration planning and review reporting

**Files:**
- Create: `scripts/customizations/migrateProductConfigurations.ts`
- Test: `tests/customizations/migrateProductConfigurations.spec.ts`

**Step 1: Write failing tests**

Cover ordered reference conversion, unchanged default fixed/included/POA item pricing, no-group Products, duplicate group references, existing configurations, missing referenced groups, missing/duplicate item keys, orphaned Size Option rules, and atomic report refusal.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/customizations/migrateProductConfigurations.spec.ts`

Expected: FAIL because the planner does not exist.

**Step 3: Write minimal implementation**

Export pure `planProductCustomizationMigration` and `buildMigrationReport`. Create configuration references with stable `_key`s, retain no item overrides so group defaults remain authoritative, and issue explicit per-Product review records for invalid/mixed state.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/customizations/migrateProductConfigurations.spec.ts`

Expected: PASS.

### Task 2: Add dry-run-first Sanity migration command

**Files:**
- Modify: `scripts/customizations/migrateProductConfigurations.ts`
- Modify: `package.json`
- Test: `tests/customizations/migrateProductConfigurations.spec.ts`

**Step 1: Write failing tests**

Inject a fake client and assert dry run creates no transaction, clean runs patch configurations and unset `customizationGroups` atomically, and a non-clean report refuses all writes.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/customizations/migrateProductConfigurations.spec.ts`

Expected: FAIL because no executor exists.

**Step 3: Write minimal implementation**

Read products and referenced groups through the existing Sanity environment helper. Default to dry run; require `--apply` for mutation. Emit JSON review report and patch only after all plans pass.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/customizations/migrateProductConfigurations.spec.ts`

Expected: PASS.

### Task 3: Contract Studio, types, query, and resolver

**Files:**
- Modify: `sanity/schemas/product.ts`
- Modify: `app/types/catalog.ts`
- Modify: `app/queries/catalog.ts`
- Modify: `app/utils/customizationPricing.ts`
- Test: `tests/sanity/schemas.spec.ts`
- Test: `tests/sanity/queries.spec.ts`
- Test: `tests/utils/customizationPricing.test.ts`

**Step 1: Write failing tests**

Assert Product schema omits `customizationGroups`, catalogue projection omits it, and resolver requires configurations with a selected Size Option rather than returning legacy groups.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/sanity/schemas.spec.ts tests/sanity/queries.spec.ts tests/utils/customizationPricing.test.ts`

Expected: FAIL because legacy fields and fallback still exist.

**Step 3: Write minimal implementation**

Remove legacy Product field/type/query logic and fallback. Retain validation for configurations, item keys, Size Option keys/rules, published review state, and defaults resolved from reusable group items.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/sanity/schemas.spec.ts tests/sanity/queries.spec.ts tests/utils/customizationPricing.test.ts`

Expected: PASS.

### Task 4: Remove demo customer paths and prove quote flow

**Files:**
- Modify: `app/pages/customize/index.vue`
- Modify: `app/components/customization/ProductCustomizer.vue`
- Modify: `tests/components/ProductCustomizer.spec.ts`
- Modify: `tests/components/customizationGroups.spec.ts`
- Modify: `tests/stores/quote.spec.ts`
- Modify: `tests/server/quote.test.ts`

**Step 1: Write failing tests**

Assert no demo notice/slot remains, selected Product configuration resolves for its Size Option, selections reach Quote List, and quote validation accepts only live configured choices.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/ProductCustomizer.spec.ts tests/components/customizationGroups.spec.ts tests/stores/quote.spec.ts tests/server/quote.test.ts`

Expected: FAIL because demo and legacy branches remain.

**Step 3: Write minimal implementation**

Use configuration resolution unconditionally when customizations exist. Remove demo prop, slot, notice, and fixture behaviour while retaining native Product Size Option selection.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/components/ProductCustomizer.spec.ts tests/components/customizationGroups.spec.ts tests/stores/quote.spec.ts tests/server/quote.test.ts`

Expected: PASS.

### Task 5: Migrate live data, verify, review, and close

**Files:**
- Modify: generated migration report only when intentionally retained

**Step 1: Run read-only migration report**

Run: `npm run customizations:migrate`

Expected: no review blockers; no writes.

**Step 2: Apply migration**

Run: `npm run customizations:migrate -- --apply`

Expected: configurations written and legacy field removed atomically.

**Step 3: Verify migration is repeat-safe**

Run: `npm run customizations:migrate`

Expected: no legacy Products remain and no writes.

**Step 4: Run full verification**

Run: `npm run typecheck && npm test && npm run build && (cd sanity && npm run build)`

Expected: every command exits 0.

**Step 5: Refresh graphs and review**

Run graph updates. Review the diff against issue #16; fix material findings and rerun affected checks.

**Step 6: Commit and close**

Run `git diff --check`, commit implementation, then close GitHub issue #16 with verification summary.
