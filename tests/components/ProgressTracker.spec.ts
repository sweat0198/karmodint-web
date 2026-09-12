// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { nextTick } from "vue";

vi.stubGlobal("piniaPluginPersistedstate", { localStorage: () => undefined });

const { useQuoteStore } = await import("~/stores/quote");
const ProgressTracker = (await import("~/components/ProgressTracker.vue")).default;

function mountTracker(currentStep = 1) {
  const pinia = createPinia();
  const store = useQuoteStore(pinia);
  const wrapper = mount(ProgressTracker, {
    props: { currentStep },
    global: {
      plugins: [pinia],
      stubs: {
        NuxtLink: { props: ["to"], template: '<a :href="to"><slot /></a>' },
      },
    },
  });
  wrappers.push(wrapper);
  return { wrapper, store };
}

const wrappers: ReturnType<typeof mount>[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

function addProduct(store: ReturnType<typeof useQuoteStore>) {
  store.addItem({
    productId: "cabin", productName: "Cabin", productSlug: "cabin",
    sizeKey: "150x150", sizeLabel: "1.5m × 1.5m", quantity: 1, isPoa: true,
  });
  return store.items[0]!.id;
}

describe("ProgressTracker", () => {
  it("keeps the line and available steps in sync when adding and removing a product", async () => {
    const { wrapper, store } = mountTracker();
    expect(wrapper.findAll("a")).toHaveLength(1);
    expect(wrapper.get('[style*="width"]').attributes("style")).toBe("width: 0%;");

    const id = addProduct(store);
    await nextTick();
    expect(wrapper.findAll("a")).toHaveLength(2);
    expect(parseFloat(wrapper.get<HTMLDivElement>('[style*="width"]').element.style.width)).toBeCloseTo(33.333);

    store.removeItem(id);
    await nextTick();
    expect(wrapper.findAll("a")).toHaveLength(1);
    expect(wrapper.get('[style*="width"]').attributes("style")).toBe("width: 0%;");
  });

  it("returns to Select when the last product is removed on Review", async () => {
    const { wrapper, store } = mountTracker(3);
    const id = addProduct(store);
    store.setLastVisitedRoute("/quote");
    await nextTick();
    expect(wrapper.get('[aria-current="step"]').text()).toContain("REVIEW");

    store.removeItem(id);
    await nextTick();

    expect(wrapper.findAll("a").map((link) => link.attributes("href"))).toEqual(["/products"]);
    expect(wrapper.get('[aria-current="step"]').text()).toContain("SELECT");
    expect(wrapper.get('[style*="width"]').attributes("style")).toBe("width: 0%;");
  });

  it.each(["decrement", "zero quantity", "clear all"])("resets progress through %s and starts a fresh basket", async (action) => {
    const { wrapper, store } = mountTracker(2);
    const id = addProduct(store);
    store.setLastVisitedRoute("/quote");
    if (action === "decrement") store.decrementItem(id);
    else if (action === "zero quantity") store.updateQuantity(id, 0);
    else store.clearQuote();
    await nextTick();

    expect(wrapper.findAll("a")).toHaveLength(1);
    expect(store.continueRoute).toBe("/products");
    await wrapper.setProps({ currentStep: 1 });
    addProduct(store);
    await nextTick();
    expect(wrapper.findAll("a").map((link) => link.attributes("href"))).toEqual(["/products", "/customize"]);
  });

  it("preserves Review access while products remain, including when navigating back", async () => {
    const { wrapper, store } = mountTracker(3);
    const id = addProduct(store);
    addProduct(store);
    store.setLastVisitedRoute("/quote");
    store.decrementItem(id);
    store.setLastVisitedRoute("/products");
    await wrapper.setProps({ currentStep: 1 });

    expect(wrapper.findAll("a")).toHaveLength(3);
    expect(wrapper.get('[aria-current="step"]').text()).toContain("SELECT");
  });

  it("keeps submission confirmation complete after clearing the basket", async () => {
    const { wrapper, store } = mountTracker(3);
    addProduct(store);
    store.setLastVisitedRoute("/quote");
    store.clearQuote();
    await wrapper.setProps({ currentStep: 4 });

    expect(wrapper.get('[aria-current="step"]').text()).toContain("FINAL QUOTE");
    expect(wrapper.get('[style*="width"]').attributes("style")).toBe("width: 100%;");
  });

  it("ignores stale persisted visits for an empty basket and its next selection", async () => {
    const { wrapper, store } = mountTracker();
    store.$patch({ items: [], lastVisitedRoute: "/quote", maxVisitedStep: 3 });
    await nextTick();
    expect(wrapper.findAll("a")).toHaveLength(1);
    expect(store.continueRoute).toBe("/products");
    expect(store.continueStepNumber).toBe(1);

    addProduct(store);
    await nextTick();
    expect(wrapper.findAll("a")).toHaveLength(2);
  });
});
