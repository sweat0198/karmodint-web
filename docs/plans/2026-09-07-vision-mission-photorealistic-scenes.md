# Vision and Mission Photorealistic Scenes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace abstract product composites with two attractive photorealistic completed-project scenes combining recognisable Karmod catalogue products.

**Architecture:** Generate each scene as one raster using multiple catalogue renders as references. Save versioned PNG masters plus optimized WebP delivery assets, then simplify each card to one responsive image while preserving all existing content and layout.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS, Vitest, Vue Test Utils, Sharp, built-in image generation

---

### Task 1: Generate Vision Campus Scene

**Files:**
- Reference: `public/images/products/K7001/left-diagonal.png`
- Reference: `public/images/products/K2004/left-diagonal.png`
- Reference: `public/images/products/cabin-composite-265x265/left-diagonal.png`
- Create: `public/images/about/vision-modular-campus-v2.png`
- Create: `public/images/about/vision-modular-campus-v2.webp`

**Step 1: Generate scene with catalogue references**

Use built-in image generation in `photorealistic-natural` mode. Supply all three reference images and label them product-form references. Request a premium completed UK modular business campus: multiple beige-and-white modules arranged as a believable L-shaped single-storey complex, composite cabin used as an entrance or service pavilion, mature landscaping, paved accessible paths, restrained seating, warm late-afternoon light, eye-level 28mm architectural photograph, very wide crop. Prohibit construction state, text, signage, fake logos, cranes, machinery, fencing, mud, distorted geometry, and floating structures.

**Step 2: Inspect scene**

Confirm attractive environment, completed-project quality, recognisable frame/window/door language, believable scale, no forbidden objects, and crop resilience.

**Step 3: Persist and optimize**

Copy generated output to the PNG master. Use Sharp to create a 1280px-wide WebP at quality 84.

### Task 2: Generate Mission Campus Scene

**Files:**
- Reference: `public/images/products/K1001/left-diagonal.png`
- Reference: `public/images/products/cabin-metro-city-215x265/left-diagonal.png`
- Reference: `public/images/products/cabin-grp-215x270/left-diagonal.png`
- Create: `public/images/about/mission-community-campus-v2.png`
- Create: `public/images/about/mission-community-campus-v2.webp`

**Step 1: Generate scene with catalogue references**

Use built-in image generation in `photorealistic-natural` mode. Supply all three reference images and label them product-form references. Request a completed UK community and operations campus: beige-and-white modules as main facilities, dark-trim Metro City cabin and rounded white GRP cabin as coordinated support structures, planted pedestrian routes, bicycle stands, a few secondary visitors, bright soft overcast daylight, eye-level documentary architectural photograph, very wide crop. Prohibit construction state, text, signage, fake logos, cranes, machinery, fencing, mud, distorted geometry, and people obscuring products.

**Step 2: Inspect scene**

Confirm scene feels useful, welcoming, complete, physically plausible, and visually distinct from Vision.

**Step 3: Persist and optimize**

Copy generated output to the PNG master. Use Sharp to create a 1280px-wide WebP at quality 84.

### Task 3: Replace Card Media Test-First

**Files:**
- Modify: `tests/components/MissionVisionSection.spec.ts`
- Modify: `app/components/about/MissionVisionSection.vue`

**Step 1: Update test for new scene contract**

Assert exactly two images in Vision-then-Mission order. Assert PNG fallback paths, WebP `srcset` paths, descriptive alt text, `loading="lazy"`, `decoding="async"`, `object-cover`, and hover scaling.

**Step 2: Run focused test and verify RED**

Run: `npm test -- tests/components/MissionVisionSection.spec.ts`

Expected: FAIL because component still renders four abstract composite layers.

**Step 3: Implement scene images**

Vision media:

```vue
<img
  src="/images/about/vision-modular-campus-v2.png"
  srcset="/images/about/vision-modular-campus-v2.webp 1280w"
  sizes="(min-width: 768px) 50vw, 100vw"
  alt="Completed modular business campus in a landscaped setting"
  loading="lazy"
  decoding="async"
  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

Mission media:

```vue
<img
  src="/images/about/mission-community-campus-v2.png"
  srcset="/images/about/mission-community-campus-v2.webp 1280w"
  sizes="(min-width: 768px) 50vw, 100vw"
  alt="Completed modular community campus with coordinated support cabins"
  loading="lazy"
  decoding="async"
  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
/>
```

**Step 4: Run focused test and verify GREEN**

Run: `npm test -- tests/components/MissionVisionSection.spec.ts`

Expected: PASS.

### Task 4: Verify and Review

**Files:**
- Verify: `app/components/about/MissionVisionSection.vue`
- Verify: `tests/components/MissionVisionSection.spec.ts`
- Verify: `public/images/about/*-v2.{png,webp}`

**Step 1: Run full suite**

Run: `npm test`

Expected: all tests pass.

**Step 2: Build production output**

Run: `npm run build`

Expected: successful Nuxt build.

**Step 3: Inspect prerendered asset references**

Confirm `dist/about/index.html` contains both PNG fallback and WebP delivery paths.

**Step 4: Review files and payload**

Confirm WebP files stay reasonably sized, alt text describes scenes without claiming real client projects, and no first-pass asset is deleted.

**Step 5: Refresh graphs**

Run: `graphify update .`

Run: `code-review-graph update`

