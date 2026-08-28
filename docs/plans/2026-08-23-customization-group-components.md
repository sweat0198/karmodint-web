# Implementation Plan: Customization Group Components

**Feature**: Replace the legacy hardcoded four-step configurator with components driven by the Sanity `customizationGroup` model — one component per `selectionType`, fed by a clearly-marked demo fixture until Sanity fetching is wired.
**Date**: 2026-08-23
**Status**: Ready for execution

---

## Why

The UI and the content model disagree. Sanity models a **Customization Group** as `selectionType` (`single` / `multiple` / `boolean`) with items carrying `pricingType` (`fixed` / `included` / `poa`) and `requiresTextInput`. The UI models a **step** with `type` (`card` / `grid` / `counter-checkbox` / `list`), hardcoded in `app/utils/modularConfigPresets.ts` and rendered by a `v-if` chain inside `ProductCustomizer.vue`. Nothing bridges the two, and no real groups exist yet in any dataset.

This plan builds the UI against the real content model, so wiring Sanity later is a data swap and not a rewrite.

---

## Decisions

Settled through four rounds of design questions. Recorded so nothing is re-litigated mid-build.

| # | Decision | Rationale |
|---|---|---|
| D1 | `selectionType` alone selects the component. Three components. | No presentation field in Sanity — editors must not own layout. |
| D2 | `SingleChoiceGroup` branches on data: items with pictures → tile grid; items without → rows. | Still one component per mode. A colour swatch needs a tile; a text-only option in a grid wastes space. |
| D3 | Build components only. Sanity fetching is a separate task; a fixture in exact Sanity shape feeds the UI now. | Later fetch wiring becomes a data-source swap. |
| D4 | Components consume `SanityCustomizationGroup` directly. No view-model, no mapper. | Types already exist and are accurate in `app/types/catalog.ts`. |
| D5 | No counter / quantity groups. Legacy `counter-checkbox` is dropped, no schema change. | Reopen only when a real group needs it. |
| D6 | No size selector. Each Size Option is presented as its own product; one quote item = one product + size. | The preview image is therefore fixed and does not change on selection. |
| D7 | `ProductCustomizer.vue` survives as the two-column shell. Its step chain is replaced. | Viewer, zoom controls, spec badges and scroll panel are the existing visual language. |
| D8 | `boolean` groups are constrained **in the Sanity schema**: exactly one item, and never mandatory. | Otherwise `boolean` and `multiple` are indistinguishable and editors pick at random. |
| D9 | Selections are flat and serialisable. Notes live in a parallel map. | Survives the persisted quote store. `selectionType` is always at hand to interpret a value. |
| D10 | Pricing moves into `useCustomizationPricing`, carrying over the working math from `ItemCustomizer.vue`. | The total is needed in three places: accordion row, price bar, quote payload. |
| D11 | POA is additive: `£3,240 + POA`. But when the **Size Option itself** is POA, the whole line is plain `POA` and extras are not totalled. | `POA + £300` invites reading £300 as the price. Matches the GLOSSARY rule that a POA size price is a placeholder. |
| D12 | Mandatory groups pre-select nothing, show a Required badge, and block "Review & Request Quote". Non-mandatory `single` groups get an explicit "None / Not required" row. | Auto-selecting silently commits the customer to a price. Without a None row an optional single group is a one-way door. |
| D13 | `requiresTextInput` is implemented now. | The whole path is already modelled end to end down to `SanitySelectedCustomization.customNotes`. |
| D14 | The quote store persists `selectedCustomizations` at selection time. | Same pattern as the existing `specSummary` / `customTotal`. `/quote` and the server need no group data. |
| D15 | Spec summary badges are derived generically: `{ label: group.title, value: selectedTitles.join(" + ") }`, capped at 4. | No new content field; the collapsed accordion row stays informative. |
| D16 | Products with zero groups show "Standard specification — no options for this unit". The row still expands. | Hiding the button makes a working unit look broken. |
| D17 | The demo fixture is announced in the UI by an amber strip, visible in **every** build until the fixture is deleted. | `/customize` is reachable. Fake prices reaching a customer is the failure that matters, and the banner is what forces cleanup. |
| D18 | The image seam is a **component**, `CustomizationImage.vue`, never named `SanityImage`. | `@nuxtjs/sanity` v2.5 is already installed and ships its own `<SanityImage>`; that component is the eventual real implementation, so the seam should be one too. |
| D19 | Tests: node-env tests for the pricing composable, extended schema tests for the new `boolean` rules, and one jsdom test proving the dispatcher routes all three modes. | Money and content-correctness get real tests. `@vue/test-utils` and `jsdom` are already dependencies. |

