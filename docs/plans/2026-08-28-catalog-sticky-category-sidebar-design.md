# Catalog Sticky Category Sidebar Design

## Goal

Keep desktop category navigation visible while users browse catalog products, positioned on the right side of the product grid.

## Design

- Desktop (`lg` and wider): product grid appears first; 290px category sidebar appears on its right.
- Sidebar uses `position: sticky` with a `6rem` top offset (`top-24`) and `self-start` alignment.
- Sticky containment remains the catalog layout. Sidebar stops before the footer CTA.
- Mobile remains unchanged: sticky category trigger and bottom-sheet drawer continue handling navigation.
- No animation. Scrolling must remain direct and predictable.

## Verification

- Structural regression test confirms main content precedes sidebar.
- Structural regression test confirms desktop sidebar includes `sticky`, `top-24`, and `self-start`.
- Existing test suite and Nuxt build remain green.
