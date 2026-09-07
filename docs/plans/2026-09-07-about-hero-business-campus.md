# About Hero Business Campus Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic About hero image with attractive, truthfully disclosed photorealistic concept scene showing large active modular business and education campus.

**Architecture:** Generate one crop-safe raster using existing Karmod catalogue renders as product-form references. Store versioned PNG master plus optimized WebP delivery asset, then update existing hero card without changing page copy or layout. Lock truthfulness, loading priority, sizing, disclosure, and static presentation through component test.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS, Vitest, Vue Test Utils, Sharp, built-in image generation

---

### Task 1: Generate Business Campus Hero

**Files:**
- Reference: `public/images/products/K3006/left-diagonal.png`
- Reference: `public/images/products/K7001/left-diagonal.png`
- Reference: `public/images/products/K2004/left-diagonal.png`
- Create: `public/images/about/about-business-campus-hero-v2.png`
- Create: `public/images/about/about-business-campus-hero-v2.webp`

**Step 1: Generate scene**

Use built-in image generation in `photorealistic-natural` mode. Treat catalogue images only as product-form references. Request square, crop-safe UK business and education campus: believable two-storey connected modular buildings, central landscaped courtyard, workers and students, bicycles, restrained outdoor seating, warm bright afternoon, gently elevated architectural camera. Prohibit readable text, project/client identity, fake logos, construction state, machinery, mud, fencing, conventional tower architecture, distorted people, malformed bicycles, and implausible modular geometry.

**Step 2: Inspect source**

Confirm architecture remains primary, crowd looks natural, catalogue frame/panel language remains recognisable, scene survives square and 4:3 crops, and forbidden details are absent.

**Step 3: Persist source**

Copy selected output to `public/images/about/about-business-campus-hero-v2.png`.

**Step 4: Optimize delivery**

Use Sharp to create 1280px-wide WebP at quality 84. Confirm dimensions and file size.

### Task 2: Replace Hero Image Test-First

**Files:**
- Create: `tests/components/AboutHeroSection.spec.ts`
- Modify: `app/components/about/HeroSection.vue`

**Step 1: Write failing component test**

Mount `HeroSection`. Assert:

- PNG fallback equals `/images/about/about-business-campus-hero-v2.png`.
- WebP `srcset` equals `/images/about/about-business-campus-hero-v2.webp 1280w`.
- `sizes` matches full-width mobile and half-width desktop card.
- Alt text equals `Concept visualisation of an active modular business and education campus`.
- `loading="eager"`, `fetchpriority="high"`, and `decoding="async"` exist.
- Visible `Concept visualisation` figcaption exists.
- Image keeps `object-cover` and omits `group-hover:scale-105`.
- Referenced PNG and WebP assets exist.

**Step 2: Run focused test and verify RED**

Run: `npm test -- tests/components/AboutHeroSection.spec.ts`

Expected: FAIL because current hero uses `/images/hero-building-enhanced.png` and has no disclosure or responsive source.

**Step 3: Implement minimal hero media**

Use semantic `figure`, responsive PNG/WebP image attributes, truthful alt text, eager/high-priority loading, static image class, and bottom-left disclosure badge. Preserve existing hero heading, paragraph, grid, card dimensions, border, radius, and shadow.

**Step 4: Run focused test and verify GREEN**

Run: `npm test -- tests/components/AboutHeroSection.spec.ts`

Expected: PASS.

### Task 3: Verify and Review

**Files:**
- Verify: `app/components/about/HeroSection.vue`
- Verify: `tests/components/AboutHeroSection.spec.ts`
- Verify: `public/images/about/about-business-campus-hero-v2.{png,webp}`

**Step 1: Run full suite**

Run: `npm test`

Expected: all tests pass.

**Step 2: Build production output**

Run: `npm run build`

Expected: successful Nuxt build.

**Step 3: Inspect prerendered output**

Confirm `dist/about/index.html` contains PNG path, WebP path, truthful alt text, and visible disclosure. Confirm generated CSS contains required sizing classes.

**Step 4: Review visual and technical contract**

Check crop resilience, believable people/bicycles, truthfulness, accessibility, payload, above-fold loading, and absence of unnecessary scene-wide motion.

**Step 5: Refresh graphs**

Run: `graphify update .`

Run: `code-review-graph update`

Run: `code-review-graph detect-changes --base HEAD --brief`

