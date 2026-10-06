<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Hero Section -->
    <HeroSection :slides="HERO_SLIDES" />

    <!-- Legacy home copy: category tiles -->
    <HomeCategoriesSection />

    <!-- Product Catalog Section -->
    <ProductCatalogSection />

    <!-- Legacy home copy: about, slogan, WhatsApp, catalogues, certificates -->
    <HomeAboutSection />

    <!-- Customer References Section -->
    <ReferencesSection />

    <!-- Legacy home copy: company overview -->
    <HomeCompanySection />

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
