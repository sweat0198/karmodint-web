<template>
  <NuxtLink
    :to="`/solutions/${solution.slug}`"
    class="group flex flex-col overflow-hidden rounded border border-slate-100 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
  >
    <div class="aspect-4/3 overflow-hidden bg-slate-50">
      <img
        v-if="coverSrc"
        :src="coverSrc"
        :srcset="coverSrcset"
        sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
        :alt="solution.coverImage?.alt"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition-transform duration-300 [transition-timing-function:var(--ease-out)] motion-safe:group-hover:scale-[1.03]"
      />
    </div>

    <div class="flex flex-1 flex-col gap-2 p-6">
      <h2 class="text-xl font-bold leading-snug text-brand-navy-heading">
        {{ solution.name }}
      </h2>
      <p class="line-clamp-3 text-sm leading-relaxed text-brand-slate-muted">
        {{ solution.description }}
      </p>

      <div
        class="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold uppercase tracking-wider text-brand-red"
      >
        <span>{{ productCountLabel }}</span>
        <svg
          class="h-4 w-4 shrink-0 transition-transform duration-150 motion-safe:group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SolutionSummary } from "~/types/solution";
import { resolveSanityImageConfig } from "~/utils/sanityImageConfig";
import { sanityImageSrcset, sanityImageUrl } from "~/utils/sanityImageUrl";

const SRCSET_WIDTHS = [400, 800, 1200];

const props = defineProps<{ solution: SolutionSummary }>();

const coverSrc = computed(() => {
  const { projectId, dataset } = resolveSanityImageConfig();
  return sanityImageUrl(props.solution.coverImage?.asset?._ref, projectId, dataset, {
    width: 800,
    fit: "max",
  });
});

const coverSrcset = computed(() => {
  const { projectId, dataset } = resolveSanityImageConfig();
  return sanityImageSrcset(
    props.solution.coverImage?.asset?._ref,
    projectId,
    dataset,
    SRCSET_WIDTHS,
  );
});

const productCountLabel = computed(() => {
  const count = props.solution.productCount;
  return `${count} product${count === 1 ? "" : "s"}`;
});
</script>
