<template>
  <header
    class="sticky top-0 z-50 bg-brand-navy border-b border-brand-rose-border/30 shadow-md"
  >
    <div
      class="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between"
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
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
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
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
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
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
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
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
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
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Contact Us
        </NuxtLink>
      </nav>

      <!-- Action Button / Buy Flow Continue Link & Quick Contacts -->
      <div class="hidden md:flex items-center gap-4">
        <!-- Direct Phone (Secondary) -->
        <a
          :href="phoneTelHref"
          class="hidden xl:flex items-center gap-1.5 text-xs text-brand-slate-light hover:text-white transition-colors"
          :title="`Call Direct: ${phoneDisplay}`"
        >
          <svg class="w-3.5 h-3.5 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span class="font-medium">{{ phoneDisplay }}</span>
        </a>

        <!-- WhatsApp Quick Chat Button (Primary) -->
        <a
          :href="whatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#075E54]/90 hover:bg-[#128C7E] text-white font-semibold text-xs px-3.5 py-2.5 rounded-xs border border-emerald-400/30 transition-all inline-flex items-center gap-2 shadow-sm"
          :title="hasQuoteItems ? 'Chat on WhatsApp with active quote breakdown' : 'Chat with Karmod UK on WhatsApp'"
        >
          <svg class="w-4 h-4 text-emerald-300 fill-current shrink-0" viewBox="0 0 24 24">
            <path
              d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
            />
          </svg>
          <span>{{ whatsAppDisplay }}</span>
          <span
            v-if="hasQuoteItems"
            class="px-1.5 py-0.2 text-[10px] bg-brand-red text-white font-bold rounded-full"
          >
            {{ quoteCount }}
          </span>
        </a>
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

      <!-- Mobile Quick Contact Row -->
      <div class="pt-2 grid grid-cols-2 gap-3">
        <a
          :href="whatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-[#075E54] hover:bg-[#128C7E] text-white font-semibold text-xs px-3 py-2.5 rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <svg class="w-4 h-4 text-emerald-300 fill-current shrink-0" viewBox="0 0 24 24">
            <path
              d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
            />
          </svg>
          <span>{{ whatsAppDisplay }}</span>
        </a>
        <a
          :href="phoneTelHref"
          class="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2.5 rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <svg class="w-3.5 h-3.5 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <span>Call Us</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuickContact } from "~/composables/useQuickContact";

const route = useRoute();
const { phoneDisplay, phoneTelHref, whatsAppDisplay, whatsAppUrl, hasQuoteItems, quoteCount } = useQuickContact();
const isMobileMenuOpen = ref(false);

const isCatalogActive = computed(() => {
  return route.path.startsWith("/catalog");
});
</script>
