// @vitest-environment jsdom

import { defineComponent } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoryTreeNode } from "~/queries/catalog";
import type { SolutionNavItem } from "~/queries/solutions";

// Mirrors tests/stores/quote.spec.ts: outside Nuxt's runtime this auto-import doesn't exist, and
// AppHeader pulls in the quote store transitively via useQuickContact.
(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined };

const categoryTreeQuery = vi.hoisted(() => ({ data: { value: [] as CategoryTreeNode[] } }));
const solutionsNavQuery = vi.hoisted(() => ({ data: { value: [] as SolutionNavItem[] } }));

vi.mock("#imports", () => ({
  useSanityQuery: (query: string) =>
    query.includes('_type == "solution"') ? solutionsNavQuery : categoryTreeQuery,
}));

const AppHeader = (await import("~/components/AppHeader.vue")).default;

function makeRouter(initialPath: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/contact", component: { template: "<div />" } },
      { path: "/products", component: { template: "<div />" } },
      { path: "/solutions", component: { template: "<div />" } },
      { path: "/solutions/:slug", component: { template: "<div />" } },
    ],
  });
  router.push(initialPath);
  return router;
}

async function flushRouterNavigation(router: ReturnType<typeof makeRouter>) {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await router.isReady();
}

async function mountHeader(initialPath: string) {
  const router = makeRouter(initialPath);
  await router.isReady();

  const Harness = defineComponent({
    components: { AppHeader },
    template: "<Suspense><AppHeader /></Suspense>",
  });

  const wrapper = mount(Harness, {
    global: {
      plugins: [createPinia(), router],
      stubs: {
        NuxtLink: { template: "<a><slot /></a>" },
      },
    },
  });
  await flushPromises();

  return { wrapper, router };
}

describe("AppHeader location button", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    categoryTreeQuery.data.value = [];
    solutionsNavQuery.data.value = [];
  });

  it("scrolls the on-page map section into view instead of navigating", async () => {
    const mapSection = document.createElement("div");
    mapSection.id = "map-section";
    mapSection.scrollIntoView = vi.fn();
    document.body.appendChild(mapSection);

    const { wrapper, router } = await mountHeader("/");
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.get('button[aria-label="Scroll to Location Map"]').trigger("click");

    expect(mapSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(pushSpy).not.toHaveBeenCalled();

    document.body.removeChild(mapSection);
    wrapper.unmount();
  });

  it("navigates to the contact page's map section when it isn't on the current page", async () => {
    const { wrapper, router } = await mountHeader("/products");
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.get('button[aria-label="Scroll to Location Map"]').trigger("click");
    await flushRouterNavigation(router);

    expect(pushSpy).toHaveBeenCalledWith("/contact#map-section");
    expect(router.currentRoute.value.fullPath).toBe("/contact#map-section");

    wrapper.unmount();
  });

  it("uses Products terminology on the products route", async () => {
    const { wrapper } = await mountHeader("/products");

    expect(wrapper.text()).toContain("Products");
    expect(wrapper.text()).not.toContain("Catalog");

    wrapper.unmount();
  });

  it("closes mobile drawer and scrolls when mobile location button is clicked", async () => {
    const mapSection = document.createElement("div");
    mapSection.id = "map-section";
    mapSection.scrollIntoView = vi.fn();
    document.body.appendChild(mapSection);

    const { wrapper } = await mountHeader("/");

    // Open mobile menu
    await wrapper.get('button[aria-label="Toggle Navigation Menu"]').trigger("click");

    // Multiple location buttons now exist (desktop + mobile drawer)
    const locationButtons = wrapper.findAll('button[aria-label="Scroll to Location Map"]');
    expect(locationButtons).toHaveLength(2);

    // Click the mobile drawer location button (the 2nd one)
    await locationButtons[1].trigger("click");

    expect(mapSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });

    // Drawer should now be closed
    expect(wrapper.findAll('button[aria-label="Scroll to Location Map"]')).toHaveLength(1);

    document.body.removeChild(mapSection);
    wrapper.unmount();
  });
});

