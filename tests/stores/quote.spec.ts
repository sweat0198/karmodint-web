// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { QuoteItem } from "~/stores/quote";

// The Nuxt module `pinia-plugin-persistedstate/nuxt` normally auto-imports this global. Outside
// Nuxt's runtime it doesn't exist, so it's stubbed before the store module (which references it
// at store-definition time) is loaded.
(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined };
const { useQuoteStore } = await import("~/stores/quote");

function grpItem(overrides: Partial<Omit<QuoteItem, "id">> = {}): Omit<QuoteItem, "id"> {
  return {
    productId: "product-grp-cabin",
    productName: "GRP Cabin",
    productSlug: "grp-cabin",
    sizeKey: "150x150",
    sizeLabel: "1.50m × 1.50m (4.9ft × 4.9ft)",
    basePrice: 0,
    quantity: 1,
    isPoa: true,
    ...overrides,
  };
}

describe("useQuoteStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("gives two Size Options of the same Product distinct lines", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ sizeKey: "150x150" }));
    store.addItem(grpItem({ sizeKey: "300x300", sizeLabel: "3.00m × 3.00m (9.8ft × 9.8ft)" }));

    expect(store.items).toHaveLength(2);
    expect(store.items.map((i) => i.id)).toEqual([
      "product-grp-cabin-150x150",
      "product-grp-cabin-300x300",
    ]);
  });

  it("re-adding the same Size Option increments its quantity instead of duplicating the line", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ sizeKey: "150x150" }));
    store.addItem(grpItem({ sizeKey: "150x150" }));

    expect(store.items).toHaveLength(1);
    expect(store.items[0].quantity).toBe(2);
  });

  it("getItemQuantity returns 0 for a sibling size of the same Product", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ sizeKey: "150x150" }));

    expect(store.getItemQuantity("product-grp-cabin-150x150")).toBe(1);
    expect(store.getItemQuantity("product-grp-cabin-300x300")).toBe(0);
  });

  it("decrementing one Size Option does not touch a sibling size of the same Product", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ sizeKey: "150x150", quantity: 2 }));
    store.addItem(grpItem({ sizeKey: "300x300", sizeLabel: "3.00m × 3.00m (9.8ft × 9.8ft)" }));

    store.decrementItem("product-grp-cabin-150x150");

    expect(store.getItemQuantity("product-grp-cabin-150x150")).toBe(1);
    expect(store.getItemQuantity("product-grp-cabin-300x300")).toBe(1);
  });

  it("decrementing the last unit of a line removes it", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ sizeKey: "150x150" }));

    store.decrementItem("product-grp-cabin-150x150");

    expect(store.items).toHaveLength(0);
  });
});
