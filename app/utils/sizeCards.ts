import { formatMetricAndImperialDimension, type SanitySizeImage } from "~/types/catalog";
import type { CatalogProduct, CatalogSizeOption } from "~/queries/catalog";

/** One purchasable Size Option, presented as its own product card (D3). */
export interface SizeCard {
  /** `${productId}-${sizeKey}` — the Quote List id, and the v-for :key. */
  cardId: string;
  productId: string;
  productName: string;
  productSlug: string;
  /** Product-level description used only by catalog search. */
  shortDescription: string;
  sizeKey: string;
  /** The footprint, e.g. `2.15m × 2.70m (7.1ft × 8.9ft)`. Shown as the bold sub-line under the title. */
  sizeLabel: string;
  specs: string[];
  isPoa: boolean;
  price: number;
  thumbnail: SanitySizeImage;
  /** Every angle available for this size, thumbnail first — the hover carousel cycles through these. */
  images: SanitySizeImage[];
  /** Both parent and child category slugs, so a card matches a filter at either level. */
  categorySlugs: string[];
  /** Both parent and child category names, preserving Sanity assignment order. */
  categoryNames: string[];
  /** Raw size label/key. Generated display dimensions intentionally stay out of search. */
  sizeSearchTerms: string[];
}

function footprint(size: CatalogSizeOption): number {
  return size.lengthM * size.widthM;
}

function formatFootprintLabel(size: CatalogSizeOption): string {
  const length = formatMetricAndImperialDimension(size.lengthM);
  const width = formatMetricAndImperialDimension(size.widthM);
  return `${length.metric} × ${width.metric} (${length.imperial} × ${width.imperial})`;
}

/** Height and weight specs, each omitted when unsupplied — `weightKg: 0` means "not yet supplied", not weightless. */
function buildSpecs(size: CatalogSizeOption): string[] {
  const specs: string[] = [];
  if (size.heightM) {
    const height = formatMetricAndImperialDimension(size.heightM);
    specs.push(`Height: ${height.metric} (${height.imperial})`);
  }
  if (size.weightKg) {
    specs.push(`Weight: ${size.weightKg}kg`);
  }
  return specs;
}

/** The lowest `displayOrder` among a product's categories and their parents (D11). */
function categoryDisplayOrder(product: CatalogProduct): number {
  const orders = product.categories.flatMap((category) =>
    [category.displayOrder, category.parent?.displayOrder].filter(
      (order): order is number => order !== undefined,
    ),
  );
  return orders.length ? Math.min(...orders) : Number.MAX_SAFE_INTEGER;
}

function categoryMetadataFor(product: CatalogProduct): {
  slugs: string[];
  names: string[];
} {
  const slugs = new Set<string>();
  const names = new Set<string>();
  for (const category of product.categories) {
    slugs.add(category.slug);
    names.add(category.name);
    if (category.parent) {
      slugs.add(category.parent.slug);
      names.add(category.parent.name);
    }
  }
  return { slugs: [...slugs], names: [...names] };
}

function sortedProducts(products: CatalogProduct[]): CatalogProduct[] {
  return [...products].sort((a, b) => {
    const orderDiff = categoryDisplayOrder(a) - categoryDisplayOrder(b);
    if (orderDiff !== 0) return orderDiff;

    const featuredDiff = Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured));
    if (featuredDiff !== 0) return featuredDiff;

    return a.name.localeCompare(b.name);
  });
}

function sortedSizes(sizes: CatalogSizeOption[]): CatalogSizeOption[] {
  return [...sizes].sort((a, b) => footprint(a) - footprint(b));
}

/** The carousel's frame order: the thumbnail leads (matching the static card view), then every other angle. */
function carouselImages(size: CatalogSizeOption, thumbnail: SanitySizeImage): SanitySizeImage[] {
  const rest = (size.images ?? []).filter(
    (image) => image.asset?._ref !== thumbnail.asset?._ref,
  );
  return [thumbnail, ...rest];
}

/**
 * Flattens Products into one card per Size Option (D3), in display order (D11).
 *
 * A size with no images at all — schema requires at least one plan view, so this is defensive
 * only — is skipped rather than rendered without a thumbnail.
 */
export function toSizeCards(products: CatalogProduct[]): SizeCard[] {
  const cards: SizeCard[] = [];

  for (const product of sortedProducts(products)) {
    const categoryMetadata = categoryMetadataFor(product);

    for (const size of sortedSizes(product.sizes)) {
      const sizeKey = size._key ?? "";
      const thumbnail = size.thumbnail ?? size.fallbackThumbnail;
      if (!thumbnail) continue;

      cards.push({
        cardId: `${product._id}-${sizeKey}`,
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        shortDescription: product.shortDescription ?? "",
        sizeKey,
        sizeLabel: formatFootprintLabel(size),
        specs: buildSpecs(size),
        isPoa: Boolean(size.isPoa),
        price: size.price,
        thumbnail,
        images: carouselImages(size, thumbnail),
        categorySlugs: categoryMetadata.slugs,
        categoryNames: categoryMetadata.names,
        sizeSearchTerms: [size.label, sizeKey].filter(Boolean),
      });
    }
  }

  return cards;
}
