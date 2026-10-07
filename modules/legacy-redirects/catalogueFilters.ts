/** The catalogue's category tree, as far as its `?category=` / `?subcategory=` filters need it. */
export interface CatalogueCategoryNode {
  slug: string;
  children: readonly { slug: string }[];
}

/**
 * The category tree the catalogue filters against. Mirrors `CATEGORY_TREE_QUERY` (`app/queries/catalog.ts`): top-level
 * categories, each with the categories that reference it as children.
 */
export const CATALOGUE_CATEGORY_TREE_QUERY = `*[_type == "category" && !defined(parent)]{
  "slug": slug.current,
  "children": *[_type == "category" && references(^._id)]{ "slug": slug.current }
}`;

/**
 * Redirect targets on `/products/` whose filter the catalogue can't resolve, one message each. `?category=` matches a
 * top-level category only, and `?subcategory=` a child of that category (`useCatalogBrowse`); anything else silently
 * lands on the unfiltered catalogue, which a built-page check can't see.
 */
export function findUnknownCatalogueFilters(
  targets: readonly string[],
  tree: readonly CatalogueCategoryNode[],
): string[] {
  return targets.flatMap((target) => {
    const url = new URL(target, "https://catalogue.invalid");
    if (url.pathname !== "/products/") return [];

    const categorySlug = url.searchParams.get("category");
    const subcategorySlug = url.searchParams.get("subcategory");
    if (categorySlug === null) {
      return subcategorySlug === null ? [] : [`${target}: a subcategory needs its category`];
    }

    const category = tree.find((node) => node.slug === categorySlug);
    if (!category) return [`${target}: no top-level category "${categorySlug}"`];
    if (subcategorySlug !== null && !category.children.some((child) => child.slug === subcategorySlug)) {
      return [`${target}: "${categorySlug}" has no subcategory "${subcategorySlug}"`];
    }
    return [];
  });
}
