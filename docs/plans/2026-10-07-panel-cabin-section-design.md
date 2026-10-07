# Panel Cabin Catalogue Section Design

## Decision

The client chose **Insulated Panel Cabin** for `/panel-cabin/`. The decision is recorded on GitHub issue #30.

## Data alignment

The `productLine-panel-cabin` seed will reference `category-cabin-panel` instead of `category-cabin-composite`. The Product Line page will therefore query the Insulated Panel Cabin catalogue range while retaining its Legacy URL, copy, cover and SEO fields.

The UK migration design's Kept URL table will name Cabin › Insulated Panel for `/panel-cabin/`.

## Header behaviour

The header stays data-driven. Its existing category matcher chooses a parentless Product Line when multiple Product Lines share a category; otherwise it uses the first matching Product Line. No component logic change is needed.

With the corrected seed data:

- Cabin › Panel (the Insulated Panel section) links to `/panel-cabin/` on desktop and mobile.
- Cabin › Composite has no matching Product Line and keeps its filtered `/products/` link.

## Testing

Tests will first assert the new seed category and both header destinations, producing failures against the old data/fixture. After the seed and design update, targeted tests, Product Line typechecking, the seed dry run and the full test suite must pass.

## Out of scope

- Renaming catalogue categories.
- Changing Product Line copy, imagery or SEO.
- Hardcoding `/panel-cabin/` in the header.
- Modifying the existing parent-wins matcher.
