// @vitest-environment jsdom

import { defineComponent, h, Suspense } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProductLineNavItem } from "~/types/productLine";

const productLinesNavQuery = vi.hoisted(() => ({
  data: { value: [] as ProductLineNavItem[] | null },
  queries: [] as string[],
}));

vi.mock("#imports", () => ({
  useSanityQuery: (query: string) => {
    productLinesNavQuery.queries.push(query);
    return { data: productLinesNavQuery.data };
  },
}));

const AppFooter = (await import("~/components/AppFooter.vue")).default;

const NuxtLinkStub = {
  props: ["to"],
  template: '<a :href="to"><slot /></a>',
};

async function mountFooter(props: { hasPriceBar?: boolean } = {}) {
  const Harness = defineComponent({
    render: () => h(Suspense, null, { default: () => h(AppFooter, props) }),
  });
  const wrapper = mount(Harness, {
    global: {
      stubs: { NuxtLink: NuxtLinkStub },
    },
  });
  await flushPromises();
  return wrapper;
}

describe("AppFooter", () => {
  beforeEach(() => {
    productLinesNavQuery.data.value = [];
    productLinesNavQuery.queries = [];
  });

  it("reserves space for the sticky price bar when it is visible", async () => {
    const wrapper = await mountFooter({ hasPriceBar: true });

    expect(wrapper.get("footer").classes()).toContain("pb-36");
    expect(wrapper.get("footer").classes()).toContain("sm:pb-24");
  });

  it("does not add sticky price bar spacing when the bar is hidden", async () => {
    const wrapper = await mountFooter();

    expect(wrapper.get("footer").classes()).not.toContain("pb-36");
    expect(wrapper.get("footer").classes()).not.toContain("sm:pb-24");
  });

  it("links to the Privacy Policy page", async () => {
    const wrapper = await mountFooter();
    const link = wrapper.findAll("a").find((a) => a.text() === "Privacy Policy");

    expect(link?.attributes("href")).toBe("/privacy-policy/");
  });
});

describe("AppFooter Product Lines", () => {
  beforeEach(() => {
    productLinesNavQuery.data.value = [];
    productLinesNavQuery.queries = [];
  });

  it("links every published Product Line in display order", async () => {
    productLinesNavQuery.data.value = [
      { _id: "productLine-modular-buildings", name: "Modular Buildings", path: "/modular-buildings/", categoryId: null, hasParent: false },
      { _id: "productLine-portable-cabin", name: "Portable Cabin", path: "/portable-cabin/", categoryId: "category-containers", hasParent: false },
      { _id: "productLine-steel-cabin", name: "Steel Cabin", path: "/portable-cabin/steel-cabin/", categoryId: "category-containers", hasParent: true },
      { _id: "productLine-grp-kiosk-cabin", name: "GRP Kiosk Cabin", path: "/grp-kiosk-cabin/", categoryId: "category-cabin-grp", hasParent: false },
    ];

    const wrapper = await mountFooter();

    expect(productLinesNavQuery.queries.some((query) => query.includes("order(displayOrder asc"))).toBe(true);
    const nav = wrapper.get('nav[aria-label="Product lines"]');
    expect(nav.findAll("a").map((link) => [link.text(), link.attributes("href")])).toEqual([
      ["Modular Buildings", "/modular-buildings/"],
      ["Portable Cabin", "/portable-cabin/"],
      ["Steel Cabin", "/portable-cabin/steel-cabin/"],
      ["GRP Kiosk Cabin", "/grp-kiosk-cabin/"],
    ]);
  });

  it("leaves the column out until a Product Line is published", async () => {
    productLinesNavQuery.data.value = null;

    const wrapper = await mountFooter();

    expect(wrapper.find('nav[aria-label="Product lines"]').exists()).toBe(false);
  });
});
