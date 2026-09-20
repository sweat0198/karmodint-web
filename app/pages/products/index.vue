<template>
  <div class="w-full bg-white min-h-screen pb-12">
    <!-- Buy Flow Header: Progress Tracker + Step 1 Info & Continue Action -->
    <BuyFlowHeader
      :current-step="1"
      step-label="Step 1 of 4 • Product Selection"
      title="Select Modular Products"
      description="Explore our range of portable cabins, kiosks, security gatehouses, and sanitary units. Add structures to your list to begin custom engineering."
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            v-if="!quoteStore.isEmpty"
            to="/customize"
            class="flex items-center justify-center gap-2 px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm hover:shadow"
          >
            <span>Customize Selected</span>
            <span
              class="bg-white text-brand-red text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none"
            >
              {{ quoteStore.totalItemsCount }}
            </span>
            <svg
              class="w-4 h-4 text-white shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </NuxtLink>

          <NuxtLink
            v-if="!quoteStore.isEmpty && quoteStore.isStepUnlocked(3)"
            to="/quote"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-brand-navy-heading border border-slate-300 font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm hover:shadow"
          >
            <span>Review Quote</span>
            <svg
              class="w-4 h-4 text-brand-slate-muted shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>
      </template>
    </BuyFlowHeader>

    <!-- Mobile Sticky Navigation Bar: Categories Button + Breadcrumb (Figma 50:26 & 50:11) -->
    <div
      class="lg:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-6 pt-3.5 pb-3 flex flex-col gap-2.5"
    >
      <!-- Categories Button (Figma 50:26) -->
      <button
        type="button"
        @click="isCategoryDrawerOpen = true"
        class="w-full bg-white border border-slate-200 shadow-xs hover:border-slate-300 active:scale-[0.98] active:bg-slate-50 px-4 py-3.5 rounded flex items-center justify-between transition-transform duration-150 [transition-timing-function:var(--ease-out)] group cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:outline-none select-none"
        aria-label="Open Categories Selection"
      >
        <div class="flex items-center gap-2.5">
          <!-- Red 3-bar filter/categories icon -->
          <svg
            class="w-[18px] h-3 text-brand-red shrink-0"
            viewBox="0 0 18 12"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M0 1.5H18M3 6H15M6 10.5H12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          <span class="font-medium text-base text-gray-800">
            Categories
          </span>
        </div>
        <svg
          class="w-3.5 h-2.5 text-slate-500 group-hover:text-slate-800 transition-colors duration-150 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 12 8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.8"
            d="M1 1.5L6 6.5L11 1.5"
          />
        </svg>
      </button>

      <!-- Breadcrumbs (Figma 50:11) -->
      <nav
        aria-label="Breadcrumb"
        class="flex items-center gap-1.5 text-xs font-semibold tracking-[1.2px] text-slate-500 uppercase overflow-x-auto overscroll-x-contain whitespace-nowrap scrollbar-none py-0.5"
      >
        <NuxtLink
          to="/"
          class="hover:text-slate-900 active:opacity-70 transition-opacity duration-150 shrink-0"
        >
          Home
        </NuxtLink>
        <svg
          class="w-3 h-3 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <NuxtLink
          to="/products"
          class="hover:text-slate-900 active:opacity-70 transition-opacity duration-150 shrink-0"
        >
          Products
        </NuxtLink>
        <svg
          class="w-3 h-3 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span
          @click="isCategoryDrawerOpen = true"
          class="hover:text-slate-900 active:opacity-70 cursor-pointer transition-opacity duration-150 shrink-0"
        >
          {{ activeCategoryName }}
        </span>
        <svg
          class="w-3 h-3 text-slate-400 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="text-gray-800 font-bold shrink-0">
          {{ activeSubcategoryName }}
        </span>
      </nav>

      <CatalogSearchField
        v-model="searchInput"
        input-id="catalog-search-mobile"
        @clear="clearSearch"
      />
    </div>

    <div
      class="max-w-7xl w-full mx-auto px-6 lg:px-12 pt-6 flex flex-col gap-6"
    >
      <!-- Breadcrumbs in Main Catalog Layout (Desktop) -->
      <div class="hidden lg:flex items-center justify-between gap-6">
        <nav
          aria-label="Breadcrumb"
          class="flex min-w-0 flex-1 items-center gap-2 text-xs font-semibold tracking-wider text-brand-slate-muted uppercase flex-wrap"
        >
          <NuxtLink
            to="/"
            class="hover:text-brand-navy-heading transition-colors"
            >Home</NuxtLink
          >
          <svg
            class="w-3 h-3 text-brand-slate-muted shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <NuxtLink
            to="/products"
            class="hover:text-brand-navy-heading transition-colors"
            >Products</NuxtLink
          >
          <svg
            class="w-3 h-3 text-brand-slate-muted shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span
            v-if="selectedCategorySlug"
            class="hover:text-brand-navy-heading cursor-pointer transition-colors"
            @click="toggleCategoryExpand(selectedCategorySlug)"
            >{{ activeCategoryName }}</span
          >
          <svg
            v-if="selectedCategorySlug"
            class="w-3 h-3 text-brand-slate-muted shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="text-brand-navy-heading font-bold">{{
            activeSubcategoryName
          }}</span>
        </nav>

        <div class="w-full max-w-sm shrink-0">
          <CatalogSearchField
            v-model="searchInput"
            input-id="catalog-search-desktop"
            @clear="clearSearch"
          />
        </div>
      </div>

      <!-- Main Layout Container: Sidebar + Product Grid -->
      <div class="flex flex-col lg:flex-row gap-8 items-start w-full">
        <!-- Sidebar - Categories (Desktop 290px width) -->
        <aside
          class="hidden lg:block sticky top-24 self-start w-[290px] shrink-0 bg-white border border-slate-100 rounded p-6 shadow-sm"
        >
          <h2
            class="text-brand-navy-heading text-2xl font-semibold tracking-tight mb-6"
          >
            Categories
          </h2>

          <div class="space-y-4">
            <button
              v-if="selectedCategorySlug"
              type="button"
              @click="clearFilter"
              class="text-xs font-semibold text-brand-red hover:text-brand-red-dark uppercase tracking-wider mb-2"
            >
              Show all products
            </button>
            <div
              v-for="cat in filteredCategories"
              :key="cat._id"
              class="flex flex-col"
            >
              <!-- Parent Category Header -->
              <button
                @click="onCategoryClick(cat)"
                class="flex items-center justify-between w-full text-left py-1 text-lg font-medium transition-colors"
                :class="
                  selectedCategorySlug === cat.slug
                    ? 'text-brand-navy-heading font-semibold'
                    : 'text-brand-slate-muted hover:text-brand-navy-heading'
                "
              >
                <span>{{ cat.name }}</span>
                <svg
                  v-if="cat.children.length"
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': isCategoryExpanded(cat.slug) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Subcategories Accordion List -->
              <div
                v-if="isCategoryExpanded(cat.slug) && cat.children.length"
                class="ml-4 mt-2 border-l border-slate-200 space-y-1"
              >
                <button
                  v-for="sub in cat.children"
                  :key="sub._id"
                  @click="selectSubcategory(sub.slug, cat.slug)"
                  class="w-full text-left py-2 px-4 text-sm transition-all block"
                  :class="
                    selectedSubcategorySlug === sub.slug
                      ? 'bg-brand-rose-card border-l-2 border-brand-red text-brand-navy-heading font-bold'
                      : 'text-brand-slate-muted hover:text-brand-navy-heading font-normal'
                  "
                >
                  {{ sub.name }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Product Grid Section -->
        <main class="flex-1 w-full flex flex-col gap-6" id="catalog-results">
          <!-- Category Title & Description -->
          <div class="flex flex-col gap-2 pb-2">
            <h1
              class="text-brand-navy-heading text-3xl font-bold tracking-tight"
            >
              {{ activeSubcategoryName }}
            </h1>
            <p class="text-brand-slate-muted text-base leading-relaxed">
              Durable, high-performance modular units and cabins tailored for
              site facilities, offices, and custom requirements.
            </p>
            <p
              v-if="hasSearchQuery"
              class="text-sm font-medium text-brand-slate-muted"
            >
              {{ catalogSearchStatus }}
            </p>
            <p
              id="catalog-search-status"
              class="sr-only"
              aria-live="polite"
              aria-atomic="true"
            >
              {{ catalogSearchStatus }}
            </p>
          </div>

          <!-- Empty State: a real category with no Products yet -->
          <div
            v-if="visibleCards.length === 0"
            class="bg-slate-50 border border-slate-200 rounded p-12 text-center flex flex-col items-center gap-3"
          >
            <template v-if="hasSearchQuery">
              <p class="text-brand-navy-heading text-lg font-semibold">
                {{ searchEmptyStateMessage }}
              </p>
              <button
                type="button"
                class="text-brand-red hover:text-brand-red-dark text-sm font-semibold underline underline-offset-2"
                @click="clearSearch"
              >
                Clear search
              </button>
            </template>
            <template v-else>
              <p class="text-brand-navy-heading text-lg font-semibold">
                No products in this category yet — talk to us.
              </p>
              <NuxtLink
                to="/contact"
                class="text-brand-red hover:text-brand-red-dark text-sm font-semibold underline underline-offset-2"
              >
                Contact us
              </NuxtLink>
            </template>
          </div>

          <!-- Product Cards Grid (3 Columns) -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <template v-for="card in visibleCards" :key="card.cardId">
              <PortableContainerCard v-if="isPortableCard(card)" :card="card" />
              <ProductCard v-else :card="card" />
            </template>
          </div>
        </main>
      </div>

      <!-- Footer CTA Section -->
      <section
        class="bg-brand-rose-bg border border-brand-rose-border rounded p-8 lg:p-12 text-center flex flex-col items-center gap-4 mt-8 shadow-sm"
      >
        <h2
          class="text-brand-navy-heading text-2xl font-semibold tracking-tight"
        >
          Need a custom configuration not listed here?
        </h2>
        <p class="text-brand-slate-muted text-base max-w-2xl leading-relaxed">
          Our engineering team can design and build bespoke units tailored to
          your exact site requirements, including specialized glazing,
          reinforced panels, and integrated facilities.
        </p>
        <NuxtLink
          to="/contact"
          class="mt-2 border border-brand-navy-heading text-brand-navy-heading hover:bg-brand-navy-heading hover:text-white px-8 py-3 rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-2"
        >
          <span>Contact Us</span>
          <svg
            class="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </NuxtLink>
      </section>
    </div>

    <!-- Mobile Category Bottom Sheet Navigation Drawer (Stitch Screen) -->
    <CategoryDrawer
      v-model:is-open="isCategoryDrawerOpen"
      :categories="filteredCategories"
      :active-category="selectedCategorySlug"
      :active-subcategory="selectedSubcategorySlug"
      :collapsed-categories="collapsedCategories"
      @toggle-category="toggleCategoryExpand"
      @select="selectSubcategory"
      @select-category="selectCategory"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRuntimeConfig, useSanityQuery } from "#imports";
