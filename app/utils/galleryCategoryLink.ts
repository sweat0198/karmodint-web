import type { GalleryCategoryRef } from "~/types/gallery";

export interface CategoryProductsLink {
  path: "/products";
  query: { category: string; subcategory?: string };
}

/**
 * Where "browse similar products" for a gallery category should land on the catalogue.
 *
 * The catalogue's `?category=` param only resolves against top-level categories (see
 * `useCatalogBrowse`'s `selectedCategory`, matched against the category tree by slug); a
 * subcategory only resolves as `?subcategory=` nested under its parent's `category=`. So a gallery
 * category that is itself a subcategory (e.g. "Metro City" under "Cabin") needs both params.
 */
export function toCategoryProductsLink(category: GalleryCategoryRef): CategoryProductsLink {
  return category.parentSlug
    ? { path: "/products", query: { category: category.parentSlug, subcategory: category.slug } }
    : { path: "/products", query: { category: category.slug } };
}
