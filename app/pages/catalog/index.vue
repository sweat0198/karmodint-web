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
            class="flex items-center justify-center gap-2 px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors duration-150 shadow-sm hover:shadow"
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
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-brand-navy-heading border border-slate-300 font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors duration-150 shadow-sm hover:shadow"
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
      class="lg:hidden sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 sm:px-6 pt-3.5 pb-3 flex flex-col gap-2.5"
    >
      <!-- Categories Button (Figma 50:26) -->
      <button
        type="button"
        @click="isCategoryDrawerOpen = true"
        class="w-full bg-white border border-slate-200 shadow-xs hover:border-slate-300 active:scale-[0.98] active:bg-slate-50 px-4 py-3.5 rounded-[4px] flex items-center justify-between transition-transform duration-150 [transition-timing-function:var(--ease-out)] group cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:outline-none select-none"
        aria-label="Open Categories Selection"
      >
        <div class="flex items-center gap-2.5">
          <!-- Red 3-bar filter/categories icon -->
          <svg
            class="w-[18px] h-[12px] text-[#E31E24] shrink-0"
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
          <span class="font-medium text-base text-[#1f2937]">
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
          to="/catalog"
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
          {{ activeCategory }}
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
        <span class="text-[#1f2937] font-bold shrink-0">
          {{ activeSubcategory }}
        </span>
      </nav>
    </div>

    <div
      class="max-w-[1280px] w-full mx-auto px-6 lg:px-12 pt-6 flex flex-col gap-6"
    >
      <!-- Breadcrumbs in Main Catalog Layout (Desktop) -->
      <nav
        aria-label="Breadcrumb"
        class="hidden lg:flex items-center gap-2 text-xs font-semibold tracking-wider text-brand-slate-muted uppercase flex-wrap"
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
          to="/catalog"
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
          class="hover:text-brand-navy-heading cursor-pointer transition-colors"
          @click="toggleCategory(activeCategory)"
          >{{ activeCategory }}</span
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
        <span class="text-brand-navy-heading font-bold">{{
          activeSubcategory
        }}</span>
      </nav>

      <!-- Main Layout Container: Sidebar + Product Grid -->
      <div class="flex flex-col lg:flex-row gap-8 items-start w-full">
        <!-- Sidebar - Categories (Desktop 290px width) -->
        <aside
          class="hidden lg:block w-[290px] shrink-0 bg-white border border-slate-100 rounded-[4px] p-6 shadow-sm"
        >
          <h2
            class="text-brand-navy-heading text-2xl font-semibold tracking-tight mb-6"
          >
            Categories
          </h2>

          <div class="space-y-4">
            <div
              v-for="cat in categories"
              :key="cat.name"
              class="flex flex-col"
            >
              <!-- Parent Category Header -->
              <button
                @click="toggleCategory(cat.name)"
                class="flex items-center justify-between w-full text-left py-1 text-lg font-medium transition-colors"
                :class="
                  activeCategory === cat.name
                    ? 'text-brand-navy-heading font-semibold'
                    : 'text-brand-slate-muted hover:text-brand-navy-heading'
                "
              >
                <span>{{ cat.name }}</span>
                <svg
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedCategory === cat.name }"
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
                v-if="expandedCategory === cat.name && cat.subcategories.length"
                class="ml-4 mt-2 border-l border-slate-200 space-y-1"
              >
                <button
                  v-for="sub in cat.subcategories"
                  :key="sub"
                  @click="selectSubcategory(sub, cat.name)"
                  class="w-full text-left py-2 px-4 text-sm transition-all block"
                  :class="
                    activeSubcategory === sub
                      ? 'bg-brand-rose-card border-l-2 border-brand-red text-brand-navy-heading font-bold'
                      : 'text-brand-slate-muted hover:text-brand-navy-heading font-normal'
                  "
                >
                  {{ sub }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Product Grid Section -->
        <main class="flex-1 w-full flex flex-col gap-6">
          <!-- Category Title & Description -->
          <div class="flex flex-col gap-2 pb-2">
            <h1
              class="text-brand-navy-heading text-3xl font-bold tracking-tight"
            >
              {{ activeSubcategory }}
            </h1>
            <p class="text-brand-slate-muted text-base leading-relaxed">
              Durable, high-performance modular units and cabins tailored for
              site facilities, offices, and custom requirements.
            </p>
          </div>

          <!-- Product Cards Grid (3 Columns) -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <ProductCard
              v-for="product in products"
              :key="product.id"
              :product="product"
              :variant-label="activeSubcategory"
            />
          </div>
        </main>
      </div>

      <!-- Footer CTA Section -->
      <section
        class="bg-brand-rose-bg border border-brand-rose-border rounded-[4px] p-8 lg:p-12 text-center flex flex-col items-center gap-4 mt-8 shadow-sm"
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
          :to="quoteStore.continueRoute"
          class="mt-2 border border-brand-navy-heading text-brand-navy-heading hover:bg-brand-navy-heading hover:text-white px-8 py-3 rounded-[2px] text-xs font-semibold tracking-wider uppercase transition-colors inline-flex items-center gap-2"
        >
          <span>Continue Buy Flow</span>
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
      :categories="categories"
      :active-category="activeCategory"
      :active-subcategory="activeSubcategory"
      :expanded-category="expandedCategory"
      @select="selectSubcategory"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuoteStore } from "~/stores/quote";

