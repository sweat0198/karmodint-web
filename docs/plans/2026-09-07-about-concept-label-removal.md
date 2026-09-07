# About Concept Label Removal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove visible concept overlay labels from About hero, Vision, and Mission imagery while preserving image behaviour and accurate alt text.

**Architecture:** Update existing component tests first so absence of `figcaption` becomes contract. Remove caption nodes only; retain semantic image containers, source paths, formats, sizing, loading attributes, and concept-based alt text.

**Tech Stack:** Nuxt 4, Vue 3, Vitest, Vue Test Utils

---

### Task 1: Update Caption Contract

**Files:**
- Modify: `tests/components/AboutHeroSection.spec.ts`
- Modify: `tests/components/MissionVisionSection.spec.ts`

**Step 1: Write failing expectations**

Replace caption-text expectations with `expect(wrapper.find('figcaption').exists()).toBe(false)` in both component suites.

**Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/components/AboutHeroSection.spec.ts tests/components/MissionVisionSection.spec.ts`

Expected: FAIL because three visible `figcaption` elements remain.

### Task 2: Remove Visible Labels

**Files:**
- Modify: `app/components/about/HeroSection.vue`
- Modify: `app/components/about/MissionVisionSection.vue`

**Step 1: Remove captions**

Delete only three `figcaption` blocks. Keep `figure`, `picture`, image attributes, classes, and alt text unchanged.

**Step 2: Run focused tests and verify GREEN**

Run: `npm test -- tests/components/AboutHeroSection.spec.ts tests/components/MissionVisionSection.spec.ts`

Expected: both files pass.

### Task 3: Verify

**Files:**
- Verify: `app/components/about/HeroSection.vue`
- Verify: `app/components/about/MissionVisionSection.vue`
- Verify: `tests/components/AboutHeroSection.spec.ts`
- Verify: `tests/components/MissionVisionSection.spec.ts`

**Step 1: Run full suite**

Run: `npm test`

Expected: all tests pass.

**Step 2: Build production output**

Run: `npm run build`

Expected: successful build.

**Step 3: Inspect rendered output**

Confirm `dist/about/index.html` contains no `Concept visualisation` visible text while image paths remain present.

**Step 4: Refresh graphs**

Run: `graphify update .`

Run: `code-review-graph update`

