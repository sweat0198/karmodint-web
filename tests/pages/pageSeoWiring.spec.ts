import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Each static page takes its title and description from PAGE_SEO (asserted in
// tests/constants/pageSeo.spec.ts) rather than its own literal.
function setPageSeoCall(page: string): string {
  const source = fs.readFileSync(path.resolve(process.cwd(), "app/pages", page), "utf-8");
  const start = source.indexOf("setPageSeo({");
  expect(start, `${page} calls setPageSeo`).toBeGreaterThan(-1);
  return source.slice(start, source.indexOf("canonicalPath", start));
}

describe("static page SEO wiring", () => {
  it.each([
    ["index.vue", "home"],
    ["products/index.vue", "products"],
    ["solutions/index.vue", "solutions"],
    ["gallery.vue", "gallery"],
    ["about.vue", "about"],
    ["contact.vue", "contact"],
  ])("%s uses PAGE_SEO.%s", (page, key) => {
    const call = setPageSeoCall(page);

    expect(call).toContain(`...PAGE_SEO.${key},`);
    expect(call).not.toMatch(/\btitle:/);
    expect(call).not.toMatch(/\bdescription:/);
  });

  it("solutions/[slug].vue uses solutionPageSeo", () => {
    expect(setPageSeoCall("solutions/[slug].vue")).toContain("...solutionPageSeo(solution.value),");
  });
});
