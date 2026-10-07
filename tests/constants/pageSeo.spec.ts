import { describe, expect, it } from "vitest";
import { PAGE_SEO, productLinePageSeo, solutionPageSeo } from "~/constants/pageSeo";

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

  // Wording approved by the client on 2026-10-07 (#33). The About description drops "since 1986", as Home did (#31).
  it.each([
    [
      "solutions",
      "Modular Building Solutions for Sale UK | Karmod",
      "Modular building solutions for sale UK: Karmod cabins, kiosks and gatehouses for construction sites, events, schools and more, in the sizes you need.",
    ],
    [
      "gallery",
      "Portable Cabins and Modular Buildings for Sale UK | Karmod",
      "Portable cabins and modular buildings for sale UK, as delivered by Karmod: containers, kiosks, gatehouses and bulletproof cabins on real projects.",
    ],
    [
      "about",
      "Modular and Prefabricated Buildings for Sale UK | Karmod",
      "Modular and prefabricated buildings for sale UK from Karmod, manufacturer of portable cabins, kiosks and gatehouses. Our story and mission.",
    ],
    [
      "contact",
      "Portable Cabins, Kiosks and Gatehouses for Sale UK | Karmod",
      "Portable cabins, kiosks and gatehouses for sale UK. Contact Karmod for prices, specifications and a quote by phone, WhatsApp, email or online form.",
    ],
  ] as const)("gives %s the approved commercial title and description", (page, title, description) => {
    expect(PAGE_SEO[page]).toEqual({ title, description });
    expect(PAGE_SEO[page].description.length).toBeLessThanOrEqual(160);
  });
});

describe("privacy policy title and description", () => {
  // The Legacy /privacy-policy/ answers 404 (checked 2026-10-06), so there is no Legacy title to keep, and a policy
  // isn't for sale: it gets a plain title instead of the commercial pattern.
  it("names the page and says what the policy covers", () => {
    expect(PAGE_SEO.privacyPolicy.title).toBe("Privacy Policy | Karmod International");
    expect(PAGE_SEO.privacyPolicy.description).toBe(
      "How Karmod International Ltd collects, uses, stores and protects your personal data when you enquire, request a quotation or buy from us.",
    );
  });
});

describe("solution page titles and descriptions", () => {
  it("uses the commercial pattern when Studio has no SEO title", () => {
    const seo = solutionPageSeo({ name: "Site Offices" });

    expect(seo).toEqual({
      title: "Site Offices for Sale UK | Karmod",
      description:
        "Site Offices for sale UK from Karmod. Pick the units and sizes you need, configure them online and request a quote.",
    });
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

describe("productLinePageSeo", () => {
  it("uses the Legacy title and description a Kept URL carries in Studio, word for word", () => {
    expect(
      productLinePageSeo({
        name: "GRP Kiosk Cabin",
        description: "Short description.",
        seo: {
          metaTitle: "GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int",
          metaDescription: "Legacy meta description.",
        },
      }),
    ).toEqual({
      title: "GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int",
      description: "Legacy meta description.",
    });
  });

  it("falls back to the commercial title and the page's own description", () => {
    expect(productLinePageSeo({ name: "Steel Cabin", description: "Steel cabins.", seo: { metaTitle: " " } })).toEqual({
      title: "Steel Cabin for Sale UK | Karmod",
      description: "Steel cabins.",
    });
  });
});
