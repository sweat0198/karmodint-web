// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { QuoteItem } from "~/stores/quote";
import type { SizeCard } from "~/utils/sizeCards";
import type { PortableContainerCard } from "~/utils/portableContainerCards";
import type { SanitySizeImage } from "~/types/catalog";

// The Nuxt module `pinia-plugin-persistedstate/nuxt` normally auto-imports this global. Outside
// Nuxt's runtime it doesn't exist, so it's stubbed before the store module (which references it
// at store-definition time) is loaded.
(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined };
// `useRuntimeConfig` is likewise a Nuxt auto-import, stubbed the same way `tests/server/*.test.ts`
// stub it for Nitro handlers.
(globalThis as any).useRuntimeConfig = () => ({
  public: { sanityProjectId: "proj123", sanityDataset: "production" },
});
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
    images: [thumbnail, image("interior", "image-interior-800x600-jpg")],
    categorySlugs: ["grp"],
    categoryNames: ["GRP"],
    sizeSearchTerms: [],
    ...overrides,
  };
}

function portableCard(): PortableContainerCard {
  const thumbnail = image("front", "image-k1002-representative-800x600-jpg");
  return {
    cardId: "portable-product-k1002",
    productId: "product-k1002",
    productName: "K1002 Portable Cabin",
    productSlug: "k1002-portable-cabin",
    shortDescription: "Portable cabin.",
    categorySlugs: ["containers"],
    categoryNames: ["Portable Cabins"],
    representativeImage: thumbnail,
    lowestPrice: 9000,
    isPoaOnly: false,
    sizes: [
      {
        sizeKey: "300x700", sourceLabel: "3m × 7m", sizeLabel: "23ft × 10ft (3.00m × 7.00m)",
        specs: [], lengthM: 7, widthM: 3, price: 9000, isPoa: false, images: [thumbnail]
      },
      {
        sizeKey: "300x900", sourceLabel: "3m × 9m", sizeLabel: "30ft × 10ft (3.00m × 9.00m)",
        specs: [], lengthM: 9, widthM: 3, price: undefined, isPoa: true, images: [thumbnail]
      }
    ]
  }
}

