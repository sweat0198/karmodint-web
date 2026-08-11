<template>
  <div class="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1F2937]">
    <!-- Header Navigation Bar -->
    <AppHeader />

    <!-- Main Page Content -->
    <main
      class="flex-grow"
      :class="{
        'pb-24': quoteStore.totalItemsCount > 0 && route.path !== '/quote',
      }"
    >
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Global Customization / Basket Price Bar -->
    <PriceBar />

    <!-- Scroll-Aware Quick Contact Floating Widget -->
    <QuickContactWidget />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import PriceBar from "~/components/PriceBar.vue";
import QuickContactWidget from "~/components/QuickContactWidget.vue";
import { useQuoteStore } from "~/stores/quote";

const route = useRoute();
const quoteStore = useQuoteStore();
</script>