---

## Data contracts

**Selections** — `app/types/customization.ts`

```ts
/** Sanity group `_id` -> the customer's selection. Shape follows the group's selectionType. */
export type CustomizationSelections = Record<string, string | null | string[] | boolean>
//  single   -> item `_key`, or null for "None / Not required"
//  multiple -> array of item `_key`s
//  boolean  -> on/off for the group's single item

/** "<groupId>:<itemKey>" -> the customer's free text for a requiresTextInput item. */
export type CustomizationNotes = Record<string, string>
```

`SpecSummaryItem` stays in this file — the quote store and `/quote` both import it. Everything else in the file is deleted.

**Pricing result** — `useCustomizationPricing(groups, selections, notes, size)`

```ts
{
  subtotal: number                          // size price + every `fixed` item; excludes POA
  sizeIsPoa: boolean
  poaItems: SanitySelectedCustomization[]
  hasPoa: boolean                           // sizeIsPoa || poaItems.length > 0
  priceLabel: string                        // "POA" | "£3,240" | "£3,240 + POA"
  lines: SanitySelectedCustomization[]      // exactly the quote payload shape
  unsatisfiedMandatory: SanityCustomizationGroup[]
}
```

`priceLabel` is built in the composable so the three POA display cases have one home.

**Mandatory satisfaction**

- `single` — selection is not `null`
- `multiple` — at least one `_key`
- `boolean` — not applicable; D8 forbids mandatory toggles in the schema

---

## File layout

```
app/components/customization/
  ProductCustomizer.vue        MODIFY  shell kept; step chain -> <CustomizationGroups>
  CustomizationGroups.vue      NEW     dispatcher; sorts by displayOrder; v-model whole record
  CustomizationImage.vue       NEW     image seam (D18)
  CustomizationNote.vue        NEW     textarea for requiresTextInput
  groups/
    SingleChoiceGroup.vue      NEW     grid or rows (D2); "None" row when optional
    MultipleChoiceGroup.vue    NEW
    BooleanToggleGroup.vue     NEW     one item, enforced by schema
  ItemCustomizer.vue           DELETE
app/composables/
  useCustomizationPricing.ts   NEW
app/utils/
  customizationFixtures.ts     NEW     groups + FIXTURE_ASSET_URLS
  modularConfigPresets.ts      DELETE
app/types/customization.ts     MODIFY  reduced to SpecSummaryItem + the two selection types
```

`~/components/customization` is registered with `pathPrefix: false` in `nuxt.config.ts`, so `groups/SingleChoiceGroup.vue` still auto-imports as `<SingleChoiceGroup>`.

---

## Tasks

### Task 1: Schema constraints for `boolean` groups

- **Files**:
  - `sanity/schemas/customizationGroup.ts` (MODIFY)
  - `tests/sanity/schemas.spec.ts` (MODIFY)
- **Goal**: Make a meaningless toggle group structurally impossible (D8).
- **Steps**:
  1. RED: extend `tests/sanity/schemas.spec.ts` — a `boolean` group with 2 items fails; a mandatory `boolean` group fails; a `boolean` group with 1 non-mandatory item passes; `single` / `multiple` groups are unaffected.
  2. Verify failure: `pnpm test tests/sanity/schemas.spec.ts`
  3. GREEN: add a document-level `Rule.custom` exporting a named `validateBooleanGroup(group)` helper, mirroring how `validateExactlyOneDefaultSize` is written and tested in `sanity/schemas/product.ts`.
  4. Update the `selectionType` option label to say the toggle takes exactly one option.
  5. Verify pass: `pnpm test tests/sanity/schemas.spec.ts`

---

### Task 2: Types

- **Files**:
  - `app/types/customization.ts` (MODIFY)
- **Goal**: Retire the legacy step model, land the selection contracts.
- **Steps**:
  1. Delete `OptionItem`, `CounterOption`, `CheckboxOption`, `CustomizationStep`, `ConfiguratorStep`.
  2. Keep `SpecSummaryItem`. Add `CustomizationSelections` and `CustomizationNotes` as specified above.
  3. Expect type errors across `ProductCustomizer.vue`, `ItemCustomizer.vue`, `modularConfigPresets.ts` and `pages/customize/index.vue` — all four are handled in later tasks. `pnpm typecheck` is not expected to pass until Task 7.

