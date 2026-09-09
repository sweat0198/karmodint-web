import { type MaybeRefOrGetter, computed, ref, toValue, watch } from "vue";
import { filterCatalog } from "~/utils/catalogSearch";
import type { CatalogDisplayCard } from '~/utils/catalogSearch'
import type { CategoryTreeNode } from "~/queries/catalog";

/** How long the search box waits after the last keystroke before it commits to the URL. */
export const SEARCH_DEBOUNCE_MS = 350;

function singleQueryValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export interface CatalogBrowseQuery {
  search?: unknown;
  category?: unknown;
  subcategory?: unknown;
}

export interface UseCatalogBrowseOptions {
  cards: MaybeRefOrGetter<CatalogDisplayCard[]>;
  categories: MaybeRefOrGetter<CategoryTreeNode[]>;
  /** Read the current URL query. Called from inside computeds/watchers, so it must return the same
   *  reactive source each time (e.g. `() => route.query`) for changes to be tracked. */
  getQuery: () => CatalogBrowseQuery;
  /** Merge a patch into the URL query, e.g. `(patch) => router.replace({ query: { ...route.query, ...patch } })`. */
  setQuery: (patch: Record<string, string | undefined>) => void;
}

/**
 * Owns catalogue browse state: the committed search query, its debounce, URL sync in both
 * directions, and the results/category tree derived from `filterCatalog`. The page that consumes
 * this stays markup-only.
 */
export function useCatalogBrowse(options: UseCatalogBrowseOptions) {
  const searchInput = ref(singleQueryValue(options.getQuery().search));
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const committedSearchQuery = computed(() => singleQueryValue(options.getQuery().search).trim());
  const selectedCategorySlug = computed(() => {
    const value = options.getQuery().category;
    return typeof value === "string" ? value : null;
  });
  const selectedSubcategorySlug = computed(() => {
    const value = options.getQuery().subcategory;
    return typeof value === "string" ? value : null;
  });

  const categoryTree = computed(() => toValue(options.categories));
  const selectedCategory = computed(
    () => categoryTree.value.find((cat) => cat.slug === selectedCategorySlug.value) ?? null,
  );
  const selectedSubcategory = computed(
    () =>
      selectedCategory.value?.children.find(
        (sub) => sub.slug === selectedSubcategorySlug.value,
      ) ?? null,
  );

  const activeCategoryName = computed(() => selectedCategory.value?.name ?? "All Categories");
  const activeSubcategoryName = computed(
    () => selectedSubcategory.value?.name ?? selectedCategory.value?.name ?? "All Products",
  );

  const catalogResults = computed(() =>
    filterCatalog({
      cards: toValue(options.cards),
      categories: categoryTree.value,
      query: committedSearchQuery.value,
      selectedCategorySlug: selectedCategorySlug.value,
      selectedSubcategorySlug: selectedSubcategorySlug.value,
    }),
  );
  const visibleCards = computed(() => catalogResults.value.visibleCards);
  const filteredCategories = computed(() => catalogResults.value.categories);
  const hasSearchQuery = computed(() => committedSearchQuery.value.length > 0);
  const catalogSearchStatus = computed(() => {
    if (!hasSearchQuery.value) return "";
    const count = visibleCards.value.length;
    const label = count === 1 ? "size" : "sizes";
    return `${count} ${label} found for “${committedSearchQuery.value}”.`;
  });
  const searchEmptyStateMessage = computed(() =>
    catalogResults.value.searchCards.length > 0
      ? `No products in ${activeSubcategoryName.value} found for “${committedSearchQuery.value}”.`
      : `No products or categories found for “${committedSearchQuery.value}”.`,
  );

  function replaceSearchQuery(value: string) {
    const search = value.trim();
    if (search === committedSearchQuery.value) return;
    options.setQuery({ search: search || undefined });
  }

  watch(
    searchInput,
    (value) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (value.trim() === committedSearchQuery.value) return;
      debounceTimer = setTimeout(() => {
        replaceSearchQuery(value);
        debounceTimer = undefined;
      }, SEARCH_DEBOUNCE_MS);
    },
    { flush: "sync" },
  );

  watch(
    () => options.getQuery().search,
    (value) => {
      const nextSearch = singleQueryValue(value);
      if (nextSearch !== searchInput.value) searchInput.value = nextSearch;
    },
    { flush: "sync" },
  );

  function clearSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = undefined;
    searchInput.value = "";
    replaceSearchQuery("");
  }

  function selectCategory(categorySlug: string) {
    options.setQuery({ category: categorySlug, subcategory: undefined });
  }

  function selectSubcategory(subcategorySlug: string, categorySlug: string) {
    options.setQuery({ category: categorySlug, subcategory: subcategorySlug });
  }

  function clearFilter() {
    options.setQuery({ category: undefined, subcategory: undefined });
  }

  function dispose() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = undefined;
  }

  return {
    searchInput,
    hasSearchQuery,
    catalogSearchStatus,
    searchEmptyStateMessage,
    selectedCategorySlug,
    selectedSubcategorySlug,
    activeCategoryName,
    activeSubcategoryName,
    visibleCards,
    filteredCategories,
    clearSearch,
    selectCategory,
    selectSubcategory,
    clearFilter,
    dispose,
  };
}
