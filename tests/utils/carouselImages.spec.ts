import { describe, it, expect } from "vitest";
import { toCarouselImages } from "~/utils/carouselImages";
import { sanityImageUrl } from "~/utils/sanityImageUrl";
import type { SanitySizeImage } from "~/types/catalog";

const PROJECT = "proj123";
const DATASET = "production";

function image(view: SanitySizeImage["view"], assetId: string): SanitySizeImage {
  return { _key: view, view, alt: `${view} view`, asset: { _type: "reference", _ref: assetId } };
}

describe("sanityImageUrl transforms", () => {
  // JSON-LD and outbound emails want the original asset, so no params may be appended.
  it("returns a bare URL when no transform is given", () => {
    expect(sanityImageUrl("image-abc123-800x600-png", PROJECT, DATASET)).toBe(
      "https://cdn.sanity.io/images/proj123/production/abc123-800x600.png",
    );
  });

  it("appends only the transform keys supplied", () => {
    expect(
      sanityImageUrl("image-abc123-800x600-png", PROJECT, DATASET, { width: 600, fit: "max" }),
    ).toBe("https://cdn.sanity.io/images/proj123/production/abc123-800x600.png?w=600&fit=max");

    expect(sanityImageUrl("image-abc123-800x600-png", PROJECT, DATASET, { width: 600 })).toBe(
      "https://cdn.sanity.io/images/proj123/production/abc123-800x600.png?w=600",
    );
  });
});

describe("toCarouselImages", () => {
  it("resolves each render to a sized URL, preserving order and alt text", () => {
    const frames = toCarouselImages(
      [image("left-diagonal", "image-aaa-400x300-png"), image("front", "image-bbb-400x300-png")],
      PROJECT,
      DATASET,
      600,
    );

    expect(frames).toEqual([
      {
        src: "https://cdn.sanity.io/images/proj123/production/aaa-400x300.png?w=600&fit=max",
        alt: "left-diagonal view",
      },
      {
        src: "https://cdn.sanity.io/images/proj123/production/bbb-400x300.png?w=600&fit=max",
        alt: "front view",
      },
    ]);
  });

  it("drops an unparseable ref rather than emitting a broken frame", () => {
    const frames = toCarouselImages(
      [image("front", "not-a-valid-ref"), image("interior", "image-ccc-400x300-png")],
      PROJECT,
      DATASET,
      600,
    );

    expect(frames).toHaveLength(1);
    expect(frames[0].alt).toBe("interior view");
  });

  it("returns an empty list for an absent gallery", () => {
    expect(toCarouselImages(undefined, PROJECT, DATASET, 600)).toEqual([]);
  });
});