import { useQuoteStore } from "~/stores/quote";
import { useAppSeo } from "~/composables/useAppSeo";
import { useCatalogBrowse } from "~/composables/useCatalogBrowse";
import { sanityImageUrl } from "~/utils/sanityImageUrl";
import { toSizeCards } from "~/utils/sizeCards";
import { isPortableContainerProduct, toPortableContainerCards, type PortableContainerCard } from '~/utils/portableContainerCards'
import type { CatalogDisplayCard } from '~/utils/catalogSearch'
import {
  CATEGORY_TREE_QUERY,
  PRODUCTS_WITH_SIZES_QUERY,
  type CategoryTreeNode,
  type CatalogProduct,
} from "~/queries/catalog";

const router = useRouter();
const route = useRoute();
const quoteStore = useQuoteStore();
const config = useRuntimeConfig();
const { setPageSeo, getProductSchema, getBreadcrumbSchema } = useAppSeo();

const isCategoryDrawerOpen = ref(false);
// Categories section is expanded by default. Stores explicitly collapsed categories: { [slug]: true }
const collapsedCategories = ref<Record<string, boolean>>({});

function isCategoryExpanded(categorySlug: string): boolean {
  return !collapsedCategories.value[categorySlug];
}

const { data: products } = await useSanityQuery<CatalogProduct[]>(PRODUCTS_WITH_SIZES_QUERY);
const { data: categoryTree } = await useSanityQuery<CategoryTreeNode[]>(CATEGORY_TREE_QUERY);

