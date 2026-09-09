import { describe, it, expect } from "vitest";
import { toSizeCards } from "~/utils/sizeCards";
import type { CatalogProduct } from "~/queries/catalog";
import type { SanitySizeImage } from "~/types/catalog";

/**
 * A dedicated fixture rather than tests/fixtures/sanityData.ts: that fixture is shared with the
 * offline GROQ tests and sized for schema/query coverage (2 products), not the real catalogue's
 * scale (5 products, 28 sizes). This one is small but exercises every rule in D11 and the D8/
 * "unsupplied weight" guards instead.
 */
function image(view: SanitySizeImage["view"], assetId: string): SanitySizeImage {
  return { _key: view, view, alt: `${view} view`, asset: { _type: "reference", _ref: assetId } };
}

const grpCabin: CatalogProduct = {
  _id: "product-grp-cabin",
  name: "GRP Cabin",
  slug: "grp-cabin",
  shortDescription: "A durable fibreglass guard cabin.",
  isFeatured: true,
  categories: [
    {
      _id: "category-cabin-grp",
      name: "GRP",
      slug: "grp",
      displayOrder: 1,
      parent: { _id: "category-cabin", name: "Cabin", slug: "cabin", displayOrder: 2 },
    },
  ],
  sizes: [
    {
      _key: "300x300",
      label: "3.00m x 3.00m",
      lengthM: 3,
      widthM: 3,
      heightM: 2.4,
      weightKg: 450,
      isPoa: true,
      price: 0,
      isDefault: false,
      thumbnail: image("left-diagonal", "image-diagonal-300"),
      fallbackThumbnail: image("front", "image-front-300"),
      // The query already strips the plan view, so a card's images are angles only.
      images: [image("front", "image-front-300"), image("left-diagonal", "image-diagonal-300")],
    },
    {
      _key: "150x150",
      label: "1.50m x 1.50m",
      lengthM: 1.5,
      widthM: 1.5,
      heightM: 2.4,
      weightKg: 0,
      isPoa: true,
      price: 0,
      isDefault: true,
      thumbnail: image("left-diagonal", "image-diagonal-150"),
      fallbackThumbnail: image("front", "image-front-150"),
      images: [
        image("front", "image-front-150"),
        image("left-diagonal", "image-diagonal-150"),
      ],
    },
  ],
};

const panelCabin: CatalogProduct = {
  _id: "product-insulated-panel-cabin",
  name: "Insulated Panel Cabin",
  slug: "insulated-panel-cabin",
  isFeatured: false,
  categories: [
    {
      _id: "category-cabin-panel",
      name: "Panel",
      slug: "panel",
      displayOrder: 2,
      parent: { _id: "category-cabin", name: "Cabin", slug: "cabin", displayOrder: 2 },
    },
  ],
  sizes: [
    {
      _key: "200x200",
      label: "2.00m x 2.00m",
      lengthM: 2,
      widthM: 2,
      weightKg: 0,
      isPoa: true,
      price: 0,
      isDefault: true,
      // No left-diagonal render for this size — the fallback must fire.
      thumbnail: null,
      fallbackThumbnail: image("front", "image-front-panel-200"),
      images: [image("front", "image-front-panel-200"), image("door", "image-door-panel-200")],
    },
  ],
};

const bulletproofBooth: CatalogProduct = {
  _id: "product-bulletproof-sentry-booth",
  name: "Bulletproof Sentry Booth",
  slug: "bulletproof-sentry-booth",
  isFeatured: false,
  categories: [{ _id: "category-bulletproof", name: "Bulletproof", slug: "bulletproof", displayOrder: 3, parent: null }],
  sizes: [
    {
      _key: "110x110",
      label: "1.10m x 1.10m",
      lengthM: 1.1,
      widthM: 1.1,
      weightKg: 0,
      isPoa: true,
      price: 0,
      isDefault: true,
      thumbnail: image("left-diagonal", "image-diagonal-bulletproof"),
      fallbackThumbnail: image("front", "image-front-bulletproof"),
      images: [image("left-diagonal", "image-diagonal-bulletproof")],
    },
  ],
};

