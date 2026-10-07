# ADR-004: Product Lines Are a Separate Document Type from Solutions

Product Line pages (the Kept URLs that present one construction type of unit, such as `/grp-kiosk-cabin/`) are a new `productLine` Sanity document type. They are not a "kind" of `solution`. The two share most of their field shapes: name, description, cover image, body, FAQs and SEO. Those shapes are shared as reusable objects anyway. What differs is what a single switch on one type would quietly break:

- A Product Line's URL is a fixed Legacy path that must never move, while a Solution's slug is editable.
- Product Lines nest under a parent.
- Product Lines must never appear in the `/solutions/` listing.
- A hub Product Line has no products, while a Solution requires at least one.

## Considered Options

- **One `solution` type with a `kind` discriminator:** rejected. Every Solution query would need a kind filter, the "at least one product" rule would become conditional, and an editor flipping the kind would move a page's URL.
