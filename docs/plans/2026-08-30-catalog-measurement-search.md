# Catalog Measurement Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make catalog size cards searchable by length, width, height, and weight using metric, imperial, compact, spaced, and field-qualified terms.

**Architecture:** Extend `toSizeCards` so each projected card owns canonical search terms for its exact size. Keep `filterCatalog` unchanged; its existing token-AND logic and size-specific matching will consume the richer `sizeSearchTerms` automatically.

**Tech Stack:** TypeScript, Nuxt 4, Vue 3, Vitest

---

### Task 1: Add bare metric and imperial dimension terms

**Files:**
- Modify: `tests/utils/sizeCards.spec.ts`
- Modify: `app/utils/sizeCards.ts`

**Step 1: Write the failing test**

Add this test inside `describe("toSizeCards", ...)`:

```ts
it("carries bare metric and imperial length and width search terms", () => {
  const cards = toSizeCards([panelCabin]);

  expect(cards[0].sizeSearchTerms).toEqual(
    expect.arrayContaining([
      "2m",
      "2 m",
      "2.00m",
      "2.00 m",
      "6.6ft",
      "6.6 ft",
    ]),
  );
});
```

**Step 2: Run test to verify red**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: FAIL because `sizeSearchTerms` contains only the raw label and key.

**Step 3: Implement minimal bare dimension terms**

Update the import in `app/utils/sizeCards.ts`:

```ts
import {
  formatMetricAndImperialDimension,
  metersToFeet,
  type SanitySizeImage,
} from "~/types/catalog";
```

Add helpers near `formatFootprintLabel`:

```ts
function unitValueTerms(values: string[], unit: string): string[] {
  return [...new Set(values)].flatMap((value) => [
    `${value}${unit}`,
    `${value} ${unit}`,
  ]);
}

function bareDimensionSearchTerms(meters: number): string[] {
  return [
    ...unitValueTerms([String(meters), meters.toFixed(2)], "m"),
    ...unitValueTerms([String(metersToFeet(meters))], "ft"),
  ];
}
```

Change card projection:

```ts
sizeSearchTerms: [
  size.label,
  sizeKey,
  ...bareDimensionSearchTerms(size.lengthM),
  ...bareDimensionSearchTerms(size.widthM),
].filter(Boolean),
```

**Step 4: Run test to verify green**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: PASS.

**Step 5: Commit slice**

```bash
git add app/utils/sizeCards.ts tests/utils/sizeCards.spec.ts docs/plans/2026-08-30-catalog-measurement-search.md
git commit -m "feat(catalog): search footprint measurements"
```

### Task 2: Add field-qualified height and weight search

**Files:**
- Modify: `tests/utils/catalogSearch.spec.ts`
- Modify: `app/utils/sizeCards.ts`

**Step 1: Write the failing integration test**

Import `toSizeCards`, `CatalogProduct`, and `SanitySizeImage`. Add a minimal two-size product fixture with valid thumbnails. The first size should be `lengthM: 1.5`, `widthM: 1.5`, no height/weight; the second should be `lengthM: 3`, `widthM: 3`, `heightM: 2.4`, `weightKg: 450`.

Add this behavior test:

```ts
it("matches combined field-qualified measurements on one projected size", () => {
  const projectedCards = toSizeCards([measurementProduct]);
  const result = filterCatalog({
    cards: projectedCards,
    categories,
    query: "length 3m width 3m height 7.9ft weight 450 kg",
  });

  expect(result.visibleCards.map((item) => item.sizeKey)).toEqual(["300x300"]);
});
```

Also assert missing optional measurements do not leak onto the smaller size:

```ts
expect(projectedCards.find((card) => card.sizeKey === "150x150")!.sizeSearchTerms)
  .not.toEqual(expect.arrayContaining(["height", "weight"]));
```

**Step 2: Run test to verify red**

Run: `pnpm test tests/utils/catalogSearch.spec.ts`

Expected: FAIL because field labels, height, and weight terms are absent.

**Step 3: Implement labeled measurement terms**

Replace the Task 1 helpers with:

```ts
function unitValueTerms(label: string, values: string[], unit: string): string[] {
  return [...new Set(values)].flatMap((value) => {
    const compact = `${value}${unit}`;
    const spaced = `${value} ${unit}`;
    return [compact, spaced, `${label} ${compact}`, `${label} ${spaced}`];
  });
}

function dimensionSearchTerms(label: "length" | "width" | "height", meters: number): string[] {
  return [
    ...unitValueTerms(label, [String(meters), meters.toFixed(2)], "m"),
    ...unitValueTerms(label, [String(metersToFeet(meters))], "ft"),
  ];
}

function measurementSearchTerms(size: CatalogSizeOption): string[] {
  return [
    ...dimensionSearchTerms("length", size.lengthM),
    ...dimensionSearchTerms("width", size.widthM),
    ...(size.heightM ? dimensionSearchTerms("height", size.heightM) : []),
    ...(size.weightKg
      ? unitValueTerms("weight", [String(size.weightKg)], "kg")
      : []),
  ];
}
```

Update projection:

```ts
sizeSearchTerms: [
  size.label,
  sizeKey,
  ...measurementSearchTerms(size),
].filter(Boolean),
```

**Step 4: Run focused tests**

Run: `pnpm test tests/utils/catalogSearch.spec.ts tests/utils/sizeCards.spec.ts`

Expected: PASS.

**Step 5: Commit slice**

```bash
git add app/utils/sizeCards.ts tests/utils/catalogSearch.spec.ts
git commit -m "feat(catalog): search height and weight"
```

### Task 3: Verify and refresh graphs

**Files:**
- Update generated graph data through project tooling

**Step 1: Run catalog regression tests**

Run: `pnpm test tests/utils/catalogSearch.spec.ts tests/utils/sizeCards.spec.ts tests/pages/catalogLayout.spec.ts tests/components/CatalogSearchField.spec.ts`

Expected: PASS.

**Step 2: Run full verification**

Run: `pnpm test`

Run: `pnpm exec nuxi typecheck`

Run: `pnpm build`

Expected: tests and build pass. If typecheck still reports known unrelated baseline errors, confirm no catalog-search errors were added and report them explicitly.

**Step 3: Refresh graphs**

Run: `graphify update .`

Run: `code-review-graph update`

Expected: both exit 0.

**Step 4: Inspect final scope**

Run: `git status --short`

Run: `git diff --check HEAD~2..HEAD`

Confirm unrelated pan/zoom working-tree changes remain uncommitted and untouched.
