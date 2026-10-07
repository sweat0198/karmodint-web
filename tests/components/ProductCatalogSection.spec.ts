// @vitest-environment jsdom

import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct, CatalogSizeOption } from "~/queries/catalog";

const sanityQuery = vi.hoisted(() => ({ data: { value: [] as CatalogProduct[] } }));

vi.mock("#imports", () => ({
  useSanityQuery: () => sanityQuery,
}));

const ProductCatalogSection = (await import("~/components/ProductCatalogSection.vue")).default;

function size(key: string, lengthM: number, widthM: number): CatalogSizeOption {
  const image = {
    _key: "left-diagonal" as const,
    view: "left-diagonal" as const,
    alt: `${key} view`,
    asset: { _type: "reference" as const, _ref: `image-${key}` },
  };

  return {
    _key: key,
    label: `${lengthM}m × ${widthM}m`,
    lengthM,
    widthM,
    isPoa: false,
    price: 1000,
    thumbnail: image,
    fallbackThumbnail: image,
    images: [image],
  };
}

function product(
  id: string,
  name: string,
  sizes: CatalogSizeOption[],
  isFeatured = false,
): CatalogProduct {
  return {
    _id: id,
    name,
    slug: id.replace("product-", ""),
    isFeatured,
    categories: [{ _id: `${id}-category`, name: "Cabins", slug: "cabins" }],
    representativeImages: [],
    sizes,
  };
}

async function mountCatalogue() {
  const Harness = defineComponent({
    components: { ProductCatalogSection },
    template: "<Suspense><ProductCatalogSection /></Suspense>",
  });
  const wrapper = mount(Harness, {
    global: {
      stubs: {
        NuxtLink: { template: "<a><slot /></a>" },
        ProductCard: {
          props: { card: Object, catalogueOnAdd: Boolean },
          template:
            '<article class="product-card" :data-card-id="card.cardId" :data-catalogue-on-add="String(catalogueOnAdd)" />',
        },
        PortableContainerCard: {
          props: ["card"],
          template: '<article class="portable-card" :data-card-id="card.cardId" />',
        },
      },
    },
  });
  await flushPromises();
  return wrapper;
}

describe("ProductCatalogSection", () => {
  it("shows Container 3×7, GRP 1.5×1.5, then Panel 1.35×2.10", async () => {
    sanityQuery.data.value = [
      product("product-k1002-portable-cabin", "Portable Cabin", [size("300x700", 3, 7)]),
      product(
        "product-grp-cabin",
        "GRP Cabin",
        [size("150x150", 1.5, 1.5), size("150x215", 1.5, 2.15), size("150x270", 1.5, 2.7)],
        true,
      ),
      product("product-insulated-panel-cabin", "Insulated Panel Cabin", [size("135x210", 1.35, 2.1)]),
    ];

    const wrapper = await mountCatalogue();

    expect(wrapper.findAll(".product-card").map((card) => card.attributes("data-card-id"))).toEqual([
      "product-k1002-portable-cabin-300x700",
      "product-grp-cabin-150x150",
      "product-insulated-panel-cabin-135x210",
    ]);
    expect(wrapper.find(".portable-card").exists()).toBe(false);
  });

  // The home page has no grid to sell in place: Add takes the visitor to the catalogue.
  it("sends Add on a featured card to the catalogue", async () => {
    sanityQuery.data.value = [product("product-grp-cabin", "GRP Cabin", [size("150x150", 1.5, 1.5)], true)];

    const wrapper = await mountCatalogue();

    expect(wrapper.get(".product-card").attributes("data-catalogue-on-add")).toBe("true");
  });
});
