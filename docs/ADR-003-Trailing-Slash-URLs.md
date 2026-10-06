# ADR-003: Trailing-Slash URLs Site-Wide

Every public URL ends in `/` (`/products/`, `/solutions/site-offices/`). This applies to canonicals, the sitemap, breadcrumbs, internal links and redirect targets. The legacy karmodint.co.uk URLs that rank in Google all end in `/` and are kept unchanged at migration. A slashless site would either break the "same URL" promise for those pages or mix two formats, and mixed formats send split signals to search engines. Cloudflare Pages already serves `dir/index.html` at `/dir/`, so the slash form is also what the host does natively.

## Considered Options

- **Slashless everywhere**: rejected. Every kept legacy URL would need a 301, which defeats the reason for keeping them.
- **Slash only on legacy URLs**: rejected. Two URL formats on one site, with no rule that tells a contributor which one to use.
