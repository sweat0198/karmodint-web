import type { CatalogProduct } from "~/queries/catalog";
import type { CatalogDisplayCard } from "~/utils/catalogSearch";
import {
  isPortableContainerProduct,
  toPortableContainerCards,
  type PortableContainerCard,
} from "~/utils/portableContainerCards";
import { toSizeCards } from "~/utils/sizeCards";

/**
 * The catalogue's cards for a set of products: one card per portable-container model (its sizes
 * are chosen later in Customize), one card per Size Option for everything else.
 *
 * Shared by `/products/` and Product Line grids, so a product looks the same on both.
 */
export function toCatalogDisplayCards(products: CatalogProduct[]): CatalogDisplayCard[] {
  return [
    ...toPortableContainerCards(products),
    ...toSizeCards(products.filter((product) => !isPortableContainerProduct(product))),
  ];
}

export function isPortableContainerCard(card: CatalogDisplayCard): card is PortableContainerCard {
  return "isPoaOnly" in card;
}

/** What a card contributes to a Product structured-data entry. */
export interface CatalogCardSchemaInput {
  name: string;
  imageRef: string | undefined;
  price: number | undefined;
  isPoa: boolean;
  specs: string[];
}

export function catalogCardSchemaInput(card: CatalogDisplayCard): CatalogCardSchemaInput {
  if (isPortableContainerCard(card)) {
    return {
      name: card.productName,
      imageRef: card.representativeImage?.asset?._ref,
      price: card.lowestPrice,
      isPoa: card.isPoaOnly,
      specs: card.sizes.flatMap((size) => size.specs),
    };
  }

  return {
    name: `${card.productName} ${card.sizeLabel}`,
    imageRef: card.thumbnail.asset?._ref,
    price: card.price,
    isPoa: card.isPoa,
    specs: card.specs,
  };
}
