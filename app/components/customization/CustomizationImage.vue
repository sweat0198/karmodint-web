<script setup lang="ts">
import { computed } from "vue";
import type { SanityImage } from "~/types/catalog";
import { FIXTURE_ASSET_URLS } from "~/utils/customizationFixtures";

interface Props {
  image?: SanityImage;
  alt: string;
}

const props = defineProps<Props>();

const resolvedSrc = computed(() => {
  const ref = props.image?.asset?._ref;
  if (!ref) return undefined;
  return FIXTURE_ASSET_URLS[ref];
});
</script>

<template>
  <img
    v-if="resolvedSrc"
    :src="resolvedSrc"
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
