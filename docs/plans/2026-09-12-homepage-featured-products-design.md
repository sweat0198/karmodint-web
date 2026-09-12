# Homepage Featured Products Design

## Goal

Show three fixed catalogue variants on the homepage: Portable Cabin 3.00m × 7.00m, GRP Cabin 1.50m × 1.50m, and Insulated Panel Cabin 1.35m × 2.10m.

## Options considered

1. Keep one featured product and take its first three sizes. Rejected: cannot show three product families.
2. Select product IDs and size keys in the homepage component. Chosen: stable CMS document IDs and size keys; no schema or content migration.
3. Add a CMS field for homepage ordering. Rejected: unnecessary configuration for three explicitly requested cards.

## Design

`ProductCatalogSection` selects exact product-size pairs from the existing catalogue query, converts them through `toSizeCards`, and renders all three with `ProductCard`. Missing data produces no placeholder card. Card price, images, quote-list actions, and dimensions remain owned by existing catalogue/card code.

## Verification

Add a component regression test for selected card IDs and run it before and after implementation, then run the full test suite and production build.
