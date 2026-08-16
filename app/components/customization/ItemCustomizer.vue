<script setup lang="ts">
import { computed, watch } from "vue";
import type { CustomizationStep, SpecSummaryItem } from "~/types/customization";

interface Props {
  title: string;
  subtitle?: string;
  previewImage?: string;
  specSummaryItems?: SpecSummaryItem[];
  specSheetUrl?: string;
  currencySymbol?: string;
  vatText?: string;
  basePrice?: number;
  steps: CustomizationStep[];
  // Active selection state passed from parent via v-model
  modelValue?: Record<string, any>;
  saveLabel?: string;
  quoteLabel?: string;
  isSaving?: boolean;
  showPriceBar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  previewImage: "",
  specSummaryItems: () => [],
  specSheetUrl: "#",
  currencySymbol: "£",
  vatText: "+ VAT",
  basePrice: 0,
  modelValue: () => ({}),
  saveLabel: "Save Customization",
  quoteLabel: "Get Instant Formal Quote",
  isSaving: false,
  showPriceBar: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (
    e: "change",
    payload: { selections: Record<string, any>; total: number },
  ): void;
  (
    e: "save",
    payload: { selections: Record<string, any>; total: number },
  ): void;
  (
    e: "quote",
    payload: { selections: Record<string, any>; total: number },
  ): void;
}>();

const selections = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

// Calculate total estimated price dynamically from step selections
const estimatedTotal = computed(() => {
  let total = props.basePrice;

  for (const step of props.steps) {
    const sel = selections.value[step.id];
    if (!sel) continue;

    if (step.type === "card" || step.type === "grid" || step.type === "list") {
      const selectedOpt = step.options?.find((o) => o.id === sel);
      if (selectedOpt) {
        total += selectedOpt.price;
      }
    } else if (step.type === "counter-checkbox") {
      // Counter price if any
      if (step.counter && sel.counterValue) {
        total += (step.counter.unitPrice || 0) * sel.counterValue;
      }
      // Checkboxes price if selected
      if (step.checkboxes && sel.checkboxes) {
        for (const chk of step.checkboxes) {
          if (sel.checkboxes[chk.id]) {
            const multiplier = sel.counterValue || 1;
            total +=
              chk.price * (chk.priceSuffix?.includes("/ea") ? multiplier : 1);
          }
        }
      }
    }
  }

  return total;
});

// Emit change whenever selections or estimatedTotal updates
watch(
  [selections, estimatedTotal],
  ([sel, tot]) => {
    emit("change", { selections: sel, total: tot });
  },
  { deep: true },
);

const handleSave = () => {
  emit("save", { selections: selections.value, total: estimatedTotal.value });
};

const handleQuote = () => {
  emit("quote", { selections: selections.value, total: estimatedTotal.value });
};
</script>

<template>
  <div
    class="w-full flex flex-col relative bg-slate-50 border border-slate-200/80 rounded overflow-hidden"
  >
    <!-- Customization Main Layout (Viewer + Steps) -->
    <ProductCustomizer
      v-model="selections"
      :title="title"
      :subtitle="subtitle"
      :preview-image="previewImage"
      :spec-summary-items="specSummaryItems"
      :spec-sheet-url="specSheetUrl"
      :currency-symbol="currencySymbol"
      :steps="steps"
    />

    <!-- Sticky Bottom Price Bar (shown if showPriceBar is true) -->
    <PriceBar
      v-if="showPriceBar"
      :estimated-total="estimatedTotal"
      :currency-symbol="currencySymbol"
      :vat-text="vatText"
      :save-label="saveLabel"
      :quote-label="quoteLabel"
      :is-saving="isSaving"
      @save="handleSave"
      @quote="handleQuote"
    />
  </div>
</template>
