import type { CatalogProduct, CatalogSizeOption } from "~/queries/catalog";
import type { SanitySizeImage } from "~/types/catalog";
import type { SolutionProductEntry } from "~/types/solution";
import { toSizeCards, type SizeCard } from "~/utils/sizeCards";

/**
 * A stand-in render for a size that carries none of its own: the product's representative
 * photography, or failing that any sibling size's render.
 *
 * Portable cabins are the case this exists for. Their schema lets a size carry no render, and in
 * practice one size holds the photography for the whole model while the rest hold none. Without a
 * stand-in, `toSizeCards` drops those sizes for want of a thumbnail and they vanish from every
 * solution that lists them. `toPortableContainerCards` borrows a sibling render the same way.
 */
function standInImage(product: CatalogProduct): SanitySizeImage | undefined {
  const representative = product.representativeImages?.[0];
  if (representative?.asset) {
    return { ...representative, view: "front", alt: representative.alt ?? `${product.name} representative image` };
  }

  const sibling = (product.sizes ?? []).find((size) => size.thumbnail ?? size.fallbackThumbnail);
  const borrowed = sibling?.thumbnail ?? sibling?.fallbackThumbnail;
  // The borrowed render depicts a different size, so its original alt text would misdescribe this
  // card. Say what it actually is instead.
  return borrowed ? { ...borrowed, alt: `${product.name} representative image` } : undefined;
}

function withFallbackMedia(
  product: CatalogProduct,
  size: CatalogSizeOption,
): CatalogSizeOption {
  const hasOwnMedia = Boolean(size.thumbnail || size.fallbackThumbnail);
  if (hasOwnMedia) return size;

  const image = standInImage(product);
  if (!image) return size;

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
