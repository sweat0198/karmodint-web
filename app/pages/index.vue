<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Hero Section -->
    <HeroSection />

    <!-- Product Catalog Section -->
    <ProductCatalogSection />

    <!-- Contact Section -->
    <ContactSection />
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Karmod International - Modular Building Solutions & Cabins',
  meta: [
    { name: 'description', content: 'Engineered for durability, designed for efficiency. Premium modular and portable buildings across the UK.' }
  ]
})
</script>
