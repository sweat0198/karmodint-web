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
            to="/products"
            class="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-brand-navy-heading border border-slate-300 font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm"
          >
            <span>+ Add Products</span>
          </NuxtLink>

          <button
            v-if="!quoteStore.isEmpty"
            type="button"
            class="flex items-center justify-center gap-2 px-8 py-3 text-white font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm"
            :class="[
              canProceedToQuote
                ? 'bg-brand-red hover:bg-brand-red-hover hover:shadow cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed',
            ]"
            :aria-disabled="!canProceedToQuote"
            @click="handleProceedClick"
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
          </button>
        </div>
      </template>
    </BuyFlowHeader>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Empty State View (Shown only if user clears all items) -->
      <EmptyQuoteState
        v-if="quoteStore.isEmpty"
        button-to="/products"
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
          :id="`unit-${item.id}`"
          :key="item.id"
          class="bg-white border rounded transition-[border-color,box-shadow] duration-200 overflow-clip shadow-xs"
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
                class="w-20 h-20 sm:w-24 sm:h-24 rounded bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 relative overflow-hidden"
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
                    class="label-caps text-brand-red bg-brand-rose-card px-2 py-0.5 rounded-xs"
                  >
                    {{ item.sizeLabel }}
                  </span>
                  <span
                    v-if="getItemUnsatisfiedMandatory(item).length > 0"
                    class="text-[10px] font-bold uppercase text-white bg-brand-red px-2 py-0.5 rounded-full"
                  >
                    {{ getItemUnsatisfiedMandatory(item).length }} required
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
                class="bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 flex items-center gap-1.5 text-xs text-gray-800"
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
                    {{ getItemPricing(item).priceLabel.value }}
                  </span>
                  <span
                    v-if="!getItemPricing(item).sizeIsPoa.value"
                    class="text-[11px] text-brand-slate-muted min-w-8"
                    >+ VAT</span
                  >
                </div>
              </div>

              <!-- Quantity Controls -->
              <div
                class="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xs p-0.5"
              >
                <button
                  type="button"
                  @click="quoteStore.updateQuantity(item.id, item.quantity - 1)"
                  class="w-7 h-7 rounded-xs bg-white border border-slate-200 text-brand-navy-heading font-bold hover:bg-slate-100 text-xs flex items-center justify-center transition-colors"
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
                  class="w-7 h-7 rounded-xs bg-white border border-slate-200 text-brand-navy-heading font-bold hover:bg-slate-100 text-xs flex items-center justify-center transition-colors"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>

              <!-- Expand/Collapse Button -->
              <button
                type="button"
                @click="toggleExpand(item.id)"
                class="inline-flex items-center justify-center gap-1.5 w-28 shrink-0 py-2 text-xs font-semibold rounded-xs transition-all"
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
              <ProductCustomizer
                :title="item.productName"
                :subtitle="`${item.sizeLabel} • Engineering & Component Options`"
                :preview-image="item.image || getFallbackImage(item.productId)"
                :preview-images="item.images ?? []"
                :spec-summary-items="getItemSpecSummary(item)"
                :groups="DEMO_CUSTOMIZATION_GROUPS"
                :model-value="getItemSelections(item.id)"
                :notes="getItemNotes(item.id)"
                show-demo-notice
                @update:model-value="onSelectionsUpdate(item, $event)"
                @update:notes="onNotesUpdate(item, $event)"
              >
                <template v-if="item.isPortableContainer" #before-demo-notice>
                  <SizeSelector
                    :select-id="`portable-size-${item.id}`"
                    :sizes="getPortableSizes(item)"
                    :model-value="item.hasSelectedSize === false ? '' : item.sizeKey"
                    @update:model-value="onPortableSizeChange(item, $event)"
                  />
                </template>
              </ProductCustomizer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useSanityQuery } from '#imports'
