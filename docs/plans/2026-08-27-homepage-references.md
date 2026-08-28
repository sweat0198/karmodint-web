# Homepage References Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Sanity-managed homepage references marquee and migrate eight existing reference logos, keeping two unverified brands as drafts.

**Architecture:** Standalone `clientReference` documents feed one draft-safe GROQ query. Sanity reserves `reference` as a built-in type name, so all document records use `clientReference`; asset reference values continue using Sanity's built-in `_type: 'reference'` shape. A data-owning section converts Sanity asset refs into presentation models, then a prop-driven marquee renders a duplicated, CSS-only track. A deterministic migration uploads local files and creates six published documents plus two drafts.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, Tailwind CSS 4, scoped CSS keyframes, Sanity 6, GROQ, `@sanity/client`, Vitest 4, Vue Test Utils.

---

## Before starting

- Read `docs/plans/2026-08-27-homepage-references-design.md`.
- Run `git status --short`. Worktree already contains unrelated edits. Preserve them.
- Pay special attention to currently modified shared files: `package.json`, `tests/sanity/queries.spec.ts`, and possibly `tests/sanity/schemas.spec.ts` by execution time. Append narrowly; never replace whole files.
- Keep `app/constants/references.ts`, `public/images/references/`, and `scratch/download_logos.mjs` after this implementation. Deletion waits for post-migration review.
- Use @superpowers:test-driven-development for Tasks 1–7.

### Task 1: Define and expose the Sanity reference document

**Files:**

- Create: `sanity/schemas/reference.ts`
- Modify: `sanity/schemas/index.ts`
- Modify: `sanity/structure.ts`
- Modify: `tests/sanity/schemas.spec.ts`

**Step 1: Write failing schema tests**

Import `clientReferenceType`, add `clientReference` to the registration expectation, then add:

```ts
describe('Reference Schema', () => {
  it('defines the agreed required and optional fields', () => {
    const fields = Object.fromEntries(clientReferenceType.fields.map((field: any) => [field.name, field]))

    expect(Object.keys(fields)).toEqual([
      'companyName',
      'location',
      'logo',
      'website',
      'displayOrder'
    ])
    expect(fields.companyName.type).toBe('string')
    expect(fields.location.type).toBe('string')
    expect(fields.logo.type).toBe('image')
    expect(fields.website.type).toBe('url')
    expect(fields.displayOrder.type).toBe('number')
    expect(fields.displayOrder.initialValue).toBeUndefined()
  })

  it('provides display-order and alphabetical Studio orderings', () => {
    expect(clientReferenceType.orderings?.map((ordering) => ordering.name)).toEqual([
      'displayOrderAsc',
      'companyNameAsc'
    ])
  })
})
```

**Step 2: Run the test and verify failure**

Run:

```bash
pnpm exec vitest run tests/sanity/schemas.spec.ts
```

Expected: FAIL because `sanity/schemas/reference.ts` and `clientReferenceType` do not exist.

**Step 3: Create the schema**

Create `sanity/schemas/reference.ts`:

```ts
import { defineField, defineType } from 'sanity'

export const clientReferenceType = defineType({
  name: 'clientReference',
  title: 'Reference',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'Optional project, city, or regional qualifier.'
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https'] })
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      description: 'Optional sort weight. Lower values appear first.'
    })
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'displayOrderAsc',
      by: [
        { field: 'displayOrder', direction: 'asc' },
        { field: 'companyName', direction: 'asc' }
      ]
    },
    {
      title: 'Company Name (A-Z)',
      name: 'companyNameAsc',
      by: [{ field: 'companyName', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'location',
      media: 'logo'
    }
  }
})

export default clientReferenceType
```

**Step 4: Register the schema**

In `sanity/schemas/index.ts`, import `clientReferenceType` and add it with document types:

```ts
import { clientReferenceType } from './reference'

export const schemaTypes = [
  productType,
  categoryType,
  customizationGroupType,
  quoteEnquiryType,
  clientReferenceType,
  // existing object types remain unchanged
]
```

**Step 5: Add the explicit Studio navigation item**

In `sanity/structure.ts`, insert this item between Categories and Customizations, with dividers matching surrounding structure:

```ts
S.listItem()
  .title('References')
  .child(
    S.documentTypeList('clientReference')
      .title('References')
      .defaultOrdering([
        { field: 'displayOrder', direction: 'asc' },
        { field: 'companyName', direction: 'asc' }
      ])
  )
```

