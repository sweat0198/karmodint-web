<template>
  <div class="min-h-screen flex flex-col bg-[#F8FAFC] text-[#1F2937]">
    <!-- Header Navigation Bar -->
    <AppHeader />

    <!-- Main Page Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useQuoteStore } from '~/stores/quote'
const quoteStore = useQuoteStore()
</script>
