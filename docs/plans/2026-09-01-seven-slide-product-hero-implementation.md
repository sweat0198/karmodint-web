# Seven-Slide Product Hero Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the homepage hero to seven product-specific slides with five new UK-market cabin scenes.

**Architecture:** Use existing project-local product renders as high-fidelity references for five independent built-in image-generation calls. Optimise final images to WebP, replace the three legacy cabin slide objects with five size-specific objects, and protect the rendered slide contract with Vitest.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Vue Test Utils, Vitest, Sharp, built-in image generation.

---

### Task 1: Define the seven-slide contract test-first

**Files:**
- Modify: `tests/components/HeroSection.spec.ts`
- Inspect: `app/components/HeroSection.vue:240-267`

**Step 1: Write the failing test**

Keep the existing first-two-slide assertions. Add a second test that expects seven images and verifies slides 3–7 by clicking each dot and checking its source, alt text, title, and subtitle.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: FAIL because only five images exist and slides 3–5 still use legacy category-level content.

**Step 3: Commit the failing test**

```bash
git add tests/components/HeroSection.spec.ts
git commit -m "test: define seven product hero slides"
```

### Task 2: Generate five UK deployment scenes

**Files:**
- Reference: `public/images/products/cabin-grp-150x150/front.png`
- Reference: `public/images/products/cabin-grp-150x150/left-diagonal.png`
- Reference: `public/images/products/cabin-panel-135x210/front.png`
- Reference: `public/images/products/cabin-panel-135x210/left-diagonal.png`
- Reference: `public/images/products/cabin-metro-city-215x265/front.png`
- Reference: `public/images/products/cabin-metro-city-215x265/left-diagonal.png`
- Reference: `public/images/products/cabin-composite-265x265/front.png`
- Reference: `public/images/products/cabin-composite-265x265/left-diagonal.png`
- Reference: `public/images/products/bulletproof-200x400/front.png`
- Reference: `public/images/products/bulletproof-200x400/left-diagonal.png`

**Step 1: Generate GRP scene**

Create a faithful 1.5 × 1.5 m GRP cabin at a leafy British school or sports-ground entrance.

**Step 2: Generate panel scene**

Create a faithful 1.35 × 2.1 m panel cabin at an organised UK construction-site gate.

**Step 3: Generate MetroCity scene**

Create a faithful 2.15 × 2.65 m MetroCity cabin at a premium UK residential development entrance.

**Step 4: Generate KompoCity scene**

Create a faithful 2.65 × 2.65 m KompoCity cabin at a contemporary British office or hotel forecourt.

**Step 5: Generate bulletproof scene**

Create a faithful 2 × 4 m bulletproof cabin at a discreet UK critical-infrastructure checkpoint. Show no people, weapons, conflict, or readable security signage.

**Step 6: Inspect outputs**

Compare every output with both product references. Reject geometry drift, missing openings, wrong materials, extra fixtures, cropped products, or non-UK visual cues.

### Task 3: Optimise project assets

**Files:**
- Create: `public/images/hero/hero-grp-1-5x1-5-uk.webp`
- Create: `public/images/hero/hero-panel-1-35x2-1-uk.webp`
- Create: `public/images/hero/hero-metrocity-2-15x2-65-uk.webp`
- Create: `public/images/hero/hero-kompocity-2-65x2-65-uk.webp`
- Create: `public/images/hero/hero-bulletproof-2x4-uk.webp`

**Step 1: Convert with Sharp**

Produce WebP files at quality 84, maximum width 1600 px, without upscaling.

**Step 2: Verify dimensions and file sizes**

Run: `sips -g pixelWidth -g pixelHeight public/images/hero/hero-*-uk.webp`

Expected: five new files are landscape, crop-safe, and no wider than 1600 px.

### Task 4: Integrate slide metadata

**Files:**
- Modify: `app/components/HeroSection.vue:240-267`

**Step 1: Replace legacy cabin slides**

Retain slides 1–2. Replace the existing panel, combined MetroCity/Composite, and bulletproof entries with five size-specific entries in the approved order.

**Step 2: Run focused test**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: PASS.

**Step 3: Commit implementation**

```bash
git add app/components/HeroSection.vue public/images/hero/hero-grp-1-5x1-5-uk.webp public/images/hero/hero-panel-1-35x2-1-uk.webp public/images/hero/hero-metrocity-2-15x2-65-uk.webp public/images/hero/hero-kompocity-2-65x2-65-uk.webp public/images/hero/hero-bulletproof-2x4-uk.webp
git commit -m "feat: expand hero with UK cabin scenes"
```

### Task 5: Refresh graphs and verify

**Step 1: Refresh indexes**

Run: `graphify update .`

Run: `code-review-graph update`

Expected: changed hero component and test indexed.

**Step 2: Run full verification**

Run: `npm test`

Run: `npm run build`

Expected: both commands exit 0.

**Step 3: Audit repository state**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; only intended files changed before commits, then clean worktree.