describe("toSizeCards", () => {
  it("produces one card per Size Option across all Products", () => {
    const cards = toSizeCards([grpCabin, panelCabin, bulletproofBooth]);
    expect(cards).toHaveLength(4);
  });

  it("orders by category displayOrder, then isFeatured, then name, then footprint ascending within a Product", () => {
    const cards = toSizeCards([bulletproofBooth, panelCabin, grpCabin]);

    // GRP (category displayOrder 1) before Panel (2) before Bulletproof (3); within GRP, the
    // smaller footprint (150x150) comes before the larger one (300x300).
    expect(cards.map((c) => c.cardId)).toEqual([
      "product-grp-cabin-150x150",
      "product-grp-cabin-300x300",
      "product-insulated-panel-cabin-200x200",
      "product-bulletproof-sentry-booth-110x110",
    ]);
  });

  it("omits the weight spec for the weightKg: 0 sentinel, and includes it otherwise", () => {
    const cards = toSizeCards([grpCabin]);
    const compact = cards.find((c) => c.sizeKey === "150x150")!;
    const large = cards.find((c) => c.sizeKey === "300x300")!;

    expect(compact.specs.some((s) => s.startsWith("Weight"))).toBe(false);
    expect(large.specs).toContain("Weight: 450kg");
  });

  it("formats the footprint as the sizeLabel using metric and imperial", () => {
    const cards = toSizeCards([grpCabin]);
    const compact = cards.find((c) => c.sizeKey === "150x150")!;
    expect(compact.sizeLabel).toBe("5ft × 5ft (1.50m × 1.50m)");
  });

  it("indexes the displayed measurement terms for search", () => {
    const cards = toSizeCards([grpCabin]);
    const large = cards.find((card) => card.sizeKey === "300x300")!;

    expect(large.sizeSearchTerms).toEqual(
      expect.arrayContaining([
        large.sizeLabel,
        "Height: 8ft (2.40m)",
        "Weight: 450kg",
        "3m",
        "3 m",
        "3.00m",
        "3.00 m",
        "2.40m",
        "2.40 m",
        "10ft",
        "10 ft",
        "450 kg",
      ]),
    );
  });

  it("selects the left-diagonal thumbnail over the fallback when both are present", () => {
    const cards = toSizeCards([grpCabin]);
    const compact = cards.find((c) => c.sizeKey === "150x150")!;
    expect(compact.thumbnail.view).toBe("left-diagonal");
    expect(compact.thumbnail.asset?._ref).toBe("image-diagonal-150");
  });

  it("falls back to the first image when no left-diagonal render exists", () => {
    const cards = toSizeCards([panelCabin]);
    expect(cards[0].thumbnail.view).toBe("front");
    expect(cards[0].thumbnail.asset?._ref).toBe("image-front-panel-200");
  });

  it("orders the carousel images with the thumbnail leading, then the remaining angles without duplicating it", () => {
    const cards = toSizeCards([grpCabin]);
    const compact = cards.find((c) => c.sizeKey === "150x150")!;

    expect(compact.images.map((img) => img.view)).toEqual(["left-diagonal", "front"]);
    expect(compact.images.filter((img) => img.asset?._ref === "image-diagonal-150")).toHaveLength(1);
  });

  it("leads the carousel with the fallback thumbnail when no left-diagonal render exists", () => {
    const cards = toSizeCards([panelCabin]);
    expect(cards[0].images.map((img) => img.asset?._ref)).toEqual([
      "image-front-panel-200",
      "image-door-panel-200",
    ]);
  });

  it("carries both parent and child category slugs for filtering", () => {
    const cards = toSizeCards([grpCabin]);
    expect(cards[0].categorySlugs.sort()).toEqual(["cabin", "grp"]);
  });

  it("carries only its own slug for a top-level category with no parent", () => {
    const cards = toSizeCards([bulletproofBooth]);
    expect(cards[0].categorySlugs).toEqual(["bulletproof"]);
  });

  it("carries product, category, and raw size metadata for catalog search", () => {
    const cards = toSizeCards([grpCabin]);
    const compact = cards.find((card) => card.sizeKey === "150x150")!;

    expect(compact.shortDescription).toBe("A durable fibreglass guard cabin.");
    expect(compact.categoryNames).toEqual(["GRP", "Cabin"]);
    expect(compact.sizeSearchTerms.slice(0, 2)).toEqual(["1.50m x 1.50m", "150x150"]);
  });

  it("builds the cardId as `${productId}-${sizeKey}`, matching the Quote List id", () => {
    const cards = toSizeCards([bulletproofBooth]);
    expect(cards[0].cardId).toBe("product-bulletproof-sentry-booth-110x110");
  });
});
