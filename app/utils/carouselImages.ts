import type { CarouselImage, SanitySizeImage } from "~/types/catalog";
import { sanityImageUrl } from "~/utils/sanityImageUrl";

/**
 * Resolves a size's renders into carousel frames.
 *
 * The carousel takes plain URLs so it can also show the customize page's static fallback renders,
 * which never came from Sanity — so the asset refs are resolved here, at the edge.
 *
 * Any image whose ref fails to parse is dropped rather than rendered as a broken `<img>`.
 */
export function toCarouselImages(
  images: SanitySizeImage[] | undefined,
  projectId: string,
  dataset: string,
  width: number,
): CarouselImage[] {
  return (images ?? []).flatMap((image) => {
    const src = sanityImageUrl(image.asset?._ref, projectId, dataset, { width, fit: "max" });
    return src ? [{ src, alt: image.alt }] : [];
  });
}
