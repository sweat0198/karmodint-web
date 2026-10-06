# Cloudflare Pages `_redirects`: trailing slashes, rule limits, Functions routing

Settled 2026-10-06 for the UK migration (#21). Applies to the generated `_redirects` (`modules/legacy-redirects/`,
map in `shared/migration/redirects.ts`).

## Does a source match its slashless (or slashed) twin?

**No. Matching is exact, trailing slash included.** `/container/` does not catch a request for `/container`, and
`/container` does not catch `/container/`. So the build writes every source in both forms (192 sources at most →
384 static rules, well under the 2,000 limit).

Evidence:

- **Docs** ([Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)) say nothing about
  normalisation, and their own examples list `/trailing /trailing/ 301` and `/notrailing/ /nottrailing 301` as separate rules.
- **Source.** Cloudflare's asset server is open source (`cloudflare/workers-sdk`). `pages-shared/asset-server/handler.ts`
  looks static rules up by the raw pathname: `staticRules[pathname]` (also `staticRules["https://" + host + pathname]`).
  `workers-shared/utils/configuration/parseRedirects.ts` stores the source as written. Nothing strips or adds a slash.
- **Local run** (`wrangler pages dev`, same asset-server code), with `_redirects` = `/slashed/ /target/ 301` and
  `/slashless /target/ 301`: `/slashed/` → 301, `/slashed` → no match; `/slashless` → 301, `/slashless/` → no match.
- **Live pages.dev** (before this change): `/about-contact` → 301, `/about-contact/` → 200 (the slashless rule didn't
  match the slashed request).

The asset server's own 308 from `/dir` to `/dir/` only happens when `dir/index.html` exists, so it never helps a
redirect source.

## Rule order and limits

From the parser (`parseRedirects.ts`) and the docs:

- A rule is **static** if its source has no `*` or `:placeholder`, but only until the first dynamic rule. Every rule
  after that counts as dynamic, whatever it looks like.
- Limits: 2,000 static, 100 dynamic. Past the dynamic limit the parser drops the rest of the file. Lines over 1,000
  characters are ignored (docs; the current parser allows 2,000).
- First matching rule wins. Static rules are checked before dynamic ones.
- The status is optional and defaults to **302**, so we always write it. Allowed codes: 200 (proxy), 301, 302, 303, 307, 308.
- Destinations may carry a query string (`/metrocity-cabin/ /products/?category=cabin&subcategory=metro-city 301`).
  If the destination has no query string, the request's own query string is carried over.
- Query strings in the **source** cannot be matched.

`public/_redirects` holds the Studio SPA rewrites, and `/studio/structure/*` is dynamic. That is why the generated
block goes **first** in `dist/_redirects`. Placed after the Studio rules, all 232 lines would count as dynamic and
everything past the 100th would be dropped.

Nitro's cloudflare-pages preset appends `/* /404.html 404` when `404.html` exists. Cloudflare rejects code 404 in
`_redirects`, so that line is ignored. Not-found handling comes from the top-level `404.html` instead.

## `_redirects` never runs for requests routed to Functions

Docs: "Redirects defined in the `_redirects` file are not applied to requests served by Pages Functions". `_headers`
works the same way. Nitro's default `_routes.json` is `include: ["/*"]` minus the built files, capped at 100 rules,
so every Legacy source (never a built file) went to `_worker.js` and got the worker's 404.

Fix (`nuxt.config.ts`, `nitro.cloudflare.pages`): `defaultRoutes: false`, `include: ["/api/*"]`. Only the API runs in the
worker (ADR-002). Everything else, `/studio/` included, is static. Consequences:

- Unknown paths get the top-level `404.html` with a 404 status. `nuxi build` doesn't prerender it on its own, so it
  is listed in `nitro.prerender.routes`. Without it, Pages would serve `/` with a 200 for any unknown path (SPA mode).
- A page that wasn't prerendered can no longer fall back to server rendering. Each page must be prerendered, which
  ADR-002 already requires.
- The build fails if `_routes.json` ever sends a redirect source to the worker again (`findWorkerRoutedPaths`).

## Verifying a deploy

Not checked here: needs a pages.dev deploy. Sample commands (the #29 script sweeps every source):

```sh
curl -sI https://<deploy>.pages.dev/blog/york-modular-kiosks/ | grep -iE '^(HTTP|location)'   # 301 → /solutions/retail-and-food-service-kiosks/
curl -sI https://<deploy>.pages.dev/blog/york-modular-kiosks  | grep -iE '^(HTTP|location)'   # same, one hop
curl -sI https://<deploy>.pages.dev/faq/                       | grep -iE '^(HTTP|location)'   # 302 → /contact/
curl -sI https://<deploy>.pages.dev/no-such-page/              | grep -iE '^HTTP'              # 404
```
