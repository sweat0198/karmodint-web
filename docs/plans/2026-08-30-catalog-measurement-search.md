# Catalog Measurement Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make catalog size cards searchable using the footprint, Height, and Weight terms displayed on each card.

**Architecture:** Extend `toSizeCards` so each projected card owns display-derived search terms for its exact size. Keep `filterCatalog` unchanged; its existing token-AND logic and size-specific matching consume the richer `sizeSearchTerms` automatically.

**Tech Stack:** TypeScript, Nuxt 4, Vue 3, Vitest

---

### Task 1: Index displayed measurement terms

**Files:**
- Modify: `tests/utils/sizeCards.spec.ts`
- Modify: `app/utils/sizeCards.ts`

**Step 1: Write the failing test**

Add a test inside `describe("toSizeCards", ...)` proving one projected card keeps its displayed strings searchable:

```ts
it("carries rendered footprint, Height, and Weight terms for catalog search", () => {
  const cards = toSizeCards([grpCabin]);
  const card = cards.find((item) => item.sizeKey === "300x300")!;

  expect(card.sizeSearchTerms).toEqual(
    expect.arrayContaining([
      card.sizeLabel,
      "Height: 2.40m (7.9ft)",
      "Weight: 450kg",
      "3m",
      "3 m",
      "9.8ft",
      "9.8 ft",
      "450 kg",
    ]),
  );
});
```

**Step 2: Run test to verify red**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: FAIL because `sizeSearchTerms` contains only the raw label and key.

**Step 3: Implement display-derived measurement terms**

Update the import in `app/utils/sizeCards.ts`:

```ts
import {
  formatMetricAndImperialDimension,
  metersToFeet,
  type SanitySizeImage,
} from "~/types/catalog";
```

Add helpers near `formatFootprintLabel`. Do not add `length` or `width` labels; neither appears on the catalog card:

```ts
function unitValueTerms(values: string[], unit: string): string[] {
  return [...new Set(values)].flatMap((value) => [
    `${value}${unit}`,
    `${value} ${unit}`,
  ]);
}

function displayedMeasurementSearchTerms(size: CatalogSizeOption): string[] {
  return [
    ...unitValueTerms([String(size.lengthM), size.lengthM.toFixed(2)], "m"),
    ...unitValueTerms([String(metersToFeet(size.lengthM))], "ft"),
    ...unitValueTerms([String(size.widthM), size.widthM.toFixed(2)], "m"),
    ...unitValueTerms([String(metersToFeet(size.widthM))], "ft"),
    ...(size.heightM
      ? unitValueTerms([String(size.heightM), size.heightM.toFixed(2)], "m")
      : []),
    ...(size.heightM ? unitValueTerms([String(metersToFeet(size.heightM))], "ft") : []),
    ...(size.weightKg ? unitValueTerms([String(size.weightKg)], "kg") : []),
  ];
}
```

Within `toSizeCards`, compute the rendered values once before `cards.push`:

```ts
const sizeLabel = formatFootprintLabel(size);
const specs = buildSpecs(size);
```

Then change card projection:

```ts
sizeSearchTerms: [
  size.label,
  sizeKey,
  sizeLabel,
  ...specs,
  ...displayedMeasurementSearchTerms(size),
].filter(Boolean),
```

**Step 4: Run test to verify green**

Run: `pnpm test tests/utils/sizeCards.spec.ts`

Expected: PASS.

**Step 5: Commit slice**

```bash
git add app/utils/sizeCards.ts tests/utils/sizeCards.spec.ts docs/plans/2026-08-30-catalog-measurement-search.md
git commit -m "feat(catalog): search displayed measurements"
```

### Task 2: Prove displayed terms drive filtering

**Files:**
- Modify: `tests/utils/catalogSearch.spec.ts`

**Step 1: Write the failing integration test**

Import `toSizeCards`, `CatalogProduct`, and `SanitySizeImage`. Add this fixture and helper after `cards`:

```ts
function measurementImage(assetId: string): SanitySizeImage {
  return {
    _key: assetId,
    view: "front",
    alt: "Front view",
    asset: { _type: "reference", _ref: assetId },
  };
}

const measurementProduct: CatalogProduct = {
  _id: "measurement-cabin",
  name: "Measurement Cabin",
  slug: "measurement-cabin",
  isFeatured: false,
  categories: [],
  sizes: [
    {
      _key: "150x150",
      label: "1.50m x 1.50m",
      lengthM: 1.5,
      widthM: 1.5,
      weightKg: 0,
      isPoa: true,
      price: 0,
      isDefault: true,
      thumbnail: measurementImage("measurement-small"),
      fallbackThumbnail: null,
      images: [measurementImage("measurement-small")],
    },
    {
      _key: "300x300",
      label: "3.00m x 3.00m",
      lengthM: 3,
      widthM: 3,
      heightM: 2.4,
      weightKg: 450,
      isPoa: true,
      price: 0,
      isDefault: false,
      thumbnail: measurementImage("measurement-large"),
      fallbackThumbnail: null,
      images: [measurementImage("measurement-large")],
    },
  ],
};
```

Add this behavior test; `height` and `weight` are rendered labels, while `length` and `width` must remain unsupported:

```ts
it("matches combined displayed measurements on one projected size", () => {
  const projectedCards = toSizeCards([measurementProduct]);
  const result = filterCatalog({
    cards: projectedCards,
    categories,
    query: "3m height 7.9ft weight 450 kg",
  });

  expect(result.visibleCards.map((item) => item.sizeKey)).toEqual(["300x300"]);
});
```

Also assert missing optional measurements do not leak onto the smaller size and non-rendered labels do not match:

```ts
expect(projectedCards.find((card) => card.sizeKey === "150x150")!.sizeSearchTerms)
  .not.toEqual(expect.arrayContaining(["Height: 2.40m (7.9ft)", "Weight: 450kg"]));

expect(
  filterCatalog({ cards: projectedCards, categories, query: "length 3m" }).visibleCards,
).toEqual([]);
```

**Step 2: Run test to verify red**

Run: `pnpm test tests/utils/catalogSearch.spec.ts`

Expected: FAIL because the projected cards lack displayed measurement terms.

**Step 3: Keep filtering unchanged**

Do not modify `app/utils/catalogSearch.ts`. Its normalized token-AND matching already searches `sizeSearchTerms` at individual-card scope. Use the Task 1 projection only.

**Step 4: Run focused tests**

Run: `pnpm test tests/utils/catalogSearch.spec.ts tests/utils/sizeCards.spec.ts`

Expected: PASS.

**Step 5: Commit slice**

```bash
git add tests/utils/catalogSearch.spec.ts docs/plans/2026-08-30-catalog-measurement-search.md
git commit -m "test(catalog): cover displayed measurement search"
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