**Step 6: Run focused verification**

Run:

```bash
pnpm exec vitest run tests/sanity/schemas.spec.ts
pnpm --dir sanity build
```

Expected: schema tests PASS; Studio build completes without unknown-type or structure errors.

**Step 7: Commit**

```bash
git add sanity/schemas/reference.ts sanity/schemas/index.ts sanity/structure.ts tests/sanity/schemas.spec.ts
git commit -m "feat(sanity): add reference documents"
```

### Task 2: Add the draft-safe references query and frontend types

**Files:**

- Create: `app/types/reference.ts`
- Create: `app/queries/references.ts`
- Modify: `tests/sanity/queries.spec.ts`

**Step 1: Write the failing GROQ test**

Import `REFERENCES_QUERY`, then append:

```ts
describe('homepage references query', () => {
  it('excludes drafts and puts unordered references last alphabetically', async () => {
    const dataset = [
      {
        _id: 'reference-zulu',
        _type: 'clientReference',
        companyName: 'Zulu Ltd',
        displayOrder: 20,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-zulu-100x50-png' } }
      },
      {
        _id: 'reference-beta',
        _type: 'clientReference',
        companyName: 'Beta Ltd',
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-beta-100x50-png' } }
      },
      {
        _id: 'reference-alpha',
        _type: 'clientReference',
        companyName: 'Alpha Ltd',
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-alpha-100x50-png' } }
      },
      {
        _id: 'drafts.reference-first',
        _type: 'clientReference',
        companyName: 'Draft Ltd',
        displayOrder: 10,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: 'image-draft-100x50-png' } }
      }
    ]

    const results = await executeGroq<any[]>(REFERENCES_QUERY, {}, dataset)

    expect(results.map((reference) => reference.companyName)).toEqual([
      'Zulu Ltd',
      'Alpha Ltd',
      'Beta Ltd'
    ])
    expect(results.some((reference) => reference._id.startsWith('drafts.'))).toBe(false)
    expect(results[0].logo.asset._ref).toBe('image-zulu-100x50-png')
  })
})
```

**Step 2: Run the test and verify failure**

```bash
pnpm exec vitest run tests/sanity/queries.spec.ts
```

Expected: FAIL because `REFERENCES_QUERY` does not exist.

**Step 3: Add types**

Create `app/types/reference.ts`:

```ts
export interface ReferenceLogo {
  _type?: 'image'
  asset?: {
    _type: 'reference'
    _ref: string
  }
}

export interface ClientReference {
  _id: string
  companyName: string
  location?: string
  logo: ReferenceLogo
  website?: string
  displayOrder?: number
}

export interface ReferenceTile {
  _id: string
  companyName: string
  location?: string
  logoUrl: string
  website?: string
}
```

**Step 4: Add the query**

Create `app/queries/references.ts`:

```ts
import type { ClientReference } from '~/types/reference'

export type { ClientReference }

export const REFERENCES_QUERY = `*[
  _type == "clientReference" && !(_id in path("drafts.**"))
] {
  _id,
  companyName,
  location,
  logo { asset },
  website,
  displayOrder,
  "_sortOrder": coalesce(displayOrder, 2147483647)
} | order(_sortOrder asc, companyName asc) {
  _id,
  companyName,
  location,
  logo,
  website,
  displayOrder
}`
```

**Step 5: Run the query test**

```bash
pnpm exec vitest run tests/sanity/queries.spec.ts
```

Expected: PASS. If `groq-js` rejects the pipeline expression, keep the test fixed and adjust only query syntax until explicit-order-first behavior passes.

**Step 6: Commit**

```bash
git add app/types/reference.ts app/queries/references.ts tests/sanity/queries.spec.ts
git commit -m "feat: query homepage references"
```

### Task 3: Convert Sanity records into renderable tiles

**Files:**

- Create: `app/utils/referenceTiles.ts`
- Create: `tests/utils/referenceTiles.spec.ts`

**Step 1: Write failing mapper tests**

