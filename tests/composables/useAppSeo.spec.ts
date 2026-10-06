import { beforeEach, describe, expect, it, vi } from "vitest";

const seoMeta = vi.fn();
const head = vi.fn();

vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({ public: { siteUrl: "https://www.karmodint.co.uk/" } }),
  useSeoMeta: (input: unknown) => seoMeta(input),
  useHead: (input: unknown) => head(input),
}));

const { useAppSeo } = await import("~/composables/useAppSeo");

// ADR-003: canonicals, og:url and structured-data URLs all end in `/`.
describe("useAppSeo", () => {
  beforeEach(() => {
    seoMeta.mockClear();
    head.mockClear();
  });

  it("gives canonical and og:url the `/`-ending page URL", () => {
    useAppSeo().setPageSeo({ title: "Products", description: "d", canonicalPath: "/products" });

    expect(head).toHaveBeenCalledWith(
      expect.objectContaining({
        link: [{ rel: "canonical", href: "https://www.karmodint.co.uk/products/" }],
      }),
    );
    expect(seoMeta).toHaveBeenCalledWith(
      expect.objectContaining({ ogUrl: "https://www.karmodint.co.uk/products/" }),
    );
  });

  it("gives the home page canonical as the origin plus `/`", () => {
    useAppSeo().setPageSeo({ title: "Home", description: "d", canonicalPath: "/" });

    expect(head).toHaveBeenCalledWith(
      expect.objectContaining({ link: [{ rel: "canonical", href: "https://www.karmodint.co.uk/" }] }),
    );
  });

  it("builds BreadcrumbList items at `/`-ending URLs", () => {
    const schema = useAppSeo().getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions" },
      { name: "Site Offices", path: "/solutions/site-offices" },
    ]);

    expect(schema.itemListElement.map((item) => item.item)).toEqual([
      "https://www.karmodint.co.uk/",
      "https://www.karmodint.co.uk/solutions/",
      "https://www.karmodint.co.uk/solutions/site-offices/",
    ]);
  });

  it("gives Organization and WebSite the `/`-ending home URL", () => {
    const seo = useAppSeo();

    expect(seo.getOrganizationSchema().url).toBe("https://www.karmodint.co.uk/");
    expect(seo.getWebSiteSchema().url).toBe("https://www.karmodint.co.uk/");
  });

  it("points a product offer at the `/`-ending products page", () => {
    const schema = useAppSeo().getProductSchema({ name: "GRP Kiosk", price: 1000 });

    expect(schema.offers?.url).toBe("https://www.karmodint.co.uk/products/");
  });
});

describe("getProductItemListSchema", () => {
  it("lists each product in grid order, with offers only where a price is publishable", () => {
    const schema = useAppSeo().getProductItemListSchema({
      name: "GRP Kiosk Cabin",
      description: "GRP kiosks.",
      products: [
        { name: "Kiosk 1.50m × 1.50m", price: 2450, isPoa: false },
        { name: "Kiosk 3.90m × 12.30m", price: 0, isPoa: true },
        { name: "Kiosk with no price" },
      ],
    });

    expect(schema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "GRP Kiosk Cabin",
      description: "GRP kiosks.",
    });
    expect(schema.itemListElement.map((item) => [item.position, item.item.name])).toEqual([
      [1, "Kiosk 1.50m × 1.50m"],
      [2, "Kiosk 3.90m × 12.30m"],
      [3, "Kiosk with no price"],
    ]);
    expect(schema.itemListElement[0].item.offers).toMatchObject({
      "@type": "Offer",
      price: 2450,
      priceCurrency: "GBP",
    });
    expect(schema.itemListElement[1].item).not.toHaveProperty("offers");
    expect(schema.itemListElement[2].item).not.toHaveProperty("offers");
  });
});

describe("getFaqPageSchema", () => {
  const block = (text: string, extra: Record<string, unknown> = {}) => ({
    _type: "block" as const,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span" as const, text, marks: [] }],
    ...extra,
  });

  it("builds a FAQPage whose questions and answers are the visible text", () => {
    const schema = useAppSeo().getFaqPageSchema([
      { question: "What is a GRP kiosk?", answer: [block("A prefabricated structure.")] },
      {
        question: "How to install a GRP kiosk?",
        answer: [block("Steps:"), block("Site Preparation: level it.", { listItem: "bullet" })],
      },
    ]);

    expect(schema).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a GRP kiosk?",
          acceptedAnswer: { "@type": "Answer", text: "A prefabricated structure." },
        },
        {
          "@type": "Question",
          name: "How to install a GRP kiosk?",
          acceptedAnswer: { "@type": "Answer", text: "Steps:\nSite Preparation: level it." },
        },
      ],
    });
  });

  it("is absent when there are no FAQs", () => {
    expect(useAppSeo().getFaqPageSchema([])).toBeUndefined();
    expect(useAppSeo().getFaqPageSchema(undefined)).toBeUndefined();
  });

  it("skips an entry with no question or no answer text", () => {
    const schema = useAppSeo().getFaqPageSchema([
      { question: "", answer: [block("Orphan answer.")] },
      { question: "Unanswered?", answer: [] },
    ]);
    expect(schema).toBeUndefined();
  });
});
