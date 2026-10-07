<template>
  <article v-if="body?.length" class="max-w-3xl">
    <PortableTextContent :blocks="body" />
  </article>

  <FaqAccordion v-if="faqs.length > 0" class="max-w-3xl" :heading="faqHeading" :faqs="faqs" />
</template>

<script setup lang="ts">
import FaqAccordion from "~/components/content/FaqAccordion.vue";
import PortableTextContent from "~/components/content/PortableTextContent.vue";
import type { FaqItem } from "~/types/faq";
import type { PortableTextBlock } from "~/types/portableText";

/**
 * A page's long-form copy and its FAQ accordion, as Product Line and Solution pages show them.
 * `faqs` is the page's `publishableFaqs` list, the same one its FAQPage structured data uses.
 */
defineProps<{
  body?: PortableTextBlock[] | null;
  faqs: FaqItem[];
  faqHeading: string;
}>();
</script>
