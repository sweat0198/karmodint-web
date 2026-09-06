# Hero First Slides Swap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the 3 × 7 m container first Hero carousel slide and the 2.3 × 6 m container second.

**Architecture:** The carousel renders the `slides` array in source order. Reorder only its first two objects. Update its component test to assert same order and active-slide content.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Vitest, Vue Test Utils.

---

### Task 1: Define expected initial Hero slide order

**Files:**
- Modify: `tests/components/HeroSection.spec.ts:8-38`

**Step 1: Write the failing test**

Change expected first image and initial content to `3 × 7 m Modular Container`; make slide 2 expect `2.3 × 6 m Modular Container`.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: FAIL. Existing first slide remains 2.3 × 6 m.

### Task 2: Swap Hero container slide definitions

**Files:**
- Modify: `app/components/HeroSection.vue:251-260`

**Step 1: Write minimal implementation**

Exchange the first two `slides` objects, preserving every property and each remaining object.

**Step 2: Run targeted test**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: PASS.

**Step 3: Run full suite**

Run: `npm test`

Expected: PASS.

**Step 4: Commit**

```bash
git add app/components/HeroSection.vue tests/components/HeroSection.spec.ts
git commit -m "feat: reorder hero container slides"
```
