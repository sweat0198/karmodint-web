<template>
  <div
    class="bg-white border border-slate-100 rounded-[4px] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
  >
    <!-- Thumbnail Header -->
    <div
      class="bg-slate-50 h-[192px] p-4 flex items-center justify-center relative border-b border-slate-100"
    >
      <img
        :src="product.image"
        :alt="product.name"
        class="max-h-[160px] w-auto object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
      />
      <div
        v-if="product.categoryTag"
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-[2px] px-2 py-0.5 rounded-[2px] border border-slate-200 shadow-xs"
      >
        <span
          class="text-brand-navy-heading text-[11px] font-semibold tracking-wider uppercase"
        >
          {{ product.categoryTag }}
        </span>
      </div>
    </div>

    <!-- Content Body -->
    <div class="p-6 flex flex-col flex-1 justify-between gap-6">
      <div>
        <h3 class="text-brand-navy-heading text-xl font-bold mb-4 leading-snug">
          {{ product.name }}
        </h3>

        <!-- Feature Specs List with Checkmarks -->
        <div class="space-y-3">
          <div
            v-for="(spec, idx) in formattedSpecs"
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
          <span
            class="text-brand-slate-muted text-xs font-semibold tracking-wider uppercase block"
          >
            FROM
          </span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-brand-navy-heading text-2xl font-bold">
              £{{ product.price.toLocaleString() }}
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
            class="border border-brand-navy-heading text-brand-navy-heading hover:bg-brand-navy-heading hover:text-white text-xs font-semibold py-2.5 px-3 rounded-[2px] transition-colors duration-150 text-center flex items-center justify-center"
          >
            Customize
          </button>

          <!-- Add Button (When item is NOT in basket) -->
          <button
            v-if="quantityInBasket === 0"
            @click="handleAdd"
            class="bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold py-2.5 px-3 rounded-[2px] transition-colors duration-150 text-center flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span class="text-sm font-bold leading-none">+</span>
            <span>Add</span>
          </button>

          <!-- Quantity Stepper Controls (When item IS in basket) -->
          <div
            v-else
            class="bg-brand-red text-white rounded-[2px] flex items-center justify-between p-1.5 shadow-xs transition-all animate-fadeIn"
          >
            <button
              @click="handleDecrement"
              class="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-brand-red-dark active:scale-95 rounded-[2px] transition-colors select-none"
              title="Decrease quantity"
            >
              −
            </button>
            <span class="font-bold text-sm px-2 text-center min-w-[24px]">
              {{ quantityInBasket }}
            </span>
            <button
              @click="handleIncrement"
              class="w-7 h-7 flex items-center justify-center font-bold text-base hover:bg-brand-red-dark active:scale-95 rounded-[2px] transition-colors select-none"
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
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useQuoteStore } from "~/stores/quote";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string;
    price: number;
    specs?: (string | { label?: string; key?: string; value: string })[];
    categoryTag?: string;
  };
  variantLabel?: string;
}

const props = defineProps<ProductCardProps>();
const quoteStore = useQuoteStore();
const router = useRouter();

const formattedSpecs = computed(() => {
  if (!props.product.specs) return [];
  return props.product.specs.map((spec) => {
    if (typeof spec === "string") return spec;
    if (spec.label && spec.value) return `${spec.label}: ${spec.value}`;
    if (spec.key && spec.value) return `${spec.key}: ${spec.value}`;
    return spec.value || "";
  });
});

const quantityInBasket = computed(() => {
  return quoteStore.getItemQuantity(props.product.id);
});

function handleAdd() {
  quoteStore.addItem({
    productId: props.product.id,
    productName: props.product.name,
    productSlug: props.product.slug,
    variantLabel:
      props.variantLabel || props.product.categoryTag || "Standard Spec",
    basePrice: props.product.price,
    quantity: 1,
  });
}

function handleCustomize() {
  if (quantityInBasket.value === 0) {
    handleAdd();
  }
  router.push("/customize");
}

function handleIncrement() {
  quoteStore.incrementProduct({
    productId: props.product.id,
    productName: props.product.name,
    productSlug: props.product.slug,
    variantLabel:
      props.variantLabel || props.product.categoryTag || "Standard Spec",
    basePrice: props.product.price,
    quantity: 1,
  });
}

function handleDecrement() {
  quoteStore.decrementProduct(props.product.id);
}
</script>
