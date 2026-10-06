import { describe, expect, it } from "vitest";
import { PAGE_SEO, solutionPageSeo } from "~/constants/pageSeo";

// UK migration design, "Titles and descriptions": Kept URLs carry the Legacy Site's <title> and
// meta description word for word; every other page uses `{Thing} for Sale UK | Karmod`.
describe("page titles and descriptions", () => {
  it("gives the home page the Legacy home title and description", () => {
    expect(PAGE_SEO.home).toEqual({
      title: "Karmod International | Portable Buildings and Cabins",
      description:
        "Leading the Future of Modular Construction. Discover Innovative Solutions at Karmod International. Build with Confidence.",
    });
  });

  it("gives /products/ the Legacy products title and description", () => {
    expect(PAGE_SEO.products).toEqual({
      title: "Innovative Solutions: Discover Karmod International's Products",
      description:
        "Explore Karmod International's cutting-edge products, designed to address diverse needs. Elevate your projects with our innovative solutions.",
    });
  });

  it.each([
    ["solutions", "Modular Building Solutions for Sale UK | Karmod"],
    ["gallery", "Portable Cabins and Modular Buildings for Sale UK | Karmod"],
    ["about", "Modular and Prefabricated Buildings for Sale UK | Karmod"],
    ["contact", "Portable Cabins, Kiosks and Gatehouses for Sale UK | Karmod"],
  ] as const)("gives %s the commercial title", (page, title) => {
    expect(PAGE_SEO[page].title).toBe(title);
  });

  it.each(["solutions", "gallery", "about", "contact"] as const)(
    "gives %s a commercial description that says what is for sale in the UK",
    (page) => {
      const { description } = PAGE_SEO[page];
      expect(description).toMatch(/ for sale UK/);
      expect(description.length).toBeLessThanOrEqual(160);
    },
  );
});

describe("solution page titles and descriptions", () => {
  it("uses the commercial pattern when Studio has no SEO title", () => {
    const seo = solutionPageSeo({ name: "Site Offices" });

    expect(seo.title).toBe("Site Offices for Sale UK | Karmod");
    expect(seo.description).toMatch(/^Site Offices for sale UK from Karmod\./);
    expect(seo.description.length).toBeLessThanOrEqual(160);
  });

  it("keeps the commercial description within 160 characters for long Solution names", () => {
    const name = "Car Park, Valet and Weighbridge Cabins";
    expect(solutionPageSeo({ name }).description.length).toBeLessThanOrEqual(160);
  });

  it("lets the Studio SEO title and description override the pattern", () => {
    const seo = solutionPageSeo({
      name: "Site Offices",
      seo: { metaTitle: "Site Cabins Prices for Sale", metaDescription: "Studio description." },
    });

    expect(seo).toEqual({ title: "Site Cabins Prices for Sale", description: "Studio description." });
  });

  it("falls back per field when Studio sets only one of them", () => {
    expect(solutionPageSeo({ name: "Site Offices", seo: { metaTitle: "Studio title" } })).toEqual({
      title: "Studio title",
      description: solutionPageSeo({ name: "Site Offices" }).description,
    });
    expect(
      solutionPageSeo({ name: "Site Offices", seo: { metaDescription: "Studio description." } }).title,
    ).toBe("Site Offices for Sale UK | Karmod");
  });

  it("ignores a blank Studio title", () => {
    expect(solutionPageSeo({ name: "Site Offices", seo: { metaTitle: "  " } }).title).toBe(
      "Site Offices for Sale UK | Karmod",
    );
  });
});
