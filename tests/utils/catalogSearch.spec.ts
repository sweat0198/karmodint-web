import { describe, expect, it } from "vitest";
import type { CatalogProduct, CategoryTreeNode } from "~/queries/catalog";
import type { SanitySizeImage } from "~/types/catalog";
import { toSizeCards, type SizeCard } from "~/utils/sizeCards";
import { filterCatalog } from "~/utils/catalogSearch";

function frontImage(assetId: string): SanitySizeImage {
  return {
    _key: "front",
    view: "front",
    alt: "Front view",
    asset: { _type: "reference", _ref: assetId },
  };
}

const measurementProduct: CatalogProduct = {
  _id: "measurement-cabin",
  name: "Measurement Cabin",
  slug: "measurement-cabin",
  categories: [],
  sizes: [
    {
      _key: "150x150",
      label: "1.50m x 1.50m",
      lengthM: 1.5,
      widthM: 1.5,
      weightKg: 0,
      price: 0,
      thumbnail: frontImage("image-front-150"),
      fallbackThumbnail: frontImage("image-front-150"),
      images: [frontImage("image-front-150")],
    },
    {
      _key: "300x300",
      label: "3.00m x 3.00m",
      lengthM: 3,
      widthM: 3,
      heightM: 2.4,
      weightKg: 450,
      price: 0,
      thumbnail: frontImage("image-front-300"),
      fallbackThumbnail: frontImage("image-front-300"),
      images: [frontImage("image-front-300")],
    },
    {
      _key: "215x270",
      label: "2.15m x 2.70m",
      lengthM: 2.15,
      widthM: 2.7,
      weightKg: 550,
      price: 0,
      thumbnail: frontImage("image-front-215"),
      fallbackThumbnail: frontImage("image-front-215"),
      images: [frontImage("image-front-215")],
    },
    {
      _key: "1150x200",
      label: "11.50m x 2.00m",
      lengthM: 11.5,
      widthM: 2,
      weightKg: 0,
      price: 0,
      thumbnail: frontImage("image-front-1150"),
      fallbackThumbnail: frontImage("image-front-1150"),
      images: [frontImage("image-front-1150")],
    },
  ],
};

function card(overrides: Partial<SizeCard> & Pick<SizeCard, "cardId" | "productId">): SizeCard {
  return {
    productName: "İzmir Güvenlik Kabini",
    productSlug: "izmir-guvenlik-kabini",
    shortDescription: "Dayanıklı fibreglass güvenlik yapısı",
    sizeKey: "150x150",
    sizeLabel: "1.50m × 1.50m (4.9ft × 4.9ft)",
    sizeSearchTerms: ["Küçük", "150x150"],
    specs: [],
    isPoa: true,
    price: 0,
    thumbnail: {
      _key: "front",
      view: "front",
      alt: "Front view",
      asset: { _type: "reference", _ref: "image-front" },
    },
    images: [],
    categorySlugs: ["cabins", "grp"],
    categoryNames: ["Portable Cabins", "GRP"],
    ...overrides,
  };
}

const categories: CategoryTreeNode[] = [
  {
    _id: "category-cabins",
    name: "Portable Cabins",
    slug: "cabins",
    children: [
      { _id: "category-grp", name: "GRP", slug: "grp" },
      { _id: "category-panel", name: "Panel", slug: "panel" },
    ],
  },
  {
    _id: "category-sanitary",
    name: "Sanitary Units",
    slug: "sanitary",
    children: [],
  },
];

const cards: SizeCard[] = [
  card({ cardId: "izmir-small", productId: "izmir", sizeSearchTerms: ["Küçük", "150x150"] }),
  card({
    cardId: "izmir-large",
    productId: "izmir",
    sizeKey: "300x300",
    sizeSearchTerms: ["Büyük", "300x300"],
  }),
  card({
    cardId: "panel-medium",
    productId: "panel",
    productName: "Insulated Panel Cabin",
    productSlug: "insulated-panel-cabin",
    shortDescription: "Thermally insulated site office",
    sizeKey: "200x200",
    sizeSearchTerms: ["Medium", "200x200"],
    categorySlugs: ["cabins", "panel"],
    categoryNames: ["Portable Cabins", "Panel"],
  }),
  card({
    cardId: "toilet-standard",
    productId: "toilet",
    productName: "Portable Toilet",
    productSlug: "portable-toilet",
    shortDescription: "Single-person sanitary unit",
    sizeKey: "standard",
    sizeSearchTerms: ["Standard", "standard"],
    categorySlugs: ["sanitary"],
    categoryNames: ["Sanitary Units"],
  }),
];

