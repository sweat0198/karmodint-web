# Implementation Plan: Full-Height Customizer Panel with Sticky Photo

**Feature**: Invert the `/customize` expanded card so the options list dictates its height and the photo column pins under the nav, replacing today's fixed 500px stage with a scroll-trapped options panel.
**Date**: 2026-08-26
**Status**: Ready for execution

---

## Why

The expanded accordion card currently reads backwards. `ProductCustomizer.vue:82` gives the photo column `min-h-[500px]`, and `ProductCustomizer.vue:236-237` makes the options panel `lg:absolute lg:inset-0 overflow-y-auto` inside it. The consequence: the **photo** decides how tall the card is, and the **options** — the thing the customer came to interact with — are squeezed into a ~450px-wide, ~500px-tall box with its own scrollbar nested inside the page's scrollbar.

Four demo groups already overflow that box. Real Sanity-authored groups will be worse.

This plan flips the relationship. The card grows to whatever the options need, there is exactly one scrollbar on the page, and the photo follows the customer down via `position: sticky` so the unit stays visible while its options are chosen.

---

## Decisions

Settled through three rounds of design questions. Recorded so nothing is re-litigated mid-build.

| #   | Decision                                                                                                                                    | Rationale                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Card height is **content-driven** by the options column. No inner scrollbar anywhere. Rejected: pinning the row to `100dvh`.                  | The nested scrollbar is the actual irritation. A viewport-height row keeps it, just taller.                                                                          |
| D2  | The accordion becomes **single-open**. Expanding a unit collapses the others.                                                                 | With full-height panels, multi-open stacks several 2000px cards and the sticky photos hand off between them incoherently. One open unit keeps the photo unambiguous. |
| D3  | Below `lg` nothing changes. Columns stack, nothing sticks.                                                                                    | Mobile sticky media costs a large share of a small screen and needs its own height tuning. Separate decision, separate pass.                                         |
| D4  | The **whole** left column sticks — title, image stage, spec chips — capped to the viewport, with the image stage absorbing the shrink.        | Spec chips are the thing most worth seeing while choosing options. On a 1440x800 laptop the column is ~600px against ~640px of usable height; the photo gives way.   |
| D5  | Reserve clearance for the fixed price bar. Chrome heights live in **CSS variables**, not scattered magic numbers.                             | `PriceBar` is `bg-white/95 backdrop-blur` over `bottom-0`; chips half-buried behind it read as a bug.                                                                |
| D6  | Split moves 3/5–2/5 → **55/45**, and `CustomizationGroups`' `max-w-[480px]` cap is dropped.                                                   | The options column now drives page length, so narrow means long. The photo is sticky and no longer needs to be the largest thing on screen.                          |
| D7  | Keep the 350ms expand animation; after the swap settles, `scrollIntoView` the open card's header at the nav offset.                           | Single-open means the outgoing card collapses while the incoming one expands — the page yanks both ways unless scroll is managed.                                    |
| D8  | The photo stays **centred** in its column. Not right-aligned against the divider.                                                             | Confirmed reading of "sticky to right side": the left column sticks while the right scrolls past it.                                                                 |
| D9  | Both clipping ancestors change `overflow: hidden` → **`overflow: clip`**.                                                                     | `hidden` makes an element a scroll container, so `position: sticky` inside resolves against that box and never moves. `clip` clips identically without that.         |
| D10 | The column divider moves from the left column's `border-r` to the right column's `border-l`.                                                  | Sticky requires `items-start`, so the left column stops stretching and its border would end in mid-air against a much taller card.                                   |
| D11 | The card's summary header stays **non-sticky**. Out of scope.                                                                                 | It would want the same `top` offset as the sticky photo and overlap it. A deliberate second pass, not a bolt-on.                                                     |

---

## The critical mechanic (D9)

This is the one that decides whether the feature works at all, so it is stated plainly.

The photo column sits inside two clipped boxes:

- `app/pages/customize/index.vue:85` — the card wrapper's `overflow-hidden`, present so the `rounded` corners clip their contents.
- `app/pages/customize/index.vue:438-441` — `.accordion-inner { overflow: hidden }`, present so the collapsed `grid-template-rows: 0fr` row hides its content.

Per CSS Overflow 3, an element with `overflow: hidden` **is a scroll container** (it has a scrollable overflow region, merely without a visible scrollbar). `position: sticky` resolves against its nearest scroll container. So a sticky child of either box would offset against a box the user never scrolls — the photo would sit there looking completely inert, and it would read as "the CSS silently didn't apply".

`overflow: clip` clips at the same padding box but explicitly does **not** create a scroll container, so sticky keeps resolving against the page viewport. Tailwind ships `overflow-clip`. Support: Chrome 90+, Firefox 81+, Safari 16+.

