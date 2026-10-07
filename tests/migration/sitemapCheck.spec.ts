import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findSitemapProblems } from "../../modules/sitemap-check/checkSitemap";

const SITE = "https://www.karmodint.co.uk";
let publicDir: string;

function buildPage(page: string, head: { canonical?: string; robots?: string }) {
  const tags = [
    head.robots ? `<meta name="robots" content="${head.robots}">` : "",
    head.canonical ? `<link rel="canonical" href="${head.canonical}">` : "",
  ].join("");
  mkdirSync(path.join(publicDir, page), { recursive: true });
  writeFileSync(path.join(publicDir, page, "index.html"), `<!doctype html><html><head>${tags}</head></html>`);
}

function indexablePage(page: string) {
  buildPage(page, { canonical: `${SITE}/${page}${page ? "/" : ""}`, robots: "index, follow" });
}

function sitemap(...locs: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${locs.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join("\n")}
</urlset>`;
}

beforeEach(() => {
  publicDir = mkdtempSync(path.join(tmpdir(), "sitemap-check-"));
});

afterEach(() => {
  rmSync(publicDir, { recursive: true, force: true });
});

describe("findSitemapProblems", () => {
  it("passes when every <loc> is a built page whose canonical is that <loc>, and every indexable page is listed", () => {
    indexablePage("");
    indexablePage("portable-cabin/steel-cabin");
    buildPage("quote", { canonical: `${SITE}/quote/`, robots: "noindex, nofollow" });

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/`, `${SITE}/portable-cabin/steel-cabin/`))).toEqual([]);
  });

  it("flags a <loc> with no built page", () => {
    indexablePage("");

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/`, `${SITE}/panel-cabin/`))).toEqual([
      `${SITE}/panel-cabin/: no panel-cabin/index.html in the build`,
    ]);
  });

  it("flags a <loc> whose page declares a different canonical", () => {
    buildPage("about", { canonical: `${SITE}/about`, robots: "index, follow" });

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/about/`))).toEqual([
      `${SITE}/about/: page canonical is ${SITE}/about`,
    ]);
  });

  it("flags a <loc> whose page has no canonical", () => {
    buildPage("about", { robots: "index, follow" });

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/about/`))).toEqual([`${SITE}/about/: page canonical is missing`]);
  });

  it("flags a listed page that is noindex", () => {
    buildPage("customize", { canonical: `${SITE}/customize/`, robots: "noindex, nofollow" });

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/customize/`))).toEqual([
      `${SITE}/customize/: page is noindex`,
    ]);
  });

  it("flags a <loc> without the trailing slash", () => {
    indexablePage("gallery");

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/gallery`))).toContain(
      `${SITE}/gallery: <loc> does not end in /`,
    );
  });

  it("flags a built indexable page missing from the sitemap", () => {
    indexablePage("");
    indexablePage("solutions/site-offices");

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/`))).toEqual([
      `${SITE}/solutions/site-offices/: indexable page missing from the sitemap`,
    ]);
  });

  it("ignores the Studio build", () => {
    indexablePage("");
    buildPage("studio", {});

    expect(findSitemapProblems(publicDir, sitemap(`${SITE}/`))).toEqual([]);
  });
});
