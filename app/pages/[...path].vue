<template>
  <main class="flex min-h-screen w-full flex-col items-center bg-white">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-[60px] md:pt-[79px] lg:px-12">
      <nav
        aria-label="Breadcrumb"
        class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-slate-muted"
      >
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
          <svg
            v-if="index > 0"
            class="h-3 w-3 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span
            v-if="index === breadcrumbs.length - 1"
            class="font-bold text-brand-navy-heading"
            aria-current="page"
          >
            {{ crumb.name }}
          </span>
          <NuxtLink v-else :to="crumb.path" class="transition-colors hover:text-brand-navy-heading">
            {{ crumb.name }}
          </NuxtLink>
        </template>
      </nav>

      <!-- Cover photo, then the title and short description beneath it -->
      <header class="flex flex-col gap-6">
        <div class="aspect-16/9 w-full overflow-hidden rounded bg-slate-50 md:aspect-21/9">
          <img
            v-if="coverSrc"
            :src="coverSrc"
            :srcset="coverSrcset"
            sizes="(min-width: 1280px) 1216px, 100vw"
            :alt="line.coverImage?.alt"
            fetchpriority="high"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="flex flex-col gap-3 border-b border-slate-100 pb-6">
          <h1
            class="text-3xl font-bold leading-tight tracking-tight text-brand-navy-heading md:text-4xl lg:text-5xl"
          >
            {{ line.name }}
          </h1>
          <p class="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {{ line.description }}
          </p>
        </div>
      </header>

      <!-- Every product in the line's category and its subcategories; a hub page has none -->
      <section v-if="line.category" class="flex flex-col gap-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2 class="text-2xl font-semibold tracking-tight text-brand-navy-heading">
            Products in this range
          </h2>
          <NuxtLink
            v-if="catalogueLink"
            :to="catalogueLink"
            class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-red transition-colors hover:text-brand-red-dark"
          >
            <span>View all in catalogue</span>
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </NuxtLink>
        </div>

        <div
          v-if="cards.length === 0"
          class="flex flex-col items-center gap-3 rounded border border-slate-200 bg-slate-50 p-12 text-center"
        >
          <p class="text-lg font-semibold text-brand-navy-heading">
            The units in this range are being updated — talk to us.
          </p>
          <NuxtLink
            to="/contact/"
            class="text-sm font-semibold text-brand-red underline underline-offset-2 hover:text-brand-red-dark"
          >
            Contact us
          </NuxtLink>
        </div>

        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <template v-for="card in cards" :key="card.cardId">
            <PortableContainerCard v-if="isPortableContainerCard(card)" :card="card" />
            <ProductCard v-else :card="card" />
          </template>
        </div>
      </section>

      <!-- Legacy copy, word for word -->
      <article v-if="line.body?.length" class="max-w-3xl">
        <PortableTextContent :blocks="line.body" />
      </article>

      <FaqAccordion
        v-if="faqs.length > 0"
        class="max-w-3xl"
        :heading="`${line.name} Frequently Asked Questions`"
        :faqs="faqs"
      />

      <section
        class="mt-2 flex flex-col items-center gap-4 rounded border border-brand-rose-border bg-brand-rose-bg p-8 text-center shadow-sm lg:p-12"
      >
        <h2 class="text-2xl font-semibold tracking-tight text-brand-navy-heading">
          Need a {{ line.name }} built to your site?
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
          <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
import PortableContainerCard from "~/components/PortableContainerCard.vue";
import ProductCard from "~/components/ProductCard.vue";
import { useAppSeo } from "~/composables/useAppSeo";
import { productLinePageSeo } from "~/constants/pageSeo";
import type { CatalogProduct } from "~/queries/catalog";
import {
  PRODUCT_LINE_BY_PATH_QUERY,
  PRODUCTS_IN_CATEGORIES_QUERY,
  productLineCategoryIds,
  type ProductLine,
} from "~/queries/productLines";
import {
  catalogCardSchemaInput,
  isPortableContainerCard,
  toCatalogDisplayCards,
} from "~/utils/catalogCards";
import { productLineBreadcrumbs, productLineCatalogueLink } from "~/utils/productLines";
import { sanityImageSrcset, sanityImageUrl } from "~/utils/sanityImageUrl";
import { toSitePath } from "~~/shared/utils/sitePath";

/**
 * Product Line pages (ADR-004): the catch-all resolves the request path against `productLine.path`.
 * Every static page outranks this route, so it only ever sees paths no other page claims; anything
 * that is not a Product Line 404s.
 */
const SRCSET_WIDTHS = [640, 1024, 1600, 2000];

const route = useRoute();
const config = useRuntimeConfig();
const { setPageSeo, getBreadcrumbSchema, getProductItemListSchema, getFaqPageSchema } = useAppSeo();

// `route.path` can arrive slashless in dev or on a direct visit; Product Line paths are stored in `/` form.
const requestPath = toSitePath(route.path);

const { data } = await useSanityQuery<ProductLine | null>(PRODUCT_LINE_BY_PATH_QUERY, {
  path: requestPath,
});

// Identity, not truthiness: an unmatched `*[...][0]{...}` can arrive as an object of null fields.
const found = data.value?._id ? data.value : null;
if (!found) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const line = computed(() => (data.value?._id ? data.value : found));

const categoryIds = productLineCategoryIds(found);
const { data: products } =
  categoryIds.length > 0
    ? await useSanityQuery<CatalogProduct[]>(PRODUCTS_IN_CATEGORIES_QUERY, { categoryIds })
    : { data: computed<CatalogProduct[]>(() => []) };

const cards = computed(() => (line.value.category ? toCatalogDisplayCards(products.value ?? []) : []));
const faqs = computed(() => line.value.faqs ?? []);
const breadcrumbs = computed(() => productLineBreadcrumbs(line.value));
const catalogueLink = computed(() => productLineCatalogueLink(line.value.category));

const coverRef = computed(() => line.value.coverImage?.asset?._ref);
const coverSrc = computed(() =>
  sanityImageUrl(coverRef.value, config.public.sanityProjectId, config.public.sanityDataset, {
    width: 1600,
    fit: "max",
  }),
);
const coverSrcset = computed(() =>
  sanityImageSrcset(coverRef.value, config.public.sanityProjectId, config.public.sanityDataset, SRCSET_WIDTHS),
);

const faqPageSchema = getFaqPageSchema(faqs.value);

setPageSeo({
  ...productLinePageSeo(line.value),
  canonicalPath: line.value.path,
  image: coverSrc.value,
  noindex: line.value.seo?.noIndex,
  jsonLd: [
    getBreadcrumbSchema(breadcrumbs.value),
    ...(cards.value.length > 0
      ? [
          getProductItemListSchema({
            name: line.value.name,
            description: line.value.description,
            products: cards.value.map((card) => {
              const { imageRef, ...input } = catalogCardSchemaInput(card);
              return {
                ...input,
                image: sanityImageUrl(imageRef, config.public.sanityProjectId, config.public.sanityDataset),
              };
            }),
          }),
        ]
      : []),
    ...(faqPageSchema ? [faqPageSchema] : []),
  ],
});
</script>
