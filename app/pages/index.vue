<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Hero Section -->
    <HeroSection />

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

const { setPageSeo, getOrganizationSchema, getWebSiteSchema } = useAppSeo();

setPageSeo({
  title: "Karmod International - Portable Cabins, Kiosks & Modular Buildings",
  description:
    "Engineered for durability, designed for efficiency. Premium modular buildings, portable cabins, retail kiosks, and security gatehouses across the UK and worldwide.",
  canonicalPath: "/",
  jsonLd: [getOrganizationSchema(), getWebSiteSchema()],
});
</script>
