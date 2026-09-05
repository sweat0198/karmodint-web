# Catalog to Products Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the public Catalog experience to Products and move its pre-launch route from `/catalog` to `/products` without a redirect.

**Architecture:** Preserve internal catalogue import, query, type, helper, DOM, and CSS vocabulary. Change only public route ownership, route consumers, visible/accessibility copy, and SEO output. Existing rendered components, Pinia store, page-source test, and Nitro handler form the behavior seams.

**Tech Stack:** Nuxt 4, Vue 3, Vue Router, Pinia, TypeScript, Vitest

---

### Task 1: Lock Products behavior in tests

**Files:**
- Modify: `tests/components/AppHeader.spec.ts`
- Modify: `tests/components/CatalogSearchField.spec.ts`
- Modify: `tests/pages/catalogLayout.spec.ts`
- Modify: `tests/stores/quote.spec.ts`
- Create: `tests/server/sitemap.test.ts`

**Step 1: Write failing expectations**

- Register and mount `/products` in `AppHeader.spec.ts`; assert rendered navigation says `Products` and omits `Catalog`.
- Expect `Search products…` and `Clear product search` in `CatalogSearchField.spec.ts`.
- Read `app/pages/products/index.vue` from the page-layout test.
- Assert a fresh quote store starts at `/products`.
- Invoke the sitemap handler and assert `/products` exists while `/catalog` does not.

**Step 2: Run tests to verify red**

Run:

```bash
pnpm test tests/components/AppHeader.spec.ts tests/components/CatalogSearchField.spec.ts tests/pages/catalogLayout.spec.ts tests/stores/quote.spec.ts tests/server/sitemap.test.ts
```

Expected: FAIL because implementation still exposes Catalog and `/catalog`.

### Task 2: Move the route and update all public route consumers

**Files:**
- Move: `app/pages/catalog/index.vue` → `app/pages/products/index.vue`
- Modify: `app/components/AppHeader.vue`
- Modify: `app/components/HeroSection.vue`
- Modify: `app/components/ProductCatalogSection.vue`
- Modify: `app/components/ProductCard.vue`
- Modify: `app/components/PriceBar.vue`
- Modify: `app/components/ProgressTracker.vue`
- Modify: `app/components/EmptyQuoteState.vue`
- Modify: `app/pages/customize/index.vue`
- Modify: `app/pages/quote.vue`
- Modify: `app/stores/quote.ts`
- Modify: `app/composables/useAppSeo.ts`
- Modify: `server/routes/sitemap.xml.ts`
- Modify: `nuxt.config.ts`

**Step 1: Implement minimal route migration**

Replace public `/catalog` destinations and route checks with `/products`. Move the Nuxt page so `/catalog` is no longer generated. Do not create a redirect.

**Step 2: Replace customer-facing terminology**

Use `Products`, `Return to Products`, `Browse Products`, `Search products…`, and `Clear product search`. Rewrite product-page SEO naturally: remove Catalog from title/description, use `/products` canonical and breadcrumb paths, and name schemas with Products terminology.

**Step 3: Run targeted tests to verify green**

Run the Task 1 command. Expected: PASS.

### Task 3: Audit scope and verify repository

**Files:**
- Modify only if audit finds missed public occurrences.

**Step 1: Audit leftovers**

Search application, server, tests, and Nuxt config for public `/catalog` routes and visible Catalog strings. Allow internal imports, `Catalog*` types/helpers/components, catalogue pipeline paths, CSS/DOM identifiers, comments, and historical docs.

**Step 2: Typecheck**

Run: `pnpm exec nuxi typecheck`

Expected: PASS.

**Step 3: Run full suite**

Run: `pnpm test`

Expected: PASS.

**Step 4: Review and refresh graphs**

Use `mattpocock-skills:code-review` against the pre-implementation commit. Resolve valid findings, rerun affected checks, then run `graphify update .` and `code-review-graph update` when available.

**Step 5: Commit implementation**

```bash
git add app tests server nuxt.config.ts graphify-out
git commit -m "feat: rename catalog to products"
```
