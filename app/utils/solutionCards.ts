import type { CatalogProduct, CatalogSizeOption } from "~/queries/catalog";
import type { SanitySizeImage } from "~/types/catalog";
import type { SolutionProductEntry } from "~/types/solution";
import { toSizeCards, type SizeCard } from "~/utils/sizeCards";

/**
 * Gives a size the product's representative photography when it has none of its own.
 *
 * Portable cabins are the case this exists for: their schema lets a size carry no render because
 * the product holds one shared representative image instead. Without this, `toSizeCards` would
 * drop such a size for want of a thumbnail, silently removing a product the editor chose.
 */
function withFallbackMedia(
  product: CatalogProduct,
  size: CatalogSizeOption,
): CatalogSizeOption {
  const hasOwnMedia = Boolean(size.thumbnail || size.fallbackThumbnail);
  if (hasOwnMedia) return size;

  const representative = product.representativeImages?.[0];
  if (!representative?.asset) return size;

  const image: SanitySizeImage = {
    ...representative,
    view: "front",
    alt: representative.alt ?? `${product.name}, ${size.label}`,
  };

  return { ...size, thumbnail: image, fallbackThumbnail: image, images: [image] };
}

/**
 * Resolves a solution's curated entries into catalog cards, one per entry.
 *
 * Each entry is narrowed to the single chosen size and passed through `toSizeCards`, so a solution
 * card is built by exactly the same rules as a catalog card — thumbnail view preference, spec
 * lines, POA handling — and stays in step with it.
 *
 * Order is the editor's: `toSizeCards` sorts by category display order, which is right for the
 * catalog but would scramble a curated list, so entries are converted one at a time.
 *
 * An entry whose product reference is broken, or whose size key no longer exists, is dropped
 * rather than rendered as a blank card — the same rule `toGalleryTiles` follows.
 */
export function toSolutionCards(
  entries: SolutionProductEntry[] | null | undefined,
): SizeCard[] {
  return (entries ?? []).flatMap((entry) => {
    const product = entry.product;
    if (!product) return [];

    const size = product.sizes?.find((candidate) => candidate._key === entry.sizeOptionKey);
    if (!size) return [];

    return toSizeCards([{ ...product, sizes: [withFallbackMedia(product, size)] }]);
  });
}
