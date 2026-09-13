# Product Customization Pricing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace demo customization data with Product-specific Sanity groups and resolve each selected item price consistently.

**Architecture:** A Product configuration references a reusable Customization Group and supplies optional item controls. The catalog query resolves configurations and preserves legacy groups. A pure resolver produces the displayable group and resolved price state; the existing customizer and quote UI consume those results.

**Tech Stack:** Nuxt 4, Vue 3 Composition API, Pinia, Sanity, GROQ, Vitest.

---

### Task 1: Define Sanity configuration schema and types

**Files:**
- Create: `sanity/schemas/objects/productCustomizationConfiguration.ts`
- Modify: `sanity/schemas/product.ts`
- Modify: `sanity/schemas/index.ts`
- Modify: `app/types/catalog.ts`
- Test: `tests/sanity/schemas.spec.ts`

**Step 1:** Write failing schema tests for a Product `customizationConfigurations` array, its group reference, and override fields (`itemKey`, `enabled`, `pricingType`, `price`).

**Step 2:** Run `npm test -- tests/sanity/schemas.spec.ts`; confirm missing schema assertions fail.

**Step 3:** Add the object schema. Add the Product field without removing `customizationGroups`. Add matching client interfaces.

**Step 4:** Run `npm test -- tests/sanity/schemas.spec.ts`; confirm pass.

### Task 2: Query and resolve Product customization data

**Files:**
- Modify: `app/queries/catalog.ts`
- Create: `app/utils/customizationPricing.ts`
- Modify: `app/types/catalog.ts`
- Test: `tests/sanity/queries.spec.ts`
- Test: `tests/utils/customizationPricing.test.ts`

**Step 1:** Write failing tests for query projection of configurations and the resolver: default fixed price, Product price override, Product pricing-type override, included, POA, and disabled group item.

**Step 2:** Run `npm test -- tests/sanity/queries.spec.ts tests/utils/customizationPricing.test.ts`; confirm expected resolver/query failures.

**Step 3:** Project configuration group data and overrides in GROQ. Implement pure functions that select Product configurations when present, otherwise legacy groups, remove disabled items, and resolve price type/value. Keep Size Option override out of this implementation.

**Step 4:** Run the same focused tests; confirm pass.

### Task 3: Use live groups in the existing customizer

**Files:**
- Modify: `app/pages/customize/index.vue`
- Modify: `app/composables/useCustomizationPricing.ts`
- Modify: `app/components/customization/ProductCustomizer.vue`
- Test: `tests/utils/customizationPricing.test.ts`
- Test: `tests/components/ProductCustomizer.spec.ts`

**Step 1:** Write failing tests that prove resolved Product groups reach the pricing composable and the demo notice is absent for live data.

**Step 2:** Run `npm test -- tests/utils/customizationPricing.test.ts tests/components/ProductCustomizer.spec.ts`; confirm failure.

**Step 3:** Remove fixture dependency. Lookup the selected Product's resolved groups for each Quote List item. Reuse those groups for controls, summaries, mandatory validation, and price lines. Preserve the existing components and selection state.

**Step 4:** Run focused tests; confirm pass.

### Task 4: Make Quote List wording and totals explicit

**Files:**
- Modify: `app/pages/quote.vue`
- Test: `tests/utils/quoteLine.spec.ts`
- Test: `tests/utils/priceLabel.spec.ts`

**Step 1:** Write failing tests for customization per-unit price × quantity and known totals with POA.

**Step 2:** Run `npm test -- tests/utils/quoteLine.spec.ts tests/utils/priceLabel.spec.ts`; confirm failure.

**Step 3:** Retain the existing line multiplication. Change labels to say `ex VAT`; ensure mixed fixed/POA shows the known numeric subtotal plus POA.

**Step 4:** Run focused tests; confirm pass.

### Task 5: Verify, review, and commit

**Files:**
- Modify: all implementation files above

**Step 1:** Run `npm run typecheck`.

**Step 2:** Run `npm test`.

**Step 3:** Run `graphify update .` and `code-review-graph update` if available.

**Step 4:** Review changed code against issue #12. Fix material findings and rerun affected tests.

**Step 5:** Run `git diff --check`, inspect `git diff --cached`, then commit with `feat: connect product customization pricing`.
