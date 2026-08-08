<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useQuoteStore } from "~/stores/quote";

interface Props {
  estimatedTotal?: number;
  currencySymbol?: string;
  vatText?: string;
  saveLabel?: string;
  quoteLabel?: string;
  isSaving?: boolean;
  showWhenEmpty?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currencySymbol: "£",
  vatText: "+ VAT & Delivery",
  saveLabel: "Save Customization",
  quoteLabel: "",
  isSaving: false,
  showWhenEmpty: false,
});

const emit = defineEmits<{
  (e: "save"): void;
  (e: "quote"): void;
}>();

const route = useRoute();
const quoteStore = useQuoteStore();

// Hide sticky bar on final quote submission/review page to prevent UI clash with contact form
const isQuotePage = computed(() => route.path === "/quote");

// Display whenever user has items in quote queue across the whole application
const isVisible = computed(() => {
  if (props.showWhenEmpty) return true;
  if (isQuotePage.value) return false;
  return quoteStore.totalItemsCount > 0;
});

const calculatedTotal = computed(() => {
  if (props.estimatedTotal !== undefined) {
    return props.estimatedTotal;
  }
  return quoteStore.totalQuotePrice;
});

const formattedTotal = computed(() => {
  return `${props.currencySymbol}${calculatedTotal.value.toLocaleString()}`;
});

// Dynamic continuation text based on current location
const actionText = computed(() => {
  if (props.quoteLabel) return props.quoteLabel;
  if (route.path.startsWith("/catalog")) {
    return "Customize Selected";
  }
  if (route.path.startsWith("/customize")) {
    return "Proceed to Review & Quote";
  }
  return "Continue Quote";
});

// Destination route to continue where the user left off
const destinationRoute = computed(() => {
  if (route.path.startsWith("/catalog")) {
    return "/customize";
  }
  if (route.path.startsWith("/customize")) {
    return "/quote";
  }
  return quoteStore.continueRoute;
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="isVisible"
      class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] py-4 px-4 sm:px-8"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <!-- Summary Statistics -->
        <div
          class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start"
        >
          <div>
            <span
              class="text-[10px] font-bold text-brand-slate-muted tracking-wider uppercase block"
            >
              Total Customized Units
            </span>
            <div class="flex items-center gap-2">
              <span
                class="text-xl sm:text-2xl font-bold text-brand-navy-heading"
              >
                {{ quoteStore.totalItemsCount }}
                {{ quoteStore.totalItemsCount === 1 ? "Unit" : "Units" }}
              </span>
              <span
                class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                In Quote Queue
              </span>
            </div>
          </div>

          <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div>
            <span
              class="text-[10px] font-bold text-brand-slate-muted tracking-wider uppercase block"
            >
              Estimated Total
            </span>
            <div class="flex items-center gap-1.5">
              <span
                class="text-xl sm:text-2xl font-extrabold text-brand-navy-heading leading-none"
              >
                {{ formattedTotal }}
              </span>
              <span
                v-if="vatText"
                class="text-xs text-brand-slate-muted font-medium"
              >
                {{ vatText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Master Actions -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <NuxtLink
            :to="destinationRoute"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-all shadow-sm hover:shadow"
            :title="`Continue to ${destinationRoute}`"
          >
            <span>{{ actionText }}</span>
            <span
              v-if="
                quoteStore.totalItemsCount > 0 &&
                !route.path.startsWith('/customize')
              "
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
        </div>
      </div>
    </div>
  </Transition>
</template>