**Fallback if `clip` misbehaves against the `0fr` collapsed row**: keep `hidden`, and swap to `visible` on `transitionend` once the card is open, restoring it before collapse. Rejected as the default because an interrupted transition can strand `overflow` in the wrong mode. Verify `clip` visually before accepting it.

---

## File layout

```
app/assets/css/main.css                                  MODIFY  chrome-height + sticky vars in :root
app/components/customization/ProductCustomizer.vue       MODIFY  sticky left column, 55/45, divider, unwrapped right panel
app/components/customization/CustomizationGroups.vue     MODIFY  drop max-w-[480px]
app/pages/customize/index.vue                            MODIFY  overflow-clip, single-open state, scroll management
```

No new files. No component API changes — `ProductCustomizer`'s props and emits are untouched, and it is used in exactly one place (`app/pages/customize/index.vue:251`).

---

## Tasks

### Task 1: Chrome height variables

- **Files**:
  - `app/assets/css/main.css` (MODIFY)
- **Goal**: One home for the two measurements every sticky offset depends on (D5).
- **Steps**:
  1. Run `pnpm dev`, open `/customize`, and **measure** the rendered heights of `AppHeader` (`sticky top-0 z-50`) and `PriceBar` (`fixed bottom-0 z-40`) in devtools at `lg` and above. Both are padding-derived (`py-4` plus content), so do not infer them from the classes.
  2. Add to the existing `:root` block, alongside `--ease-out` and friends:
     ```css
     --app-header-h: <measured>px;
     --price-bar-h: <measured>px;
     --customizer-sticky-top: calc(var(--app-header-h) + 1rem);
     --customizer-sticky-max-h: calc(
       100dvh - var(--customizer-sticky-top) - var(--price-bar-h) - 1rem
     );
     ```
  3. `100dvh`, not `100vh` — mobile browser chrome collapse would otherwise make the cap wrong even though D3 keeps sticky off below `lg`.
  4. Note in a comment that `--price-bar-h` is reserved unconditionally on this page: `PriceBar` renders whenever the cart is non-empty, and `/customize` shows `EmptyQuoteState` instead of any card when it is empty, so the bar is always present alongside an expanded card.

---

### Task 2: Unclip the sticky ancestors

- **Files**:
  - `app/pages/customize/index.vue` (MODIFY)
- **Goal**: Make `position: sticky` reachable at all (D9). Must land before Task 3, or Task 3 cannot be visually verified.
- **Steps**:
  1. Card wrapper at `index.vue:85`: `overflow-hidden` → `overflow-clip`.
  2. `.accordion-inner` in the scoped style block at `index.vue:438-441`: `overflow: hidden` → `overflow: clip`.
  3. Verify in the browser that a collapsed card still shows no bleed at `grid-template-rows: 0fr` and the card's rounded corners still clip their contents. If either regresses, take the `transitionend` fallback documented above and record the swap in this file.

---

### Task 3: Two-column relayout

- **Files**:
  - `app/components/customization/ProductCustomizer.vue` (MODIFY)
  - `app/components/customization/CustomizationGroups.vue` (MODIFY)
- **Goal**: Options drive the height, photo sticks (D1, D4, D6, D8, D10).
- **Steps**:
  1. Root (`:77`): `items-stretch` → `lg:items-start`. Mandatory — a stretched flex child fills its line and has no sticky travel.
  2. Left column (`:82`):
     - `lg:w-3/5` → `lg:w-[55%]`.
     - Add `lg:sticky lg:self-start lg:top-[var(--customizer-sticky-top)] lg:max-h-[var(--customizer-sticky-max-h)]`.
     - `min-h-[500px]` → `min-h-[500px] lg:min-h-0`, so the mobile floor survives (D3) without fighting the desktop cap.
     - Remove `lg:border-r border-brand-rose-border/30`; keep `border-b lg:border-b-0` for the stacked case.
     - The existing `flex flex-col justify-between` and `flex-1` on the image stage (`:99`) already make the stage the shrinking element. Leave both.
  3. Image frame wrapper (`:101-103`): add `max-h-full` next to `aspect-video`. Without it the aspect box computes its height from a full-width basis and overflows the capped column, cropping against the stage's `overflow-hidden`. The `<img>` inside is already `object-contain max-h-full max-w-full`, so the frame becoming wider than 16:9 on short viewports costs nothing visually.
  4. Right column (`:236`): `lg:w-2/5 bg-white relative flex flex-col min-h-0` → `lg:w-[45%] bg-white lg:border-l border-brand-rose-border/30`. The divider lands here so it spans the card's true height (D10).
  5. Right column inner (`:237`): drop `lg:absolute lg:inset-0` and `overflow-y-auto`. Keep `p-6 md:p-8`. This is what makes the panel flow and the card grow.
  6. `CustomizationGroups.vue:37`: drop `max-w-[480px]`, leaving `flex flex-col gap-8`. The panel's own `p-8` now bounds the content at roughly 570px (D6).
  7. Confirm the sticky column's background: it has none of its own and inherits the root's `bg-slate-50`, so the area below it once the right column runs longer stays seamless. No background rule needed.

