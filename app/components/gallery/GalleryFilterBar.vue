<template>
  <div
    class="flex items-center gap-3 overflow-x-auto border-b border-slate-200 pb-4 no-scrollbar"
    role="tablist"
    aria-label="Filter projects by category"
  >
    <button
      type="button"
      role="tab"
      :aria-selected="activeCategory === ALL"
      data-gallery-chip="ALL"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-[1.2px] transition-[background-color,color] duration-150 ease-in-out motion-reduce:transition-none"
      :class="
        activeCategory === ALL
          ? 'bg-brand-red text-white shadow-sm'
          : 'bg-slate-100 text-brand-slate-muted hover:bg-slate-200 hover:text-slate-900'
      "
      @click="emit('update:activeCategory', ALL)"
    >
      All projects
      <span class="text-[11px] font-medium normal-case tracking-normal opacity-60">{{
        totalCount
      }}</span>
    </button>
    <button
      v-for="category in categories"
      :key="category.slug"
      type="button"
      role="tab"
      :aria-selected="activeCategory === category.slug"
      :data-gallery-chip="category.slug"
      class="flex items-center gap-1.5 whitespace-nowrap rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-[1.2px] transition-[background-color,color] duration-150 ease-in-out motion-reduce:transition-none"
      :class="
        activeCategory === category.slug
          ? 'bg-brand-red text-white shadow-sm'
          : 'bg-slate-100 text-brand-slate-muted hover:bg-slate-200 hover:text-slate-900'
      "
      @click="emit('update:activeCategory', category.slug)"
    >
      {{ category.name }}
      <span class="text-[11px] font-medium normal-case tracking-normal opacity-60">{{
        category.count
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { GalleryCategoryOption } from "~/types/gallery";

const ALL = "ALL";

defineProps<{
  categories: GalleryCategoryOption[];
  activeCategory: string;
  totalCount: number;
}>();
const emit = defineEmits<{ "update:activeCategory": [slug: string] }>();
</script>
