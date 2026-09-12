import { describe, expect, it } from "vitest";
import { GALLERY_SEEDS } from "../../scripts/gallery/data";
import {
  buildGalleryDocuments,
  type GalleryManifestEntry,
} from "../../scripts/gallery/buildGalleryDocuments";

function manifestFor(
  seeds = GALLERY_SEEDS,
  overrides: Partial<GalleryManifestEntry> = {},
): GalleryManifestEntry[] {
  return seeds.map((seed) => ({
    filePath: seed.filePath,
    title: `Title for ${seed.id}`,
    alt: `Alt for ${seed.id}`,
    rightsStatus: "unknown",
    uploadEligible: true,
    ...overrides,
  }));
}

function assetIdsFor(seeds = GALLERY_SEEDS): Record<string, string> {
  return Object.fromEntries(
    seeds.map((seed) => [seed.filePath, `image-${seed.id}-100x50-jpg`]),
  );
}

describe("gallery entry documents", () => {
  const documents = buildGalleryDocuments(
    GALLERY_SEEDS,
    manifestFor(),
    assetIdsFor(),
  );

  it("builds one document per seed with unique deterministic ids", () => {
    expect(documents).toHaveLength(GALLERY_SEEDS.length);
    expect(new Set(documents.map((document) => document._id)).size).toBe(
      GALLERY_SEEDS.length,
    );
    expect(documents.every((document) => document._id.startsWith("galleryEntry-"))).toBe(true);
  });

  it("never sets order, so the schema falls back to alphabetical", () => {
    expect(documents.every((document) => !("order" in document))).toBe(true);
  });

  it("takes title and alt from the manifest, not the seed", () => {
    expect(documents[0].projectTitle).toBe(`Title for ${GALLERY_SEEDS[0].id}`);
    expect(documents[0].image.alt).toBe(`Alt for ${GALLERY_SEEDS[0].id}`);
  });

  it("points each entry at its seeded category", () => {
    const categories = new Set(
      documents.map((document) => document.category._ref),
    );
    expect(categories).toEqual(
      new Set([
        "category-cabin-metro-city",
        "category-cabin-grp",
        "category-cabin-composite",
        "category-bulletproof",
        "category-containers",
      ]),
    );
  });

  it("gives every entry a non-empty description within the schema limit", () => {
    for (const document of documents) {
      expect(document.description.length).toBeGreaterThan(0);
      expect(document.description.length).toBeLessThanOrEqual(500);
    }
  });

  it("refuses a photo the rights audit has not cleared", () => {
    const [seed] = GALLERY_SEEDS;
    const blocked = manifestFor([seed], {
      rightsStatus: "review-required",
      uploadEligible: false,
    });
    expect(() =>
      buildGalleryDocuments([seed], blocked, assetIdsFor([seed])),
    ).toThrow(/not upload eligible/);
  });

  it("refuses a seed with no manifest entry", () => {
    const [seed] = GALLERY_SEEDS;
    expect(() => buildGalleryDocuments([seed], [], assetIdsFor([seed]))).toThrow(
      /no manifest entry/,
    );
  });

  it("refuses a seed whose image was never uploaded", () => {
    const [seed] = GALLERY_SEEDS;
    expect(() => buildGalleryDocuments([seed], manifestFor([seed]), {})).toThrow(
      /no uploaded asset/,
    );
  });
});
