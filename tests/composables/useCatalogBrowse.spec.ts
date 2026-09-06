import { reactive } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CategoryTreeNode } from "~/queries/catalog";
import type { SizeCard } from "~/utils/sizeCards";
import { SEARCH_DEBOUNCE_MS, useCatalogBrowse } from "~/composables/useCatalogBrowse";

function card(overrides: Partial<SizeCard> & Pick<SizeCard, "cardId" | "productId">): SizeCard {
  return {
    productName: "Portable Cabin",
    productSlug: "portable-cabin",
    shortDescription: "Standard site cabin",
    sizeKey: "150x150",
    sizeLabel: "1.50m × 1.50m",
    sizeSearchTerms: ["150x150"],
    specs: [],
    isPoa: true,
    price: 0,
    thumbnail: { _key: "front", view: "front", alt: "Front", asset: { _type: "reference", _ref: "img" } },
    images: [],
    categorySlugs: ["cabins", "grp"],
    categoryNames: ["Portable Cabins", "GRP"],
    ...overrides,
  };
}

const categories: CategoryTreeNode[] = [
  {
    _id: "category-cabins",
    name: "Portable Cabins",
    slug: "cabins",
    children: [{ _id: "category-grp", name: "GRP", slug: "grp" }],
  },
  { _id: "category-sanitary", name: "Sanitary Units", slug: "sanitary", children: [] },
];

const cards: SizeCard[] = [
  card({ cardId: "cabin-1", productId: "cabin", productName: "GRP Cabin" }),
  card({
    cardId: "toilet-1",
    productId: "toilet",
    productName: "Portable Toilet",
    categorySlugs: ["sanitary"],
    categoryNames: ["Sanitary Units"],
  }),
];

interface FakeQuery {
  search?: string;
  category?: string;
  subcategory?: string;
}

function harness(initialQuery: FakeQuery = {}) {
  const query = reactive<FakeQuery>({ ...initialQuery });
  const setQuery = vi.fn((patch: Record<string, string | undefined>) => {
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) delete (query as Record<string, unknown>)[key];
      else (query as Record<string, unknown>)[key] = value;
    }
  });

  const browse = useCatalogBrowse({
    cards,
    categories,
    getQuery: () => query,
    setQuery,
  });

  return { query, setQuery, ...browse };
}

describe("useCatalogBrowse", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes the search box from the URL without waiting on the debounce", () => {
    const { searchInput } = harness({ search: "cabin" });

    expect(searchInput.value).toBe("cabin");
  });

  it("debounces before writing a typed search into the URL", () => {
    const { searchInput, setQuery, query } = harness();

    searchInput.value = "cabin";
    expect(setQuery).not.toHaveBeenCalled();

    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    expect(setQuery).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(setQuery).toHaveBeenCalledWith({ search: "cabin" });
    expect(query.search).toBe("cabin");
  });

  it("resets the debounce timer on every keystroke, committing only the settled value", () => {
    const { searchInput, setQuery } = harness();

    searchInput.value = "c";
    vi.advanceTimersByTime(200);
    searchInput.value = "ca";
    vi.advanceTimersByTime(200);
    searchInput.value = "cab";
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(setQuery).toHaveBeenCalledTimes(1);
    expect(setQuery).toHaveBeenCalledWith({ search: "cab" });
  });

  it("clears the pending debounce and the URL immediately on clearSearch", () => {
    const { searchInput, clearSearch, setQuery, query } = harness({ search: "cabin" });
    query.search = "cabin";

    searchInput.value = "cabin extra";
    clearSearch();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(searchInput.value).toBe("");
    expect(setQuery).toHaveBeenCalledWith({ search: undefined });
  });

  it("syncs an externally-changed URL search back into the search box", async () => {
    const { searchInput, query } = harness({ search: "cabin" });

    query.search = "toilet";
    await Promise.resolve();

    expect(searchInput.value).toBe("toilet");
  });

  it("does not re-debounce a search box update that merely echoes the committed URL value", async () => {
    const { searchInput, query, setQuery } = harness({ search: "cabin" });

    query.search = "toilet";
    await Promise.resolve();
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);

    expect(setQuery).not.toHaveBeenCalled();
    expect(searchInput.value).toBe("toilet");
  });

  it("selecting and clearing a category round-trips through the URL", () => {
    const { selectCategory, clearFilter, setQuery, selectedCategorySlug, query } = harness();

    selectCategory("cabins");
    expect(setQuery).toHaveBeenCalledWith({ category: "cabins", subcategory: undefined });
    expect(selectedCategorySlug.value).toBe("cabins");

    clearFilter();
    expect(setQuery).toHaveBeenCalledWith({ category: undefined, subcategory: undefined });
    expect(query.category).toBeUndefined();
  });

  it("reports the category-scoped empty state when the category has no search hits but others do", () => {
    const { searchEmptyStateMessage } = harness({ search: "toilet", category: "cabins" });

    expect(searchEmptyStateMessage.value).toBe(
      'No products in Portable Cabins found for “toilet”.',
    );
  });

  it("reports the global empty state when nothing anywhere matches the search", () => {
    const { searchEmptyStateMessage } = harness({ search: "nonexistent" });

    expect(searchEmptyStateMessage.value).toBe(
      'No products or categories found for “nonexistent”.',
    );
  });

  it("derives visible cards and the filtered category tree from the committed search", () => {
    const { visibleCards, filteredCategories } = harness({ search: "toilet" });

    expect(visibleCards.value.map((c) => c.cardId)).toEqual(["toilet-1"]);
    expect(filteredCategories.value.map((c) => c.slug)).toEqual(["sanitary"]);
  });
});
