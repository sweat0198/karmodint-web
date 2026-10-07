# UK Migration Design

## Goal

Replace the Legacy Site at www.karmodint.co.uk with this site without losing search rankings. Every Legacy URL either stays a Kept URL (same address, same copy) or moves with a single 301 hop to the page that best replaces it. Terms are defined in `docs/GLOSSARY.md` under "Site Migration" and "Product Line page".

Source: the client's migration sheet ("UK Migration - Karmod.xlsx": launch steps, pages to keep, redirects), merged with the Legacy Site's live sitemap as fetched on 2026-10-06.

## Out of scope

- **Analytics and cookie consent (sheet step 8):** parked in #17.
- **FAQ and Cookies Policy pages:** deferred to #18. They get interim 302s (see Redirects).
- **karmod.co.uk:** a separate live site with 367 URLs. Its migration is a later, separate project.
- **Launch-day and post-launch ops (sheet steps 11–16):** covered by a checklist doc only. DNS, zone-level redirects, WAF and Search Console are not done from this repo.

## URL format

Every public URL ends in `/`, per `docs/ADR-003-Trailing-Slash-URLs.md`. That covers canonicals, sitemap entries, breadcrumbs and structured data, every `NuxtLink`, prerender routes, and redirect targets.

## Kept URLs

| Kept URL | Page | Content |
|---|---|---|
| `/` | Home | Existing page plus the Legacy Site home copy, ported word for word |
| `/products/` | Products | Existing page |
| `/modular-buildings/` | Product Line (hub, no product grid) | Legacy copy |
| `/portable-cabin/` | Product Line → Containers | Legacy copy |
| `/portable-cabin/steel-cabin/` | Product Line → Containers, parent `/portable-cabin/` | Legacy copy |
| `/portable-cabin/portable-house/` | same | Legacy copy |
| `/grp-kiosk-cabin/` | Product Line → Cabin › GRP | Legacy copy |
| `/panel-cabin/` | Product Line → Cabin › Insulated Panel | Legacy copy |
| `/bulletproof-cabin/` | Product Line → Bulletproof | Legacy copy |
| `/privacy-policy/` | Hardcoded page | Client-supplied text in `docs/assets/privacy-policy.md`, word for word |