const cards = computed<CatalogDisplayCard[]>(() => {
  const catalogue = products.value ?? []
  return [
    ...toPortableContainerCards(catalogue),
    ...toSizeCards(catalogue.filter((product) => !isPortableContainerProduct(product)))
  ]
});

function isPortableCard(card: CatalogDisplayCard): card is PortableContainerCard {
  return 'isPoaOnly' in card
}

// The filter lives in the URL (D10: `?category=cabin&subcategory=grp`), not local state, so it
// survives a reload and is shareable.
const {
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
  selectCategory: selectCategoryBrowse,
  selectSubcategory: selectSubcategoryBrowse,
  clearFilter,
  dispose: disposeCatalogBrowse,
} = useCatalogBrowse({
  cards,
  categories: () => categoryTree.value ?? [],
  getQuery: () => route.query,
  setQuery: (patch) => void router.replace({ query: { ...route.query, ...patch } }),
});

function selectCategory(categorySlug: string) {
  selectCategoryBrowse(categorySlug);
  isCategoryDrawerOpen.value = false;
}

function selectSubcategory(subcategorySlug: string, categorySlug: string) {
  selectSubcategoryBrowse(subcategorySlug, categorySlug);
  isCategoryDrawerOpen.value = false;
  if (collapsedCategories.value[categorySlug]) {
    collapsedCategories.value = {
      ...collapsedCategories.value,
      [categorySlug]: false,
    };
  }
}

