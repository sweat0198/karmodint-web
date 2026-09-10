<template>
  <fieldset class="mb-6 rounded border border-slate-200 bg-slate-50 p-4">
    <legend class="px-1 text-sm font-semibold text-brand-navy-heading">Choose size</legend>
    <label :for="selectId" class="mt-1 block text-xs text-brand-slate-muted">
      Size is required before quote review.
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :aria-invalid="!modelValue"
      :aria-describedby="feedbackId"
      class="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-brand-navy-heading focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>Choose a size</option>
      <option v-for="size in sizes" :key="size.sizeKey" :value="size.sizeKey">
        {{ size.sizeLabel }} — {{ size.isPoa ? 'Price on application' : `£${size.price?.toLocaleString()}` }}
      </option>
    </select>
    <p :id="feedbackId" class="mt-2 text-xs" :class="modelValue ? 'text-brand-slate-muted' : 'font-medium text-brand-red'">
      <template v-if="modelValue">Dimensions and price update when you change size.</template>
      <template v-else>Choose a size before continuing to quote review.</template>
    </p>
  </fieldset>
</template>

<script setup lang="ts">
interface SizeChoice {
  sizeKey: string
  sizeLabel: string
  price?: number
  isPoa: boolean
}

import { computed } from 'vue'

const props = withDefaults(defineProps<{
  sizes: SizeChoice[]
  modelValue: string
  selectId?: string
}>(), {
  selectId: 'portable-size-selector'
})

const feedbackId = computed(() => `${props.selectId}-feedback`)

const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
</script>
