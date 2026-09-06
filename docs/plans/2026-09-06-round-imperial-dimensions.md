# Rounded Imperial Dimensions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Return and display meter-to-feet conversions as nearest whole feet.

**Architecture:** Preserve the existing shared conversion seam in `app/types/catalog.ts`. Change only its rounding precision; existing formatters and search consumers inherit the integer result without duplicated display logic.

**Tech Stack:** TypeScript, Vitest, Nuxt 4

---

### Task 1: Round converted feet to whole numbers

**Files:**
- Modify: `tests/sanity/typegen.spec.ts:9-21`
- Modify: `app/types/catalog.ts:197-207`

**Step 1: Write the failing test**

Update conversion expectations:

```ts
expect(metersToFeet(1.5)).toBe(5)
expect(metersToFeet(3.0)).toBe(10)
expect(metersToFeet(6.0)).toBe(20)
expect(dim.imperial).toBe('8ft')
```

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/sanity/typegen.spec.ts`

Expected: FAIL because the helper still returns tenth-precision values.

**Step 3: Write minimal implementation**

```ts
export function metersToFeet(meters: number): number {
  return Math.round(meters * METERS_TO_FEET)
}
```

**Step 4: Run focused test to verify it passes**

Run: `npm test -- tests/sanity/typegen.spec.ts`

Expected: PASS.

**Step 5: Run project verification**

Run: `npx nuxi typecheck`

Expected: exit 0.

Run: `npm test`

Expected: all tests pass.

Run: `npm run build`

Expected: exit 0.

**Step 6: Refresh knowledge graphs**

Run: `graphify update .`

Run: `code-review-graph update`

Expected: both graphs include the modified helper and test.

**Step 7: Commit**

```bash
git add app/types/catalog.ts tests/sanity/typegen.spec.ts
git commit -m "fix: round imperial dimensions"
```
