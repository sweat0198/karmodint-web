<template>
  <div class="w-full bg-white min-h-screen pb-24">
    <!-- Buy Flow Header: Progress Tracker + Step 2 Info & Proceed Action -->
    <BuyFlowHeader
      :current-step="2"
      step-label="Step 2 of 4 • Modular Engineering"
      title="Modular Unit Customization"
      description="Configure dimensions, exterior finishes, security glazing, and electrical distribution for each item in your quote. Expand any unit below to access the live 3D visualizer and component options."
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/catalog"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-brand-navy-heading border border-slate-300 font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors duration-150 shadow-sm"
          >
            <span>+ Add Products</span>
          </NuxtLink>

          <NuxtLink
            v-if="!quoteStore.isEmpty"
            to="/quote"
            class="flex items-center justify-center gap-2 px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors duration-150 shadow-sm hover:shadow"
          >
            <span>Review & Request Quote</span>
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
      </template>
    </BuyFlowHeader>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Empty State View (Shown only if user clears all items) -->
      <EmptyQuoteState
        v-if="quoteStore.isEmpty"
        button-to="/catalog"
      />

      <!-- Multi-Item Expandable List View -->
      <div v-else class="space-y-6">
        <!-- List Header Bar -->
        <div
          class="flex items-center justify-between px-1 pb-2 border-b border-slate-200"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-lg font-bold text-brand-navy-heading">
              Customized Units
            </h2>
            <span
              class="bg-brand-rose-card text-brand-red text-xs font-bold px-2 py-0.5 rounded-full"
            >
              {{ quoteStore.totalItemsCount }}
              {{ quoteStore.totalItemsCount === 1 ? "Unit" : "Units" }}
            </span>
          </div>
          <div
            class="flex items-center gap-2 text-xs text-brand-slate-muted font-medium"
          >
            <span>Tip: Click any unit to expand live 3D options</span>
          </div>
        </div>

        <!-- Accordion Item Card Loop -->
        <div
          v-for="item in quoteStore.items"
          :key="item.id"
          class="bg-white border rounded-[4px] transition-[border-color,box-shadow] duration-200 overflow-hidden shadow-xs"
          :class="[
            isExpanded(item.id)
              ? 'border-brand-red/80 ring-1 ring-brand-red/20 shadow-md'
              : 'border-slate-200 hover:border-slate-300',
          ]"
        >
          <!-- Collapsed / Summary Header Row -->
          <div
            class="p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer select-none bg-white transition-colors"
            @click="toggleExpand(item.id)"
          >
            <!-- Left: Product Image & Identity -->
            <div class="flex items-start sm:items-center gap-4 shrink-0">
              <!-- Thumbnail Box -->
              <div
                class="w-20 h-20 sm:w-24 sm:h-24 rounded-[4px] bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 relative overflow-hidden"
              >
                <img
                  :src="item.image || getFallbackImage(item.productId)"
                  :alt="item.productName"
                  class="max-h-full max-w-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                />
                <span
                  v-if="isExpanded(item.id)"
                  class="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"
                  title="Customization Active"
                ></span>
              </div>

              <!-- Titles & Badges -->
              <div class="flex flex-col gap-1 shrink-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    class="label-caps text-brand-red bg-brand-rose-card px-2 py-0.5 rounded-[2px]"
                  >
                    {{ item.variantLabel || "Modular Cabin" }}
                  </span>
                </div>
                <h3
                  class="text-base sm:text-lg font-bold text-brand-navy-heading leading-tight whitespace-nowrap"
                >
                  {{ item.productName }}
                </h3>

                <p
                  v-if="item.notes"
                  class="text-xs text-brand-slate-muted italic line-clamp-1"
                >
                  Note: "{{ item.notes }}"
                </p>
              </div>
            </div>

            <!-- Middle: Quick Spec Summary Badges (Collapsed View) -->
            <div class="flex flex-wrap items-center gap-2 py-1 max-w-md">
              <div
                v-for="(spec, idx) in getItemSpecSummary(item)"
                :key="idx"
                class="bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 flex items-center gap-1.5 text-xs text-[#1F2937]"
              >
                <span
                  class="text-[10px] font-bold uppercase text-brand-slate-muted tracking-wider"
                  >{{ spec.label }}:</span
                >
                <span class="font-medium text-brand-navy-heading">{{
                  spec.value
                }}</span>
              </div>
            </div>

            <!-- Right: Pricing, Quantity & Expand Actions -->
            <div
              class="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0 shrink-0"
              @click.stop
            >
              <!-- Item Price Breakdown -->
              <div class="text-left lg:text-right">
                <span
                  class="text-[10px] font-bold text-brand-slate-muted tracking-wider uppercase block"
                >
                  Unit Estimate
                </span>
                <div class="flex items-baseline gap-1">
                  <span class="text-xl font-bold text-brand-navy-heading">
                    £{{ getItemCustomTotal(item).toLocaleString() }}
                  </span>
                  <span class="text-[11px] text-brand-slate-muted min-w-8"
                    >+ VAT</span
                  >
                </div>
              </div>

              <!-- Quantity Controls -->
              <div
                class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-[2px] p-0.5"
              >
                <button
                  type="button"
                  @click="quoteStore.updateQuantity(item.id, item.quantity - 1)"
                  class="w-7 h-7 rounded-[2px] bg-white border border-slate-200 text-brand-navy-heading font-bold hover:bg-slate-100 text-xs flex items-center justify-center transition-colors"
                  title="Decrease quantity"
                >
                  -
                </button>
                <span
                  class="w-8 text-center text-xs font-bold text-brand-navy-heading"
                >
                  {{ item.quantity }}
                </span>
                <button
                  type="button"
                  @click="quoteStore.updateQuantity(item.id, item.quantity + 1)"
                  class="w-7 h-7 rounded-[2px] bg-white border border-slate-200 text-brand-navy-heading font-bold hover:bg-slate-100 text-xs flex items-center justify-center transition-colors"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>

              <!-- Expand/Collapse Button -->
              <button
                type="button"
                @click="toggleExpand(item.id)"
                class="inline-flex items-center justify-center gap-1.5 w-28 shrink-0 py-2 text-xs font-semibold rounded-[2px] transition-all"
                :class="[
                  isExpanded(item.id)
                    ? 'bg-brand-rose-card text-brand-red border border-brand-rose-border hover:bg-brand-rose-border'
                    : 'bg-brand-navy-heading text-white hover:bg-brand-navy',
                ]"
              >
                <span>{{
                  isExpanded(item.id) ? "Collapse" : "Customize"
                }}</span>
                <svg
                  class="w-3.5 h-3.5 transition-transform duration-200"
                  :class="{ 'rotate-180': isExpanded(item.id) }"
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
            </div>
          </div>

          <!-- Expanded View: Smooth Accordion Grid Animation for Expand & Collapse -->
          <div
            class="accordion-grid"
            :class="{ 'is-expanded': isExpanded(item.id) }"
          >
            <div class="accordion-inner border-t border-slate-200 bg-slate-50">
              <ItemCustomizer
                :title="item.productName"
                :subtitle="`${item.variantLabel || 'Standard Spec'} • Engineering & Component Options`"
                :preview-image="item.image || getFallbackImage(item.productId)"
                :base-price="item.basePrice || 2450"
                :steps="getItemSteps(item)"
                :model-value="getItemConfig(item.id)"
                :spec-summary-items="getItemSpecSummary(item)"
                :show-price-bar="false"
                @update:model-value="onModelUpdate(item.id, $event)"
                @change="handleItemConfigChange(item, $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useQuoteStore, type QuoteItem } from "~/stores/quote";
