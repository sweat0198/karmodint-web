<template>
  <main class="flex min-h-screen w-full flex-col items-center bg-white">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-[60px] md:pt-[79px] lg:px-12">
      <nav
        aria-label="Breadcrumb"
        class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-slate-muted"
      >
        <NuxtLink to="/" class="transition-colors hover:text-brand-navy-heading">Home</NuxtLink>
        <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span aria-current="page" class="font-bold text-brand-navy-heading">Privacy Policy</span>
      </nav>

      <PrivacyPolicyArticle />
    </div>
  </main>
</template>

<script setup lang="ts">
import PrivacyPolicyArticle from "~/components/legal/PrivacyPolicyArticle.vue";
import { useAppSeo } from "~/composables/useAppSeo";
import { PAGE_SEO } from "~/constants/pageSeo";

// Kept URL (UK migration design, "Kept URLs"): the client-supplied policy, hardcoded rather than Sanity content.
const { setPageSeo, getBreadcrumbSchema } = useAppSeo();

setPageSeo({
  ...PAGE_SEO.privacyPolicy,
  canonicalPath: "/privacy-policy/",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy-policy/" },
    ]),
  ],
});
</script>