function toggleCategoryExpand(categorySlug: string) {
  collapsedCategories.value = {
    ...collapsedCategories.value,
    [categorySlug]: !collapsedCategories.value[categorySlug],
  };
}

/** A category header both toggles its accordion and, for one with no children, selects it directly. */
function onCategoryClick(category: CategoryTreeNode) {
  toggleCategoryExpand(category.slug);
  if (category.children.length === 0) {
    selectCategory(category.slug);
  }
}

watch([selectedCategorySlug, selectedSubcategorySlug], () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});

onBeforeUnmount(() => {
  disposeCatalogBrowse();
});

onMounted(() => {
  quoteStore.setLastVisitedRoute("/products");
});

setPageSeo({
  title: "Portable Cabins, Gatehouses & Kiosks | Karmod International",
  description:
    "Explore Karmod's full range of modular buildings, portable cabins, security gatehouses, retail kiosks, and sanitary units with customizable engineering options.",
  canonicalPath: "/products",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Modular Products", path: "/products" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Portable Cabins, Gatehouses & Kiosks",
      itemListElement: cards.value.map((card, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: getProductSchema({
          name: isPortableCard(card) ? card.productName : `${card.productName} ${card.sizeLabel}`,
          image: sanityImageUrl(
            isPortableCard(card) ? card.representativeImage?.asset?._ref : card.thumbnail.asset?._ref,
            config.public.sanityProjectId,
            config.public.sanityDataset,
          ),
          price: isPortableCard(card) ? card.lowestPrice : card.price,
          isPoa: isPortableCard(card) ? card.isPoaOnly : card.isPoa,
          specs: isPortableCard(card) ? card.sizes.flatMap((size) => size.specs) : card.specs,
        }),
      })),
    },
  ],
});
</script>
