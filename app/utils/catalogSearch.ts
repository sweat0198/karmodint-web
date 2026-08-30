import type { CategoryTreeNode } from "~/queries/catalog";
import type { SizeCard } from "~/utils/sizeCards";

export interface CatalogFilterOptions {
  cards: SizeCard[];
  categories: CategoryTreeNode[];
  query: string;
  selectedCategorySlug?: string | null;
  selectedSubcategorySlug?: string | null;
}

export interface CatalogFilterResult {
  searchCards: SizeCard[];
  visibleCards: SizeCard[];
  categories: CategoryTreeNode[];
}

function normalizeSearchText(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesEveryToken(text: string, tokens: string[]): boolean {
  const normalized = normalizeSearchText(text);
  return tokens.every((token) => normalized.includes(token));
}

function filterCategoryTree(
  categories: CategoryTreeNode[],
  searchCards: SizeCard[],
  tokens: string[],
  selectedCategorySlug?: string | null,
  selectedSubcategorySlug?: string | null,
): CategoryTreeNode[] {
  if (tokens.length === 0) return categories;

  const matchedSlugs = new Set(searchCards.flatMap((card) => card.categorySlugs));
  const filtered: CategoryTreeNode[] = [];

  for (const category of categories) {
    if (includesEveryToken(category.name, tokens)) {
      filtered.push(category);
      continue;
    }

    const children = category.children.filter(
      (child) =>
        child.slug === selectedSubcategorySlug ||
        matchedSlugs.has(child.slug) ||
        includesEveryToken(child.name, tokens),
    );
    if (
      category.slug === selectedCategorySlug ||
      matchedSlugs.has(category.slug) ||
      children.length > 0
    ) {
      filtered.push({ ...category, children });
    }
  }

  return filtered;
}

export function filterCatalog({
  cards,
  categories,
  query,
  selectedCategorySlug,
  selectedSubcategorySlug,
}: CatalogFilterOptions): CatalogFilterResult {
  const tokens = normalizeSearchText(query).split(" ").filter(Boolean);
  const searchCards = tokens.length
    ? cards.filter((card) => {
        const productText = [
          card.productName,
          card.shortDescription,
          ...card.categoryNames,
        ].join(" ");
        return (
          includesEveryToken(productText, tokens) ||
          includesEveryToken([productText, ...card.sizeSearchTerms].join(" "), tokens)
        );
      })
    : cards;

  const targetCategorySlug = selectedSubcategorySlug ?? selectedCategorySlug;
  const visibleCards = targetCategorySlug
    ? searchCards.filter((card) => card.categorySlugs.includes(targetCategorySlug))
    : searchCards;

  return {
    searchCards,
    visibleCards,
    categories: filterCategoryTree(
      categories,
      searchCards,
      tokens,
      selectedCategorySlug,
      selectedSubcategorySlug,
    ),
  };
}
