import type { ProductLineAncestor, ProductLineCategory } from "~/types/productLine";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Home, then the Product Line's parent chain from the top down, then the page itself. */
export function productLineBreadcrumbs(line: ProductLineAncestor): BreadcrumbItem[] {
  const chain: BreadcrumbItem[] = [];
  for (let node: ProductLineAncestor | null | undefined = line; node; node = node.parent) {
    chain.unshift({ name: node.name, path: node.path });
  }
  return [{ name: "Home", path: "/" }, ...chain];
}

/** The catalogue filtered to a Product Line's category, or nothing for a hub page. */
export function productLineCatalogueLink(
  category: ProductLineCategory | null | undefined,
): string | undefined {
  if (!category) return undefined;
  return category.parentSlug
    ? `/products/?category=${category.parentSlug}&subcategory=${category.slug}`
    : `/products/?category=${category.slug}`;
}
