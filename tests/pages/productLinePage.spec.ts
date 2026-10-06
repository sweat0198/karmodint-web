// @vitest-environment jsdom

import { flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { defineComponent, h, onErrorCaptured, ref, Suspense } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queries = vi.fn();
const seoMeta = vi.fn();
const head = vi.fn();
let routePath = "/grp-kiosk-cabin/";

vi.mock("#imports", () => ({
  useSanityQuery: async (query: string, params?: Record<string, unknown>) => ({
    data: ref(queries(query, params)),
  }),
  createError: (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
  useRuntimeConfig: () => ({
    public: {
      siteUrl: "https://www.karmodint.co.uk",
      sanityProjectId: "proj",
      sanityDataset: "production",
    },
  }),
  useSeoMeta: (input: unknown) => seoMeta(input),
  useHead: (input: unknown) => head(input),
}));

vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRoute: () => ({ path: routePath }),
}));

// The cards pull in the quote store; the page only decides which card each product gets.
vi.mock("~/components/ProductCard.vue", () => ({
  default: defineComponent({ name: "ProductCard", props: ["card"], render: () => h("product-card-stub") }),
}));
vi.mock("~/components/PortableContainerCard.vue", () => ({
  default: defineComponent({ name: "PortableContainerCard", props: ["card"], render: () => h("portable-card-stub") }),
}));

const { default: ProductLinePage } = await import("~/pages/[...path].vue");

const text = (value: string, extra: Record<string, unknown> = {}) => ({
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", text: value, marks: [] }],
  ...extra,
});

const render = (ref: string) => ({
  _key: "left-diagonal",
  view: "left-diagonal",
  alt: "render",
  asset: { _type: "reference", _ref: ref },
});

const grpKiosk = {
  _id: "prod-grp",
  name: "GRP Kiosk",
  slug: "grp-kiosk",
  categories: [
    {
      _id: "category-cabin-grp",
      name: "GRP",
      slug: "grp",
      parent: { _id: "category-cabin", name: "Gatehouses & Kiosks", slug: "cabin" },
    },
  ],
  representativeImages: [],
  sizes: [
    { _key: "150x150", label: "1.5 × 1.5", lengthM: 1.5, widthM: 1.5, price: 2450, isPoa: false, thumbnail: render("image-a-900x600-png"), fallbackThumbnail: null, images: [] },
    { _key: "390x1230", label: "3.9 × 12.3", lengthM: 12.3, widthM: 3.9, price: 0, isPoa: true, thumbnail: render("image-b-900x600-png"), fallbackThumbnail: null, images: [] },
  ],
};

const grpLine = {
  _id: "productLine-grp-kiosk-cabin",
  name: "GRP Kiosk Cabin",
  path: "/grp-kiosk-cabin/",
  parent: null,
  category: { _id: "category-cabin-grp", slug: "grp", parentSlug: "cabin", childIds: [] },
  description: "GRP kiosks and cabins.",
  coverImage: { alt: "A GRP kiosk", asset: { _type: "reference", _ref: "image-cover-1376x768-jpg" } },
  body: [text("Transparent Quality: GRP Kiosk Prices in the UK", { style: "h2" }), text("Body copy.")],
  faqs: [{ _key: "q3", question: "What is a GRP kiosk?", answer: [text("A prefabricated structure.")] }],
  seo: {
    metaTitle: "GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int",
    metaDescription: "Legacy meta description.",
  },
};

const hubLine = {
  _id: "productLine-modular-buildings",
  name: "Modular Buildings",
  path: "/modular-buildings/",
  parent: null,
  category: null,
  description: "Hub copy.",
  coverImage: { alt: "Modular", asset: { _type: "reference", _ref: "image-hub-1376x768-jpg" } },
  body: [text("Hub body.")],
  faqs: [],
};

function serve(lines: Array<Record<string, any>>, products: unknown[] = []) {
  queries.mockImplementation((query: string, params?: Record<string, unknown>) => {
    if (query.includes('_type == "productLine"')) {
      return lines.find((line) => line.path === params?.path) ?? null;
    }
    if (query.includes('_type == "product"')) return products;
    throw new Error(`Unexpected query: ${query}`);
  });
}

async function mountAt(path: string) {
  routePath = path;
  const errors: unknown[] = [];
  const Host = defineComponent({
    setup() {
      onErrorCaptured((error) => {
        errors.push(error);
        return false;
      });
      return () => h(Suspense, null, { default: () => h(ProductLinePage) });
    },
  });
  const wrapper = mount(Host, {
    global: {
      stubs: { NuxtLink: RouterLinkStub },
    },
  });
  await flushPromises();
  return { wrapper, errors };
}

function jsonLd(): Array<Record<string, any>> {
  const config = head.mock.calls.at(-1)?.[0];
  return config.script.map((script: { children: string }) => JSON.parse(script.children));
}