import type { CustomizationStep, SpecSummaryItem } from "~/types/customization";
import {
  generateSpecSummary,
  getDefaultSelections,
  getModularStepsForProduct,
} from "~/utils/modularConfigPresets";
import { useAppSeo } from "~/composables/useAppSeo";

const { setPageSeo } = useAppSeo();

setPageSeo({
  title: "Customize Modular Units | Karmod International",
  description:
    "Interactive engineering configuration for Karmod modular cabins, security gatehouses, and portable buildings.",
  canonicalPath: "/customize",
  noindex: true,
});

const quoteStore = useQuoteStore();

// Tracks which items are expanded in accordion
const expandedItemIds = ref<Set<string>>(new Set());

// Local reactive mapping for each item's selection state
const itemConfigs = reactive<Record<string, Record<string, any>>>({});

function isExpanded(id: string): boolean {
  return expandedItemIds.value.has(id);
}

function toggleExpand(id: string) {
  if (expandedItemIds.value.has(id)) {
    expandedItemIds.value.delete(id);
  } else {
    expandedItemIds.value.add(id);
  }
}

function getFallbackImage(productId?: string): string {
  if (
    productId?.includes("security") ||
    productId?.includes("gatehouse") ||
    productId?.includes("sec-")
  ) {
    return "/images/product-service-cabin-135.png";
  }
  if (productId?.includes("kiosk") || productId?.includes("retail")) {
    return "/images/product-security-cabin-110.png";
  }
  return "/images/product-container-k2004.png";
}

function getItemSteps(item: QuoteItem): CustomizationStep[] {
  return getModularStepsForProduct(item.productId, item.productName);
}

function getItemConfig(id: string): Record<string, any> {
  if (!itemConfigs[id]) {
    const existing = quoteStore.items.find((i) => i.id === id);
    if (existing?.configState && Object.keys(existing.configState).length > 0) {
      itemConfigs[id] = { ...existing.configState };
    } else {
      itemConfigs[id] = getDefaultSelections();
    }
  }
  return itemConfigs[id];
}

function getItemSpecSummary(item: QuoteItem): SpecSummaryItem[] {
  if (item.specSummary && item.specSummary.length > 0) {
    return item.specSummary;
  }
  const steps = getItemSteps(item);
  const selections = getItemConfig(item.id);
  return generateSpecSummary(steps, selections);
}

function getItemCustomTotal(item: QuoteItem): number {
  return item.customTotal ?? item.basePrice ?? 2450;
}

function onModelUpdate(id: string, newSelections: Record<string, any>) {
  itemConfigs[id] = newSelections;
}

function handleItemConfigChange(
  item: QuoteItem,
  payload: { selections: Record<string, any>; total: number },
) {
  itemConfigs[item.id] = payload.selections;
  const steps = getItemSteps(item);
  const specSummary = generateSpecSummary(steps, payload.selections);

  quoteStore.updateItemConfig(
    item.id,
    payload.selections,
    payload.total,
    specSummary,
  );
}

onMounted(() => {
  quoteStore.setLastVisitedRoute('/customize');
  // Expand the first item by default if items exist
  const first = quoteStore.items[0];
  if (first) {
    expandedItemIds.value.add(first.id);
  }
});
</script>

<style scoped>
.accordion-grid {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition:
    grid-template-rows 350ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms ease-in-out;
  will-change: grid-template-rows, opacity;
}

.accordion-grid.is-expanded {
  grid-template-rows: 1fr;
  opacity: 1;
}

.accordion-inner {
  overflow: hidden;
  min-height: 0;
}
</style>