useHead({
  title: "Catalog | Karmod International",
  meta: [
    {
      name: "description",
      content:
        "Explore Karmod standard modular units, security cabins, gatehouses, and portable accommodation.",
    },
  ],
});

const router = useRouter();
const route = useRoute();
const quoteStore = useQuoteStore();

const isCategoryDrawerOpen = ref(false);
const activeCategory = ref("Standard Units");
const activeSubcategory = ref("Security Cabins");
const expandedCategory = ref("Standard Units");

const categories = ref([
  {
    name: "Standard Units",
    subcategories: ["Accommodation", "Security Cabins", "Sanitary Units"],
  },
  {
    name: "Modular Buildings",
    subcategories: ["Site Offices", "Classrooms", "Healthcare Units"],
  },
  {
    name: "Container Conversions",
    subcategories: ["Pop-up Shops", "Storage Units", "Workshops"],
  },
  {
    name: "Flat Pack Solutions",
    subcategories: ["K2004 Series", "Quick Build Cabins"],
  },
]);

function toggleCategory(catName: string) {
  expandedCategory.value = expandedCategory.value === catName ? "" : catName;
}

function selectSubcategory(sub: string, parentCatName?: string) {
  activeSubcategory.value = sub;
  if (parentCatName) {
    activeCategory.value = parentCatName;
    expandedCategory.value = parentCatName;
  } else {
    const parent = categories.value.find((c) => c.subcategories.includes(sub));
    if (parent) {
      activeCategory.value = parent.name;
      expandedCategory.value = parent.name;
    }
  }

  router.replace({
    query: {
      ...route.query,
      category: activeCategory.value.toLowerCase().replace(/\s+/g, "-"),
      subcategory: sub.toLowerCase().replace(/\s+/g, "-"),
    },
  });
}

onMounted(() => {
  quoteStore.setLastVisitedRoute('/catalog');
  const queryCat = route.query.category as string;
  const querySub = route.query.subcategory as string;

  if (queryCat || querySub) {
    categories.value.forEach((cat) => {
      const matchCat = cat.name.toLowerCase().replace(/\s+/g, "-") === queryCat;
      if (matchCat || querySub) {
        cat.subcategories.forEach((sub) => {
          if (sub.toLowerCase().replace(/\s+/g, "-") === querySub) {
            activeSubcategory.value = sub;
            activeCategory.value = cat.name;
            expandedCategory.value = cat.name;
          }
        });
      }
    });
  }
});

const products = [
  {
    id: "sec-guard-house",
    name: "Compact Guard House",
    slug: "compact-guard-house",
    image: "/images/product-security-cabin-110.png",
    price: 2450,
    specs: [
      "1.5m x 1.5m External Dimensions",
      "Standard EPS Sandwich Insulation",
      "1 Security Door, 3 Windows",
    ],
  },
  {
    id: "sec-std-gatehouse",
    name: "Standard Gatehouse",
    slug: "standard-gatehouse",
    image: "/images/product-service-cabin-135.png",
    price: 3100,
    specs: [
      "2.0m x 2.0m External Dimensions",
      "Premium PUR Thermal Insulation",
      "1 Security Door, 3 Large Windows",
    ],
  },
  {
    id: "sec-ext-access",
    name: "Extended Access Cabin",
    slug: "extended-access-cabin",
    image: "/images/product-container-k2004.png",
    price: 4250,
    specs: [
      "2.5m x 2.5m External Dimensions",
      "Integrated Electrics & Lighting",
      "Optional WC Module Integration",
    ],
  },
  {
    id: "sec-multi-role",
    name: "Multi-Role Security Office",
    slug: "multi-role-security-office",
    image: "/images/product-container-k2004.png",
    price: 7800,
    specs: [
      "6.0m x 2.4m External Dimensions",
      "High Security Steel Doors & Windows",
      "2 Internal Compartments",
    ],
  },
];

function handleSelect(product: (typeof products)[0]) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: activeSubcategory.value,
    basePrice: product.price,
    quantity: 1,
  });
}
</script>