```ts
import { describe, expect, it } from 'vitest'
import { toReferenceTiles } from '~/utils/referenceTiles'
import type { ClientReference } from '~/types/reference'

const base: ClientReference = {
  _id: 'reference-w-hotel',
  companyName: 'W Hotel Edinburgh',
  location: 'Edinburgh, Scotland',
  website: 'https://example.com',
  logo: {
    _type: 'image',
    asset: { _type: 'reference', _ref: 'image-logo123-800x400-png' }
  }
}

describe('toReferenceTiles', () => {
  it('resolves a constrained Sanity CDN logo while preserving display content', () => {
    expect(toReferenceTiles([base], 'project1', 'production')).toEqual([
      {
        _id: base._id,
        companyName: base.companyName,
        location: base.location,
        website: base.website,
        logoUrl: 'https://cdn.sanity.io/images/project1/production/logo123-800x400.png?w=320&fit=max'
      }
    ])
  })

  it('drops records whose logo asset cannot resolve', () => {
    expect(
      toReferenceTiles([{ ...base, logo: { asset: { _type: 'reference', _ref: 'invalid' } } }], 'p', 'd')
    ).toEqual([])
  })
})
```

**Step 2: Run test and verify failure**

```bash
pnpm exec vitest run tests/utils/referenceTiles.spec.ts
```

Expected: FAIL because mapper does not exist.

**Step 3: Implement mapper**

Create `app/utils/referenceTiles.ts`:

```ts
import type { ClientReference, ReferenceTile } from '~/types/reference'
import { sanityImageUrl } from '~/utils/sanityImageUrl'

export function toReferenceTiles(
  references: ClientReference[] | undefined,
  projectId: string,
  dataset: string
): ReferenceTile[] {
  return (references ?? []).flatMap((reference) => {
    const logoUrl = sanityImageUrl(reference.logo.asset?._ref, projectId, dataset, {
      width: 320,
      fit: 'max'
    })

    if (!logoUrl) return []

    return [{
      _id: reference._id,
      companyName: reference.companyName,
      location: reference.location,
      logoUrl,
      website: reference.website
    }]
  })
}
```

**Step 4: Run test and verify pass**

```bash
pnpm exec vitest run tests/utils/referenceTiles.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add app/utils/referenceTiles.ts tests/utils/referenceTiles.spec.ts
git commit -m "feat: map reference logos for display"
```

### Task 4: Build the accessible CSS marquee

**Files:**

- Create: `app/components/ReferencesMarquee.vue`
- Create: `tests/components/ReferencesMarquee.spec.ts`

**Required skill:** Use @animate. Gate result: marketing content, purpose `delight`; CSS animation, `transform`, linear 40-second loop. Reduced-motion and interaction pausing ship in this task.

**Step 1: Write failing component tests**

Use a jsdom test with two tiles: one linked with location, one unlinked without location. Assert:

```ts
// @vitest-environment jsdom

import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ReferencesMarquee from '~/components/ReferencesMarquee.vue'
import type { ReferenceTile } from '~/types/reference'

const tiles: ReferenceTile[] = [
  {
    _id: 'one',
    companyName: 'Linked Company',
    location: 'London',
    logoUrl: '/one.svg',
    website: 'https://example.com'
  },
  {
    _id: 'two',
    companyName: 'Static Company',
    logoUrl: '/two.svg'
  }
]

describe('ReferencesMarquee', () => {
  it('hides the whole section when empty', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: [] } })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders one accessible group and one hidden duplicate', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })

    expect(wrapper.get('h2').text()).toBe('Trusted by organisations worldwide')
    expect(wrapper.findAll('[data-reference-copy="original"] [data-reference-tile]')).toHaveLength(2)
    expect(wrapper.findAll('[data-reference-copy="duplicate"] [data-reference-tile]')).toHaveLength(2)
    expect(wrapper.get('[data-reference-copy="duplicate"]').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('[data-reference-copy="duplicate"] a').attributes('tabindex')).toBe('-1')
  })

  it('opens websites safely and leaves missing websites non-interactive', () => {
    const wrapper = mount(ReferencesMarquee, { props: { references: tiles } })
    const original = wrapper.get('[data-reference-copy="original"]')
    const link = original.get('a')

    expect(link.attributes()).toMatchObject({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer'
    })
    expect(original.findAll('a')).toHaveLength(1)
    expect(original.text()).toContain('London')
  })

  it('keeps required motion safety contracts in scoped CSS', () => {
    const source = fs.readFileSync(
      fileURLToPath(new URL('../../app/components/ReferencesMarquee.vue', import.meta.url)),
      'utf-8'
    )

    expect(source).toContain('@media (prefers-reduced-motion: reduce)')
    expect(source).toContain('animation-play-state: paused')
    expect(source).toContain('40s linear infinite')
  })
})
```

