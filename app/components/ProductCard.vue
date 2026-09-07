<template>
  <div
    class="bg-white border border-slate-100 rounded shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <!-- Thumbnail Header -->
    <div
      class="bg-slate-50 h-60 p-4 flex items-center justify-center relative border-b border-slate-100"
    >
      <ProductImageCarousel
        :images="carouselImages"
        :active="isHovering"
        zoom-on-hover
        frame-class="mix-blend-multiply"
      />
    </div>

    <!-- Content Body -->
    <div class="p-6 flex flex-col flex-1 justify-between gap-6">
      <div>
        <h3 class="text-brand-navy-heading text-xl font-bold leading-snug">
          {{ card.productName }}
        </h3>
        <p class="text-brand-navy-heading text-sm font-bold mb-4 mt-1">
          {{ card.sizeLabel }}
        </p>

        <!-- Feature Specs List with Checkmarks -->
        <div class="space-y-3">
          <div
            v-for="(spec, idx) in card.specs"
            :key="idx"
            class="flex items-center gap-2 text-sm text-brand-slate-muted"
          >
            <svg
              class="w-4 h-4 text-brand-red shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>{{ spec }}</span>
          </div>
        </div>
      </div>

      <!-- Pricing & Action Buttons -->
      <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
        <div>
          <template v-if="card.isPoa">
            <span class="text-brand-navy-heading text-2xl font-bold">{{ priceLabel }}</span>
            <div class="text-brand-slate-muted text-xs mt-0.5">
              Price on application
            </div>
          </template>
          <div v-else class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-brand-navy-heading text-2xl font-bold">
              {{ priceLabel }}
            </span>
            <span class="text-brand-slate-muted text-sm">+ VAT</span>
          </div>
        </div>

        <!-- Action Button Grid -->
        <div class="grid grid-cols-2 gap-3 pt-1">
          <!-- Customize Button -->
          <button
            type="button"
            @click="handleCustomize"
            class="border border-brand-navy-heading text-brand-navy-heading hover:bg-brand-navy-heading hover:text-white text-xs font-semibold py-2.5 px-3 rounded-xs transition-colors duration-150 text-center flex items-center justify-center"
          >
            Customize
          </button>

          <!-- Add Button (When item is NOT in basket) -->
          <button
            v-if="quantityInBasket === 0"
            @click="handleAdd"
            class="bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold py-2.5 px-3 rounded-xs transition-colors duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Add</span>
          </button>

          <!-- Quantity Stepper Controls (When item IS in basket) -->
          <div
            v-else
            class="bg-brand-red text-white rounded-xs flex items-center justify-between p-1.5 shadow-xs transition-all animate-fadeIn"
          >
            <button
              @click="handleDecrement"
              class="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-brand-red-dark active:scale-95 rounded-xs transition-colors select-none"
              title="Decrease quantity"
            >
              −
            </button>
            <span class="font-bold text-sm px-2 text-center min-w-6">
              {{ quantityInBasket }}
            </span>
            <button
              @click="handleIncrement"
              class="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-brand-red-dark active:scale-95 rounded-xs transition-colors select-none"
              title="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuoteStore } from "~/stores/quote";
import { toCarouselImages } from "~/utils/carouselImages";
import { resolveSanityImageConfig } from "~/utils/sanityImageConfig";
import type { SizeCard } from "~/utils/sizeCards";
import { getPriceLabel } from "~~/shared/utils/priceLabel";

export interface ProductCardProps {
  card: SizeCard;
}

const props = defineProps<ProductCardProps>();
const quoteStore = useQuoteStore();
const router = useRouter();
const route = useRoute();

const isHovering = ref(false);

const quantityInBasket = computed(() =>
  quoteStore.getItemQuantity(props.card.cardId),
);

const priceLabel = computed(() =>
  getPriceLabel({ price: props.card.price, isPoa: props.card.isPoa }),
);

const carouselImages = computed(() => {
  const { projectId, dataset } = resolveSanityImageConfig();
  return toCarouselImages(props.card.images, projectId, dataset, 600);
});

function handleAdd() {
  quoteStore.addSizeOption(props.card);
  if (route.path === "/" || !route.path.startsWith("/products")) {
    router.push("/products");
  }
}

function handleCustomize() {
  if (quantityInBasket.value === 0) {
    quoteStore.addSizeOption(props.card);
  }
  router.push("/customize");
}

function handleIncrement() {
  quoteStore.addSizeOption(props.card);
}

function handleDecrement() {
  quoteStore.decrementItem(props.card.cardId);
}
</script>
