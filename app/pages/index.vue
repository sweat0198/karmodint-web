<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Hero Section -->
    <HeroSection :slides="HERO_SLIDES" />

    <!-- Product Catalog Section -->
    <ProductCatalogSection />

    <!-- Customer References Section -->
    <ReferencesSection />

    <!-- Contact Section -->
    <ContactSection />
  </main>
</template>

<script setup lang="ts">
import { useAppSeo } from "~/composables/useAppSeo";
import { PAGE_SEO } from "~/constants/pageSeo";
import { HERO_SLIDES } from "~/constants/heroSlides";

const { setPageSeo, getOrganizationSchema, getWebSiteSchema } = useAppSeo();

setPageSeo({
  ...PAGE_SEO.home,
  canonicalPath: "/",
  jsonLd: [getOrganizationSchema(), getWebSiteSchema()],
});
</script>
