# Catalog Sticky Category Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move desktop catalog category navigation to the right and keep it visible during catalog scrolling.

**Architecture:** Preserve existing Vue state and category interactions. Change template order and desktop positioning classes only; retain mobile navigation unchanged.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS, Vitest

---

### Task 1: Add layout regression coverage

**Files:**
- Create: `tests/pages/catalogLayout.spec.ts`
- Test: `app/pages/catalog/index.vue`

**Step 1: Write failing test**

Read catalog page source. Assert main product grid occurs before desktop category sidebar. Assert sidebar class contains `sticky top-24 self-start`.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/pages/catalogLayout.spec.ts`

Expected: FAIL because sidebar precedes main and lacks sticky classes.

### Task 2: Implement sticky right sidebar

**Files:**
- Modify: `app/pages/catalog/index.vue`

**Step 1: Write minimal implementation**

Move desktop sidebar after main product grid. Add `sticky top-24 self-start` while preserving width, visibility, styling, state, and events.

**Step 2: Run targeted test**

Run: `npm test -- tests/pages/catalogLayout.spec.ts`

Expected: PASS.

### Task 3: Verify and refresh graph

**Files:**
- Update: `graphify-out/*`
- Update: code-review graph data when available

**Step 1: Run verification**

Run: `npm test`

Run: `npm run build`

Expected: both exit 0.

**Step 2: Refresh graphs**

Run: `graphify update .`

Run: `code-review-graph update` when installed.