---

### Task 3: Pricing composable

- **Files**:
  - `app/composables/useCustomizationPricing.ts` (NEW)
  - `tests/utils/customizationPricing.test.ts` (NEW)
- **Goal**: One source of truth for the total, POA state, quote lines, spec badges and mandatory satisfaction (D10, D11, D12, D15).
- **Steps**:
  1. RED: write `tests/utils/customizationPricing.test.ts` (node env) covering:
     - `fixed` items sum onto the size price; `included` items add £0.
     - a `poa` item leaves `subtotal` untouched, sets `hasPoa`, and yields `"£3,240 + POA"`.
     - a POA **size** yields plain `"POA"` and does not total the extras (D11).
     - `multiple` sums every selected item; `boolean` adds its item only when `true`; `single` with `null` adds nothing.
     - `unsatisfiedMandatory` lists a mandatory group with no selection and drops it once selected.
     - `lines` carry `groupTitle`, `optionTitle`, `price`, `isPoa` and `customNotes` from the notes map.
     - `buildSpecSummary` caps at 4 badges and joins multi-selects with `" + "`.
  2. Verify failure: `pnpm test tests/utils/customizationPricing.test.ts`
  3. GREEN: implement the composable plus an exported `buildSpecSummary(groups, selections)`. Carry over the arithmetic from `ItemCustomizer.vue:60-91`, dropping the counter branch (D5).
  4. Verify pass: `pnpm test tests/utils/customizationPricing.test.ts`

---

### Task 4: Demo fixture and image seam

- **Files**:
  - `app/utils/customizationFixtures.ts` (NEW)
  - `app/components/customization/CustomizationImage.vue` (NEW)
- **Goal**: Real Sanity-shaped data on screen, and one place that later becomes `<SanityImage>` (D3, D18).
- **Steps**:
  1. Write `customizationFixtures.ts` exporting `DEMO_CUSTOMIZATION_GROUPS: SanityCustomizationGroup[]`. Coverage must include: one `single` group **with** pictures (exterior finish), one `single` group **without** pictures (electrical package), one `multiple` group, one `boolean` group, at least one `included` item, one `poa` item, and one `requiresTextInput` item with a placeholder. Vary `displayOrder` so dispatcher sorting is visible.
  2. Export `FIXTURE_ASSET_URLS: Record<string, string>` mapping fake asset refs (`image-fixture-ral9002-png`) to paths under `public/images/`.
  3. Header comment naming the removal condition: delete this file once `/customize` fetches groups from Sanity.
  4. Write `CustomizationImage.vue` taking `image?: SanityImage` and `alt: string`, resolving through `FIXTURE_ASSET_URLS[image.asset._ref]`, rendering a neutral placeholder box when unresolved. Deleting the fixture then breaks this import on purpose — that is the cleanup reminder.

---

### Task 5: Group components

- **Files**:
  - `app/components/customization/groups/SingleChoiceGroup.vue` (NEW)
  - `app/components/customization/groups/MultipleChoiceGroup.vue` (NEW)
  - `app/components/customization/groups/BooleanToggleGroup.vue` (NEW)
  - `app/components/customization/CustomizationNote.vue` (NEW)
- **Goal**: One component per `selectionType` (D1, D2, D12, D13).
- **Steps**:
  1. `CustomizationNote.vue`: labelled textarea, `v-model` string, placeholder from `textInputPlaceholder`, shown only under a selected item that sets `requiresTextInput`.
  2. `SingleChoiceGroup.vue`: props `group`, `modelValue: string | null`. Grid of tiles when every item has a picture; rows otherwise. Renders a leading "None / Not required" row when `!group.isMandatory`. Price badge reads `Included` for `included`, `POA` for `poa`, `+£X` for `fixed`.
  3. `MultipleChoiceGroup.vue`: props `group`, `modelValue: string[]`. Checkbox rows, same price badge rules.
  4. `BooleanToggleGroup.vue`: props `group`, `modelValue: boolean`. Single switch row using `group.title` as the label and `items[0].title` as the sub-label.
  5. All three reuse the existing brand classes from the current `ProductCustomizer` markup — `border-brand-red`, `brand-rose-border`, `brand-slate-muted` — so nothing shifts visually beyond the new structures.
  6. Follow `.agents/skills/emil-design-eng` for interaction polish and `animate` for any transition, per `AGENTS.md`.

