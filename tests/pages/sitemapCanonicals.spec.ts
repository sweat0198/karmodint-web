import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { renderSitemapXml, sitemapEntries } from "~~/server/utils/sitemap";
import { STATIC_PAGES } from "~~/shared/utils/sitePages";

// Every sitemap <loc> must equal the canonical its page emits. The page side is read from source (which
// expression each page passes as `canonicalPath`) and run through the real useAppSeo; the sitemap side is the
// real renderer.

const SITE_URL = "https://www.karmodint.co.uk";
const head = vi.fn();

vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({ public: { siteUrl: SITE_URL } }),
  useSeoMeta: () => undefined,
  useHead: (input: unknown) => head(input),
}));

const { useAppSeo } = await import("~/composables/useAppSeo");

function canonicalFor(canonicalPath: string): string {
  head.mockClear();
  useAppSeo().setPageSeo({ title: "t", description: "d", canonicalPath });
  return head.mock.calls[0]![0].link[0].href;
}

function sitemapLocs(documents = { solutionSlugs: [] as string[], productLinePaths: [] as string[] }): string[] {
  const xml = renderSitemapXml(SITE_URL, sitemapEntries(documents), "2026-10-07");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
}

const PAGES_DIR = path.resolve(process.cwd(), "app/pages");

function pageSource(page: string): string {
  return fs.readFileSync(path.join(PAGES_DIR, page), "utf-8");
}

function setPageSeoCall(page: string): string {
  const source = pageSource(page);
  const start = source.indexOf("setPageSeo({");
  expect(start, `${page} calls setPageSeo`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf("\n})", start));
}

const STATIC_PAGE_FILES: Record<keyof typeof STATIC_PAGES, string> = {
  home: "index.vue",
  products: "products/index.vue",
  solutions: "solutions/index.vue",
  gallery: "gallery.vue",
  about: "about.vue",
  contact: "contact.vue",
  privacyPolicy: "privacy-policy.vue",
  customize: "customize/index.vue",
  quote: "quote.vue",
};

function listPages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listPages(full);
    return entry.name.endsWith(".vue") ? [path.relative(PAGES_DIR, full)] : [];
  });
}

describe("static pages", () => {
  it("has a STATIC_PAGES entry for every page file with a fixed address", () => {
    const fixed = listPages(PAGES_DIR).filter((page) => !page.includes("["));

    expect(fixed.sort()).toEqual(Object.values(STATIC_PAGE_FILES).sort());
  });

  it.each(Object.entries(STATIC_PAGE_FILES))("%s page takes its canonical from STATIC_PAGES", (key, page) => {
    expect(setPageSeoCall(page)).toContain(`canonicalPath: STATIC_PAGES.${key}.path,`);
  });

  it.each(Object.entries(STATIC_PAGE_FILES))("%s page is noindex exactly when the sitemap leaves it out", (key, page) => {
    const listed = STATIC_PAGES[key as keyof typeof STATIC_PAGES].sitemap !== false;

    expect(setPageSeoCall(page).includes("noindex: true")).toBe(!listed);
  });

  it("lists each indexable static page at the canonical its page emits", () => {
    const expected = Object.values(STATIC_PAGES)
      .filter((page) => page.sitemap !== false)
      .map((page) => canonicalFor(page.path));

    expect(sitemapLocs()).toEqual(expected);
    expect(expected).toContain("https://www.karmodint.co.uk/privacy-policy/");
    expect(expected).not.toContain("https://www.karmodint.co.uk/quote/");
    expect(expected).not.toContain("https://www.karmodint.co.uk/customize/");
  });
});

describe("Solution pages", () => {
  it("lists a Solution at the canonical solutions/[slug].vue emits for it", () => {
    const call = setPageSeoCall("solutions/[slug].vue");
    const template = call.match(/canonicalPath: `([^`]+)`,/)?.[1];
    expect(template, "solutions/[slug].vue passes a template-literal canonicalPath").toBeDefined();

    const pagePath = template!.replace("${solution.value.slug}", "site-offices");
    expect(sitemapLocs({ solutionSlugs: ["site-offices"], productLinePaths: [] })).toContain(canonicalFor(pagePath));
    expect(canonicalFor(pagePath)).toBe("https://www.karmodint.co.uk/solutions/site-offices/");
  });

  it("follows the Studio noindex flag the sitemap query filters on", () => {
    expect(setPageSeoCall("solutions/[slug].vue")).toContain("noindex: solution.value.seo?.noIndex,");
  });
});

describe("Product Line pages", () => {
  it("lists a Product Line at the canonical [...path].vue emits for it", () => {
    expect(setPageSeoCall("[...path].vue")).toContain("canonicalPath: line.value.path,");

    for (const linePath of ["/portable-cabin/steel-cabin/", "/panel-cabin"]) {
      expect(sitemapLocs({ solutionSlugs: [], productLinePaths: [linePath] })).toContain(canonicalFor(linePath));
    }
  });

  it("follows the Studio noindex flag the sitemap query filters on", () => {
    expect(setPageSeoCall("[...path].vue")).toContain("noindex: line.value.seo?.noIndex,");
  });
});