describe("useQuoteStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("starts the quote journey at the products route", () => {
    const store = useQuoteStore();

    expect(store.lastVisitedRoute).toBe("/products");
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

  it("re-adding refreshes the renders, backfilling a line persisted without its extra angles", () => {
    const store = useQuoteStore();
    // A line replayed from a cart saved before `images` existed: one static render, no angles.
    store.addItem(grpItem({ image: "front.jpg" }));
    expect(store.items[0].images).toBeUndefined();

    store.addItem(
      grpItem({
        image: "front.jpg",
        images: [{ src: "front.jpg" }, { src: "top.jpg" }],
      }),
    );

    expect(store.items[0].images).toEqual([{ src: "front.jpg" }, { src: "top.jpg" }]);
    expect(store.items[0].quantity).toBe(2);
  });

  it("re-adding a size with notes preserves them, rather than silently discarding them", () => {
    const store = useQuoteStore();
    store.addItem(grpItem());
    store.addItem(grpItem({ notes: "fragile items, ring bell twice" }));

    expect(store.items).toHaveLength(1);
    expect(store.items[0].notes).toBe("fragile items, ring bell twice");
  });

  it("re-adding without notes keeps whatever note the line already had", () => {
    const store = useQuoteStore();
    store.addItem(grpItem({ notes: "leave at the gate" }));
    store.addItem(grpItem());

    expect(store.items[0].notes).toBe("leave at the gate");
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

  describe("addSizeOption", () => {
    it("derives the line from a Size Option card, resolving renders at both widths itself", () => {
      const store = useQuoteStore();
      store.addSizeOption(grpCard());

      expect(store.items).toHaveLength(1);
      const [line] = store.items;
      expect(line.id).toBe("product-grp-cabin-150x150");
      expect(line.productId).toBe("product-grp-cabin");
      expect(line.sizeKey).toBe("150x150");
      expect(line.basePrice).toBe(5000);
      expect(line.isPoa).toBe(false);
      expect(line.quantity).toBe(1);
      // Thumbnail: untransformed, as JSON-LD/emails expect.
      expect(line.image).toBe(
        "https://cdn.sanity.io/images/proj123/production/front-800x600.jpg",
      );
      // Customize page viewer: wider renders for every angle.
      expect(line.images).toEqual([
        { src: "https://cdn.sanity.io/images/proj123/production/front-800x600.jpg?w=1200&fit=max", alt: "front view" },
        { src: "https://cdn.sanity.io/images/proj123/production/interior-800x600.jpg?w=1200&fit=max", alt: "interior view" },
      ]);
    });

    it("accepts an optional quantity", () => {
      const store = useQuoteStore();
      store.addSizeOption(grpCard(), 3);

      expect(store.items[0].quantity).toBe(3);
    });

    it("re-adding the same card merges into the existing line: quantity increments, renders refresh", () => {
      const store = useQuoteStore();
      store.addSizeOption(grpCard());
      store.addSizeOption(
        grpCard({ images: [image("front", "image-front-800x600-jpg"), image("top", "image-top-800x600-jpg")] }),
      );

      expect(store.items).toHaveLength(1);
      expect(store.items[0].quantity).toBe(2);
      expect(store.items[0].images?.map((img) => img.alt)).toEqual(["front view", "top view"]);
    });

    it("Product cards no longer need to resolve any image URL: a bare card is enough", () => {
      const store = useQuoteStore();
      // No pre-resolved `image`/`images` fields exist on a Size Option card — the store derives
      // them itself from the card's raw Sanity refs.
      expect(grpCard()).not.toHaveProperty("image");
      store.addSizeOption(grpCard());
      expect(store.items[0].image).toBeDefined();
    });
  });

  describe("portable-container selections", () => {
    it("starts a container line without a selected size", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());

      expect(store.items).toHaveLength(1);
      expect(store.items[0]).toMatchObject({
        isPortableContainer: true,
        hasSelectedSize: false,
        sizeKey: "",
      });
    });

    it("uses selected-size images without saving a separate floor-plan payload", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());

      store.selectPortableSize(store.items[0]!.id, portableCard().sizes[0]!);

      expect(store.items[0]).not.toHaveProperty("floorPlan");
    });

    it("keeps the representative preview when the selected size has no images", () => {
      const store = useQuoteStore();
      const card = portableCard();
      const imageLessSize = { ...card.sizes[1]!, images: [] };
      store.addPortableContainer(card);
      const representativeImages = store.items[0]!.images;

      store.selectPortableSize(store.items[0]!.id, imageLessSize);

      expect(store.items[0]!.images).toEqual(representativeImages);
      expect(store.items[0]!.image).toBe(representativeImages![0]!.src);
    });

    it("keeps matching portable configurations together but separates different extras", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());
      const [first] = store.items;
      store.selectPortableSize(first.id, portableCard().sizes[0]!);
      store.updateItemConfig(first.id, {
        selections: { heating: ["electric"] }, notes: {}, total: 9200, isPoa: false, specSummary: [], lines: []
      });
      store.addPortableContainer(portableCard());
      const second = store.items.find((item) => item.id !== first.id)!;
      store.selectPortableSize(second.id, portableCard().sizes[0]!);
      store.updateItemConfig(second.id, {
        selections: { heating: ["gas"] }, notes: {}, total: 9300, isPoa: false, specSummary: [], lines: []
      });

      expect(store.items).toHaveLength(2);
      expect(store.items.every((item) => item.sizeKey === "300x700")).toBe(true);
    });

    it("merges matching model, size, and extras while retaining their quantity", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());
      const [first] = store.items;
      store.selectPortableSize(first.id, portableCard().sizes[0]!);
      const payload = { selections: { heating: ["electric"] }, notes: {}, total: 9200, isPoa: false, specSummary: [], lines: [] };

      store.updateItemConfig(first.id, payload);
      store.addPortableContainer(portableCard());
      const second = store.items.find((item) => item.id !== first.id)!;
      store.selectPortableSize(second.id, portableCard().sizes[0]!);
      store.updateItemConfig(second.id, payload);

      expect(store.items).toHaveLength(1);
      expect(store.items[0].quantity).toBe(2);
    });

    it("changes a selected size without losing quantity or extras", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());
      const [line] = store.items;
      store.updateQuantity(line.id, 3);
      store.selectPortableSize(line.id, portableCard().sizes[0]!);
      store.updateItemConfig(line.id, {
        selections: { heating: ["electric"] }, notes: { heating: "urgent" }, total: 9200, isPoa: false, specSummary: [], lines: []
      });
      const selected = store.items[0]!;

      store.selectPortableSize(selected.id, portableCard().sizes[1]!);

      expect(store.items[0]).toMatchObject({
        quantity: 3, sizeKey: "300x900", isPoa: true,
        configState: { heating: ["electric"] }, customizationNotes: { heating: "urgent" }
      });
    });

    it("updates a configured line total by the selected size base-price difference", () => {
      const store = useQuoteStore();
      store.addPortableContainer(portableCard());
      const [line] = store.items;
      store.selectPortableSize(line.id, portableCard().sizes[0]!);
      store.updateItemConfig(store.items[0]!.id, {
        selections: { heating: ["electric"] }, notes: {}, total: 9200, isPoa: false, specSummary: [], lines: []
      });
      const largerPricedSize = { ...portableCard().sizes[1]!, price: 11000, isPoa: false };

      store.selectPortableSize(store.items[0]!.id, largerPricedSize);

      expect(store.items[0]!.customTotal).toBe(11200);
    });
  });
});
