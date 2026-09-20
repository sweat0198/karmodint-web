import type {
  SanityImage,
  SanityProductCustomizationConfiguration,
  SanitySizeImage,
} from "~/types/catalog";

export interface CatalogCategoryRef {
  _id: string;
  name: string;
  slug: string;
  displayOrder?: number;
  parent?: {
    _id: string;
    name: string;
    slug: string;
    displayOrder?: number;
  } | null;
}

export interface CatalogSizeOption {
  _key?: string;
  label: string;
  lengthM: number;
  widthM: number;
  heightM?: number;
  weightKg?: number;
  isPoa?: boolean;
  price?: number;
  isDefault?: boolean;
  thumbnail: SanitySizeImage | null;
  fallbackThumbnail: SanitySizeImage | null;
  images: SanitySizeImage[];
}

export interface CatalogProduct {
  _id: string;
  name: string;
  slug: string;
  isFeatured?: boolean;
  shortDescription?: string;
  categories: CatalogCategoryRef[];
  representativeImages: SanityImage[];
  sizes: CatalogSizeOption[];
  customizationConfigurations?: SanityProductCustomizationConfiguration[];
}

export interface CategoryTreeChild {
  _id: string;
  name: string;
  slug: string;
  displayOrder?: number;
}

export interface CategoryTreeNode extends CategoryTreeChild {
  children: CategoryTreeChild[];
}

export const CUSTOMIZATION_GROUP_PROJECTION = `{
  _id, _type, title, "identifier": identifier.current, selectionType, isMandatory, maxSelections, description, displayOrder,
  items[]{
    _key, title, pricingType, price, requiresTextInput, textInputPlaceholder, description,
    image { asset, alt, caption }, scope,
    selectionRequirements[]{
      _key,
      "groupId": group->_id,
      "groupTitle": group->title,
      itemKey
    }
  }
}`;

// Category documents may lag behind the seed files in an already-populated Sanity dataset. Keep
// customer-facing labels canonical at the query boundary, keyed by stable slugs; this also keeps
// product category search and the sidebar in sync during the CMS migration.
/**
 * The card-shaped projection of a Product, shared by the catalog and any other page that
 * renders products through `toSizeCards`.
 *
 * The thumbnail is picked by view *name*, not array position (D8): `left-diagonal` first,
 * falling back to the first image if a size has no three-quarter render.
 *
 * `images` feeds the card's hover carousel and excludes the `top` view: every size carries
 * exactly one, and it is a plan drawing rather than an angle of the unit.
 */
export const PRODUCT_CARD_PROJECTION = `{
  _id, name, "slug": slug.current, isFeatured, shortDescription,
  "representativeImages": representativeImages[] { asset, alt, caption },
  "categories": categories[]->{
    _id,
    "name": select(
      slug.current == "containers" => "Portable Cabins",
      slug.current == "cabin" => "Gatehouses & Kiosks",
      name
    ),
    "slug": slug.current,
    displayOrder,
    "parent": parent->{
      _id,
      "name": select(
        slug.current == "containers" => "Portable Cabins",
        slug.current == "cabin" => "Gatehouses & Kiosks",
        name
      ),
      "slug": slug.current,
      displayOrder
    }
  },
  sizes[] {
    _key, label, lengthM, widthM, heightM, weightKg, price, isPoa, isDefault,
    "thumbnail": images[_key == "left-diagonal"][0] { asset, alt, view },
    "fallbackThumbnail": images[0] { asset, alt, view },
    "images": images[view != "top"] { _key, asset, alt, view }
  },
  customizationConfigurations[]{
    _key,
    "group": group->${CUSTOMIZATION_GROUP_PROJECTION},
    itemOverrides[]{
      _key, itemKey, enabled, pricingType, price, titleOverride, descriptionOverride,
      sizeRules[]{
        _key, sizeOptionKey, mode, price, titleOverride, descriptionOverride,
        review { status, snapshot }
      }
    }
  }
}`;

/**
 * Products with their sizes, shaped for the catalog fan-out (`toSizeCards`).
 *
 * The `drafts.` guard mirrors scripts/catalogue/lib/verifyCatalogue.ts — without it, opening a
 * product in the Studio doubles it, since the draft twin copies `status: "published"` too.
 */
export const PRODUCTS_WITH_SIZES_QUERY = `*[_type == "product" && status == "published" && !(_id in path("drafts.**"))] | order(isFeatured desc, name asc) ${PRODUCT_CARD_PROJECTION}`;

/** The sidebar's category tree: top-level categories ordered by `displayOrder`, each with its children. */
export const CATEGORY_TREE_QUERY = `*[_type == "category" && !defined(parent)] | order(displayOrder asc) {
  _id,
  "name": select(
    slug.current == "containers" => "Portable Cabins",
    slug.current == "cabin" => "Gatehouses & Kiosks",
    name
  ),
  "slug": slug.current,
  displayOrder,
  "children": *[_type == "category" && references(^._id)] | order(displayOrder asc) {
    _id,
    name,
    "slug": slug.current,
    displayOrder
  }
}`;