**Step 2: Run test and verify failure**

```bash
pnpm exec vitest run tests/components/ReferencesMarquee.spec.ts
```

Expected: FAIL because component does not exist.

**Step 3: Implement markup with Tailwind utilities**

Create a prop-driven component. Required structure:

```vue
<template>
  <section
    v-if="references.length"
    aria-labelledby="references-heading"
    class="w-full overflow-hidden bg-white py-12 lg:py-16"
  >
    <div class="mx-auto flex w-full max-w-[1184px] flex-col gap-8 px-6 lg:px-12">
      <h2
        id="references-heading"
        class="text-center text-2xl font-semibold tracking-[-0.24px] text-brand-navy-heading"
      >
        Trusted by organisations worldwide
      </h2>

      <div class="references-marquee references-mask overflow-hidden">
        <div class="references-track flex w-max">
          <div
            v-for="copy in ['original', 'duplicate'] as const"
            :key="copy"
            class="references-group flex shrink-0 gap-4 pr-4"
            :class="{ 'references-copy': copy === 'duplicate' }"
            :data-reference-copy="copy"
            :aria-hidden="copy === 'duplicate' ? 'true' : undefined"
          >
            <component
              :is="reference.website ? 'a' : 'div'"
              v-for="reference in references"
              :key="`${copy}-${reference._id}`"
              data-reference-tile
              :href="reference.website"
              :target="reference.website ? '_blank' : undefined"
              :rel="reference.website ? 'noopener noreferrer' : undefined"
              :tabindex="copy === 'duplicate' && reference.website ? -1 : undefined"
              class="flex w-60 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-5 text-center shadow-sm transition-colors duration-150 md:w-72"
              :class="reference.website ? 'hover:border-brand-rose-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red' : ''"
            >
              <div class="flex h-24 w-full items-center justify-center">
                <img
                  :src="reference.logoUrl"
                  alt=""
                  class="max-h-20 w-full object-contain"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <p class="mt-4 text-sm font-semibold text-brand-navy-heading">
                {{ reference.companyName }}
              </p>
              <p v-if="reference.location" class="mt-1 text-xs text-brand-slate-muted">
                {{ reference.location }}
              </p>
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ReferenceTile } from '~/types/reference'

defineProps<{ references: ReferenceTile[] }>()
</script>
```

Feel-check tile width against the longest company name. Keep fixed widths unless wrapping causes an obviously uneven row.

**Step 4: Add minimal scoped CSS**

```vue
<style scoped>
.references-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
  mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
}

.references-track {
  animation: references-marquee 40s linear infinite;
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .references-marquee:hover .references-track {
    animation-play-state: paused;
  }
}

.references-marquee:focus-within .references-track,
.references-marquee:active .references-track {
  animation-play-state: paused;
}

@keyframes references-marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .references-mask {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .references-track {
    width: 100%;
    animation: none;
    transform: none;
  }

  .references-group {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    padding-right: 0;
  }

  .references-copy {
    display: none;
  }
}
</style>
```

The `pr-4` belongs to each identical group. That makes each group exactly half the track, allowing `translateX(-50%)` to loop without a jump.

**Step 5: Run test and inspect in browser**

```bash
pnpm exec vitest run tests/components/ReferencesMarquee.spec.ts
pnpm dev
```

Expected: test PASS. In browser, verify no seam at loop boundary, pause on hover/focus/press, no horizontal page scrollbar, and static wrapping layout under DevTools reduced-motion emulation.

**Step 6: Commit**

```bash
git add app/components/ReferencesMarquee.vue tests/components/ReferencesMarquee.spec.ts
git commit -m "feat: add references marquee"
```

### Task 5: Fetch references and place the section below the hero

**Files:**

- Create: `app/components/ReferencesSection.vue`
- Modify: `app/pages/index.vue`
- Create: `tests/pages/homeReferences.spec.ts`

**Step 1: Write the failing placement contract**

Create `tests/pages/homeReferences.spec.ts`:

```ts
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('homepage references placement', () => {
  it('places references between hero and catalogue', () => {
    const source = fs.readFileSync(
      fileURLToPath(new URL('../../app/pages/index.vue', import.meta.url)),
      'utf-8'
    )

    const hero = source.indexOf('<HeroSection')
    const references = source.indexOf('<ReferencesSection')
    const catalogue = source.indexOf('<ProductCatalogSection')

    expect(hero).toBeGreaterThan(-1)
    expect(references).toBeGreaterThan(hero)
    expect(catalogue).toBeGreaterThan(references)
  })
})
```

