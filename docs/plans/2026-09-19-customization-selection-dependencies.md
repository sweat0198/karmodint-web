# Customization Selection Dependencies Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add general customization selection dependencies, enforce them client/server, and load the supplied Product Size Option extra-item prices.

**Architecture:** Keep Product/Size price resolution unchanged. Add optional requirement and selection-limit fields to Sanity, then place dynamic selection behavior behind one pure constraint module shared by UI reconciliation and server validation. Generate reviewed size rules from one checked-in commercial matrix.

**Tech Stack:** TypeScript, Vue 3, Nuxt, Sanity schemas/GROQ, Vitest.

---

### Task 1: Add schema contracts

**Files:**
- Modify: `sanity/schemas/customizationGroup.ts`
- Modify: `sanity/schemas/objects/customizationItem.ts`
- Modify: `sanity/schemas/product.ts`
- Modify: `app/types/catalog.ts`
- Modify: `app/queries/catalog.ts`
- Test: `tests/sanity/schemas.spec.ts`
- Test: `tests/sanity/queries.spec.ts`

1. Add failing tests for `maxSelections`, requirement reference projection, invalid requirement targets, and cycles.
2. Run `npm test -- tests/sanity/schemas.spec.ts tests/sanity/queries.spec.ts` and confirm failure.
3. Add optional fields, runtime types, GROQ projection, and publish validation.
4. Re-run focused tests and `npm run typecheck:customizations`.

### Task 2: Add pure selection-constraint module

**Files:**
- Create: `app/utils/customizationConstraints.ts`
- Modify: `app/types/catalog.ts`
- Test: `tests/utils/customizationConstraints.test.ts`

1. Add failing behavior tests: unmet requirement, satisfied requirement, max selection limit, cascading cleanup, note cleanup.
2. Run focused test and confirm failure.
3. Implement evaluator and reconciler through public interfaces only.
4. Re-run focused test and typecheck.

### Task 3: Enforce constraints in UI and server

**Files:**
- Modify: `app/pages/customize/index.vue`
- Modify: `app/components/customization/ProductCustomizer.vue`
- Modify: `app/components/customization/groups/MultipleChoiceGroup.vue`
- Modify: `app/components/customization/groups/BooleanToggleGroup.vue`
- Modify: `app/components/customization/groups/SingleChoiceGroup.vue`
- Modify: `server/utils/quoteRevalidation.ts`
- Test: `tests/components/CustomizationGroups.spec.ts`
- Test: `tests/server/quoteRevalidation.test.ts`

1. Add failing tests for visible disabled controls, reason text, automatic cleanup, and tampered quote rejection.
2. Run focused tests and confirm failure.
3. Wire evaluated groups into rendering, reconcile before persistence, show cleared-item notice, and validate server submissions.
4. Re-run focused tests and main typecheck.

### Task 4: Apply workbook content and price matrix

**Files:**
- Modify: `sanity/seeds/customizationGroups.ndjson`
- Modify: `scripts/customizations/lib/seedRecipes.ts`
- Modify: `scripts/catalogue/lib/buildSeed.ts`
- Modify: `scripts/manual-products/add-container-products.ts`
- Modify: `sanity/seeds/products.ndjson`
- Test: `tests/customizations/seedRecipes.spec.ts`
- Test: `tests/catalogue/buildSeed.spec.ts`
- Test: `tests/manual-products/add-container-products.spec.ts`

1. Add failing matrix tests using literal workbook prices and availability.
2. Run focused tests and confirm failure.
3. Replace old Electrical choices, add requirements, generate reviewed size rules for all six Products, and regenerate the catalogue seed offline.
4. Re-run focused tests and customization/catalogue/manual-product typechecks.

### Task 5: Verify and review

**Files:**
- Update: `graphify-out/*` through graph refresh

1. Run focused customization, schema, query, UI, seed, and server tests.
2. Run all repository typechecks relevant to changed modules.
3. Run `npm test` once.
4. Run `npm run build`.
5. Refresh both project knowledge graphs.
6. Review diff against this design along Standards and Spec axes.
7. Fix valid findings and repeat verification.
8. Commit implementation to current branch.
