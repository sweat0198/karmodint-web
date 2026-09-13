import type { GalleryEntry, GalleryTile } from "~/types/gallery";
import { sanityImageDimensions, sanityImageUrl } from "~/utils/sanityImageUrl";

const SRCSET_WIDTHS = [480, 800, 1200, 1600];
const DEFAULT_SRC_WIDTH = 800;

/**
 * Resolves gallery entries into tiles ready to render: a real image URL, a srcset spanning the
 * widths a masonry tile can actually reach, and the aspect ratio the layout engine packs by.
 *
 * An entry whose image ref won't parse, or whose category reference is broken, is dropped rather
 * than rendered as a broken tile — same rule `toCarouselImages` follows.
 */
export function toGalleryTiles(
  entries: GalleryEntry[] | null | undefined,
  projectId: string,
  dataset: string,
): GalleryTile[] {
  return (entries ?? []).flatMap((entry) => {
    const assetRef = entry.image?.asset?._ref;
    const dimensions = sanityImageDimensions(assetRef);
    const src = sanityImageUrl(assetRef, projectId, dataset, {
      width: DEFAULT_SRC_WIDTH,
      fit: "max",
    });
    if (!dimensions || !src || !entry.category) return [];

    const srcset = SRCSET_WIDTHS.map((width) => {
      const url = sanityImageUrl(assetRef, projectId, dataset, { width, fit: "max" });
      return `${url} ${width}w`;
    }).join(", ");

    return [
      {
        id: entry._id,
        title: entry.projectTitle,
        description: entry.description,
        category: entry.category,
        image: {
          src,
          srcset,
          alt: entry.image.alt,
          width: dimensions.width,
          height: dimensions.height,
          aspectRatio: dimensions.width / dimensions.height,
        },
      },
    ];
  });
}