---

### Task 6: Dispatcher

- **Files**:
  - `app/components/customization/CustomizationGroups.vue` (NEW)
  - `tests/components/customizationGroups.spec.ts` (NEW)
- **Goal**: Map groups to components and own the aggregate `v-model` (D1, D9, D16).
- **Steps**:
  1. RED: write `tests/components/customizationGroups.spec.ts` with a `// @vitest-environment jsdom` docblock. Assert a `single` group mounts `SingleChoiceGroup`, `multiple` mounts `MultipleChoiceGroup`, `boolean` mounts `BooleanToggleGroup`; that groups render in `displayOrder`; and that an empty `groups` array renders the standard-specification message.
  2. Verify failure: `pnpm test tests/components/customizationGroups.spec.ts`
  3. GREEN: implement. Props `groups`, `modelValue: CustomizationSelections`, `notes: CustomizationNotes`. Sorts by `displayOrder` ascending. Emits `update:modelValue` and `update:notes`. Keeps the numbered step header, connecting line and Required badge that live in the current panel markup.
  4. Verify pass: `pnpm test tests/components/customizationGroups.spec.ts`

---

### Task 7: Shell, page and store

- **Files**:
  - `app/components/customization/ProductCustomizer.vue` (MODIFY)
  - `app/pages/customize/index.vue` (MODIFY)
  - `app/stores/quote.ts` (MODIFY)
  - `app/components/customization/ItemCustomizer.vue` (DELETE)
  - `app/utils/modularConfigPresets.ts` (DELETE)
- **Goal**: Wire it together, retire the legacy path (D6, D7, D14, D17).
- **Steps**:
  1. `ProductCustomizer.vue`: swap props `steps: CustomizationStep[]` → `groups: SanityCustomizationGroup[]`, add `notes` and `showDemoNotice`. Replace lines 276-539 with `<CustomizationGroups>`. Keep the left column exactly as is — the preview image is fixed under D6, so the zoom and reset controls are unchanged.
  2. Add the amber demo strip at the top of the right-hand options panel, gated on `showDemoNotice`, not on `import.meta.dev` (D17).
  3. `quote.ts`: add `selectedCustomizations?: SanitySelectedCustomization[]` and `isPoa?: boolean` to `QuoteItem`. Change `updateItemConfig` to take a single payload object carrying selections, notes, total, POA state, spec summary and lines. Delete `seedDefaultItems`' stale `specSummary` values if they no longer parse.
  4. `pages/customize/index.vue`: drop the `modularConfigPresets` imports; feed `DEMO_CUSTOMIZATION_GROUPS`; render `ProductCustomizer` directly inside the accordion; hold `selections` and `notes` per item; pass `show-demo-notice`.
  5. Mandatory guard (D12): a page-level computed lists items with `unsatisfiedMandatory`. "Review & Request Quote" is disabled while non-empty; activating it expands the first offending unit and scrolls to the group. Collapsed unit headers show a red "N required" chip.
  6. Unit price in the collapsed row renders `priceLabel`, so POA units read `POA` rather than a number.
  7. Delete `ItemCustomizer.vue` and `modularConfigPresets.ts`.
  8. Verify: `pnpm typecheck` clean, `pnpm test` green.

---

### Task 8: Verification

- **Steps**:
  1. `pnpm test` — full suite.
  2. `pnpm typecheck`.
  3. `pnpm dev` and walk `/catalog` → `/customize` → `/quote`: pick a POA option and confirm the line reads `£X + POA`; leave a mandatory group empty and confirm the proceed button blocks and auto-expands; type a custom note and confirm it survives a page reload through the persisted store; confirm the amber demo strip is present.
  4. `graphify update .` and `code-review-graph update`, per `AGENTS.md`.

---

## Out of scope

- Fetching groups from Sanity (`useSanityQuery`) and deleting the fixture.
- Authoring real `customizationGroup` documents in the catalogue pipeline — `sanity/catalogue/manifest.json` carries no customization data today.
- Counter / quantity groups (D5) and any schema field for them.
- The hardcoded product list in `app/pages/catalog/index.vue`.
- Presenting each Size Option as its own catalogue entry (D6 assumes it; it is not built here).
