# Vision and Mission Product Imagery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic Vision and Mission photos with truthful composites using exact catalogue product renders over restrained generated backgrounds.

**Architecture:** Generate background-only raster assets; never ask image generation to recreate products. Layer unchanged catalogue PNGs above those backgrounds inside `MissionVisionSection.vue`, keeping content and layout intact.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS, Vitest, Vue Test Utils, built-in image generation

---

### Task 1: Generate Background-Only Assets

**Files:**
- Create: `public/images/about/vision-product-backdrop.png`
- Create: `public/images/about/mission-product-backdrop.png`

**Step 1: Generate Vision background**

Use built-in image generation with this prompt:

```text
Use case: stylized-concept
Asset type: wide website card background
Primary request: create a restrained future-facing abstract architectural backdrop for a modular construction brand
Scene/backdrop: pale warm-grey ground plane, subtle perspective grid, soft blue-white horizon glow, minimal geometric planes
Composition/framing: very wide 2.6:1 composition; open central and lower space for a product cutout overlay
Lighting/mood: bright natural daylight, optimistic, precise, premium
Constraints: background only; no buildings, cabins, containers, people, vehicles, machinery, tools, text, logos, signs, or identifiable products
```

**Step 2: Inspect Vision output**

Confirm wide composition, clean product space, and zero claim-bearing subjects. Iterate only if a forbidden object appears.

**Step 3: Save Vision output**

Copy final output into `public/images/about/vision-product-backdrop.png`. Do not overwrite unrelated assets.

**Step 4: Generate Mission background**

Use built-in image generation with this prompt:

```text
Use case: stylized-concept
Asset type: wide website card background
Primary request: create a restrained engineering-system backdrop for a modular construction brand
Scene/backdrop: neutral light-grey ground plane, subtle modular grid, faint precise linework and layered rectangular rhythm
Composition/framing: very wide 2.6:1 composition; open central and lower space for a product cutout overlay
Lighting/mood: clean diffused daylight, dependable, practical, engineered
Constraints: background only; no buildings, cabins, containers, people, vehicles, machinery, tools, text, logos, signs, or identifiable products
```

**Step 5: Inspect Mission output**

Confirm wide composition, clean product space, and zero claim-bearing subjects. Iterate only if a forbidden object appears.

**Step 6: Save Mission output**

Copy final output into `public/images/about/mission-product-backdrop.png`. Do not overwrite unrelated assets.

**Step 7: Commit assets**

```bash
git add public/images/about/vision-product-backdrop.png public/images/about/mission-product-backdrop.png
git commit -m "feat(about): add product card backdrops"
```

### Task 2: Add Truthful Product Composites

**Files:**
- Create: `tests/components/MissionVisionSection.spec.ts`
- Modify: `app/components/about/MissionVisionSection.vue`

**Step 1: Write failing component test**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MissionVisionSection from '../../app/components/about/MissionVisionSection.vue'

describe('MissionVisionSection', () => {
  it('uses exact catalogue renders over decorative generated backdrops', () => {
    const wrapper = mount(MissionVisionSection)
    const images = wrapper.findAll('img')

    expect(images.map(image => image.attributes('src'))).toEqual([
      '/images/about/vision-product-backdrop.png',
      '/images/products/K7001/left-diagonal.png',
      '/images/about/mission-product-backdrop.png',
      '/images/products/K2004/left-diagonal.png',
    ])
    expect(images[0]?.attributes('alt')).toBe('')
    expect(images[1]?.attributes('alt')).toBe('Karmod K7001 modular building')
    expect(images[2]?.attributes('alt')).toBe('')
    expect(images[3]?.attributes('alt')).toBe('Karmod K2004 modular building')
  })
})
```

**Step 2: Run test to verify failure**

Run: `npm test -- tests/components/MissionVisionSection.spec.ts`

Expected: FAIL because existing component still references generic hero photos.

**Step 3: Implement Vision media stack**

Replace only Vision image container contents with:

```vue
<img
  src="/images/about/vision-product-backdrop.png"
  alt=""
  aria-hidden="true"
  class="absolute inset-0 h-full w-full object-cover"
>
<img
  src="/images/products/K7001/left-diagonal.png"
  alt="Karmod K7001 modular building"
  class="absolute inset-0 h-full w-full object-contain px-4 py-2 transition-transform duration-500 group-hover:scale-105"
>
```

**Step 4: Implement Mission media stack**

Replace only Mission image container contents with:

```vue
<img
  src="/images/about/mission-product-backdrop.png"
  alt=""
  aria-hidden="true"
  class="absolute inset-0 h-full w-full object-cover"
>
<img
  src="/images/products/K2004/left-diagonal.png"
  alt="Karmod K2004 modular building"
  class="absolute inset-0 h-full w-full object-contain px-4 py-2 transition-transform duration-500 group-hover:scale-105"
>
```

Preserve current order, copy, icon markup, card structure, and surrounding user changes.

**Step 5: Run focused test**

Run: `npm test -- tests/components/MissionVisionSection.spec.ts`

Expected: PASS.

**Step 6: Commit component and test**

```bash
git add app/components/about/MissionVisionSection.vue tests/components/MissionVisionSection.spec.ts
git commit -m "feat(about): show catalogue products in purpose cards"
```

### Task 3: Verify Integration

**Files:**
- Verify: `app/components/about/MissionVisionSection.vue`
- Verify: `public/images/about/vision-product-backdrop.png`
- Verify: `public/images/about/mission-product-backdrop.png`

**Step 1: Run focused test**

Run: `npm test -- tests/components/MissionVisionSection.spec.ts`

Expected: PASS.

**Step 2: Run full test suite**

Run: `npm test`

Expected: PASS.

**Step 3: Run production build**

Run: `npm run build`

Expected: successful Nuxt build.

**Step 4: Inspect rendered page**

Run: `npm run dev`

Inspect `/about` at narrow mobile and desktop widths. Confirm product silhouettes stay uncropped, card text remains unchanged, backgrounds contain no identifiable claims, and hover scales only product overlays.

**Step 5: Refresh knowledge graphs**

Run: `graphify update .`

Run: `code-review-graph update`

Expected: both graphs include component, test, and asset changes.

