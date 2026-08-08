<template>
  <header
    class="sticky top-0 z-50 bg-brand-navy border-b border-brand-rose-border/30 shadow-md"
  >
    <div
      class="max-w-[1280px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between"
    >
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center shrink-0">
        <img
          src="/images/karmod-logo.png"
          alt="Karmod International"
          class="h-8 w-auto object-contain"
        />
      </NuxtLink>

      <!-- Desktop Navigation Links -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          to="/"
          class="text-base transition-colors py-1 relative"
          :class="
            route.path === '/'
              ? 'text-white font-bold border-b-2 border-brand-red pb-[6px]'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/catalog"
          class="text-base transition-colors py-1 relative"
          :class="
            isCatalogActive
              ? 'text-white font-bold border-b-2 border-brand-red pb-[6px]'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Catalog
        </NuxtLink>
        <NuxtLink
          to="/about"
          class="text-base transition-colors py-1 relative"
          :class="
            route.path === '/about' && !route.hash
              ? 'text-white font-bold border-b-2 border-brand-red pb-[6px]'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          About Us
        </NuxtLink>
        <NuxtLink
          to="/gallery"
          class="text-base transition-colors py-1 relative"
          :class="
            route.path === '/gallery'
              ? 'text-white font-bold border-b-2 border-brand-red pb-[6px]'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Gallery
        </NuxtLink>
        <NuxtLink
          to="/contact"
          class="text-base transition-colors py-1 relative"
          :class="
            route.path === '/contact'
              ? 'text-white font-bold border-b-2 border-brand-red pb-[6px]'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Contact Us
        </NuxtLink>
      </nav>

      <!-- Action Button / Buy Flow Continue Link -->
      <div class="hidden md:flex items-center gap-4">
        <NuxtLink
          :to="quoteStore.continueRoute"
          class="bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-[0.6px] uppercase px-6 py-3 rounded-[2px] transition-colors inline-flex items-center gap-2 shadow-sm"
          :title="`Continue buy flow at ${quoteStore.continueRoute}`"
        >
          <span>{{ continueButtonText }}</span>
          <span
            v-if="quoteStore.totalItemsCount > 0"
            class="ml-1 px-2 py-0.5 text-xs bg-white text-brand-red font-bold rounded-full"
          >
            {{ quoteStore.totalItemsCount }}
          </span>
        </NuxtLink>
      </div>

      <!-- Mobile Menu Toggle Button -->
      <button
        @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="md:hidden text-brand-slate-light hover:text-white p-2 focus:outline-none"
        aria-label="Toggle Navigation Menu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="!isMobileMenuOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-brand-navy border-t border-brand-rose-border/20 px-6 py-4 space-y-4"
    >
      <NuxtLink
        to="/"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Home
      </NuxtLink>
      <NuxtLink
        to="/catalog"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Catalog
      </NuxtLink>
      <NuxtLink
        to="/about"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        About Us
      </NuxtLink>
      <NuxtLink
        to="/gallery"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Gallery
      </NuxtLink>
      <NuxtLink
        to="/contact"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Contact Us
      </NuxtLink>

      <div class="pt-2">
        <NuxtLink
          :to="quoteStore.continueRoute"
          @click="isMobileMenuOpen = false"
          class="w-full bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-[0.6px] uppercase px-6 py-3 rounded-[2px] transition-colors flex items-center justify-center gap-2"
        >
          <span>{{ continueButtonText }}</span>
          <span
            v-if="quoteStore.totalItemsCount > 0"
            class="px-2 py-0.5 text-xs bg-white text-brand-red font-bold rounded-full"
          >
            {{ quoteStore.totalItemsCount }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuoteStore } from "~/stores/quote";

const route = useRoute();
const quoteStore = useQuoteStore();
const isMobileMenuOpen = ref(false);

const isCatalogActive = computed(() => {
  return route.path.startsWith("/catalog");
});

const continueButtonText = computed(() => {
  return quoteStore.isEmpty ? "GET A QUOTE" : "VIEW QUOTE";
});
</script>
