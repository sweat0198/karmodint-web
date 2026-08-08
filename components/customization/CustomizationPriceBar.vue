<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  estimatedTotal: number
  currencySymbol?: string
  vatText?: string
  saveLabel?: string
  quoteLabel?: string
  isSaving?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currencySymbol: '£',
  vatText: '+ VAT',
  saveLabel: 'Save Customization',
  quoteLabel: 'Get Instant Formal Quote',
  isSaving: false
})

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'quote'): void
}>()

const formattedTotal = computed(() => {
  return `${props.currencySymbol}${props.estimatedTotal.toLocaleString()}`
})
</script>

<template>
  <div 
    class="sticky bottom-0 z-40 bg-white border-t border-brand-rose-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] w-full py-4 px-6 md:px-12"
    data-node-id="1:21"
  >
    <div class="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Total Price Display -->
      <div class="flex flex-col items-start">
        <span class="text-xs font-semibold text-brand-slate-muted tracking-[0.8px] uppercase">
          ESTIMATED TOTAL
        </span>
        <div class="flex items-baseline gap-2 mt-0.5">
          <span class="text-2xl sm:text-3xl font-normal text-gray-800 leading-none">
            {{ formattedTotal }}
          </span>
          <span v-if="vatText" class="text-xs sm:text-sm font-medium text-brand-slate-muted">
            {{ vatText }}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          class="flex-1 sm:flex-initial px-6 py-3 border border-brand-rose-border text-gray-800 font-medium text-sm rounded hover:bg-brand-rose-bg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-rose-border"
          :disabled="isSaving"
          @click="emit('save')"
        >
          <span v-if="isSaving" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>{{ saveLabel }}</span>
        </button>

        <button
          type="button"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-red text-white font-medium text-sm rounded hover:bg-brand-red-hover transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2"
          @click="emit('quote')"
        >
          <span>{{ quoteLabel }}</span>
          <svg class="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
