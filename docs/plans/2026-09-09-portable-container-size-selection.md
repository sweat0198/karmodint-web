# Portable Container Size Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Group portable-container sizes by model and require a selected size before quote submission.

**Architecture:** Keep the existing per-size `SizeCard` path for every non-container category. Add a portable model-card shape carrying complete size data, product-level representative images, and resolved customization groups. Store a portable selection as a provisional quote line until a size is selected, then re-key it from product + size + canonical customization state.

**Tech Stack:** Nuxt 4, Vue 3, Pinia, TypeScript, Sanity, Vitest.

---

### Task 1: Define portable catalogue and quote-domain contracts

**Files:**
- Modify: `app/types/catalog.ts`
- Modify: `app/queries/catalog.ts`
- Modify: `shared/utils/quoteLine.ts`
- Test: `tests/sanity/queries.spec.ts`

1. Write failing query/type expectations for product-level representative images, all size image views, and resolved customization groups.
2. Run `pnpm test tests/sanity/queries.spec.ts`; expect missing projections/types.
3. Add optional product-level representative images and floor-plan projection without treating absent images or prices as zero.
4. Re-run the focused test.
5. Commit contracts and query projection.

### Task 2: Permit portable image sharing in Sanity only

**Files:**
- Modify: `sanity/schemas/product.ts`
- Modify: `sanity/schemas/objects/sizeOption.ts`
- Modify: `sanity/schemas/objects/productImageViews.ts`
- Test: `tests/sanity/schemas.spec.ts`

1. Write failing pure validation tests: `containers` sizes can omit per-size imagery/plans; all other sizes still require one plan and image.
2. Run `pnpm test tests/sanity/schemas.spec.ts`; expect the portable exception to fail.
3. Pass product category context into size/image validation and retain exact-one default-size validation.
4. Re-run schema tests.
5. Commit schema exception.

### Task 3: Build portable model cards without disturbing size cards

**Files:**
- Modify: `app/utils/sizeCards.ts`
- Create: `app/utils/portableContainerCards.ts`
- Test: `tests/utils/sizeCards.spec.ts`
- Create: `tests/utils/portableContainerCards.spec.ts`

1. Write failing tests for one model card per `containers` product, every configured size including image-less sizes, lowest numeric price, all-POA price, and distinct models.
2. Run `pnpm test tests/utils/portableContainerCards.spec.ts`; expect missing converter.
3. Implement category-gated grouping; source representative imagery from product level first, then an available size render only as display fallback. Keep `toSizeCards` output unchanged for non-containers.
4. Re-run both card utility suites.
5. Commit grouping utility.

### Task 4: Render portable cards and retain existing actions elsewhere

**Files:**
- Modify: `app/components/ProductCard.vue`
- Modify: `app/pages/products/index.vue`
- Modify: `app/components/ProductCatalogSection.vue`
- Test: `tests/components/ProductCard.spec.ts`

1. Write failing component tests for available-size labels, From/POA labels, Representative image, and the sole `Choose size & customize` button.
2. Run `pnpm test tests/components/ProductCard.spec.ts`; expect missing portable presentation.
3. Render portable model cards through a discriminated prop; create one provisional line and route to Customize. Preserve Add/Customize/quantity controls for normal cards.
4. Re-run component tests and `pnpm typecheck`.
5. Commit portable catalogue UI.

### Task 5: Add provisional size selection and configuration-safe quote identity

**Files:**
- Modify: `app/stores/quote.ts`
- Modify: `shared/utils/quoteLine.ts`
- Test: `tests/stores/quote.spec.ts`
- Test: `tests/utils/quoteLine.spec.ts`

1. Write failing tests for a new unresolved portable line, identical configuration merge, same model/size different extras separation, re-keying on size change, and legacy concrete-size line support.
2. Run `pnpm test tests/stores/quote.spec.ts tests/utils/quoteLine.spec.ts`; expect identity failures.
3. Implement stable canonical selection/notes serialization and store operations to create, select/reselect, update configuration, re-key, and merge portable lines without dropping quantity/extras.
4. Re-run focused store/line tests.
5. Commit quote identity.

### Task 6: Replace demo-only customize data with selected product data

**Files:**
- Modify: `app/pages/customize/index.vue`
- Modify: `app/components/customization/ProductCustomizer.vue`
- Create: `app/components/customization/SizeSelector.vue`
- Test: `tests/pages/customize.spec.ts`
- Test: `tests/components/ProductCustomizer.spec.ts`

1. Write failing UI tests for accessible required size selection, disabled/blocked continue state, size-driven dimensions/price/image updates, matched plan only, and preserved selection state.
2. Run the new focused page/component tests; expect selector/props absent.
3. Query the selected products/customization groups, render the selector only for unresolved/container lines, and use actual group pricing instead of `DEMO_CUSTOMIZATION_GROUPS` when supplied.
4. Re-run focused tests and `pnpm typecheck`.
5. Commit customization flow.

### Task 7: Reject unresolved selections at UI and server boundaries

**Files:**
- Modify: `app/pages/quote.vue`
- Modify: `server/api/quote.post.ts`
- Test: `tests/server/quote.test.ts`
- Test: `tests/pages/quote.spec.ts`

1. Write failing tests that unresolved portable lines cannot open/submit quote and API payloads receive HTTP 400; confirm concrete legacy lines still submit.
2. Run `pnpm test tests/server/quote.test.ts tests/pages/quote.spec.ts`; expect acceptance of unresolved items.
3. Add portable-only line guards in navigation/submission and server validation. Continue carrying selected `sizeLabel`, quantity, prices, and extras unchanged to email/CRM adapters.
4. Re-run focused tests.
5. Commit validation.

### Task 8: Audit persistence and email/CRM payloads

**Files:**
- Modify: `app/stores/quote.ts`
- Modify: `server/utils/email.ts` only if test proves a missing final-size/extras field
- Modify: `server/utils/sanityLead.ts` only if test proves a missing final-size/extras field
- Test: `tests/stores/quote.spec.ts`
- Test: `tests/server/email.test.ts`
- Test: `tests/server/quote.test.ts`

1. Write failing replay/persistence tests for independent configurations and selected final sizes.
2. Run targeted tests; expect legacy/provisional migration gaps.
3. Add a non-destructive persisted-state migration/filter so saved concrete lines restore and incomplete legacy provisional lines do not submit.
4. Re-run targeted tests.
5. Commit persistence compatibility.

### Task 9: Refresh generated CMS types and catalogue verification rules

**Files:**
- Modify: generated Sanity type files only through their generator, if configured
- Modify: `scripts/catalogue/lib/verifyCatalogue.ts` only where portable image sharing otherwise reports false drift
- Test: `tests/catalogue/verifyCatalogue.spec.ts`

1. Write failing verification coverage for a portable image-less size and normal per-size imagery.
2. Run `pnpm test tests/catalogue/verifyCatalogue.spec.ts`; expect current global image rule failure.
3. Make verification category-aware; do not alter inventory or seed sizes.
4. Re-run the focused test and `pnpm catalogue:verify` when configured credentials permit read-only CMS access.
5. Commit verification rules.

### Task 10: Final validation and review

**Files:**
- Review: all changed files

1. Run `pnpm typecheck`.
2. Run `pnpm test`.
3. Run `git diff --check` and inspect changed-file impact using code-review graph when available.
4. Run `/code-review`, resolve findings, repeat targeted/full verification.
5. Commit completed implementation.
