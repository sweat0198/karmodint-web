# Catalog to Products Rename Design

## Goal

Present the public product-browsing experience as “Products” everywhere and expose it at `/products` before launch.

## Scope

- Move the Nuxt catalog page from `/catalog` to `/products`.
- Replace public navigation, calls to action, breadcrumbs, search copy, quote-flow links, structured data, canonical URLs, sitemap entries, and prerender configuration with Products terminology and `/products`.
- Update public-behavior tests at existing component and page seams.
- Do not add a `/catalog` redirect because the site has not launched.
- Keep internal catalogue import paths, commands, data directories, query/type names, helper names, DOM IDs, CSS classes, and historical plans unchanged. These are implementation vocabulary, not customer-facing branding.

## Behavior

Users reach the listing through `/products`. Header active-state behavior, product-card navigation, quote back-navigation, customization links, and progress tracking all recognize `/products`. Search controls announce “products” to assistive technology. SEO output references only `/products` and uses Products wording.

## Testing

Use existing rendered-component and source-structure tests as public seams. First change expectations to Products and `/products`, observe targeted failures, then update implementation. Run affected tests, Nuxt typecheck, and full Vitest suite. Review final diff for leftover public `/catalog` or Catalog copy while allowing internal catalogue vocabulary.
