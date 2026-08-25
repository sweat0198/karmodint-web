<template>
  <section
    class="w-full bg-brand-rose-bg border-t border-b border-brand-rose-border py-16 lg:py-24 px-6 lg:px-12 flex justify-center"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-12">
      <!-- Section Header -->
      <div
        class="border-b border-brand-rose-border pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2
            class="text-brand-navy-heading text-2xl font-semibold tracking-[-0.24px]"
          >
            Standard Modular Units
          </h2>
          <p class="text-brand-slate-muted text-base mt-1">
            Precision-engineered for immediate deployment.
          </p>
        </div>

        <NuxtLink
          to="/catalog"
          class="text-brand-red-dark hover:text-brand-red-deep text-xs font-semibold tracking-[1.2px] uppercase inline-flex items-center gap-1 transition-colors"
        >
          <span>VIEW ALL SPECIFICATIONS</span>
          <svg
            class="w-3 h-3"
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
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProductCard v-for="card in featuredCards" :key="card.cardId" :card="card" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSanityQuery } from "#imports";
import { toSizeCards } from "~/utils/sizeCards";
import { PRODUCTS_WITH_SIZES_QUERY, type CatalogProduct } from "~/queries/catalog";

const { data: products } = await useSanityQuery<CatalogProduct[]>(PRODUCTS_WITH_SIZES_QUERY);

// The three smallest Size Options of the featured Product (GRP Cabin today).
const featuredCards = computed(() => {
  const featuredProduct = products.value?.find((p) => p.isFeatured);
  if (!featuredProduct) return [];
  return toSizeCards(products.value ?? [])
    .filter((card) => card.productId === featuredProduct._id)
    .slice(0, 3);
});
</script>
