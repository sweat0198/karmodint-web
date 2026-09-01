# Homepage Container Hero Images Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two product-faithful UK-market container images to the first two homepage hero slides.

**Architecture:** Generate two independent landscape assets from the supplied product references, optimise them into project-local WebP files, and point the existing static `slides` array at them. Add a focused mount test for rendered slide metadata; leave carousel behaviour untouched.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Vue Test Utils, Vitest, Sharp, built-in image generation.

---

### Task 1: Protect first-two-slide content with a failing test

**Files:**
- Create: `tests/components/HeroSection.spec.ts`
- Inspect: `app/components/HeroSection.vue:1-310`

**Step 1: Write the failing test**

Mount `HeroSection` with a `NuxtLink` stub. Assert five images render. Assert the first two image sources, alt text, titles, and subtitles match the approved 2.3 × 6 m and 3 × 7 m content.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: FAIL because current first two slide paths and metadata still describe the generic modular and GRP imagery.

**Step 3: Commit test**

```bash
git add tests/components/HeroSection.spec.ts
git commit -m "test: define container hero slides"
```

### Task 2: Generate and optimise hero assets

**Files:**
- Create: `public/images/hero/hero-container-2-3x6-uk.webp`
- Create: `public/images/hero/hero-container-3x7-uk.webp`

**Step 1: Generate the 2.3 × 6 m scene**

Use supplied Image 1 as the product reference. Request a photorealistic compact site office on a tidy British construction site, natural overcast-bright daylight, central crop-safe product, and no people or generated text.

**Step 2: Generate the 3 × 7 m scene**

Use supplied Image 2 as the product reference. Request a photorealistic larger office at a modern UK commercial development, soft daylight, central crop-safe product, and no people or generated text.

**Step 3: Inspect both outputs**

Check product geometry, doors, windows, frame, panels, colour, UK environmental cues, overlay-safe composition, and absence of image-generation artefacts.

**Step 4: Optimise assets**

Use Sharp to produce 1600 px-wide WebP assets at quality 84 without upscaling.

**Step 5: Inspect dimensions and sizes**

Run: `sips -g pixelWidth -g pixelHeight public/images/hero/hero-container-2-3x6-uk.webp public/images/hero/hero-container-3x7-uk.webp`

Expected: both landscape, at most 1600 px wide, with the full product retained in the central safe area.

### Task 3: Wire assets and copy into the hero

**Files:**
- Modify: `app/components/HeroSection.vue:240-255`

**Step 1: Update first two slide objects**

Use the new WebP paths. Set titles to `2.3 × 6 m Modular Container` and `3 × 7 m Modular Container`. Set concise UK-market site-office subtitles.

**Step 2: Run focused test**

Run: `npm test -- tests/components/HeroSection.spec.ts`

Expected: PASS.

**Step 3: Commit implementation**

```bash
git add app/components/HeroSection.vue public/images/hero/hero-container-2-3x6-uk.webp public/images/hero/hero-container-3x7-uk.webp
git commit -m "feat: add UK container hero scenes"
```

### Task 4: Refresh graphs and verify

**Files:**
- Update: `graphify-out/graph.json`
- Update: code-review graph index

**Step 1: Refresh project graphs**

Run: `graphify update .`

Run: `code-review-graph update`

Expected: indexes include the changed hero component, test, and image assets.

**Step 2: Run full verification**

Run: `npm test`

Run: `npm run build`

Expected: both commands exit 0.

**Step 3: Review final diff**

Run: `git diff --check`

Run: `git status --short`

Expected: no whitespace errors; only intended files changed.

