# Size Option Customization Matrix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolve Product customization availability, equipment, and pricing by stable Product Size Option and Customization Item keys.

**Architecture:** Extend the reusable item contract with applicability scope and the Product item override with native Size Option rules. Keep resolution and publish-validation as pure functions in `app/utils/customizationPricing.ts`, then reuse those rules in Sanity schema validation. Query the new fields and pass the selected size through the existing customer resolver.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Sanity Studio, Vitest.

---

### Task 1: Extend catalog contracts

**Files:**

- Modify: `app/types/catalog.ts`
- Modify: `tests/utils/customizationPricing.test.ts`

**Step 1: Write failing tests**

Add fixtures with stable size `_key` values and size-dependent items. Assert the type-level fixture accepts `scope`, Size Option rules, and resolved title/description.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/customizationPricing.test.ts`

Expected: FAIL because the size-rule fields and resolver do not exist.

**Step 3: Write minimal implementation**

Add `CustomizationItemScope`, `CustomizationAvailability`, `SanityCustomizationSizeRule`, and fields for scope, override title/description, rule list, and review state. Use `sizeOptionKey` and `itemKey` only.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/customizationPricing.test.ts`

Expected: PASS for contract fixture compilation.

**Step 5: Commit**

```bash
git add app/types/catalog.ts tests/utils/customizationPricing.test.ts
git commit -m "feat: add size customization rule contracts"
```

### Task 2: Resolve size rule precedence and customer filtering

**Files:**

- Modify: `app/utils/customizationPricing.ts`
- Modify: `tests/utils/customizationPricing.test.ts`

**Step 1: Write failing tests**

Add cases for Size Option fixed/included/POA rules taking precedence, inherit using Product then item defaults, unavailable filtering, title/description resolution, and empty-group removal.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/utils/customizationPricing.test.ts`

Expected: FAIL because `resolveCustomizationGroups` has no Size Option parameter or Size Option rule handling.

**Step 3: Write minimal implementation**

Change `resolveCustomizationGroups` to require the selected Size Option key when Product configurations exist. Resolve an item by Size Option rule → Product override → item default. Drop unavailable items and groups with no remaining items. Preserve legacy direct groups as the migration fallback.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/utils/customizationPricing.test.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add app/utils/customizationPricing.ts tests/utils/customizationPricing.test.ts
git commit -m "feat: resolve size customization rules"
```

### Task 3: Validate native Studio rules and publish readiness

**Files:**

- Modify: `sanity/schemas/objects/customizationItem.ts`
- Modify: `sanity/schemas/objects/productCustomizationConfiguration.ts`
- Modify: `sanity/schemas/product.ts`
- Modify: `tests/sanity/schemas.spec.ts`

**Step 1: Write failing tests**

Test duplicate Size Option rules, unknown size/item keys, missing reviewed rules for size-dependent items, mandatory groups with no available items, and schema fields for all native states.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/sanity/schemas.spec.ts`

Expected: FAIL because native rule fields and validations do not exist.

**Step 3: Write minimal implementation**

Add `scope` to customization items. Add nested Size Option rule objects to Product item overrides. Use async references to validate item keys and Product size keys. Add Product-level validation that permits incomplete drafts but rejects a `published` Product with orphaned/stale rules, missing reviewed size-dependent rules, or a mandatory configured group with no available items.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/sanity/schemas.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add sanity/schemas tests/sanity/schemas.spec.ts
git commit -m "feat: validate size customization rules"
```

### Task 4: Project new fields and use selected size in customer customization

**Files:**

- Modify: `app/queries/catalog.ts`
- Modify: `app/pages/customize/index.vue`
- Modify: `tests/sanity/queries.spec.ts`
- Modify: `tests/components/customizationGroups.spec.ts`

**Step 1: Write failing tests**

Assert the catalogue projection requests item scope, Size Option rules, review fields, and resolved-equipment overrides. Assert customer groups receive only items effective for the selected Size Option.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/sanity/queries.spec.ts tests/components/customizationGroups.spec.ts`

Expected: FAIL because the query omits rules and the selected size is not supplied to resolution.

**Step 3: Write minimal implementation**

Project all rule fields. Pass the selected Size Option `_key` when resolving Product configurations. Keep existing group selection mode and presentation components unchanged.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/sanity/queries.spec.ts tests/components/customizationGroups.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add app/queries/catalog.ts app/pages/customize/index.vue tests/sanity/queries.spec.ts tests/components/customizationGroups.spec.ts
git commit -m "feat: filter customer customizations by size"
```

### Task 5: Full verification and review

**Files:**

- Modify: `graphify-out/` only if graph tooling writes changed index data

**Step 1: Run checks**

Run: `npm test && npm run build && cd sanity && npm run build`

Expected: all commands exit 0.

**Step 2: Refresh graphs**

Run: `graphify update . && code-review-graph update`

Expected: graph data reflects changed contracts.

**Step 3: Review diff**

Run a two-axis review against commit `6d736c0` using the issue #13 specification and repository standards.

**Step 4: Commit final fixes**

```bash
git add <reviewed-files>
git commit -m "fix: address size customization review findings"
```
