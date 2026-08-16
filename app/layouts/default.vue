<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-gray-800">
    <!-- Header Navigation Bar -->
    <AppHeader />

    <!-- Main Page Content -->
    <main
      class="grow"
      :class="{
        'pb-24': quoteStore.totalItemsCount > 0 && route.path !== '/quote',
      }"
    >
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Global Customization / Basket Price Bar (hosts anchored QuickContactWidget when active) -->
    <PriceBar />

    <!-- Standalone Quick Contact Floating Widget (active when PriceBar is not visible) -->
    <QuickContactWidget v-if="!hasPriceBar" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import PriceBar from "~/components/PriceBar.vue";
import QuickContactWidget from "~/components/QuickContactWidget.vue";
import { useQuoteStore } from "~/stores/quote";

const route = useRoute();
const quoteStore = useQuoteStore();

const hasPriceBar = computed(() => {
  if (route.path === "/quote") return false;
  return quoteStore.totalItemsCount > 0;
});
</script>
