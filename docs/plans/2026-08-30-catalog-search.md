# Catalog Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add shareable, debounced catalog search that filters size cards and desktop/mobile category navigation.

**Architecture:** Enrich the existing `SizeCard` projection with search-only metadata, then keep matching rules in one pure `filterCatalog` utility. The catalog page owns immediate input state and commits trimmed searches to `?search=` after 350ms; a reusable field renders in the desktop breadcrumb row and below mobile breadcrumbs.

**Tech Stack:** Nuxt 4, Vue 3, Vue Router, Tailwind CSS, Vitest

---

### Task 1: Carry searchable catalog metadata

**Files:**
- Modify: `app/utils/sizeCards.ts`
- Test: `tests/utils/sizeCards.spec.ts`

**Step 1: Write failing metadata test**

Assert each size card carries product `shortDescription`, parent/child category names, and only that size's raw label/key.

**Step 2: Verify red**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: FAIL because search metadata does not exist.

**Step 3: Implement minimal projection**

Add typed `shortDescription`, `categoryNames`, and `sizeSearchTerms` fields to `SizeCard`; populate them in `toSizeCards` without changing display order.

**Step 4: Verify green**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: PASS.

### Task 2: Implement catalog filtering

**Files:**
- Create: `app/utils/catalogSearch.ts`
- Create: `tests/utils/catalogSearch.spec.ts`

**Step 1: Add one failing behavior test at a time**

Cover Turkish/accent/punctuation normalization, token-AND matching across fields, general matches showing every product size, size-only matches showing only matching size cards, active-category intersection, original ordering, globally derived category results, ancestor retention, and selected-path pinning.

**Step 2: Verify each red state**

Run: `pnpm test tests/utils/catalogSearch.spec.ts`

Expected: newest assertion FAILS for missing behavior.

**Step 3: Add minimal behavior**

Export one public `filterCatalog` function returning search-matched cards, selected-category cards, and a filtered category tree.

**Step 4: Verify each green state**

Run: `pnpm test tests/utils/catalogSearch.spec.ts`

Expected: PASS after each slice.

### Task 3: Build accessible search field

**Files:**
- Create: `app/components/CatalogSearchField.vue`
- Create: `tests/components/CatalogSearchField.spec.ts`

**Step 1: Write failing component test**

Mount the field through its public DOM/events. Assert native search semantics, `Search catalog…` placeholder, model updates, and clear event.

**Step 2: Verify red**

Run: `pnpm test tests/components/CatalogSearchField.spec.ts`

Expected: FAIL because component is absent.

**Step 3: Implement field**

Render search icon, native input, accessible label, and immediate clear button. Avoid list or keyboard animation; limit press feedback to the clear button.

**Step 4: Verify green**

Run: `pnpm test tests/components/CatalogSearchField.spec.ts`

Expected: PASS.

### Task 4: Wire search into catalog page

**Files:**
- Modify: `app/pages/catalog/index.vue`
- Modify: `tests/pages/catalogLayout.spec.ts`

**Step 1: Write failing integration assertions**

Assert desktop field follows breadcrumb navigation and mobile field follows mobile breadcrumbs. Assert filtered categories feed the drawer/sidebar and category clearing preserves unrelated query state.

**Step 2: Verify red**

Run: `pnpm test tests/pages/catalogLayout.spec.ts`

Expected: FAIL because catalog search markup and state are absent.

**Step 3: Implement page wiring**

Initialize input from `route.query.search`, debounce URL replacement by 350ms, sync browser navigation back into the input, clear immediately, preserve search during category changes, filter cards/categories, render query-specific result count/empty state, and pass filtered categories to `CategoryDrawer`.

**Step 4: Verify green and type safety**

Run: `pnpm test tests/pages/catalogLayout.spec.ts tests/utils/catalogSearch.spec.ts tests/components/CatalogSearchField.spec.ts`

Run: `pnpm exec nuxi typecheck`

Expected: PASS.

### Task 5: Review, verify, refresh graphs, commit

**Files:**
- Update: `graphify-out/*`

**Step 1: Review implementation against repo standards and this plan**

Run the requested two-axis `/code-review`; resolve valid findings.

**Step 2: Run full verification**

Run: `pnpm test`

Run: `pnpm exec nuxi typecheck`

Run: `pnpm build`

Expected: all exit 0.

**Step 3: Refresh code graphs**

Run: `graphify update .`

Run `code-review-graph update` when available.

**Step 4: Commit**

Commit verified files on the current branch with a Conventional Commit message.
