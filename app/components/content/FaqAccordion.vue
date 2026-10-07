<template>
  <section v-if="faqs.length > 0" class="flex flex-col gap-6" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="text-2xl font-semibold tracking-tight text-brand-navy-heading">
      {{ heading }}
    </h2>

    <!--
      Native <details>: every answer stays in the server-rendered HTML even while closed, so crawlers
      read the same Q&A the FAQPage structured data declares, and it opens without JavaScript.
    -->
    <div class="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
      <details v-for="(faq, index) in faqs" :key="faq._key ?? index" class="group">
        <summary
          class="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-brand-navy-heading transition-colors hover:text-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red [&::-webkit-details-marker]:hidden"
        >
          <span>{{ faq.question }}</span>
          <svg
            class="h-4 w-4 shrink-0 text-brand-slate-muted transition-transform duration-200 ease-out group-open:rotate-180 motion-reduce:transition-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div class="pb-6">
          <PortableTextContent :blocks="faq.answer" />
        </div>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
import PortableTextContent from "~/components/content/PortableTextContent.vue";
import type { FaqItem } from "~/types/productLine";

/**
 * The visible half of a page's FAQs. Pass it the `publishableFaqs` list the page also gives
 * `useAppSeo().getFaqPageSchema`, so the markup and the structured data cannot drift apart.
 */
defineProps<{
  heading: string;
  faqs: FaqItem[];
}>();
</script>
