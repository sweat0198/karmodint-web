// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import type { SizeCard } from "~/utils/sizeCards";
import type { SanitySizeImage } from "~/types/catalog";

// The Nuxt module `pinia-plugin-persistedstate/nuxt` normally auto-imports this global. Outside
// Nuxt's runtime it doesn't exist, so it's stubbed before the store module (which references it
// at store-definition time) is loaded.
(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined };

const { useQuoteStore } = await import("~/stores/quote");
const ProductCard = (await import("~/components/ProductCard.vue")).default;

function image(view: SanitySizeImage["view"], assetId: string): SanitySizeImage {
  return { _key: view, view, alt: `${view} view`, asset: { _type: "reference", _ref: assetId } };
}

function grpCard(overrides: Partial<SizeCard> = {}): SizeCard {
  const thumbnail = image("front", "image-front-800x600-jpg");
  return {
    cardId: "product-grp-cabin-150x150",
    productId: "product-grp-cabin",
    productName: "GRP Cabin",
    productSlug: "grp-cabin",
    shortDescription: "A durable fibreglass guard cabin.",
    sizeKey: "150x150",
    sizeLabel: "1.50m × 1.50m (4.9ft × 4.9ft)",
    specs: [],
    isPoa: false,
    price: 5000,
    thumbnail,
    images: [thumbnail],
    categorySlugs: ["grp"],
    categoryNames: ["GRP"],
    sizeSearchTerms: [],
    ...overrides,
  };
}

// Neither action button carries a `title` attribute (only the quantity stepper's +/- do), and
// Customize always renders before Add/the stepper — so the first untitled button is Customize,
// and the second (present only once a line exists) is Add.
function customizeButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll("button:not([title])")[0];
}
function addButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll("button:not([title])")[1];
}

async function mountAt(path: string, card: SizeCard = grpCard(), extraProps: { catalogueOnAdd?: boolean } = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/products", component: { template: "<div />" } },
      { path: "/products/:slug", component: { template: "<div />" } },
      { path: "/solutions", component: { template: "<div />" } },
      { path: "/solutions/:slug", component: { template: "<div />" } },
      { path: "/customize", component: { template: "<div />" } },
      { path: "/:path(.*)*", component: { template: "<div />" } },
    ],
  });
  await router.push(path);
  await router.isReady();

  const wrapper = mount(ProductCard, {
    props: { card, ...extraProps },
    global: { plugins: [createPinia(), router] },
  });

  return { wrapper, router };
}

describe("ProductCard", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Add", () => {
    it("adds the Size Option to the Quote List", async () => {
      const { wrapper } = await mountAt("/products/");
      const store = useQuoteStore();

      await addButton(wrapper).trigger("click");

      expect(store.getItemQuantity("product-grp-cabin-150x150")).toBe(1);
    });

    it("redirects to the catalogue when adding from a home-page showcase card", async () => {
      const { wrapper, router } = await mountAt("/", grpCard(), { catalogueOnAdd: true });

      await addButton(wrapper).trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/products/");
    });

    it("does not redirect when already within the catalogue", async () => {
      const { wrapper, router } = await mountAt("/products/");

      await addButton(wrapper).trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/products/");
    });

    it("does not redirect when already on a catalogue subroute", async () => {
      const { wrapper, router } = await mountAt("/products/grp-cabin/");

      await addButton(wrapper).trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/products/grp-cabin/");
    });

    // A solution page sells the units it curates; bouncing the visitor to the catalogue on Add
    // would throw away the page they were reading.
    it("does not redirect when adding from a solution page", async () => {
      const { wrapper, router } = await mountAt("/solutions/construction-site-setup/");

      await addButton(wrapper).trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/solutions/construction-site-setup/");
    });

    // Product Line pages live at Legacy paths and sell their grid in place too.
    it("does not redirect when adding from a Product Line page", async () => {
      const { wrapper, router } = await mountAt("/portable-cabin/steel-cabin/");

      await addButton(wrapper).trigger("click");
      await flushPromises();

      expect(router.currentRoute.value.path).toBe("/portable-cabin/steel-cabin/");
    });
  });

  describe("Customize", () => {
    it("adds the Size Option to the Quote List when it is not already there, then navigates to /customize", async () => {
      const { wrapper, router } = await mountAt("/products/");
      const store = useQuoteStore();

      await customizeButton(wrapper).trigger("click");
      await flushPromises();

      expect(store.getItemQuantity("product-grp-cabin-150x150")).toBe(1);
      expect(router.currentRoute.value.path).toBe("/customize/");
    });

    it("does not add a second line when the Size Option is already in the Quote List", async () => {
      const card = grpCard();
      const { wrapper } = await mountAt("/products/", card);
      const store = useQuoteStore();
      store.addSizeOption(card);
      await wrapper.vm.$nextTick();

      await customizeButton(wrapper).trigger("click");
      await flushPromises();

      expect(store.getItemQuantity("product-grp-cabin-150x150")).toBe(1);
    });
  });
});
