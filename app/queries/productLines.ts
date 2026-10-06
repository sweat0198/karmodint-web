import { PRODUCT_CARD_PROJECTION } from "~/queries/catalog";
import type { ProductLine } from "~/types/productLine";

export type { ProductLine };
/** Every published Product Line path: the prerender list (and, later, the sitemap). */
export { PRODUCT_LINE_PATHS_QUERY } from "~~/shared/utils/productLineRoutes";

const PUBLISHED_PRODUCT_LINES = `_type == "productLine" && defined(path) && !(_id in path("drafts.**"))`;

/**
 * The Product Line served at `$path`, with what the page needs around it: the parent chain for
 * breadcrumbs (three levels up; the deepest Kept URL is two segments) and the category with its
 * published subcategories, so the grid can list both.
 *
 * Child ids are resolved here, but products are fetched separately by
 * `PRODUCTS_IN_CATEGORIES_QUERY`: @nuxtjs/sanity pins apiVersion "1", where a nested `^.^` scope
 * inside a product filter is not something to rely on.
 */
export const PRODUCT_LINE_BY_PATH_QUERY = `*[${PUBLISHED_PRODUCT_LINES} && path == $path][0] {
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

/** Published products in any of `$categoryIds`, in the catalogue card shape. */
export const PRODUCTS_IN_CATEGORIES_QUERY = `*[
  _type == "product" && status == "published" && !(_id in path("drafts.**")) && references($categoryIds)
] | order(name asc) ${PRODUCT_CARD_PROJECTION}`;

/** The category ids a Product Line's grid lists: its category and that category's subcategories. */
export function productLineCategoryIds(line: Pick<ProductLine, "category">): string[] {
  return line.category ? [line.category._id, ...(line.category.childIds ?? [])] : [];
}