describe("AppHeader Products and Solutions submenus", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    categoryTreeQuery.data.value = [];
    solutionsNavQuery.data.value = [];
  });

  it("lists top-level categories with a Show all link in the Products dropdown", async () => {
    categoryTreeQuery.data.value = [
      { _id: "cat-containers", name: "Portable Cabins", slug: "containers", displayOrder: 1, children: [] },
      { _id: "cat-cabin", name: "Gatehouses & Kiosks", slug: "cabin", displayOrder: 2, children: [] },
    ];

    const { wrapper } = await mountHeader("/");

    const showAllLinks = wrapper.findAll('a[to="/products"]').filter((a) => a.text().includes("Show all"));
    expect(showAllLinks).toHaveLength(1);
    expect(wrapper.find('a[to="/products?category=containers"]').text()).toBe("Portable Cabins");
    expect(wrapper.find('a[to="/products?category=cabin"]').text()).toBe("Gatehouses & Kiosks");

    wrapper.unmount();
  });

  it("nests subcategories under their parent category in the Products dropdown", async () => {
    categoryTreeQuery.data.value = [
      {
        _id: "cat-cabin",
        name: "Gatehouses & Kiosks",
        slug: "cabin",
        displayOrder: 1,
        children: [
          { _id: "sub-grp", name: "GRP", slug: "grp", displayOrder: 1 },
          { _id: "sub-panel", name: "Panel", slug: "panel", displayOrder: 2 },
          { _id: "sub-metro-city", name: "Metro City", slug: "metro-city", displayOrder: 3 },
          { _id: "sub-composite", name: "Composite", slug: "composite", displayOrder: 4 },
        ],
      },
    ];

    const { wrapper } = await mountHeader("/");

    expect(wrapper.find('a[to="/products?category=cabin&subcategory=grp"]').text()).toBe("GRP");
    expect(wrapper.find('a[to="/products?category=cabin&subcategory=panel"]').text()).toBe("Panel");
    expect(wrapper.find('a[to="/products?category=cabin&subcategory=metro-city"]').text()).toBe("Metro City");
    expect(wrapper.find('a[to="/products?category=cabin&subcategory=composite"]').text()).toBe("Composite");

    wrapper.unmount();
  });

  it("lists solutions with a Show all link in the Solutions dropdown", async () => {
    solutionsNavQuery.data.value = [
      { _id: "sol-1", name: "Construction Site Compound", slug: "construction-site" },
    ];

    const { wrapper } = await mountHeader("/");

    const showAllLinks = wrapper.findAll('a[to="/solutions"]').filter((a) => a.text().includes("Show all"));
    expect(showAllLinks).toHaveLength(1);
    expect(wrapper.find('a[to="/solutions/construction-site"]').text()).toBe("Construction Site Compound");

    wrapper.unmount();
  });

  it("hides the mobile categories toggle when there are no categories yet", async () => {
    const { wrapper } = await mountHeader("/");

    await wrapper.get('button[aria-label="Toggle Navigation Menu"]').trigger("click");

    expect(wrapper.find('button[aria-label="Toggle Products categories"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it("reveals category links after opening the mobile Products toggle", async () => {
    categoryTreeQuery.data.value = [
      { _id: "cat-containers", name: "Portable Cabins", slug: "containers", displayOrder: 1, children: [] },
    ];

    const { wrapper } = await mountHeader("/");

    await wrapper.get('button[aria-label="Toggle Navigation Menu"]').trigger("click");
    // Just the always-present (CSS-hidden) desktop dropdown copy; the mobile drawer's is still collapsed.
    expect(wrapper.findAll('a[to="/products?category=containers"]')).toHaveLength(1);

    await wrapper.get('button[aria-label="Toggle Products categories"]').trigger("click");

    // Desktop dropdown copy + the now-expanded mobile drawer copy.
    expect(wrapper.findAll('a[to="/products?category=containers"]')).toHaveLength(2);

    wrapper.unmount();
  });

  it("reveals nested subcategory links after opening the mobile Products toggle", async () => {
    categoryTreeQuery.data.value = [
      {
        _id: "cat-cabin",
        name: "Gatehouses & Kiosks",
        slug: "cabin",
        displayOrder: 1,
        children: [{ _id: "sub-grp", name: "GRP", slug: "grp", displayOrder: 1 }],
      },
    ];

    const { wrapper } = await mountHeader("/");

    await wrapper.get('button[aria-label="Toggle Navigation Menu"]').trigger("click");
    expect(wrapper.findAll('a[to="/products?category=cabin&subcategory=grp"]')).toHaveLength(1);

    await wrapper.get('button[aria-label="Toggle Products categories"]').trigger("click");

    expect(wrapper.findAll('a[to="/products?category=cabin&subcategory=grp"]')).toHaveLength(2);

    wrapper.unmount();
  });
});

