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