describe("filterCatalog", () => {
  it("normalizes Turkish characters and punctuation while requiring every product token", () => {
    const result = filterCatalog({ cards, categories, query: "IZMIR, GUVENLIK" });

    expect(result.visibleCards.map((item) => item.cardId)).toEqual([
      "izmir-small",
      "izmir-large",
    ]);
  });

  it("matches tokens across product, category, and description fields for every product size", () => {
    const result = filterCatalog({
      cards,
      categories,
      query: "izmir portable yapi",
    });

    expect(result.visibleCards.map((item) => item.cardId)).toEqual([
      "izmir-small",
      "izmir-large",
    ]);
  });

  it("shows only the size card whose raw label or key matches", () => {
    const result = filterCatalog({ cards, categories, query: "Büyük" });

    expect(result.visibleCards.map((item) => item.cardId)).toEqual(["izmir-large"]);
  });

  it("matches combined displayed measurements on one projected size", () => {
    const projectedCards = toSizeCards([measurementProduct]);
    const result = filterCatalog({
      cards: projectedCards,
      categories,
      query: "3m height 7.9ft weight 450 kg",
    });

    expect(result.visibleCards.map((item) => item.sizeKey)).toEqual(["300x300"]);
    const compactTerms = projectedCards.find((card) => card.sizeKey === "150x150")!.sizeSearchTerms;
    expect(compactTerms.some((term) => term.startsWith("Height"))).toBe(false);
    expect(compactTerms.some((term) => term.startsWith("Weight"))).toBe(false);
    expect(
      filterCatalog({ cards: projectedCards, categories, query: "length 3m" }).visibleCards,
    ).toEqual([]);
  });

  it("matches decimal measurements by value rather than digit fragments", () => {
    const projectedCards = toSizeCards([measurementProduct]);

    expect(
      filterCatalog({ cards: projectedCards, categories, query: "1.5" }).visibleCards.map(
        (card) => card.sizeKey,
      ),
    ).toEqual(["150x150"]);
    expect(
      filterCatalog({ cards: projectedCards, categories, query: "1,5" }).visibleCards.map(
        (card) => card.sizeKey,
      ),
    ).toEqual(["150x150"]);
  });

  it("requires a matching unit when a decimal query includes one", () => {
    const projectedCards = toSizeCards([measurementProduct]);

    expect(
      filterCatalog({ cards: projectedCards, categories, query: "1.5m" }).visibleCards.map(
        (card) => card.sizeKey,
      ),
    ).toEqual(["150x150"]);
    expect(
      filterCatalog({ cards: projectedCards, categories, query: "1.5 m" }).visibleCards.map(
        (card) => card.sizeKey,
      ),
    ).toEqual(["150x150"]);
    expect(
      filterCatalog({ cards: projectedCards, categories, query: "1.5ft" }).visibleCards,
    ).toEqual([]);
  });

  it("intersects global search results with the active category filter", () => {
    const result = filterCatalog({
      cards,
      categories,
      query: "portable cabins",
      selectedCategorySlug: "cabins",
      selectedSubcategorySlug: "panel",
    });

    expect(result.searchCards.map((item) => item.cardId)).toEqual([
      "izmir-small",
      "izmir-large",
      "panel-medium",
    ]);
    expect(result.visibleCards.map((item) => item.cardId)).toEqual(["panel-medium"]);
  });

  it("filters category navigation to matching product branches and keeps their ancestors", () => {
    const result = filterCatalog({ cards, categories, query: "insulated" });

    expect(result.categories).toEqual([
      {
        ...categories[0],
        children: [{ _id: "category-panel", name: "Panel", slug: "panel" }],
      },
    ]);
  });

  it("pins the selected category path when it has no search hits", () => {
    const result = filterCatalog({
      cards,
      categories,
      query: "toilet",
      selectedCategorySlug: "cabins",
      selectedSubcategorySlug: "grp",
    });

    expect(result.visibleCards).toEqual([]);
    expect(result.categories).toEqual([
      {
        ...categories[0],
        children: [{ _id: "category-grp", name: "GRP", slug: "grp" }],
      },
      categories[1],
    ]);
  });
});
