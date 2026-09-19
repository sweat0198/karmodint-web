import { describe, it, expect } from "vitest";
import { toSolutionCards } from "~/utils/solutionCards";
import type { SolutionProductEntry } from "~/types/solution";
import type { SanitySizeImage } from "~/types/catalog";

function image(view: SanitySizeImage["view"], assetId: string): SanitySizeImage {
  return { _key: view, view, alt: `${view} view`, asset: { _type: "reference", _ref: assetId } };
}

function size(key: string, lengthM: number, widthM: number, price?: number) {
  return {
    _key: key,
    label: `${lengthM}m x ${widthM}m`,
    lengthM,
    widthM,
    heightM: 2.4,
    weightKg: 300,
    isPoa: price === undefined,
    price,
    isDefault: false,
    thumbnail: image("left-diagonal", `image-diagonal-${key}`),
    fallbackThumbnail: image("front", `image-front-${key}`),
    images: [image("front", `image-front-${key}`), image("left-diagonal", `image-diagonal-${key}`)],
  };
}

const cabin = {
  _id: "product-cabin",
  name: "Site Office Cabin",
  slug: "site-office-cabin",
  shortDescription: "A site office.",
  categories: [{ _id: "category-cabin", name: "Cabin", slug: "cabin", displayOrder: 2 }],
  representativeImages: [],
  sizes: [size("large", 6, 2.4, 4250), size("small", 3, 2.4, 2100)],
};

const kiosk = {
  _id: "product-kiosk",
  name: "Retail Kiosk",
  slug: "retail-kiosk",
  shortDescription: "A kiosk.",
  categories: [{ _id: "category-kiosk", name: "Kiosk", slug: "kiosk", displayOrder: 1 }],
  representativeImages: [],
  sizes: [size("std", 3, 2, 5800)],
};

function entry(product: any, sizeOptionKey: string): SolutionProductEntry {
  return { _key: `${product._id}-${sizeOptionKey}`, product, sizeOptionKey };
}

describe("toSolutionCards", () => {
  it("builds one card per entry, for the chosen size only", () => {
    const cards = toSolutionCards([entry(cabin, "large")]);

    expect(cards).toHaveLength(1);
    expect(cards[0]!.cardId).toBe("product-cabin-large");
    expect(cards[0]!.productName).toBe("Site Office Cabin");
    expect(cards[0]!.sizeKey).toBe("large");
    expect(cards[0]!.price).toBe(4250);
  });

  // The catalog sorts by category display order; a solution is a curated list, so the editor's
  // ordering is the one that carries meaning.
  it("preserves the authored order rather than re-sorting by category", () => {
    const cards = toSolutionCards([entry(cabin, "large"), entry(kiosk, "std")]);

    expect(cards.map((card) => card.cardId)).toEqual(["product-cabin-large", "product-kiosk-std"]);
  });

  it("lists the same product at two sizes as two separate cards", () => {
    const cards = toSolutionCards([entry(cabin, "large"), entry(cabin, "small")]);

    expect(cards.map((card) => card.cardId)).toEqual(["product-cabin-large", "product-cabin-small"]);
    expect(cards.map((card) => card.price)).toEqual([4250, 2100]);
  });

  it("carries the size label and specs the catalog card shows", () => {
    const [card] = toSolutionCards([entry(cabin, "large")]);

    expect(card!.sizeLabel).toContain("6.00m");
    expect(card!.specs.some((spec) => spec.startsWith("Height:"))).toBe(true);
  });

  it("marks a size with no price as POA", () => {
    const poaProduct = { ...cabin, sizes: [size("poa", 4, 2.4)] };
    const [card] = toSolutionCards([entry(poaProduct, "poa")]);

    expect(card!.isPoa).toBe(true);
  });

  it("drops an entry whose size key no longer exists instead of rendering a blank card", () => {
    expect(toSolutionCards([entry(cabin, "deleted-size")])).toEqual([]);
  });

  it("drops an entry whose product reference is broken", () => {
    expect(toSolutionCards([{ _key: "orphan", product: null, sizeOptionKey: "large" }])).toEqual([]);
  });

  // Portable cabins keep their photography on the product (`representativeImages`) rather than on
  // each size, so `toSizeCards` alone would drop them for want of a thumbnail — silently removing
  // a product the editor deliberately put in the solution.
  it("falls back to the product's representative image when the size carries no render", () => {
    const portable = {
      ...cabin,
      _id: "product-portable",
      name: "Portable Cabin",
      representativeImages: [
        { _type: "image" as const, asset: { _type: "reference" as const, _ref: "image-rep-600x400-jpg" }, alt: "Portable cabin" },
      ],
      sizes: [
        {
          ...size("20ft", 6, 2.4, 3900),
          thumbnail: null,
          fallbackThumbnail: null,
          images: [],
        },
      ],
    };

    const [card] = toSolutionCards([entry(portable, "20ft")]);

    expect(card!.cardId).toBe("product-portable-20ft");
    expect(card!.thumbnail.asset?._ref).toBe("image-rep-600x400-jpg");
    expect(card!.images).toHaveLength(1);
  });

  it("still drops a size with no render and no representative image to fall back on", () => {
    const medialess = {
      ...cabin,
      _id: "product-medialess",
      representativeImages: [],
      sizes: [{ ...size("bare", 3, 2, 900), thumbnail: null, fallbackThumbnail: null, images: [] }],
    };

    expect(toSolutionCards([entry(medialess, "bare")])).toEqual([]);
  });

  it("returns nothing for an absent list", () => {
    expect(toSolutionCards(undefined)).toEqual([]);
    expect(toSolutionCards(null)).toEqual([]);
  });
});