**Step 2: Run test and verify failure**

```bash
pnpm exec vitest run tests/pages/homeReferences.spec.ts
```

Expected: FAIL because homepage has no `ReferencesSection`.

**Step 3: Create the data-owning section**

Create `app/components/ReferencesSection.vue`:

```vue
<template>
  <ReferencesMarquee :references="tiles" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig, useSanityQuery } from '#imports'
import { REFERENCES_QUERY, type ClientReference } from '~/queries/references'
import { toReferenceTiles } from '~/utils/referenceTiles'

const config = useRuntimeConfig()
const { data: references } = await useSanityQuery<ClientReference[]>(REFERENCES_QUERY)

const tiles = computed(() =>
  toReferenceTiles(
    references.value,
    config.public.sanityProjectId,
    config.public.sanityDataset
  )
)
</script>
```

`ReferencesMarquee` already suppresses empty content, covering empty queries and invalid asset refs without a customer-facing error state.

**Step 4: Insert below hero**

Update `app/pages/index.vue`:

```vue
<HeroSection />
<ReferencesSection />
<ProductCatalogSection />
<ContactSection />
```

Preserve existing SEO setup unchanged.

**Step 5: Run focused test and production build**

```bash
pnpm exec vitest run tests/pages/homeReferences.spec.ts tests/components/ReferencesMarquee.spec.ts tests/utils/referenceTiles.spec.ts tests/sanity/queries.spec.ts
pnpm build
```

Expected: tests PASS; Nuxt build resolves `#imports`, prerenders `/`, and emits no hydration warnings.

**Step 6: Commit**

```bash
git add app/components/ReferencesSection.vue app/pages/index.vue tests/pages/homeReferences.spec.ts
git commit -m "feat: add references to homepage"
```

### Task 6: Model the deterministic initial migration

**Files:**

- Create: `scripts/references/data.ts`
- Create: `scripts/references/buildDocuments.ts`
- Create: `tests/references/buildDocuments.spec.ts`

**Step 1: Write failing migration-model tests**

Test these invariants:

```ts
import { describe, expect, it } from 'vitest'
import { REFERENCE_SEEDS } from '../../scripts/references/data'
import { buildReferenceDocuments } from '../../scripts/references/buildDocuments'

describe('reference migration documents', () => {
  const assetIds = Object.fromEntries(
    REFERENCE_SEEDS.map((seed) => [seed.logoPath, `image-${seed.id}-100x50-png`])
  )
  const documents = buildReferenceDocuments(REFERENCE_SEEDS, assetIds)

  it('builds eight deterministic documents in supplied display order', () => {
    expect(documents).toHaveLength(8)
    expect(documents.map((document) => document.displayOrder)).toEqual([
      10, 20, 30, 40, 50, 60, 70, 80
    ])
    expect(new Set(documents.map((document) => document._id)).size).toBe(8)
  })

  it('keeps West Haddon and Luton as drafts only', () => {
    expect(documents.filter((document) => document._id.startsWith('drafts.')).map((document) => document.companyName)).toEqual([
      'West Haddon Council',
      'Luton Sea Cadet'
    ])
  })

  it('omits websites until authoritative URLs are supplied', () => {
    expect(documents.every((document) => document.website === undefined)).toBe(true)
  })

  it('fails when an uploaded asset reference is missing', () => {
    expect(() => buildReferenceDocuments(REFERENCE_SEEDS, {})).toThrow('Missing uploaded logo')
  })
})
```

**Step 2: Run test and verify failure**

```bash
pnpm exec vitest run tests/references/buildDocuments.spec.ts
```

Expected: FAIL because migration modules do not exist.

**Step 3: Add seed data**

Create `scripts/references/data.ts` with this exact source order:

