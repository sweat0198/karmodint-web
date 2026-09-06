# Vision and Mission Product Imagery Design

## Goal

Replace generic Vision and Mission photography with imagery grounded in products Karmod can substantiate from its catalogue.

## Chosen Direction

Use existing product renders as immutable foreground assets. Generate only restrained architectural backdrops, then layer product PNGs in the Vue component. This keeps product geometry, openings, finishes, and branding exact while adding enough context for polished editorial cards.

## Asset Design

### Vision

- Product: `public/images/products/K7001/left-diagonal.png`
- Backdrop: bright, future-facing abstract architectural grid and pale horizon
- Mood: optimistic, spacious, precise
- Exclusions: buildings, workers, vehicles, machinery, text, logos, and operational claims

### Mission

- Product: `public/images/products/K2004/left-diagonal.png`
- Backdrop: practical modular-system grid over a neutral ground plane
- Mood: dependable, engineered, delivery-focused
- Exclusions: buildings, workers, vehicles, machinery, text, logos, and operational claims

## Composition

Both cards keep their existing wide `h-48` media region. Generated backgrounds fill each frame with `object-cover`. Exact product renders sit above them with absolute positioning and `object-contain`, leaving comfortable negative space and preventing crop damage to product silhouettes.

## Implementation Boundaries

- Preserve current Vision/Mission order, copy, icons, layout, hover behavior, and user edits.
- Add two new background assets under `public/images/about/`.
- Do not modify source product images.
- Add no claims through people, sites, manufacturing equipment, or installation scenes.
- Decorative background images use empty alt text; product overlays carry accurate alt text.

## Verification

- Confirm both generated assets exist in the workspace.
- Confirm the component references the new backgrounds and exact catalogue renders.
- Run focused component tests when available, then project type-check/build validation.
- Inspect the rendered section at desktop and mobile widths.

