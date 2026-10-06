<template>
  <main class="flex min-h-screen w-full flex-col items-center bg-white">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-[60px] md:pt-[79px] lg:px-12">
      <div class="flex flex-col items-start gap-4 border-b border-slate-100 pb-6">
        <div class="flex flex-col gap-2">
          <h1
            class="text-3xl font-bold leading-tight tracking-tight text-brand-navy-heading md:text-4xl lg:text-5xl"
          >
            Solutions
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Ready-made combinations of our modular units, put together for the situations our
            customers meet most often — from construction compounds to event sites.
          </p>
        </div>
      </div>

      <div
        v-if="solutions.length === 0"
        class="flex flex-col items-center gap-3 rounded border border-slate-200 bg-slate-50 p-12 text-center"
      >
        <p class="text-lg font-semibold text-brand-navy-heading">
          No solutions published yet — tell us what you need.
        </p>
        <NuxtLink
          to="/contact/"
          class="text-sm font-semibold text-brand-red underline underline-offset-2 hover:text-brand-red-dark"
        >
          Contact us
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SolutionCard v-for="solution in solutions" :key="solution._id" :solution="solution" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSanityQuery } from "#imports";
import SolutionCard from "~/components/SolutionCard.vue";
import { useAppSeo } from "~/composables/useAppSeo";
import { PAGE_SEO } from "~/constants/pageSeo";
import { SOLUTIONS_QUERY, type SolutionSummary } from "~/queries/solutions";

const { setPageSeo, getBreadcrumbSchema } = useAppSeo();

const { data } = await useSanityQuery<SolutionSummary[]>(SOLUTIONS_QUERY);

const solutions = computed(() => data.value ?? []);

setPageSeo({
  ...PAGE_SEO.solutions,
  canonicalPath: "/solutions/",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Karmod Modular Building Solutions",
      description:
        "Curated modular building packages for construction, events, education and security applications.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: solutions.value.map((solution, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: solution.name,
          description: solution.description,
        })),
      },
    },
  ],
});
</script>
