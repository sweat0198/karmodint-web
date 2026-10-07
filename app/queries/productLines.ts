import { PRODUCT_CARD_PROJECTION } from "~/queries/catalog";
import { PUBLISHED_PRODUCT_LINE_FILTER } from "~~/shared/utils/productLineRoutes";
import type { ProductLine, ProductLineNavItem } from "~/types/productLine";

export type { ProductLine, ProductLineNavItem };
/** Every published Product Line path: the prerender list. The sitemap filters the same set (server/utils/sitemap.ts). */
export { PRODUCT_LINE_PATHS_QUERY } from "~~/shared/utils/productLineRoutes";

/**
 * The Product Line served at `$path`, with what the page needs around it: the parent chain for
 * breadcrumbs (three levels up; the deepest Kept URL is two segments) and the category with its
 * published subcategories, so the grid can list both.
 *
 * Child ids are resolved here, but products are fetched separately by
 * `PRODUCTS_IN_CATEGORIES_QUERY`: @nuxtjs/sanity pins apiVersion "1", where a nested `^.^` scope
 * inside a product filter is not something to rely on.
 */
export const PRODUCT_LINE_BY_PATH_QUERY = `*[${PUBLISHED_PRODUCT_LINE_FILTER} && path == $path][0] {
  _id,
  name,
  path,
  "parent": parent->{
    name,
    path,
    "parent": parent->{ name, path, "parent": parent->{ name, path } }
  },
  "category": category->{
    _id,
    "slug": slug.current,
    "parentSlug": parent->slug.current,
    "childIds": *[_type == "category" && parent._ref == ^._id && !(_id in path("drafts.**"))]._id
  },
  description,
  coverImage,
  body,
  faqs[]{ _key, question, answer },
  displayOrder,
  seo
}`;

/**
 * Every published Product Line in display order, as the header and footer link to them: the footer
 * lists them all; the header's Products menu matches catalogue entries on `categoryId`.
 */
export const PRODUCT_LINES_NAV_QUERY = `*[${PUBLISHED_PRODUCT_LINE_FILTER}] | order(displayOrder asc, name asc) {
  _id,
  name,
  path,
  "categoryId": category._ref,
  "hasParent": defined(parent)
}`;

/** Published products in any of `$categoryIds`, in the catalogue card shape. */
export const PRODUCTS_IN_CATEGORIES_QUERY = `*[
  _type == "product" && status == "published" && !(_id in path("drafts.**")) && references($categoryIds)
] | order(name asc) ${PRODUCT_CARD_PROJECTION}`;

/** The category ids a Product Line's grid lists: its category and that category's subcategories. */
export function productLineCategoryIds(line: Pick<ProductLine, "category">): string[] {
  return line.category ? [line.category._id, ...(line.category.childIds ?? [])] : [];
}