describe("AppHeader submenu active state", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    categoryTreeQuery.data.value = [];
    solutionsNavQuery.data.value = [];
  });

  it("marks the selected category as the current page and the Show all link as inactive", async () => {
    categoryTreeQuery.data.value = [
      { _id: "cat-containers", name: "Portable Cabins", slug: "containers", displayOrder: 1, children: [] },
      { _id: "cat-cabin", name: "Gatehouses & Kiosks", slug: "cabin", displayOrder: 2, children: [] },
    ];

    const { wrapper } = await mountHeader("/products?category=containers");

    const activeCategory = wrapper.get('a[to="/products?category=containers"]');
    expect(activeCategory.attributes("aria-current")).toBe("page");
    expect(activeCategory.classes()).toContain("text-brand-red");

    const otherCategory = wrapper.get('a[to="/products?category=cabin"]');
    expect(otherCategory.attributes("aria-current")).toBeUndefined();

    const showAllLink = wrapper.findAll('a[to="/products"]').find((a) => a.text().includes("Show all"))!;
    expect(showAllLink.attributes("aria-current")).toBeUndefined();

    wrapper.unmount();
  });

  it("marks a selected subcategory and its parent category as active, but only the subcategory as the current page", async () => {
    categoryTreeQuery.data.value = [
      {
        _id: "cat-cabin",
        name: "Gatehouses & Kiosks",
        slug: "cabin",
        displayOrder: 1,
        children: [
          { _id: "sub-grp", name: "GRP", slug: "grp", displayOrder: 1 },
          { _id: "sub-panel", name: "Panel", slug: "panel", displayOrder: 2 },
        ],
      },
    ];

    const { wrapper } = await mountHeader("/products?category=cabin&subcategory=grp");

    const activeSubcategory = wrapper.get('a[to="/products?category=cabin&subcategory=grp"]');
    expect(activeSubcategory.attributes("aria-current")).toBe("page");
    expect(activeSubcategory.classes()).toContain("text-brand-red");

    const parentCategory = wrapper.get('a[to="/products?category=cabin"]');
    expect(parentCategory.classes()).toContain("text-brand-red");
    expect(parentCategory.attributes("aria-current")).toBeUndefined();

    const otherSubcategory = wrapper.get('a[to="/products?category=cabin&subcategory=panel"]');
    expect(otherSubcategory.attributes("aria-current")).toBeUndefined();
    expect(otherSubcategory.classes()).not.toContain("text-brand-red");

    wrapper.unmount();
  });

  it("marks Show all Products as the current page when no category is selected", async () => {
    categoryTreeQuery.data.value = [
      { _id: "cat-containers", name: "Portable Cabins", slug: "containers", displayOrder: 1, children: [] },
    ];

    const { wrapper } = await mountHeader("/products");

    const showAllLink = wrapper.findAll('a[to="/products"]').find((a) => a.text().includes("Show all"))!;
    expect(showAllLink.attributes("aria-current")).toBe("page");

    wrapper.unmount();
  });

  it("marks the selected solution as the current page in the Solutions dropdown", async () => {
    solutionsNavQuery.data.value = [
      { _id: "sol-1", name: "Construction Site Compound", slug: "construction-site" },
      { _id: "sol-2", name: "Event Site Kiosk", slug: "event-site" },
    ];

    const { wrapper } = await mountHeader("/solutions/construction-site");

    const activeSolution = wrapper.get('a[to="/solutions/construction-site"]');
    expect(activeSolution.attributes("aria-current")).toBe("page");
    expect(activeSolution.classes()).toContain("text-brand-red");

    const otherSolution = wrapper.get('a[to="/solutions/event-site"]');
    expect(otherSolution.attributes("aria-current")).toBeUndefined();

    const showAllLink = wrapper.findAll('a[to="/solutions"]').find((a) => a.text().includes("Show all"))!;
    expect(showAllLink.attributes("aria-current")).toBeUndefined();

    wrapper.unmount();
  });

  it("marks Show all Solutions as the current page on the solutions index", async () => {
    solutionsNavQuery.data.value = [
      { _id: "sol-1", name: "Construction Site Compound", slug: "construction-site" },
    ];

    const { wrapper } = await mountHeader("/solutions");

    const showAllLink = wrapper.findAll('a[to="/solutions"]').find((a) => a.text().includes("Show all"))!;
    expect(showAllLink.attributes("aria-current")).toBe("page");

    wrapper.unmount();
  });
});
