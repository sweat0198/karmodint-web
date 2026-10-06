<template>
  <main class="w-full min-h-screen bg-slate-50 flex flex-col items-center">
    <ContactSection />
  </main>
</template>

<script setup lang="ts">
import { useAppSeo } from "~/composables/useAppSeo";
import { PAGE_SEO } from "~/constants/pageSeo";

const { setPageSeo, getOrganizationSchema, getBreadcrumbSchema } = useAppSeo();

setPageSeo({
  ...PAGE_SEO.contact,
  canonicalPath: "/contact/",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Contact Us", path: "/contact/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Karmod International",
      description:
        "Direct contact channels for modular construction enquiries and quotation assistance.",
      mainEntity: getOrganizationSchema(),
    },
  ],
});
</script>
