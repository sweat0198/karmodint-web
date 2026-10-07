import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Directories in the static output that hold no site pages. */
const NOT_PAGES = new Set(["_nuxt", "api", "studio"]);

interface PageHead {
  canonical?: string;
  noindex: boolean;
}

function attributes(tag: string): Record<string, string> {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1]!.toLowerCase(), m[2]!]));
}

function readHead(html: string): PageHead {
  const tags = [...html.matchAll(/<(?:link|meta)\b[^>]*>/gi)].map((m) => attributes(m[0]));
  const canonical = tags.find((tag) => tag.rel === "canonical")?.href;
  const robots = tags.find((tag) => tag.name === "robots")?.content ?? "";
  return { canonical, noindex: /\bnoindex\b/i.test(robots) };
}

function decodeXml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Every `dir/index.html` page path in the output, `/` form. */
function builtPagePaths(publicDir: string, dir = ""): string[] {
  const here = path.join(publicDir, dir);
  const own = existsSync(path.join(here, "index.html")) ? [`/${dir}${dir ? "/" : ""}`] : [];
  const nested = readdirSync(here, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !(dir === "" && NOT_PAGES.has(entry.name)))
    .flatMap((entry) => builtPagePaths(publicDir, dir ? `${dir}/${entry.name}` : entry.name));
  return [...own, ...nested];
}

function pageHead(publicDir: string, pagePath: string): PageHead {
  return readHead(readFileSync(path.join(publicDir, pagePath, "index.html"), "utf8"));
}

/**
 * Checks the built sitemap against the built pages (UK migration design, "Sitemap"; ADR-003). Each `<loc>` must
 * end in `/`, be a built page, carry that page's own canonical, and not be noindex. Each built page that is
 * indexable and canonical to itself must be listed. Returns one message per problem.
 */
export function findSitemapProblems(publicDir: string, sitemapXml: string): string[] {
  const locs = [...sitemapXml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => decodeXml(m[1]!.trim()));
  const problems: string[] = [];

  for (const loc of locs) {
    const pagePath = new URL(loc).pathname;
    if (!pagePath.endsWith("/")) {
      problems.push(`${loc}: <loc> does not end in /`);
      continue;
    }
    const file = path.join(pagePath.slice(1), "index.html");
    if (!existsSync(path.join(publicDir, file))) {
      problems.push(`${loc}: no ${file} in the build`);
      continue;
    }
    const head = pageHead(publicDir, pagePath);
    if (head.canonical !== loc) problems.push(`${loc}: page canonical is ${head.canonical ?? "missing"}`);
    if (head.noindex) problems.push(`${loc}: page is noindex`);
  }

  const listed = new Set(locs.map((loc) => new URL(loc).pathname));
  for (const pagePath of builtPagePaths(publicDir)) {
    if (listed.has(pagePath)) continue;
    const head = pageHead(publicDir, pagePath);
    if (head.noindex || !head.canonical || new URL(head.canonical).pathname !== pagePath) continue;
    problems.push(`${head.canonical}: indexable page missing from the sitemap`);
  }

  return problems;
}

/**
 * Checks every built page's canonical (UK migration design, "Testing"; ADR-003): it must be the page's own address
 * on `siteUrl`, so it ends in `/`. Covers pages the sitemap leaves out (noindex ones such as `/quote/`) too. The
 * 404 page is `404.html`, not a `dir/index.html` page, so it is not checked. Returns one message per problem.
 */
export function findCanonicalProblems(publicDir: string, siteUrl: string): string[] {
  const origin = new URL(siteUrl).origin;
  return builtPagePaths(publicDir).sort().flatMap((pagePath) => {
    const expected = `${origin}${pagePath}`;
    const { canonical } = pageHead(publicDir, pagePath);
    return canonical === expected ? [] : [`${pagePath}: canonical is ${canonical ?? "missing"}, not ${expected}`];
  });
}
