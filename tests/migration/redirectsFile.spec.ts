import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withRedirects } from "../../modules/legacy-redirects/redirectsFile";
import { REDIRECTS, type Redirect } from "../../shared/migration/redirects";
import { matchRedirect, parseRedirects } from "./cloudflarePages";

/** The hand-written part of `_redirects` (Studio SPA rewrites) as Nitro copies it into the build output. */
const studioRewrites = readFileSync(path.join(__dirname, "../../public/_redirects"), "utf8");
/** Nitro's cloudflare-pages preset appends this once `404.html` exists. Cloudflare rejects the 404 code and skips it. */
const nitroFallback = "/* /404.html 404";

const sample: Redirect[] = [
  { from: "/container/", to: "/portable-cabin/", status: 301 },
  { from: "/faq/", to: "/contact/", status: 302 },
  { from: "/metrocity-cabin/", to: "/products/?category=cabin&subcategory=metro-city", status: 301 },
];

describe("withRedirects", () => {
  it("answers both the slashed and the slashless request with the rule's status and target", () => {
    const { rules } = parseRedirects(withRedirects(studioRewrites, sample));

    for (const request of ["/container/", "/container"]) {
      expect(matchRedirect(rules, request), request).toMatchObject({ to: "/portable-cabin/", status: 301 });
    }
    for (const request of ["/faq/", "/faq"]) {
      expect(matchRedirect(rules, request), request).toMatchObject({ to: "/contact/", status: 302 });
    }
    expect(matchRedirect(rules, "/metrocity-cabin")).toMatchObject({
      to: "/products/?category=cabin&subcategory=metro-city",
      status: 301,
    });
  });

  it("writes exactly the given rules, each as a slashed and a slashless source", () => {
    const { rules } = parseRedirects(withRedirects("", sample));

    expect(rules.map(({ from, to, status }) => `${from} ${to} ${status}`)).toEqual([
      "/container/ /portable-cabin/ 301",
      "/container /portable-cabin/ 301",
      "/faq/ /contact/ 302",
      "/faq /contact/ 302",
      "/metrocity-cabin/ /products/?category=cabin&subcategory=metro-city 301",
      "/metrocity-cabin /products/?category=cabin&subcategory=metro-city 301",
    ]);
  });

  it("keeps the Studio rewrites working", () => {
    const { rules } = parseRedirects(withRedirects(`${studioRewrites}\n${nitroFallback}`, sample));

    expect(matchRedirect(rules, "/studio/structure")).toMatchObject({ to: "/studio/", status: 200 });
    expect(matchRedirect(rules, "/studio/structure/product")).toMatchObject({ to: "/studio/", status: 200 });
    expect(matchRedirect(rules, "/studio/intent/edit/id=abc")).toMatchObject({ to: "/studio/", status: 200 });
  });

  it("fits every shipped rule within Cloudflare's static-rule budget, ahead of the dynamic Studio rewrites", () => {
    const { rules, invalid } = parseRedirects(withRedirects(`${studioRewrites}\n${nitroFallback}`, REDIRECTS));

    expect(invalid).toEqual([nitroFallback]);
    for (const redirect of REDIRECTS) {
      for (const request of [redirect.from, redirect.from.slice(0, -1)]) {
        const match = matchRedirect(rules, request);
        expect(match, request).toMatchObject({ to: redirect.to, status: redirect.status, dynamic: false });
      }
    }
  });
});
