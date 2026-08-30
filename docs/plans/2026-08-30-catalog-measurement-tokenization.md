# Catalog Measurement Tokenization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Match decimal measurements by value and optional unit, never by arbitrary digit fragments.

**Architecture:** Keep existing Turkish/accent text normalization and token-AND semantics. Preserve decimal separators, canonicalize comma decimals, and route numeric tokens through a numeric-value matcher over normalized terms; text tokens retain substring matching. `filterCatalog` public API and search-field UI stay unchanged.

**Tech Stack:** TypeScript, Vue 3, Vitest

---

### Task 1: Parse numeric measurement tokens safely

**Files:**
- Modify: `tests/utils/catalogSearch.spec.ts`
- Modify: `app/utils/catalogSearch.ts`

**Step 1: Write failing behavior tests**

Extend the projected-card fixture with cards containing `2.15m` and `11.50m` measurements. Add focused tests:

```ts
it("matches decimal measurements by value rather than digit fragments", () => {
  const projectedCards = toSizeCards([measurementProduct]);

  expect(
    filterCatalog({ cards: projectedCards, categories, query: "1.5" }).visibleCards
      .map((card) => card.sizeKey),
  ).toEqual(["150x150"]);

  expect(
    filterCatalog({ cards: projectedCards, categories, query: "1,5" }).visibleCards
      .map((card) => card.sizeKey),
  ).toEqual(["150x150"]);
});

it("requires a matching unit when the decimal query includes one", () => {
  const projectedCards = toSizeCards([measurementProduct]);

  expect(
    filterCatalog({ cards: projectedCards, categories, query: "1.5m" }).visibleCards
      .map((card) => card.sizeKey),
  ).toEqual(["150x150"]);
  expect(
    filterCatalog({ cards: projectedCards, categories, query: "1.5ft" }).visibleCards,
  ).toEqual([]);
});
```

Keep the existing Turkish/punctuation behavior test unchanged. Run:

```bash
pnpm test tests/utils/catalogSearch.spec.ts
```

Expected: FAIL because `1.5` becomes tokens `1` and `5`, matching `2.15m` and `11.50m`.

**Step 2: Preserve decimal normalization**

In `normalizeSearchText`, canonicalize decimal commas before punctuation replacement and allow decimal dots to survive:

```ts
.replace(/(\d),(\d)/g, "$1.$2")
.replace(/[^a-z0-9.]+/g, " ")
```

**Step 3: Match numeric tokens by parsed value**

Add a parser for `number` plus optional alphabetic unit and route each token through it:

```ts
function numericToken(value: string): { value: number; unit?: string } | null {
  const match = value.match(/^(\d+(?:\.\d+)?)([a-z]+)?$/);
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2] };
}
```

For numeric query tokens, inspect normalized whitespace-separated candidate terms. Match only equal numeric values; if the query has a unit, require equal units. For non-numeric tokens retain current normalized substring behavior. Keep `filterCatalog` call sites and return shape unchanged.

**Step 4: Run focused tests**

```bash
pnpm test tests/utils/catalogSearch.spec.ts tests/utils/sizeCards.spec.ts
```

Expected: PASS. Confirm existing Turkish/punctuation test remains green.

**Step 5: Commit**

```bash
git add app/utils/catalogSearch.ts tests/utils/catalogSearch.spec.ts
git commit -m "fix(catalog): match decimal measurements exactly"
```

### Task 2: Verify catalog behavior and graph freshness

**Files:**
- Update: generated graph data through project tooling

**Step 1: Run catalog regression tests**

```bash
pnpm test tests/utils/catalogSearch.spec.ts tests/utils/sizeCards.spec.ts tests/pages/catalogLayout.spec.ts tests/components/CatalogSearchField.spec.ts
```

**Step 2: Run broader verification**

```bash
pnpm test
pnpm exec nuxi typecheck
pnpm build
```

Record known unrelated Sanity test, typecheck, or prerender failures separately; confirm no catalog-search regression.

**Step 3: Refresh graphs and inspect scope**

```bash
graphify update .
code-review-graph update
git diff --check
git status --short
```

Expected: graph updates succeed; only intended search source/test changes tracked.
