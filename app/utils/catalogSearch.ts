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
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/[^a-z0-9.]+/g, " ")
    .trim();
}

interface NumericToken {
  text: string;
  value: number;
  unit?: string;
}

const MEASUREMENT_UNITS = new Set(["m", "ft", "kg"]);

function numericToken(value: string): NumericToken | null {
  const match = value.match(/^(\d+(?:\.\d+)?)([a-z]+)?$/);
  if (!match) return null;
  return { text: match[1]!, value: Number(match[1]), unit: match[2] };
}

function searchTokens(value: string): string[] {
  const terms = normalizeSearchText(value).split(" ").filter(Boolean);
  const tokens: string[] = [];

  for (let index = 0; index < terms.length; index += 1) {
    const term = terms[index]!;
    const nextTerm = terms[index + 1];
    const numeric = numericToken(term);
    if (numeric && !numeric.unit && nextTerm && MEASUREMENT_UNITS.has(nextTerm)) {
      tokens.push(`${term}${nextTerm}`);
      index += 1;
    } else {
      tokens.push(term);
    }
  }

  return tokens;
}

function matchesToken(normalizedText: string, token: string): boolean {
  const expected = numericToken(token);
  if (!expected) return normalizedText.includes(token);

  return normalizedText.split(" ").some((term) => {
    const candidate = numericToken(term);
    const matchingValue = expected.text.includes(".")
      ? candidate?.text.startsWith(expected.text)
      : candidate?.value === expected.value;
    return (
      candidate !== null &&
      matchingValue &&
      (!expected.unit || candidate.unit === expected.unit)
    );
  });
}

function includesEveryToken(text: string, tokens: string[]): boolean {
  const normalized = normalizeSearchText(text);
  return tokens.every((token) => matchesToken(normalized, token));
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
  const tokens = searchTokens(query);
  const searchCards = tokens.length
    ? cards.filter((card) => {
        const productText = [
          card.productName,
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
