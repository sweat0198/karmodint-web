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
          to="/products"
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
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :variant-label="product.categoryTag"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useQuoteStore } from "~/stores/quote";

const quoteStore = useQuoteStore();
const router = useRouter();

const products = [
  {
    id: "prod-k2004",
    name: "Container K-2004",
    slug: "container-k-2004",
    categoryTag: "Flat Pack",
    image: "/images/product-container-k2004.png",
    price: 3450,
    specs: [
      { label: "Dimensions", value: "3m x 7m" },
      { label: "Insulation", value: "60mm EPS" },
      { label: "Layout", value: "Open Plan" },
    ],
  },
  {
    id: "prod-sec110",
    name: "Security Cabin 110",
    slug: "security-cabin-110",
    categoryTag: "Guard Hut",
    image: "/images/product-security-cabin-110.png",
    price: 1200,
    specs: [
      { label: "Dimensions", value: "1.1m x 1.1m" },
      { label: "Insulation", value: "40mm PUR" },
      { label: "Glazing", value: "3-Side Visibility" },
    ],
  },
  {
    id: "prod-serv135",
    name: "Service Cabin 135",
    slug: "service-cabin-135",
    categoryTag: "Ticket Office",
    image: "/images/product-service-cabin-135.png",
    price: 1850,
    specs: [
      { label: "Dimensions", value: "1.35m x 2.1m" },
      { label: "Insulation", value: "40mm PUR" },
      { label: "Features", value: "Serving Hatch" },
    ],
  },
];

function handleSelect(product: (typeof products)[0]) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: product.categoryTag,
    basePrice: product.price,
    quantity: 1,
  });
}
</script>
