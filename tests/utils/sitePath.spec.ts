import { describe, expect, it } from "vitest";
import { isSameSitePath, isSitePath, toAbsoluteSiteUrl, toSitePath } from "~~/shared/utils/sitePath";

// ADR-003: every public URL ends in `/`.
describe("toSitePath", () => {
  it.each([
    ["/", "/"],
    ["", "/"],
    ["/products", "/products/"],
    ["/products/", "/products/"],
    ["products", "/products/"],
    ["/solutions/site-offices", "/solutions/site-offices/"],
    ["/portable-cabin/steel-cabin/", "/portable-cabin/steel-cabin/"],
  ])("%j -> %j", (input, expected) => {
    expect(toSitePath(input)).toBe(expected);
  });

  it("puts the slash before the query string and hash", () => {
    expect(toSitePath("/products?category=cabin&subcategory=grp")).toBe(
      "/products/?category=cabin&subcategory=grp",
    );
    expect(toSitePath("/contact#map-section")).toBe("/contact/#map-section");
    expect(toSitePath("/products/?category=cabin")).toBe("/products/?category=cabin");
  });

  it("leaves file paths alone", () => {
    expect(toSitePath("/sitemap.xml")).toBe("/sitemap.xml");
    expect(toSitePath("/images/karmod-logo.png")).toBe("/images/karmod-logo.png");
  });
});

describe("toAbsoluteSiteUrl", () => {
  it("joins the site origin and a slash-ending path", () => {
    expect(toAbsoluteSiteUrl("https://www.karmodint.co.uk", "/products")).toBe(
      "https://www.karmodint.co.uk/products/",
    );
    expect(toAbsoluteSiteUrl("https://www.karmodint.co.uk/", "/about/")).toBe(
      "https://www.karmodint.co.uk/about/",
    );
  });

  it("gives the home page as the origin plus `/`", () => {
    expect(toAbsoluteSiteUrl("https://www.karmodint.co.uk", "/")).toBe("https://www.karmodint.co.uk/");
    expect(toAbsoluteSiteUrl("https://www.karmodint.co.uk/", "")).toBe("https://www.karmodint.co.uk/");
  });
});

describe("isSitePath", () => {
  it("accepts paths already in public form", () => {
    for (const path of ["/", "/products/", "/products/?category=cabin", "/sitemap.xml", "/products/_payload.json"]) {
      expect(isSitePath(path), path).toBe(true);
    }
  });

  it("rejects slashless page paths", () => {
    for (const path of ["/products", "/solutions/site-offices", "/products?category=cabin", "/about-contact"]) {
      expect(isSitePath(path), path).toBe(false);
    }
  });
});

describe("isSameSitePath", () => {
  it("treats the slash and slashless forms of a path as the same page", () => {
    expect(isSameSitePath("/quote/", "/quote")).toBe(true);
    expect(isSameSitePath("/quote", "/quote/")).toBe(true);
    expect(isSameSitePath("/", "/")).toBe(true);
  });

  it("tells different pages apart", () => {
    expect(isSameSitePath("/products/", "/products/grp")).toBe(false);
    expect(isSameSitePath("/solutions/", "/")).toBe(false);
  });
});
