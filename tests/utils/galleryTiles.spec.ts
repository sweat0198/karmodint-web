import { describe, expect, it } from "vitest";
import { toGalleryTiles } from "~/utils/galleryTiles";
import type { GalleryEntry } from "~/types/gallery";

const PROJECT = "proj123";
const DATASET = "production";

const CATEGORY = { _id: "cat-1", name: "Containers", slug: "containers", displayOrder: 1 };

function entry(overrides: Partial<GalleryEntry> = {}): GalleryEntry {
  return {
    _id: "entry-1",
    projectTitle: "Container house in a garden",
    image: {
      asset: { _type: "reference", _ref: "image-abc123-1600x1200-jpg" },
      alt: "A white container house.",
    },
    description: "A short description.",
    order: 1,
    category: CATEGORY,
    ...overrides,
  };
}

describe("toGalleryTiles", () => {
  it("resolves an entry into a tile with a src, srcset and aspect ratio", () => {
    const tiles = toGalleryTiles([entry()], PROJECT, DATASET);

    expect(tiles).toHaveLength(1);
    const [tile] = tiles;
    expect(tile.id).toBe("entry-1");
    expect(tile.title).toBe("Container house in a garden");
    expect(tile.category).toEqual(CATEGORY);
    expect(tile.image.src).toBe(
      "https://cdn.sanity.io/images/proj123/production/abc123-1600x1200.jpg?w=800&fit=max",
    );
    expect(tile.image.alt).toBe("A white container house.");
    expect(tile.image.aspectRatio).toBeCloseTo(1600 / 1200);
    expect(tile.image.srcset).toContain("w=480&fit=max 480w");
    expect(tile.image.srcset).toContain("w=1600&fit=max 1600w");
  });

  it("drops an entry whose image ref won't parse", () => {
    const tiles = toGalleryTiles(
      [entry({ image: { asset: { _type: "reference", _ref: "not-a-valid-ref" }, alt: "x" } })],
      PROJECT,
      DATASET,
    );

    expect(tiles).toEqual([]);
  });

  it("drops an entry with a broken category reference", () => {
    const tiles = toGalleryTiles(
      [entry({ category: undefined as unknown as GalleryEntry["category"] })],
      PROJECT,
      DATASET,
    );

    expect(tiles).toEqual([]);
  });

  it("returns an empty list for undefined entries", () => {
    expect(toGalleryTiles(undefined, PROJECT, DATASET)).toEqual([]);
  });
});
