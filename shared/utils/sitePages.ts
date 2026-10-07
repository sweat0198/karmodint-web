/**
 * The site's static pages: one entry per page file in `app/pages/` with a fixed address. The prerender list
 * (`nuxt.config.ts`), each page's canonical (`canonicalPath: STATIC_PAGES.<key>.path`) and the sitemap all read
 * this list, so a page's `<loc>` and its canonical cannot drift apart.
 *
 * `sitemap: false` marks a page that sets `noindex` (the quote flow and the customizer): it is built but never listed.
 * Pages with addresses from Sanity (Solutions, Product Lines) are listed from the dataset (`server/utils/sitemap.ts`).
 */

export interface SitemapHints {
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: string;
}

export interface StaticPage {
  path: string;
  sitemap: SitemapHints | false;
}

export const STATIC_PAGES = {
  home: { path: "/", sitemap: { changefreq: "weekly", priority: "1.0" } },
  products: { path: "/products/", sitemap: { changefreq: "daily", priority: "0.9" } },
  solutions: { path: "/solutions/", sitemap: { changefreq: "weekly", priority: "0.9" } },
  gallery: { path: "/gallery/", sitemap: { changefreq: "weekly", priority: "0.8" } },
  about: { path: "/about/", sitemap: { changefreq: "monthly", priority: "0.8" } },
  contact: { path: "/contact/", sitemap: { changefreq: "monthly", priority: "0.8" } },
  privacyPolicy: { path: "/privacy-policy/", sitemap: { changefreq: "yearly", priority: "0.3" } },
  customize: { path: "/customize/", sitemap: false },
  quote: { path: "/quote/", sitemap: false },
} as const satisfies Record<string, StaticPage>;

/** Every static page path, indexable or not: all of them are prerendered. */
export const STATIC_PAGE_PATHS: string[] = Object.values(STATIC_PAGES).map((page) => page.path);

/** A Solution page's path, e.g. `/solutions/site-offices/`. */
export function solutionPagePath(slug: string): string {
  return `/solutions/${slug}/`;
}
