<template>
  <button
    type="button"
    class="group relative block h-full w-full overflow-hidden rounded-xs bg-slate-200 text-left shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    @click="emit('select')"
  >
    <img
      :src="tile.image.src"
      :srcset="tile.image.srcset"
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
      :alt="tile.image.alt"
      loading="lazy"
      decoding="async"
      class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
    />
    <div
      class="absolute inset-0 flex flex-col justify-end gap-0.5 bg-gradient-to-t from-[#291715]/90 via-[#291715]/40 to-transparent p-3 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
    >
      <span class="text-[10px] font-semibold uppercase tracking-[1.1px] text-[#FF9A96]">{{
        tile.category.name
      }}</span>
      <span class="line-clamp-2 text-[13px] font-semibold leading-snug text-white">{{
        tile.title
      }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { GalleryTile } from "~/types/gallery";

defineProps<{ tile: GalleryTile }>();
const emit = defineEmits<{ select: [] }>();
</script>
