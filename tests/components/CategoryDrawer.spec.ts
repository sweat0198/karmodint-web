// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CategoryDrawer from "~/components/CategoryDrawer.vue";
import type { CategoryTreeNode } from "~/queries/catalog";

const testCategories: CategoryTreeNode[] = [
  {
    _id: "category-cabins",
    name: "Portable Cabins",
    slug: "cabins",
    children: [
      { _id: "sub-1", name: "Site Offices", slug: "site-offices" },
      { _id: "sub-2", name: "Storage Units", slug: "storage-units" },
    ],
  },
  {
    _id: "category-kiosks",
    name: "Gatehouses & Kiosks",
    slug: "kiosks",
    children: [],
  },
];

describe("CategoryDrawer", () => {
  it("expands all categories by default", () => {
    const wrapper = mount(CategoryDrawer, {
      props: {
        isOpen: true,
        categories: testCategories,
        activeCategory: null,
        activeSubcategory: null,
      },
      attachTo: document.body,
    });

    expect(document.body.textContent).toContain("Site Offices");
    expect(document.body.textContent).toContain("Storage Units");

    wrapper.unmount();
  });

  it("collapses when parent category is clicked, and re-expands on next click", async () => {
    const wrapper = mount(CategoryDrawer, {
      props: {
        isOpen: true,
        categories: testCategories,
        activeCategory: null,
        activeSubcategory: null,
      },
      attachTo: document.body,
    });

    const cabinButton = Array.from(document.body.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Portable Cabins"),
    );
    expect(cabinButton).toBeDefined();

    // Click to collapse
    await cabinButton!.click();
    expect(document.body.textContent).not.toContain("Site Offices");
    expect(wrapper.emitted("toggleCategory")?.[0]).toEqual(["cabins"]);

    // Click to re-expand
    await cabinButton!.click();
    expect(document.body.textContent).toContain("Site Offices");
    expect(wrapper.emitted("toggleCategory")?.[1]).toEqual(["cabins"]);

    wrapper.unmount();
  });

  it("emits selectCategory when category has no children", async () => {
    const wrapper = mount(CategoryDrawer, {
      props: {
        isOpen: true,
        categories: testCategories,
        activeCategory: null,
        activeSubcategory: null,
      },
      attachTo: document.body,
    });

    const kiosksButton = Array.from(document.body.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Gatehouses & Kiosks"),
    );
    expect(kiosksButton).toBeDefined();

    await kiosksButton!.click();
    expect(wrapper.emitted("selectCategory")?.[0]).toEqual(["kiosks"]);
    expect(wrapper.emitted("update:isOpen")?.[0]).toEqual([false]);

    wrapper.unmount();
  });

  it("selects subcategory and closes drawer", async () => {
    const wrapper = mount(CategoryDrawer, {
      props: {
        isOpen: true,
        categories: testCategories,
        activeCategory: null,
        activeSubcategory: null,
      },
      attachTo: document.body,
    });

    const subcategoryButton = Array.from(document.body.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Site Offices"),
    );
    expect(subcategoryButton).toBeDefined();

    await subcategoryButton!.click();
    expect(wrapper.emitted("select")?.[0]).toEqual(["site-offices", "cabins"]);
    expect(wrapper.emitted("update:isOpen")?.[0]).toEqual([false]);

    wrapper.unmount();
  });

  it("respects external collapsedCategories prop", () => {
    const wrapper = mount(CategoryDrawer, {
      props: {
        isOpen: true,
        categories: testCategories,
        activeCategory: null,
        activeSubcategory: null,
        collapsedCategories: { cabins: true },
      },
      attachTo: document.body,
    });

    expect(document.body.textContent).not.toContain("Site Offices");

    wrapper.unmount();
  });
});
