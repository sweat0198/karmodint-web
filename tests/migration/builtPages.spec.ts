import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findMissingPages } from "../../modules/legacy-redirects/builtPages";

let outputDir: string;

function buildPage(page: string) {
  mkdirSync(path.join(outputDir, page), { recursive: true });
  writeFileSync(path.join(outputDir, page, "index.html"), "<!doctype html>");
}

beforeEach(() => {
  outputDir = mkdtempSync(path.join(tmpdir(), "built-pages-"));
});

afterEach(() => {
  rmSync(outputDir, { recursive: true, force: true });
});

describe("findMissingPages", () => {
  it("finds nothing missing when every page was built as dir/index.html", () => {
    buildPage("");
    buildPage("contact");
    buildPage("solutions/site-offices");

    expect(findMissingPages(outputDir, ["/", "/contact/", "/solutions/site-offices/"])).toEqual([]);
  });

  it("lists each page that wasn't built", () => {
    buildPage("contact");
    buildPage("portable-cabin");

    expect(
      findMissingPages(outputDir, ["/contact/", "/privacy-policy/", "/portable-cabin/steel-cabin/", "/"]),
    ).toEqual(["/privacy-policy/", "/portable-cabin/steel-cabin/", "/"]);
  });

  it("checks the page behind a query string or hash", () => {
    buildPage("products");

    expect(findMissingPages(outputDir, ["/products/?category=cabin&subcategory=metro-city", "/contact/#map"])).toEqual([
      "/contact/#map",
    ]);
  });

  it("does not count a directory without index.html as a page", () => {
    mkdirSync(path.join(outputDir, "gallery"));

    expect(findMissingPages(outputDir, ["/gallery/"])).toEqual(["/gallery/"]);
  });
});
