<template>
  <div role="search" class="w-full">
    <label :for="inputId" class="sr-only">Search products and categories</label>
    <div
      class="relative flex h-11 items-center rounded border border-slate-200 bg-white shadow-xs focus-within:border-brand-red focus-within:ring-2 focus-within:ring-brand-red/15"
    >
      <svg
        class="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
        />
      </svg>
      <input
        :id="inputId"
        :value="modelValue"
        type="search"
        placeholder="Search products…"
        autocomplete="off"
        :spellcheck="false"
        aria-controls="catalog-results"
        aria-describedby="catalog-search-status"
        class="catalog-search-input h-full w-full rounded bg-transparent py-2 pl-10 pr-10 text-sm font-medium text-brand-navy-heading outline-none placeholder:text-slate-400"
        @input="onInput"
      />
      <button
        v-if="modelValue"
        type="button"
        class="absolute right-1.5 rounded p-2 text-slate-400 hover:text-brand-navy-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
        aria-label="Clear product search"
        @click="emit('clear')"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  inputId: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "clear"): void;
}>();

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<style scoped>
.catalog-search-input::-webkit-search-cancel-button {
  appearance: none;
}
</style>