import { useQuoteStore, type QuoteItem } from "~/stores/quote";
import type { CustomizationNotes, CustomizationSelections, SpecSummaryItem } from "~/types/customization";
import { DEMO_CUSTOMIZATION_GROUPS } from "~/utils/customizationFixtures";
import { buildSpecSummary, useCustomizationPricing } from "~/composables/useCustomizationPricing";
import { useAppSeo } from "~/composables/useAppSeo";
import { PRODUCTS_WITH_SIZES_QUERY, type CatalogProduct } from '~/queries/catalog'
import { toPortableContainerCards } from '~/utils/portableContainerCards'
import { requiresSizeSelection } from '~~/shared/utils/quoteLine'
import { moveQuoteItemState } from '~/utils/quoteItemState'

const { setPageSeo } = useAppSeo();

setPageSeo({
  title: "Customize Modular Units | Karmod International",
  description:
    "Interactive engineering configuration for Karmod modular cabins, security gatehouses, and portable buildings.",
  canonicalPath: "/customize",
  noindex: true,
});

const quoteStore = useQuoteStore();
const { data: catalogueProducts } = await useSanityQuery<CatalogProduct[]>(PRODUCTS_WITH_SIZES_QUERY)
const portableCards = computed(() => toPortableContainerCards(catalogueProducts.value ?? []))

// Tracks which single item is expanded in the accordion
const expandedItemId = ref<string | null>(null);

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls the card's header to sit just under the sticky app header, once its layout has settled.
 *
 * `--customizer-sticky-top` itself is a `calc()` expression, and `getComputedStyle` returns an
 * unregistered custom property's `calc()` text unevaluated rather than a resolved pixel value —
 * so this re-derives the same `var(--app-header-h) + 1rem` formula from its plain-length parts
 * instead of trying to parse the calc string.
 *
 * Single-open means the outgoing card's `.accordion-grid` collapses to `0fr` while the incoming
 * one expands to `1fr` in the same 350ms transition (D7). Measuring right after Vue's `nextTick`
 * catches both mid-animation, so the target position is off by however much of the transition
 * hasn't run yet — waiting for the incoming card's `transitionend` measures the settled layout.
 */
function scrollCardIntoView(id: string) {
  nextTick(() => {
    const reduced = prefersReducedMotion();

    const doScroll = () => {
      const el = document.getElementById(`unit-${id}`);
      if (!el) return;
      const rootStyle = getComputedStyle(document.documentElement);
      const headerH = Number.parseFloat(rootStyle.getPropertyValue("--app-header-h")) || 0;
      const rem = Number.parseFloat(rootStyle.fontSize) || 16;
      const stickyTop = headerH + rem;
      const targetY = el.getBoundingClientRect().top + window.scrollY - stickyTop;
      window.scrollTo({ top: targetY, behavior: reduced ? "auto" : "smooth" });
    };

    const grid = document.querySelector<HTMLElement>(`#unit-${id} .accordion-grid`);
    if (reduced || !grid) {
      doScroll();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      grid.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(fallback);
      doScroll();
    };
    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target === grid && e.propertyName === "grid-template-rows") finish();
    };
    grid.addEventListener("transitionend", onTransitionEnd);
    // Fallback in case the transition is interrupted (e.g. another toggle) and never fires.
    const fallback = window.setTimeout(finish, 400);
  });
}

// Local reactive mapping for each item's live selections and notes
const itemSelections = reactive<Record<string, CustomizationSelections>>({});
const itemNotes = reactive<Record<string, CustomizationNotes>>({});
const itemPricingCache = new Map<string, ReturnType<typeof useCustomizationPricing>>();

function isExpanded(id: string): boolean {
  return expandedItemId.value === id;
}

