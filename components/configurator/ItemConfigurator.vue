<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ConfiguratorStep, SpecSummaryItem } from '~/types/configurator'

import ConfiguratorPriceBar from '~/components/configurator/ConfiguratorPriceBar.vue'

interface Props {
  title: string
  subtitle?: string
  previewImage?: string
  specSummaryItems?: SpecSummaryItem[]
  specSheetUrl?: string
  currencySymbol?: string
  vatText?: string
  basePrice?: number
  steps: ConfiguratorStep[]
  // Active selection state passed from parent via v-model
  modelValue?: Record<string, any>
  saveLabel?: string
  quoteLabel?: string
  isSaving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  previewImage: '',
  specSummaryItems: () => [],
  specSheetUrl: '#',
  currencySymbol: '£',
  vatText: '+ VAT',
  basePrice: 0,
  modelValue: () => ({}),
  saveLabel: 'Save Config',
  quoteLabel: 'Get Instant Formal Quote',
  isSaving: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'save', payload: { selections: Record<string, any>; total: number }): void
  (e: 'quote', payload: { selections: Record<string, any>; total: number }): void
  (e: 'download-spec'): void
}>()

const selections = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// Calculate total estimated price dynamically from step selections
const estimatedTotal = computed(() => {
  let total = props.basePrice

  for (const step of props.steps) {
    const sel = selections.value[step.id]
    if (!sel) continue

    if (step.type === 'card' || step.type === 'grid' || step.type === 'list') {
      const selectedOpt = step.options?.find(o => o.id === sel)
      if (selectedOpt) {
        total += selectedOpt.price
      }
    } else if (step.type === 'counter-checkbox') {
      // Counter price if any
      if (step.counter && sel.counterValue) {
        total += (step.counter.unitPrice || 0) * sel.counterValue
      }
      // Checkboxes price if selected
      if (step.checkboxes && sel.checkboxes) {
        for (const chk of step.checkboxes) {
          if (sel.checkboxes[chk.id]) {
            const multiplier = sel.counterValue || 1
            total += chk.price * (chk.priceSuffix?.includes('/ea') ? multiplier : 1)
          }
        }
      }
    }
  }

  return total
})

const handleSave = () => {
  emit('save', { selections: selections.value, total: estimatedTotal.value })
}

const handleQuote = () => {
  emit('quote', { selections: selections.value, total: estimatedTotal.value })
}
</script>

<template>
  <div class="w-full flex flex-col relative bg-slate-50">
    <!-- Configurator Main Layout (Viewer + Steps) -->
    <ProductConfigurator
      v-model="selections"
      :title="title"
      :subtitle="subtitle"
      :preview-image="previewImage"
      :spec-summary-items="specSummaryItems"
      :spec-sheet-url="specSheetUrl"
      :currency-symbol="currencySymbol"
      :steps="steps"
      @download-spec="emit('download-spec')"
    />

    <!-- Sticky Bottom Price Bar -->
    <ConfiguratorPriceBar
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
