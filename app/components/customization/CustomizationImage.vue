<script setup lang="ts">
import type { SanityImage } from "~/types/catalog";

interface Props {
  image?: SanityImage;
  alt: string;
}

defineProps<Props>();
</script>

<template>
  <SanityImage
    v-if="image?.asset?._ref"
    :asset="image.asset"
    :alt="alt"
    class="w-full h-full object-cover"
  />
  <div
    v-else
    class="w-full h-full bg-slate-200/60 flex items-center justify-center text-xs text-slate-400 font-medium"
  >
    Preview
  </div>
</template>