function toggleExpand(id: string) {
  if (expandedItemId.value === id) {
    expandedItemId.value = null;
  } else {
    expandedItemId.value = id;
    scrollCardIntoView(id);
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

function getItemSelections(id: string): CustomizationSelections {
  if (!itemSelections[id]) {
    const existing = quoteStore.items.find((i) => i.id === id);
    itemSelections[id] = existing?.configState ? { ...existing.configState } : {};
  }
  return itemSelections[id];
}

function getItemNotes(id: string): CustomizationNotes {
  if (!itemNotes[id]) {
    const existing = quoteStore.items.find((i) => i.id === id);
    itemNotes[id] = existing?.customizationNotes ? { ...existing.customizationNotes } : {};
  }
  return itemNotes[id];
}

function getItemPricing(item: QuoteItem) {
  let pricing = itemPricingCache.get(item.id);
  if (!pricing) {
    pricing = useCustomizationPricing(
      () => DEMO_CUSTOMIZATION_GROUPS,
      () => getItemSelections(item.id),
      () => getItemNotes(item.id),
      () => ({
        label: item.sizeLabel,
        lengthM: 0,
        widthM: 0,
        images: [],
        price: item.basePrice ?? 0,
        isPoa: item.isPoa === true,
      }),
    );
    itemPricingCache.set(item.id, pricing);
  }
  return pricing;
}

function getPortableSizes(item: QuoteItem) {
  return portableCards.value.find((card) => card.productId === item.productId)?.sizes ?? []
}

function onPortableSizeChange(item: QuoteItem, sizeKey: string) {
  const size = getPortableSizes(item).find((candidate) => candidate.sizeKey === sizeKey)
  if (!size) return

  const previousId = item.id
  const nextId = quoteStore.selectPortableSize(previousId, size)
  migrateCustomizerState(previousId, nextId)
}

function getItemUnsatisfiedMandatory(item: QuoteItem) {
  return getItemPricing(item).unsatisfiedMandatory.value;
}

function getItemSpecSummary(item: QuoteItem): SpecSummaryItem[] {
  const live = buildSpecSummary(DEMO_CUSTOMIZATION_GROUPS, getItemSelections(item.id));
  if (live.length > 0) return live;
  return item.specSummary ?? [];
}

function persistItemConfig(item: QuoteItem) {
  const pricing = getItemPricing(item);
  return quoteStore.updateItemConfig(item.id, {
    selections: getItemSelections(item.id),
    notes: getItemNotes(item.id),
    total: pricing.subtotal.value,
    isPoa: pricing.hasPoa.value,
    specSummary: buildSpecSummary(DEMO_CUSTOMIZATION_GROUPS, getItemSelections(item.id)),
    lines: pricing.lines.value,
  });
}

function migrateCustomizerState(previousId: string, nextId: string | undefined) {
  if (!nextId || previousId === nextId) return
  moveQuoteItemState(itemSelections, previousId, nextId)
  moveQuoteItemState(itemNotes, previousId, nextId)
  itemPricingCache.delete(previousId)
  itemPricingCache.delete(nextId)
  if (expandedItemId.value === previousId) expandedItemId.value = nextId
}

function onSelectionsUpdate(item: QuoteItem, next: CustomizationSelections) {
  const previousId = item.id
  itemSelections[previousId] = next;
  migrateCustomizerState(previousId, persistItemConfig(item));
}

function onNotesUpdate(item: QuoteItem, next: CustomizationNotes) {
  const previousId = item.id
  itemNotes[previousId] = next;
  migrateCustomizerState(previousId, persistItemConfig(item));
}

const canProceedToQuote = computed(() =>
  quoteStore.items.every(
    (item) => !requiresSizeSelection(item) && getItemUnsatisfiedMandatory(item).length === 0,
  ),
);

function handleProceedClick() {
  if (canProceedToQuote.value) {
    navigateTo("/quote");
    return;
  }

  const offendingItem = quoteStore.items.find(
    (item) => requiresSizeSelection(item) || getItemUnsatisfiedMandatory(item).length > 0,
  );
  if (!offendingItem) return;

  expandedItemId.value = offendingItem.id;
  if (requiresSizeSelection(offendingItem)) {
    nextTick(() => {
      document.getElementById(`portable-size-${offendingItem.id}`)?.focus();
    });
    return;
  }
  const offendingGroup = getItemUnsatisfiedMandatory(offendingItem)[0];
  nextTick(() => {
    document
      .getElementById(`group-${offendingGroup?._id}`)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  });
}

onMounted(() => {
  quoteStore.setLastVisitedRoute('/customize');
  // Expand the first item by default if items exist
  const first = quoteStore.items[0];
  if (first) {
    expandedItemId.value = first.id;
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
  overflow: clip;
  min-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .accordion-grid {
    /* Drop the row-height transition (it moves the rest of the page) but keep the opacity
       fade — it aids comprehension of the swap without any motion. */
    transition: opacity 300ms ease-in-out;
  }
}
</style>