`/portable-cabin/flat-pack-cabins/`, `/portable-cabin/jackleg-cabin/` and `/portable-cabin/portable-classroom/` were Kept URLs until the client retired them (#34). They now 301 to `/portable-cabin/` (see Redirects).

"Legacy copy" means the body copy, `<title>` and meta description the Legacy Site served at a Legacy URL, carried over word for word. The only cuts are claims about products, sizes or contact details that are no longer true.

## Product Line pages

A new Sanity document type, `productLine`, separate from `solution`. See `docs/ADR-004-Product-Line-Document-Type.md`.

Fields:

| Field | Purpose |
|---|---|
| `name` | Used as H1, menu label and breadcrumb label |
| `path` | The Kept URL. Read-only for anyone who isn't a Studio admin. Validated as lowercase kebab segments that start and end with `/`, unique across Product Lines, and prefixed by the parent's path. |
| `parent` | Optional reference to another `productLine` |
| `category` | Optional `category` reference. Empty means a hub page. |
| `description` | |
| `coverImage` | Includes `alt` |
| `body` | `blockContent` |
| `faqs` | Array of the new shared `faqItem` object, `{ question, answer }` |
| `displayOrder` | |
| `seo` | |

Page behaviour:

- **Product grid:** shows automatically every product in `category` and its subcategories, with a "View all in catalogue" link to the filtered `/products/`. No grid when `category` is empty.
- **Breadcrumbs:** follow the `parent` chain.
- **Routing:** a catch-all route resolves the request path against `productLine.path`. Every Product Line path is added to the prerender list.

## Solution changes

- Add `body` (`blockContent`) and `faqs` (`faqItem[]`).
- Port the Legacy copy of one primary Legacy URL per Solution, word for word:

| Solution | Primary Legacy URL |
|---|---|
| retail-and-food-service-kiosks | `/outdoor-and-retail-kiosk/` |
| accommodation-units | `/farm-workers-accommodation/` |
| security-gatehouses-and-access-control | `/security-gatehouse-security-guardhouse/` |
| site-offices | `/site-cabin/` |
| welfare-and-wc-units | `/portable-cabin/portable-toilet-and-shower-cabin/` |
| car-park-valet-and-weighbridge-cabins | `/car-park-kiosk-and-parking-booths/` |
| ticket-information-and-service-kiosks | `/ticket-booths/` |
| garden-rooms-and-garden-offices | `/garden-office/` |

The other four Solutions keep their current content.

## Internal links

- **Header Products menu:** category and subcategory entries link to the Product Line whose `category` matches. The parentless one wins when several match, e.g. Containers → `/portable-cabin/`. Entries with no matching Product Line keep their filtered `/products/` link.
- **Footer:** lists every Product Line by `displayOrder`.

## Titles and descriptions

- **Kept URLs:** use the Legacy `<title>` and meta description word for word. Scrape them into `seo.metaTitle` and `seo.metaDescription`.
- **Other pages:** commercial formula, `{Thing} for Sale UK | Karmod`.

## Structured data

- **BreadcrumbList:** on every page except home.
- **FAQPage:** on any page with non-empty `faqs`, built from that same list so the visible Q&A and the markup always match.
- **Product:** on Product Line pages, as an `ItemList` of the grid's products. Prices only where `hasPublishablePrice`; POA items have no `offers`.

## Redirects

Cloudflare Pages' `_redirects` is generated at build time from one typed redirect map, `shared/migration/redirects.ts` (written into `dist/_redirects` ahead of the hand-written Studio rewrites in `public/_redirects`, by `modules/legacy-redirects/`). A group of rules ships once its target page exists; the rest wait in `PENDING_REDIRECT_GROUPS`. The full map is in `docs/plans/2026-10-06-uk-migration-redirects.tsv`: 199 rules: 135 from the sheet, 59 from the Legacy sitemap that the sheet missed, 3 retired Product Lines (#34), and 2 interim 302s.

| Source group | Target | Code |
|---|---|---|
| Legacy sheet rows | Targets as given in the sheet, plus the `/prefabricated-shelter-*` rows confirmed to `/panel-cabin/` and `/metrocity-cabin/` confirmed to `/products/?category=cabin&subcategory=metro-city` | 301 |
| `/blog/{city}-portable-cabin-and-container/` (52) | `/portable-cabin/` | 301 |
| `/galleries/{3 entries}/` | `/gallery/` | 301 |
| `/garden-office/` | `/solutions/garden-rooms-and-garden-offices/` | 301 |
| `/ticket-booths/` | `/solutions/ticket-information-and-service-kiosks/` | 301 |
| `/security-gatehouse-security-guardhouse/` | `/solutions/security-gatehouses-and-access-control/` | 301 |
| `/prefabricated-shelter/` | `/panel-cabin/` | 301 |
| `/portable-cabin/flat-pack-cabins/`, `/portable-cabin/jackleg-cabin/`, `/portable-cabin/portable-classroom/` (retired Product Lines, #34) | `/portable-cabin/` | 301 |
| `/modular-buildings/modular-school-buildings/` (sheet target was `/portable-cabin/portable-classroom/`; retargeted to avoid a chain, #34) | `/portable-cabin/` | 301 |
| `/faq/`, `/cookies-policy/` | `/contact/` | **302**, interim until #18 |

Test invariants:

- Every target resolves to a real prerendered route.
- No source is also a target, so there are no chains.
- No source is a Kept URL.
- Every path ends in `/`.

Settled: Cloudflare Pages matches sources exactly, trailing slash included, so `/container/` does not catch `/container`. Each source is written in both forms. Redirects also never run for requests routed to the Pages Functions worker, so `_routes.json` sends only `/api/*` there, and unknown paths get the static `404.html`. Evidence and limits: `docs/research/cloudflare-pages-redirects.md`.

The stale `/about-contact` `routeRules` entry is gone: `_redirects` is the only source of redirects.

## Sitemap

Generated at build time. It includes every indexable route: the static pages, every Solution, every Product Line and `/privacy-policy/`. It excludes `/quote/`, `/customize/`, `/api/` and anything with `seo.noIndex`. All entries use trailing-slash URLs.

## pages.dev

`public/_headers` sends `X-Robots-Tag: noindex` for `https://:project.pages.dev/*` and `https://:version.:project.pages.dev/*`. `robots.txt` keeps allowing crawling, so Google can see the header.

## Launch checklist doc

`docs/LAUNCH_CHECKLIST.md` covers sheet steps 11–16:

- No noindex or password on www.
- A single 301 for http → https and apex → www, set as a zone-level rule.
- A curl sweep script that asserts every source in the redirect map returns its expected code and `Location` in one hop.
- Googlebot is not blocked by the WAF.
- Submit the sitemap in Search Console.
- A two-week watch on the Search Console 404 report.

## Testing

- **Unit:** redirect map invariants, Kept URL validation, sitemap contents, and structured data for each page type.
- **Build:** after `nuxi generate`, every Kept URL and redirect target exists as `dir/index.html`, and every canonical ends in `/`.
- **Full suite:** run Vitest and the Nuxt typecheck.