```ts
export interface ReferenceSeed {
  id: string
  companyName: string
  location?: string
  logoPath: string
  website?: string
  displayOrder: number
  published: boolean
}

export const REFERENCE_SEEDS: ReferenceSeed[] = [
  { id: 'reference-w-hotel-edinburgh', companyName: 'W Hotel Edinburgh', location: 'Edinburgh, Scotland', logoPath: 'public/images/references/w-hotel.svg', displayOrder: 10, published: true },
  { id: 'reference-west-haddon-council', companyName: 'West Haddon Council', location: 'Cricket Ground, Northampton', logoPath: 'public/images/references/west-haddon-council.svg', displayOrder: 20, published: false },
  { id: 'reference-canary-wharf-management', companyName: 'Canary Wharf Management', location: 'London', logoPath: 'public/images/references/canary-wharf.svg', displayOrder: 30, published: true },
  { id: 'reference-leicestershire-ccc', companyName: 'Leicestershire County Cricket Club', location: 'Leicester', logoPath: 'public/images/references/leicestershire-ccc.svg', displayOrder: 40, published: true },
  { id: 'reference-bournemouth-airport', companyName: 'Bournemouth Airport', location: 'Bournemouth', logoPath: 'public/images/references/bournemouth-airport.svg', displayOrder: 50, published: true },
  { id: 'reference-osi-contracts', companyName: 'OSI Contracts', location: 'Havana, Cuba', logoPath: 'public/images/references/osi-contracts.png', displayOrder: 60, published: true },
  { id: 'reference-birmingham-wholesale-market', companyName: 'Birmingham Wholesale Market', location: 'Birmingham', logoPath: 'public/images/references/birmingham-wholesale-market.png', displayOrder: 70, published: true },
  { id: 'reference-luton-sea-cadet', companyName: 'Luton Sea Cadet', location: 'Luton', logoPath: 'public/images/references/luton-sea-cadet.png', displayOrder: 80, published: false }
]
```

**Step 4: Add pure document builder**

`buildReferenceDocuments` must:

- use the base ID for published documents
- prefix draft-only IDs with `drafts.`
- attach document `_type: 'clientReference'`
- attach `logo: { _type: 'image', asset: { _type: 'reference', _ref } }`
- copy optional fields only when defined
- throw a path-specific error before returning any documents if an asset ID is missing

Define and export a `ReferenceDocument` interface so the import script stays strictly typed.

**Step 5: Run test and verify pass**

```bash
pnpm exec vitest run tests/references/buildDocuments.spec.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add scripts/references/data.ts scripts/references/buildDocuments.ts tests/references/buildDocuments.spec.ts
git commit -m "feat: model reference migration"
```

### Task 7: Add dry-run, upload, import, and verification commands

**Files:**

- Create: `scripts/references/import-references.ts`
- Create: `scripts/references/verify-references.ts`
- Create: `tsconfig.references.json`
- Modify: `package.json`

**Step 1: Add package commands narrowly**

Append without disturbing existing user edits:

```json
"references:import": "jiti scripts/references/import-references.ts",
"references:verify": "jiti scripts/references/verify-references.ts",
"typecheck:references": "tsc -p tsconfig.references.json"
```

**Step 2: Add references typecheck config**

