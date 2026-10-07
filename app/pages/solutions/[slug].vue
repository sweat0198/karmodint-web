<template>
  <main class="flex min-h-screen w-full flex-col items-center bg-white">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-[60px] md:pt-[79px] lg:px-12">
      <nav
        aria-label="Breadcrumb"
        class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-slate-muted"
      >
        <NuxtLink to="/" class="transition-colors hover:text-brand-navy-heading">Home</NuxtLink>
        <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <NuxtLink to="/solutions/" class="transition-colors hover:text-brand-navy-heading">
          Solutions
        </NuxtLink>
        <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-bold text-brand-navy-heading">{{ solution.name }}</span>
      </nav>

      <!-- Cover photo, then the title and short description beneath it -->
      <header class="flex flex-col gap-6">
        <div class="aspect-16/9 w-full overflow-hidden rounded bg-slate-50 md:aspect-21/9">
          <img
            v-if="coverSrc"
            :src="coverSrc"
            :srcset="coverSrcset"
            sizes="(min-width: 1280px) 1216px, 100vw"
            :alt="solution.coverImage?.alt"
            fetchpriority="high"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="flex flex-col gap-3 border-b border-slate-100 pb-6">
          <h1
            class="text-3xl font-bold leading-tight tracking-tight text-brand-navy-heading md:text-4xl lg:text-5xl"
          >
            {{ solution.name }}
          </h1>
          <p class="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {{ solution.description }}
          </p>
        </div>
      </header>

      <!-- The products that make up this solution -->
      <section class="flex flex-col gap-6">
        <h2 class="text-2xl font-semibold tracking-tight text-brand-navy-heading">
          Products in this solution
        </h2>

        <div
          v-if="cards.length === 0"
          class="flex flex-col items-center gap-3 rounded border border-slate-200 bg-slate-50 p-12 text-center"
        >
          <p class="text-lg font-semibold text-brand-navy-heading">
            The units for this solution are being updated — talk to us.
          </p>
          <NuxtLink
            to="/contact/"
            class="text-sm font-semibold text-brand-red underline underline-offset-2 hover:text-brand-red-dark"
          >
            Contact us
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProductCard v-for="card in cards" :key="card.cardId" :card="card" />
        </div>
      </section>

      <!-- Legacy copy of the Legacy URL that now redirects to this Solution, where there was one -->
      <article v-if="solution.body?.length" class="max-w-3xl">
        <PortableTextContent :blocks="solution.body" />
      </article>

      <FaqAccordion
        v-if="faqs.length > 0"
        class="max-w-3xl"
        :heading="`${solution.name} Frequently Asked Questions`"
        :faqs="faqs"
      />

      <section
        class="mt-2 flex flex-col items-center gap-4 rounded border border-brand-rose-border bg-brand-rose-bg p-8 text-center shadow-sm lg:p-12"
      >
        <h2 class="text-2xl font-semibold tracking-tight text-brand-navy-heading">
          Need this solution adapted to your site?
        </h2>
        <p class="max-w-2xl text-base leading-relaxed text-brand-slate-muted">
          Our engineering team can adjust sizes, layouts and specifications to match your exact
          requirements.
        </p>
        <NuxtLink
          to="/contact/"
          class="mt-2 inline-flex items-center gap-2 rounded-xs border border-brand-navy-heading px-8 py-3 text-xs font-semibold uppercase tracking-wider text-brand-navy-heading transition-colors hover:bg-brand-navy-heading hover:text-white"
        >
          <span>Contact Us</span>
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </NuxtLink>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { createError, useRuntimeConfig, useSanityQuery } from "#imports";
import FaqAccordion from "~/components/content/FaqAccordion.vue";
import PortableTextContent from "~/components/content/PortableTextContent.vue";
import ProductCard from "~/components/ProductCard.vue";
import { useAppSeo } from "~/composables/useAppSeo";
import { solutionPageSeo } from "~/constants/pageSeo";
import { SOLUTION_BY_SLUG_QUERY, type Solution } from "~/queries/solutions";
import { sanityImageSrcset, sanityImageUrl } from "~/utils/sanityImageUrl";
import { toSolutionCards } from "~/utils/solutionCards";
import { solutionPagePath } from "~~/shared/utils/sitePages";

const SRCSET_WIDTHS = [640, 1024, 1600, 2000];

const route = useRoute();
const config = useRuntimeConfig();
const { setPageSeo, getProductSchema, getBreadcrumbSchema, getFaqPageSchema } = useAppSeo();

const slug = computed(() => String(route.params.slug));

const { data } = await useSanityQuery<Solution | null>(SOLUTION_BY_SLUG_QUERY, {
  slug: slug.value,
});

// Identity, not truthiness: an unmatched `*[...][0]{...}` can arrive as an object of null fields
// rather than null itself, and that object would otherwise render as a solution named "undefined".
const found = data.value?._id ? data.value : null;
if (!found) {
  throw createError({ statusCode: 404, statusMessage: "Solution not found", fatal: true });
}

const solution = computed(() => (data.value?._id ? data.value : found));
const cards = computed(() => toSolutionCards(solution.value.products));
const faqs = computed(() => solution.value.faqs ?? []);

const coverRef = computed(() => solution.value.coverImage?.asset?._ref);

const coverSrc = computed(() =>
  sanityImageUrl(coverRef.value, config.public.sanityProjectId, config.public.sanityDataset, {
    width: 1600,
    fit: "max",
  }),
);

const coverSrcset = computed(() =>
  sanityImageSrcset(
    coverRef.value,
    config.public.sanityProjectId,
    config.public.sanityDataset,
    SRCSET_WIDTHS,
  ),
);

// Built from the same list the accordion renders, so the markup always matches the visible Q&A.
const faqPageSchema = getFaqPageSchema(faqs.value);

setPageSeo({
  ...solutionPageSeo(solution.value),
  canonicalPath: solutionPagePath(solution.value.slug),
  image: coverSrc.value,
  noindex: solution.value.seo?.noIndex,
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Solutions", path: "/solutions/" },
      { name: solution.value.name, path: solutionPagePath(solution.value.slug) },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: solution.value.name,
      description: solution.value.description,
      itemListElement: cards.value.map((card, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: getProductSchema({
          name: `${card.productName} ${card.sizeLabel}`,
          image: sanityImageUrl(
            card.thumbnail.asset?._ref,
            config.public.sanityProjectId,
            config.public.sanityDataset,
          ),
          price: card.price,
          isPoa: card.isPoa,
          specs: card.specs,
        }),
      })),
    },
    ...(faqPageSchema ? [faqPageSchema] : []),
  ],
});
</script>
