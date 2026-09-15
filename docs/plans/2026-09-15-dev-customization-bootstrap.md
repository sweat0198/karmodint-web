# Dev Customization Bootstrap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically seed required customization groups and missing Product links in the Sanity `dev` dataset before a dev deployment without overwriting CMS changes.

**Architecture:** A new pure planner reads the existing group seed and canonical Product recipes, compares them with current Sanity documents, and creates an additive transaction plan. A CLI runs dry by default, refuses non-dev targets, applies only with `--apply`, then verifies stored groups and links. A composite dev-deploy preflight invokes the sync and legacy migration before the existing build/deployment command is allowed to proceed.

**Tech Stack:** TypeScript, `@sanity/client`, `jiti`, Vitest, Sanity NDJSON seeds.

---

### Task 1: Define reusable customization recipes

**Files:**
- Create: `scripts/customizations/lib/seedRecipes.ts`
- Modify: `scripts/catalogue/lib/buildSeed.ts:48-78`
- Modify: `scripts/manual-products/add-container-products.ts:59-75`
- Test: `tests/customizations/seedRecipes.spec.ts`

**Step 1: Write failing recipe tests**

Assert cabin recipes contain deterministic Electricity, Heater, and Air Conditioning references with the existing electricity override. Assert container recipes contain those three plus WC and Kitchen, each with a stable `_key`.

**Step 2: Run test to verify failure**

Run: `npm test -- tests/customizations/seedRecipes.spec.ts`

Expected: FAIL because recipe module does not exist.

**Step 3: Write minimal recipe module**

Export immutable factory functions returning new arrays:

```ts
export function cabinCustomizationConfigurations() { /* electricity, heater, AC */ }
export function containerCustomizationConfigurations() { /* cabin groups, WC, Kitchen */ }
```

Move current literals into these factories. Make `buildSeed.ts` and manual-container import call them, preserving their current output exactly.

**Step 4: Run focused tests**

Run: `npm test -- tests/customizations/seedRecipes.spec.ts tests/catalogue/buildSeed.spec.ts tests/manual-products/add-container-products.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/customizations/lib/seedRecipes.ts scripts/catalogue/lib/buildSeed.ts scripts/manual-products/add-container-products.ts tests/customizations/seedRecipes.spec.ts
git commit -m "refactor: share customization seed recipes"
```

### Task 2: Plan additive dev synchronization

**Files:**
- Create: `scripts/customizations/syncDevCustomizationSeeds.ts`
- Create: `tests/customizations/syncDevCustomizationSeeds.spec.ts`
- Modify: `package.json:4-30`
- Modify: `tsconfig.catalogue.json:13-19`

**Step 1: Write failing planner tests**

Test a pure `buildDevCustomizationSyncPlan` for:

- refusal when dataset is not `dev`;
- missing group documents planned via `createIfNotExists` semantics;
- missing Product configurations appended without changing existing configurations or overrides;
- already-complete input producing no operations;
- only Product IDs present in the canonical cabin/container recipes receiving links.

**Step 2: Run test to verify failure**

Run: `npm test -- tests/customizations/syncDevCustomizationSeeds.spec.ts`

Expected: FAIL because sync module does not exist.

**Step 3: Implement minimal pure planner and CLI**

Parse `sanity/seeds/customizationGroups.ndjson` into typed group documents. Build desired Product configuration recipes from Task 1. Fetch only target Product fields (`_id`, `customizationConfigurations`) and group IDs. Emit a plan containing missing groups and per-Product appended configurations. Add `customizations:sync-dev` script; dry-run default, `--apply` explicit.

**Step 4: Apply in one transaction and verify**

Use `createIfNotExists` for groups and `patch(...).setIfMissing(...).append(...)` or a `set` of the existing configurations plus missing entries for each Product. After commit, re-read group IDs and Product group references; return non-zero if any planned link is absent. Refuse a target whose `readSanityTarget().dataset !== 'dev'` before any fetch/write.

**Step 5: Run focused tests and script typecheck**

Run: `npm test -- tests/customizations/syncDevCustomizationSeeds.spec.ts tests/customizations/seedRecipes.spec.ts && npx tsc --noEmit --project tsconfig.catalogue.json`

Expected: PASS.

**Step 6: Commit**

```bash
git add scripts/customizations/syncDevCustomizationSeeds.ts tests/customizations/syncDevCustomizationSeeds.spec.ts package.json tsconfig.catalogue.json
git commit -m "feat: sync dev customization seeds"
```

### Task 3: Add deployment preflight and validate live dev data

**Files:**
- Modify: `package.json:4-30`
- Modify: `scripts/catalogue/README.md:5-30`
- Test: `tests/customizations/syncDevCustomizationSeeds.spec.ts`

**Step 1: Write failing command-composition test**

Assert package scripts expose a dev-only preflight that runs customization sync with `--apply`, runs legacy migration with `--apply`, then invokes verification. Assert no production deployment script invokes a write command.

**Step 2: Run test to verify failure**

Run: `npm test -- tests/customizations/syncDevCustomizationSeeds.spec.ts`

Expected: FAIL because preflight script is absent.

**Step 3: Add minimal deployment preflight**

Add `customizations:prepare-dev` composing the sync and migration write commands. Keep the existing generic `build` script unchanged. Document that CI/dev deployment calls this preflight only with dev credentials, followed by existing build/deploy tooling.

**Step 4: Run live dry-run then explicit dev sync**

Run:

```bash
npm run customizations:sync-dev
npm run customizations:sync-dev -- --apply
npm run customizations:migrate -- --apply
```

Expected: first command reports planned groups/links; apply verifies them; migration returns no review items.

**Step 5: Run full verification**

Run: `npm test && npx nuxi typecheck && npm run build && npm --prefix sanity run build`

Expected: all commands exit 0.

**Step 6: Commit**

```bash
git add package.json scripts/catalogue/README.md tests/customizations/syncDevCustomizationSeeds.spec.ts
git commit -m "feat: prepare dev customization data before deploy"
```
