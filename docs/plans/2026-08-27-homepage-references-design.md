# Homepage References Section Design

## Goal

Add a CMS-managed customer references section directly below the homepage hero. Editors can add a company name, logo, optional website, optional location, and optional display order through Sanity Studio.

## Content model

Each reference is a standalone Sanity `clientReference` document. Sanity reserves `reference` as a built-in type name. Each document has:

- `companyName`: required string
- `location`: optional string
- `logo`: required image
- `website`: optional URL restricted to HTTP/HTTPS
- `displayOrder`: optional number

References with `displayOrder` sort first in ascending order. Unordered references follow alphabetically by company name. Studio receives a dedicated References list with display-order and alphabetical orderings. Document previews show logo, company name, and location.

No category, slug, visibility toggle, image alt field, or homepage-settings document ships. Sanity draft/publish state controls visibility. Visible company text supplies each tile's accessible name; the adjacent logo is decorative.

## Homepage integration

Homepage order becomes:

1. Hero
2. References
3. Product catalogue
4. Contact

`ReferencesSection.vue` owns the Sanity query and transforms image asset references into CDN URLs. It renders nothing when the query is empty or no logo URL can be resolved.

The heading remains static: “Trusted by organisations worldwide”.

## Presentation

References appear in one continuous row. Each neutral tile contains:

- a consistently sized `object-contain` logo stage
- company name
- optional location
- an external link covering the tile when `website` exists

Linked tiles open in a new tab with `rel="noopener noreferrer"`. Unlinked tiles keep identical visual treatment without fake link behavior.

The implementation uses Tailwind utilities for layout and visual treatment plus one scoped CSS keyframe for the marquee. Two identical groups create the seamless loop; the duplicate group is hidden from assistive technology and removed from keyboard order. Constant movement uses a 40-second linear `transform` animation. Hover, focus-within, and active interaction pause the track. Edge masks soften entry and exit.

Despite not requiring a visible accessibility control, `prefers-reduced-motion: reduce` is supported per project motion rules. It disables positional animation, hides the duplicate group, removes the edge mask, and presents the original references as a wrapping static layout.

## Initial migration

A one-time, idempotent script uploads the eight existing local logos and creates deterministic Sanity documents. It preserves the supplied order using values `10, 20, …, 80` while leaving `displayOrder` optional for future documents.

Six documents publish immediately. These two remain drafts pending brand verification:

- West Haddon Council: local SVG identifies itself as West Northamptonshire branding.
- Luton Sea Cadet: local PNG duplicates generic Sea Cadets branding.

Initial websites remain unset because no authoritative URLs were supplied. Existing constants, downloaded files, and scratch download script stay in the repository until migration and frontend testing finish.

## Verification

Automated coverage will verify:

- schema registration and required/optional fields
- draft exclusion and ordered/alphabetical query behavior
- deterministic migration document IDs and draft state
- logo URL mapping and invalid-asset filtering
- marquee duplication, external-link semantics, optional location, and non-linked tiles
- reduced-motion and interaction-pause CSS contracts
- homepage placement and empty-section suppression

Final checks include focused tests, full Vitest suite, Nuxt build, Sanity Studio build, migration dry run, live Sanity import verification, and required graph refreshes.
