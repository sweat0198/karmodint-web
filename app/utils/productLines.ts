import type {
  ProductLineAncestor,
  ProductLineCategory,
  ProductLineNavItem,
} from "~/types/productLine";

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

/**
 * The catalogue filtered to one category. A subcategory only resolves nested under its parent's
 * `category=`, so it needs the parent's slug too.
 */
export function catalogueFilterPath(slug: string, parentSlug?: string | null): string {
  return parentSlug
    ? `/products/?category=${parentSlug}&subcategory=${slug}`
    : `/products/?category=${slug}`;
}

/** The catalogue filtered to a Product Line's category, or nothing for a hub page. */
export function productLineCatalogueLink(
  category: ProductLineCategory | null | undefined,
): string | undefined {
  if (!category) return undefined;
  return catalogueFilterPath(category.slug, category.parentSlug);
}

/**
 * Each catalogue category's Product Line page, keyed by category id, for the header's Products
 * menu. When several Product Lines share a category the parentless one wins (Containers →
 * `/portable-cabin/`, not one of its children); otherwise the first in display order does.
 */
export function productLinePathsByCategory(
  lines: readonly ProductLineNavItem[],
): Map<string, string> {
  const winners = new Map<string, ProductLineNavItem>();
  for (const line of lines) {
    if (!line.categoryId) continue;
    const current = winners.get(line.categoryId);
    if (!current || (current.hasParent && !line.hasParent)) winners.set(line.categoryId, line);
  }
  return new Map([...winners].map(([categoryId, line]) => [categoryId, line.path]));
}