Create `tsconfig.references.json` mirroring `tsconfig.catalogue.json`, with this include set:

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "types": ["node"],
    "resolveJsonModule": true,
    "esModuleInterop": true
  },
  "include": [
    "scripts/references/**/*.ts",
    "scripts/catalogue/lib/paths.ts",
    "scripts/catalogue/lib/sanityEnv.ts"
  ]
}
```

**Step 3: Implement dry-run and import**

`scripts/references/import-references.ts` should reuse:

```ts
import { repoPath } from '../catalogue/lib/paths'
import { createSanityClient, readDataset, readSanityTarget } from '../catalogue/lib/sanityEnv'
```

Behavior:

1. Validate every `logoPath` exists before any network request.
2. With `--dry-run`, read only `SANITY_DATASET`, print target dataset, eight base IDs, six published/two draft counts, and exit without upload/import.
3. Without `--dry-run`, resolve the exact Sanity target and print it before writing.
4. Upload each image with `client.assets.upload('image', fs.createReadStream(repoPath(seed.logoPath)), { filename: path.basename(seed.logoPath) })`.
5. Build documents from returned asset IDs.
6. Add all documents to one `client.transaction().createOrReplace(...)` transaction and commit once.
7. Print created IDs, clearly labeling draft IDs.
8. Wrap `main()` with the same concise catch/`process.exitCode = 1` behavior as `scripts/catalogue/lib/runScript.ts`.

Do not delete old documents or files. Do not publish the two draft IDs. Do not invent website values.

**Step 4: Implement authenticated verification**

`scripts/references/verify-references.ts` should use the write-token client with raw perspective:

```ts
const documents = await client.fetch<Array<{
  _id: string
  companyName: string
  logo?: { asset?: { _ref?: string } }
}>>(
  `*[_type == "clientReference"] { _id, companyName, logo { asset } }`,
  {},
  { perspective: 'raw' }
)
```

Fail unless:

- all eight deterministic IDs exist
- exactly six IDs are published IDs
- exactly these draft IDs exist: `drafts.reference-west-haddon-council`, `drafts.reference-luton-sea-cadet`
- every document has `logo.asset._ref`

Print one concise success line with dataset and counts.

**Step 5: Typecheck and dry-run**

```bash
pnpm typecheck:references
pnpm references:import --dry-run
```

Expected: typecheck PASS; dry run reports eight documents, six published, two drafts, and performs no network write. Confirm printed target dataset before continuing.

**Step 6: Commit migration tooling before external writes**

```bash
git add package.json scripts/references/import-references.ts scripts/references/verify-references.ts tsconfig.references.json
git commit -m "feat: add reference migration commands"
```

### Task 8: Execute and verify the Sanity migration

**Files:** No source-file changes expected. Sanity dataset changes.

**Step 1: Confirm target and credentials**

Run:

```bash
pnpm references:import --dry-run
```

Expected: intended `SANITY_DATASET`; eight documents; six published; two drafts. Stop if dataset is unexpected.

**Step 2: Run the authorized migration**

```bash
pnpm references:import
```

Expected: eight asset upload/dedupe lines, then one successful document transaction. No local reference files removed.

**Step 3: Verify remote state**

```bash
pnpm references:verify
```

Expected: PASS with eight total, six published, two drafts, eight logo refs.

**Step 4: Inspect Studio manually**

Open References in Sanity Studio. Confirm:

- W Hotel, Canary Wharf, Leicestershire CCC, Bournemouth Airport, OSI Contracts, and Birmingham Wholesale Market are published.
- West Haddon Council and Luton Sea Cadet appear only as drafts.
- Logos use contain-style frontend rendering; Studio preview image cropping does not alter source assets.

No commit follows: this task changes external content only.

### Task 9: Final verification and graph refresh

**Files:** Only targeted fixes if verification exposes defects.

**Required skills:** Use @superpowers:verification-before-completion, then @superpowers:requesting-code-review.

**Step 1: Run focused tests**

```bash
pnpm exec vitest run tests/sanity/schemas.spec.ts tests/sanity/queries.spec.ts tests/utils/referenceTiles.spec.ts tests/components/ReferencesMarquee.spec.ts tests/pages/homeReferences.spec.ts tests/references/buildDocuments.spec.ts
```

Expected: PASS.

**Step 2: Run all automated checks**

```bash
pnpm test
pnpm typecheck:references
pnpm build
pnpm --dir sanity build
```

Expected: all commands exit 0. If pre-existing unrelated failures remain, record exact command/output and prove focused references checks still pass.

**Step 3: Browser feel-check**

Verify desktop and a physical or emulated mobile viewport:

- section sits immediately below hero
- six published tiles appear after migration
- 40-second movement feels calm
- loop seam is invisible
- edge fade works without clipping focus rings
- hover, keyboard focus, and press pause movement
- linked tiles open new tab; unlinked tiles do nothing
- names and locations wrap acceptably
- page has no horizontal overflow
- reduced-motion emulation produces one static wrapping set

Adjust duration only if feel-check proves 40 seconds wrong. Keep animation linear and transform-only.

**Step 4: Refresh required project graphs**

```bash
graphify update .
code-review-graph update
```

Expected: both graph indexes update successfully.

**Step 5: Review final diff and commit verification fixes only**

```bash
git status --short
git diff --check
```

Do not stage unrelated dirty files. If verification required a targeted fix:

```bash
git add <only-reference-feature-files>
git commit -m "fix: harden homepage references"
```

## Completion criteria

- Editors can create standalone references in Studio with required company name/logo and optional location/website/order.
- Homepage shows only published references directly under hero.
- Ordered records lead; unordered records follow alphabetically.
- Marquee uses CSS transform animation, pauses during interaction, and becomes static for reduced motion.
- Duplicate visual content cannot be reached by keyboard or announced by assistive technology.
- Six verified references are published; West Haddon and Luton remain drafts.
- Existing constants, local assets, and download script remain untouched.
- Focused tests, full suite, Nuxt build, Studio build, remote verification, and graph refresh pass.
