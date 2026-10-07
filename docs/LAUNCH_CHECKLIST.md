# UK Migration Launch Checklist

Runbook for moving www.karmodint.co.uk from the Legacy Site to this build. It covers steps 11–16 of the client's
migration sheet ("UK Migration - Karmod.xlsx", sheet "Yayın"). Steps 1–10 are the build work in the UK migration
tickets (#19–#28). Design: `docs/plans/2026-10-06-uk-migration-design.md`, section "Launch checklist doc".

Nothing here is run against DNS or Cloudflare from the repo. Dashboard steps are done by hand. The commands only read.

---

## 0. Before launch day: content and build

- [ ] Every redirect ticket has landed (#21, #22, #23, #24): `PENDING_REDIRECT_GROUPS` in
      `shared/migration/redirects.ts` is empty, and all 196 rules are in `REDIRECT_GROUPS`.
- [ ] Apply the seeded content to the **production** Sanity dataset before the launch build. Every page is prerendered
      from Sanity (ADR-002): a Kept URL whose document is missing is not built, and the build fails if a Redirect
      targets it. Dry-run each script first and read the summary:
  - [ ] Product Lines (#23, #24):
    ```sh
    pnpm product-lines:seed --dry-run
    SANITY_DATASET=production pnpm product-lines:seed
    ```
    `createOrReplace` overwrites Studio edits made since the last run. Re-run only to re-apply the seeded copy.
  - [ ] Solution copy and FAQs (#26):
    ```sh
    SANITY_DATASET=production pnpm solutions:patch-copy --dry-run
    SANITY_DATASET=production pnpm solutions:patch-copy
    ```
    Patches only `body` and `faqs` on the eight Solutions with Legacy copy (published and draft). The dry run lists
    the document ids when `.env` holds a token. Re-running overwrites Studio edits to those two fields.
- [ ] Only Studio administrators can change a Product Line `path`, and only in the Studio form: the lock and the path
      rules (shape, uniqueness, under the parent, over the children) are Studio validation. API writes and scripts
      with a write token bypass them, so give write tokens only to the migration scripts, and never patch a `path`
      outside Studio.
- [ ] The production build has `NUXT_PUBLIC_SITE_URL=https://www.karmodint.co.uk`. Canonicals and `sitemap.xml` use it.
- [ ] Trigger the production deploy on Cloudflare Pages (`karmodint-web`, production branch). The build fails if a
      Redirect target isn't a built page, so a green build means every target exists.
- [ ] Run the redirect check (step 13) against pages.dev. It must pass before the DNS switch:
  ```sh
  pnpm migration:check-redirects https://karmodint-web.pages.dev
  ```
- [ ] pages.dev stays hidden from Google (sheet step 1, #20). This should print `x-robots-tag: noindex`:
  ```sh
  curl -sI https://karmodint-web.pages.dev/ | grep -i x-robots-tag
  ```
- [ ] Add `www.karmodint.co.uk` as a custom domain on the Pages project, and point its DNS record at Pages
      (proxied) at the agreed switch time.

---

## 11. No noindex and no password on www

Run once www is served by this build:

```sh
# 200 and no X-Robots-Tag header. A 401/403, or a redirect to *.cloudflareaccess.com, means a password or Access gate.
curl -sI https://www.karmodint.co.uk/ | grep -iE '^(HTTP|x-robots-tag|location)'
curl -sI https://www.karmodint.co.uk/portable-cabin/ | grep -iE '^(HTTP|x-robots-tag|location)'

# The robots meta must read "index, follow", never "noindex"
curl -s https://www.karmodint.co.uk/ | grep -io '<meta[^>]*robots[^>]*>'

# robots.txt allows crawling and names the new sitemap
curl -s https://www.karmodint.co.uk/robots.txt
```

- [ ] No `X-Robots-Tag` on www. The `_headers` noindex rules match only `*.pages.dev` hosts (#20).
- [ ] No Cloudflare Access application covers `www.karmodint.co.uk` or `karmodint.co.uk`
      (Zero Trust → Access → Applications).
- [ ] `robots.txt` has `Allow: /` and `Sitemap: https://www.karmodint.co.uk/sitemap.xml`.

---

## 12. One 301 for http → https and apex → www

This needs a **zone-level** rule. `_redirects` can't match on the host, and it never sees the apex. Each variant must
reach `https://www.karmodint.co.uk/...` in a **single** 301.

- [ ] Cloudflare dashboard → `karmodint.co.uk` zone → **Rules → Redirect Rules** → create a rule:
  - When incoming requests match (expression editor):
    `(http.host eq "karmodint.co.uk") or (http.host eq "www.karmodint.co.uk" and not ssl)`
  - Then: **Dynamic** URL redirect, expression `concat("https://www.karmodint.co.uk", http.request.uri.path)`,
    status **301**, **Preserve query string** on.
- [ ] The apex `karmodint.co.uk` has a **proxied** DNS record (orange cloud). Without one, the rule never runs.
- [ ] Check every variant takes exactly one hop and ends on a 200:

```sh
for url in http://karmodint.co.uk/ https://karmodint.co.uk/ http://www.karmodint.co.uk/ \
           "http://karmodint.co.uk/portable-cabin/?utm_source=test"; do
  curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}   ($url)\n" "$url"
  curl -sL -o /dev/null -w "   %{num_redirects} hop(s), ends %{http_code} at %{url_effective}\n" "$url"
done
```

Expect `301 -> https://www.karmodint.co.uk/...` and `1 hop(s), ends 200`. Two hops on `http://karmodint.co.uk/` (http →
https → www) mean another feature redirects first, e.g. **SSL/TLS → Edge Certificates → Always Use HTTPS**, or a Page
Rule. Turn that off, or fold it into this rule, and re-check.

---

## 13. Check every redirect

```sh
pnpm migration:check-redirects https://www.karmodint.co.uk
```

What the script (`scripts/migration/check-redirects.ts`) does:

- Reads the shipped redirect map (`REDIRECTS` in `shared/migration/redirects.ts`) and the Kept URLs
  (`shared/migration/keptUrls.ts`). It grows on its own as redirect groups ship.
- Requests each source twice, `/x/` and `/x`, because `_redirects` matches the trailing slash exactly and lists both
  (`docs/research/cloudflare-pages-redirects.md`). Each must answer its expected status (301, or 302 for the interim
  `/faq/` and `/cookies-policy/` rules) with the expected `Location`, without following redirects.
- Requests each target once. A target that redirects again is reported as a chain. A target that isn't a 200 is
  reported too.
- Checks that every Kept URL answers 200.
- Exits 1 and lists each failing path with what it got. GET requests only, 8 at a time.

- [ ] The first line reads `Checking 196 Redirect sources ...`, and the last reads `All ... requests passed`.
- [ ] Spot-check by hand:
  ```sh
  curl -sI https://www.karmodint.co.uk/container/ | grep -iE '^(HTTP|location)'   # 301 → /portable-cabin/
  curl -sI https://www.karmodint.co.uk/faq | grep -iE '^(HTTP|location)'          # 302 → /contact/
  curl -sI https://www.karmodint.co.uk/no-such-page/ | grep -iE '^HTTP'          # 404
  ```

---

## 14. Googlebot not blocked by Cloudflare

A curl with a Googlebot user agent proves nothing: Cloudflare can tell a spoofed bot from the real one. Test with
Google's own fetcher instead.

- [ ] **Security → Bots**: Bot Fight Mode is off, or Super Bot Fight Mode has **Verified bots: Allow**. "Definitely
      automated" must not block or challenge verified bots.
- [ ] **Security → WAF → Custom rules / Rate limiting rules**: no rule blocks or challenges Googlebot. Any broad
      block or challenge rule must exclude verified bots: add `and not cf.client.bot` to its expression.
- [ ] **Security → Settings**: Security Level isn't "I'm Under Attack", and no country block covers the US, where
      Googlebot mostly crawls from.
- [ ] **Security → Events**, filtered to the last 24 h with **Verified bot category: Search Engine Crawler**: no
      Block or Challenge actions against Googlebot.
- [ ] Search Console → **URL Inspection** → **Test live URL** on `/`, one Kept URL (`/portable-cabin/`), one
      Solution page and `/sitemap.xml`: "URL is available to Google", and the fetch shows HTTP 200.

---

## 15. Submit the new sitemap

```sh
# Every <loc> is https://www.karmodint.co.uk/... and ends in "/" (ADR-003)
curl -s https://www.karmodint.co.uk/sitemap.xml | grep -o '<loc>[^<]*</loc>' | head
curl -s https://www.karmodint.co.uk/sitemap.xml | grep -o '<loc>[^<]*</loc>' \
  | grep -vE '^<loc>https://www\.karmodint\.co\.uk/([^<]*/)?</loc>$'   # expect no output
```

- [ ] Search Console, property `karmodint.co.uk` (Domain property, or URL-prefix `https://www.karmodint.co.uk/`)
      → **Sitemaps** → submit `https://www.karmodint.co.uk/sitemap.xml`. Status should read "Success".
- [ ] Remove any Legacy sitemap in that report that now 404s.
- [ ] Optional: request indexing for `/` and the Kept URLs in URL Inspection.

---

## 16. Watch the 404 report for two weeks

Check on days 1, 3, 7, 10 and 14 after launch.

- [ ] Search Console → **Indexing → Pages** → "Not found (404)". Also check **Page with redirect** for anything
      unexpected.
- [ ] For each Legacy URL in the 404 list that had traffic or links:
  1. Add the redirect: put the source (`/` form) in a group's `from` in `shared/migration/redirects.ts`, or add a group
     for a new target. Add the same row to `docs/plans/2026-10-06-uk-migration-redirects.tsv`.
     `tests/migration/redirectMap.spec.ts` keeps the two in step and rejects chains or Kept URL sources. Update its
     rule counts.
  2. `pnpm test`, merge, deploy.
  3. `pnpm migration:check-redirects https://www.karmodint.co.uk`. The new source is included automatically.
  4. Search Console → the 404 issue → **Validate fix**.
- [ ] Re-run `pnpm migration:check-redirects https://www.karmodint.co.uk` after every deploy in the window.
- [ ] Day 14: no new Legacy 404s. The interim 302s (`/faq/`, `/cookies-policy/` → `/contact/`) stay until the FAQ and
      Cookies Policy pages ship (#18).
