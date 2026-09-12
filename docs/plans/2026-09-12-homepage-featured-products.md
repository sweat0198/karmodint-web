# Homepage Featured Products Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Render the three requested product-size variants on the homepage.

**Architecture:** Keep the existing catalogue query. Replace its single-featured-product selection with three explicit product-ID/size-key pairs, then use the shared size-card adapter so every card has a precise selectable variant.

**Tech Stack:** Nuxt 3, Vue 3, TypeScript, Vitest, Vue Test Utils.

---

### Task 1: Cover homepage card selection

**Files:**
- Create: `tests/components/ProductCatalogSection.spec.ts`

**Step 1:** Write failing test asserting homepage card order: `product-k1002-portable-cabin-300x700`, `product-grp-cabin-150x150`, `product-insulated-panel-cabin-135x210`.

**Step 2:** Run `pnpm vitest run tests/components/ProductCatalogSection.spec.ts`; expect failure because homepage still selects three sizes from one featured product.

### Task 2: Select requested variants

**Files:**
- Modify: `app/components/ProductCatalogSection.vue`

**Step 1:** Select exact product/size pairs, preserving requested order.

**Step 2:** Run the focused test; expect pass.

**Step 3:** Run `pnpm test` and `pnpm build`; expect exit code 0.