---

### Task 4: Single-open accordion and scroll management

- **Files**:
  - `app/pages/customize/index.vue` (MODIFY)
- **Goal**: One unit open at a time, landing where the customer expects (D2, D7).
- **Steps**:
  1. Replace `expandedItemIds = ref<Set<string>>(new Set())` (`:293`) with `expandedItemId = ref<string | null>(null)`.
  2. `isExpanded(id)` (`:300-302`) → `expandedItemId.value === id`.
  3. `toggleExpand(id)` (`:304-310`) → assign `null` when already open, otherwise assign `id` and call the scroll helper. Collapse of the outgoing card and expand of the incoming one happen in the same assignment, so both transitions run in one frame.
  4. `handleProceedClick` (`:403`): `expandedItemIds.value.add(offendingItem.id)` → `expandedItemId.value = offendingItem.id`. The existing group `scrollIntoView` at `:405-409` still runs after it and takes precedence — the customer should land on the offending group, not the card header.
  5. `onMounted` (`:412-419`): `expandedItemIds.value.add(first.id)` → `expandedItemId.value = first.id`.
  6. Give the card wrapper (`:82-91`) a bound `id` of `unit-<item.id>`, and add a `scrollCardIntoView(id)` helper: `nextTick`, then `window.scrollTo` to the element's document offset minus `--customizer-sticky-top`, read via `getComputedStyle`. Use `document.getElementById`, matching the pattern already at `:406`.
  7. Reduced motion: gate the helper's `behavior` on `window.matchMedia("(prefers-reduced-motion: reduce)").matches` — `"auto"` when set, `"smooth"` otherwise. Add a `@media (prefers-reduced-motion: reduce)` block to the scoped styles setting `transition: none` on `.accordion-grid`. `AGENTS.md` routes motion work through `.agents/skills/animate`, which requires this; `main.css` currently has no global reduced-motion block, so it is handled locally.
  8. Apply the same reduced-motion gate to the pre-existing group `scrollIntoView` at `:406-408`.

---

### Task 5: Verification

- **Steps**:
  1. `pnpm test` — full suite. No test touches `/customize`, the accordion, or `ProductCustomizer` (`tests/components/` holds only `ProductImageCarousel`, `UkAddressAutocomplete`, `customizationGroups`), so this is a regression gate, not coverage of this change. There is **no `typecheck` script** in `package.json`; use `pnpm build` as the type gate.
  2. `pnpm dev` and walk `/customize` with at least three units in the cart:
     - Expand a unit — photo pins under the nav, options scroll past it, **no inner scrollbar**.
     - Scroll to the card's end — the photo releases and leaves with the card.
     - Expand a second unit — the first collapses, and the new card's header lands just under the nav.
     - Resize to a 1440x800 viewport — the photo shrinks; the title and spec chips stay visible and clear of the price bar.
     - Collapse everything — no bleed from the `0fr` rows, corners still clipped.
     - Narrow below `lg` — stacked, nothing sticky, `min-h-[500px]` intact.
     - Leave a mandatory group empty and press "Review & Request Quote" — the offending unit opens and scrolls to the group.
     - With OS reduced-motion on, expanding jumps instead of animating.
  3. `graphify update .` and `code-review-graph update`, per `AGENTS.md`.

---

## Risks

| Risk                                                                 | Mitigation                                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `overflow: clip` interacts badly with the `0fr` grid row.             | Verified explicitly in Task 2.3; documented `transitionend` fallback.                                           |
| Measured chrome heights drift when the nav or price bar is restyled.  | Both live in `:root` variables (Task 1), so a future restyle is a one-line correction.                          |
| A very long Sanity group list makes a single card enormous.           | Accepted — that is the point of D1, and single-open (D2) bounds the page to one such card. Revisit if it bites. |
| Browser scroll anchoring fights the programmatic scroll in Task 4.6.  | Scroll after `nextTick`, once the DOM swap has committed.                                                       |

---

## Out of scope

- Sticky media on mobile/tablet (D3).
- A sticky card summary header (D11) — conflicts with the photo's `top` offset and needs its own pass.
- Any change to `PriceBar`, `AppHeader`, or `ProgressTracker` beyond reading their heights.
- Fetching customization groups from Sanity and retiring `DEMO_CUSTOMIZATION_GROUPS`.
- Right-aligning the photo against the divider (D8) — a one-class change if wanted later.
