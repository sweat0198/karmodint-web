import { PRODUCT_CARD_PROJECTION } from "~/queries/catalog";
import type { Solution, SolutionSummary } from "~/types/solution";

export type { Solution, SolutionSummary };

/** The solutions listing: cover photo, name and description, in editor-chosen order. */
export const SOLUTIONS_QUERY = `*[
  _type == "solution" && !(_id in path("drafts.**"))
] | order(displayOrder asc, name asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  coverImage,
  displayOrder,
  // Membership test rather than a dereference: @nuxtjs/sanity pins apiVersion "1", whose GROQ
  // silently evaluates \`@.product->status\` inside a filter to 0 rather than erroring.
  "productCount": count(products[product._ref in *[_type == "product" && status == "published"]._id])
}`;

/**
 * One solution with each curated entry's product resolved to the catalog card projection.
 *
 * The product is fetched by id with the published filter rather than plain dereference: a product
 * pulled from sale must not resurface through a solution that still lists it. Such an entry comes
 * back with a null product, which `toSolutionCards` drops.
 */
export const SOLUTION_BY_SLUG_QUERY = `*[
  _type == "solution" && slug.current == $slug && !(_id in path("drafts.**"))
][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  coverImage,
  displayOrder,
  seo,
  products[]{
    _key,
    sizeOptionKey,
    "product": *[
      _id == ^.product._ref && status == "published" && !(_id in path("drafts.**"))
    ][0] ${PRODUCT_CARD_PROJECTION}
  }
}`;
