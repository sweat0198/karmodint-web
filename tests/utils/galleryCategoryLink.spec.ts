import { describe, expect, it } from "vitest";
import { toCategoryProductsLink } from "~/utils/galleryCategoryLink";
import type { GalleryCategoryRef } from "~/types/gallery";

describe("toCategoryProductsLink", () => {
  it("links straight to a top-level category", () => {
    const category: GalleryCategoryRef = { _id: "c1", name: "Containers", slug: "containers" };

    expect(toCategoryProductsLink(category)).toEqual({
      path: "/products",
      query: { category: "containers" },
    });
  });

  it("nests a subcategory under its parent's category param", () => {
    const category: GalleryCategoryRef = {
      _id: "c2",
      name: "Metro City",
      slug: "metro-city",
      parentSlug: "cabin",
    };

    expect(toCategoryProductsLink(category)).toEqual({
      path: "/products",
      query: { category: "cabin", subcategory: "metro-city" },
    });
  });
});