describe("Product Line page", () => {
  beforeEach(() => {
    queries.mockReset();
    seoMeta.mockClear();
    head.mockClear();
  });

  it("renders a Product Line with its category's products, copy and FAQs", async () => {
    serve([grpLine], [grpKiosk]);
    const { wrapper } = await mountAt("/grp-kiosk-cabin/");

    expect(wrapper.get("h1").text()).toBe("GRP Kiosk Cabin");
    expect(wrapper.text()).toContain("GRP kiosks and cabins.");
    expect(wrapper.findAll("product-card-stub")).toHaveLength(2);
    const catalogueLink = wrapper
      .findAllComponents(RouterLinkStub)
      .find((link) => link.text().includes("View all in catalogue"));
    expect(catalogueLink?.props("to")).toBe("/products/?category=cabin&subcategory=grp");
    expect(wrapper.text()).toContain("Transparent Quality: GRP Kiosk Prices in the UK");
    expect(wrapper.text()).toContain("GRP Kiosk Cabin Frequently Asked Questions");
    expect(wrapper.get("details").text()).toContain("A prefabricated structure.");

    // The grid lists the category and its subcategories.
    expect(queries).toHaveBeenCalledWith(expect.stringContaining('_type == "product"'), {
      categoryIds: ["category-cabin-grp"],
    });
  });

  it("uses the Legacy title and description, with a canonical matching its path", async () => {
    serve([grpLine], [grpKiosk]);
    await mountAt("/grp-kiosk-cabin");

    expect(seoMeta).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "GRP Kiosk Cabin for Sale UK from Manufacturer | Karmod Int",
        description: "Legacy meta description.",
        ogUrl: "https://www.karmodint.co.uk/grp-kiosk-cabin/",
      }),
    );
    expect(head.mock.calls.at(-1)?.[0].link).toEqual([
      { rel: "canonical", href: "https://www.karmodint.co.uk/grp-kiosk-cabin/" },
    ]);
  });

  it("declares BreadcrumbList, an ItemList without offers on POA sizes, and FAQPage", async () => {
    serve([grpLine], [grpKiosk]);
    await mountAt("/grp-kiosk-cabin/");

    const [breadcrumbs, itemList, faqPage] = jsonLd();
    expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
    expect(breadcrumbs.itemListElement.map((item: any) => item.item)).toEqual([
      "https://www.karmodint.co.uk/",
      "https://www.karmodint.co.uk/grp-kiosk-cabin/",
    ]);
    expect(itemList["@type"]).toBe("ItemList");
    expect(itemList.itemListElement).toHaveLength(2);
    expect(itemList.itemListElement[0].item.offers.price).toBe(2450);
    expect(itemList.itemListElement[1].item).not.toHaveProperty("offers");
    expect(faqPage).toMatchObject({
      "@type": "FAQPage",
      mainEntity: [{ name: "What is a GRP kiosk?", acceptedAnswer: { text: "A prefabricated structure." } }],
    });
  });

  it("renders a hub Product Line with no category without a grid, ItemList or FAQPage", async () => {
    serve([hubLine]);
    const { wrapper } = await mountAt("/modular-buildings/");

    expect(wrapper.get("h1").text()).toBe("Modular Buildings");
    expect(wrapper.text()).not.toContain("Products in this range");
    expect(wrapper.text()).not.toContain("View all in catalogue");
    expect(wrapper.find("details").exists()).toBe(false);
    expect(queries).not.toHaveBeenCalledWith(expect.stringContaining('_type == "product"'), expect.anything());
    expect(jsonLd().map((schema) => schema["@type"])).toEqual(["BreadcrumbList"]);
  });

  it("builds breadcrumbs through the parent chain", async () => {
    serve([
      {
        ...hubLine,
        name: "Steel Cabin",
        path: "/portable-cabin/steel-cabin/",
        parent: { name: "Portable Cabin", path: "/portable-cabin/", parent: null },
      },
    ]);
    const { wrapper } = await mountAt("/portable-cabin/steel-cabin/");

    const nav = wrapper.get('nav[aria-label="Breadcrumb"]');
    expect(nav.findAll("a, span").map((crumb) => crumb.text())).toEqual([
      "Home",
      "Portable Cabin",
      "Steel Cabin",
    ]);
    expect(jsonLd()[0].itemListElement.map((item: any) => item.item)).toEqual([
      "https://www.karmodint.co.uk/",
      "https://www.karmodint.co.uk/portable-cabin/",
      "https://www.karmodint.co.uk/portable-cabin/steel-cabin/",
    ]);
  });

  it("404s a path no Product Line holds", async () => {
    serve([grpLine]);
    const { errors } = await mountAt("/not-a-product-line/");
    expect(errors[0]).toMatchObject({ statusCode: 404 });
  });
});
