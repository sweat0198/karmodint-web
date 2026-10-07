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
        <div
          class="relative group"
          @mouseleave="productsMenuClosedByNav = false"
          @focusout="onProductsMenuFocusOut"
        >
          <NuxtLink
            to="/products/"
            class="text-base transition-colors py-1 relative inline-flex items-center gap-1"
            :class="
              isProductsActive
                ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
                : 'text-brand-slate-light hover:text-white font-medium'
            "
          >
            Products
            <svg
              class="w-3 h-3 shrink-0 transition-transform duration-150 [transition-timing-function:var(--ease-out)] group-hover:rotate-180 group-focus-within:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </NuxtLink>

          <div
            class="absolute left-0 top-full w-72 origin-top-left pt-3 opacity-0 invisible -translate-y-1 transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-out)] motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:translate-y-0 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0"
            :class="{ 'opacity-0! invisible! pointer-events-none!': productsMenuClosedByNav }"
          >
            <div
              class="bg-white rounded-md border border-slate-100 shadow-lg py-2 max-h-[70vh] overflow-y-auto"
              @click="productsMenuClosedByNav = true"
            >
              <NuxtLink
                to="/products/"
                class="block px-4 py-2.5 text-sm font-semibold text-brand-red hover:bg-slate-50 hover:text-brand-red-dark"
                :class="{ 'bg-slate-50': isProductsShowAllActive }"
                :aria-current="isProductsShowAllActive ? 'page' : undefined"
              >
                Show all Products
              </NuxtLink>
              <template v-if="productCategories.length">
                <div class="my-1.5 border-t border-slate-100" />
                <template v-for="cat in productCategories" :key="cat._id">
                  <NuxtLink
                    :to="categoryHref(cat)"
                    class="block pl-3.5 pr-4 py-2 text-sm font-semibold border-l-2 hover:bg-slate-50"
                    :class="
                      isCategoryCurrentPage(cat)
                        ? 'border-brand-red bg-brand-rose-card text-brand-navy-heading'
                        : isCategoryActive(cat)
                          ? 'border-transparent text-brand-red'
                          : 'border-transparent text-brand-navy-heading'
                    "
                    :aria-current="isCategoryCurrentPage(cat) ? 'page' : undefined"
                  >
                    {{ cat.name }}
                  </NuxtLink>
                  <NuxtLink
                    v-for="sub in cat.children"
                    :key="sub._id"
                    :to="subcategoryHref(cat, sub)"
                    class="block pl-6.5 pr-4 py-1.5 text-sm border-l-2 hover:bg-slate-50"
                    :class="
                      isSubcategoryActive(cat, sub)
                        ? 'border-brand-red bg-brand-rose-card text-brand-navy-heading font-semibold'
                        : 'border-transparent text-brand-slate-muted hover:text-brand-navy-heading'
                    "
                    :aria-current="isSubcategoryActive(cat, sub) ? 'page' : undefined"
                  >
                    {{ sub.name }}
                  </NuxtLink>
                </template>
              </template>
            </div>
          </div>
        </div>

        <div
          class="relative group"
          @mouseleave="solutionsMenuClosedByNav = false"
          @focusout="onSolutionsMenuFocusOut"
        >
          <NuxtLink
            to="/solutions/"
            class="text-base transition-colors py-1 relative inline-flex items-center gap-1"
            :class="
              isSolutionsActive
                ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
                : 'text-brand-slate-light hover:text-white font-medium'
            "
          >
            Solutions
            <svg
              class="w-3 h-3 shrink-0 transition-transform duration-150 [transition-timing-function:var(--ease-out)] group-hover:rotate-180 group-focus-within:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </NuxtLink>

          <div
            class="absolute left-0 top-full w-72 origin-top-left pt-3 opacity-0 invisible -translate-y-1 transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-out)] motion-reduce:transition-opacity motion-reduce:duration-200 motion-reduce:translate-y-0 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0"
            :class="{ 'opacity-0! invisible! pointer-events-none!': solutionsMenuClosedByNav }"
          >
            <div
              class="bg-white rounded-md border border-slate-100 shadow-lg py-2"
              @click="solutionsMenuClosedByNav = true"
            >
              <NuxtLink
                to="/solutions/"
                class="block px-4 py-2.5 text-sm font-semibold text-brand-red hover:bg-slate-50 hover:text-brand-red-dark"
                :class="{ 'bg-slate-50': isSolutionsShowAllActive }"
                :aria-current="isSolutionsShowAllActive ? 'page' : undefined"
              >
                Show all Solutions
              </NuxtLink>
              <template v-if="solutionMenuItems.length">
                <div class="my-1.5 border-t border-slate-100" />
                <NuxtLink
                  v-for="sol in solutionMenuItems"
                  :key="sol._id"
                  :to="solutionPagePath(sol.slug)"
                  class="block pl-3.5 pr-4 py-2 text-sm border-l-2 hover:bg-slate-50"
                  :class="
                    isSolutionActive(sol)
                      ? 'border-brand-red bg-brand-rose-card text-brand-navy-heading font-semibold'
                      : 'border-transparent text-brand-slate-muted hover:text-brand-navy-heading'
                  "
                  :aria-current="isSolutionActive(sol) ? 'page' : undefined"
                >
                  {{ sol.name }}
                </NuxtLink>
              </template>
            </div>
          </div>
        </div>
        <NuxtLink
          to="/about/"
          class="text-base transition-colors py-1 relative"
          :class="
            isSameSitePath(route.path, '/about/') && !route.hash
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          About Us
        </NuxtLink>
        <NuxtLink
          to="/gallery/"
          class="text-base transition-colors py-1 relative"
          :class="
            isSameSitePath(route.path, '/gallery/')
              ? 'text-white font-bold border-b-2 border-brand-red pb-1.5'
              : 'text-brand-slate-light hover:text-white font-medium'
          "
        >
          Gallery
        </NuxtLink>
        <NuxtLink
          to="/contact/"
          class="text-base transition-colors py-1 relative"
          :class="
            isSameSitePath(route.path, '/contact/')
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

        <!-- Location / Map Scroll (Secondary) -->
        <button
          type="button"
          @click="scrollToLocation"
          class="hidden xl:flex -ml-2 items-center justify-center w-10 h-10 rounded-full hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red cursor-pointer transition-colors duration-150 group"
          title="View Our Location"
          aria-label="Scroll to Location Map"
        >
          <div
            class="w-7 h-7 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </button>
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
      <div>
        <div class="flex items-center justify-between gap-2">
          <NuxtLink
            to="/products/"
            @click="isMobileMenuOpen = false"
            class="block text-base font-medium text-brand-slate-light hover:text-white"
          >
            Products
          </NuxtLink>
          <button
            v-if="productCategories.length"
            type="button"
            @click="isMobileProductsOpen = !isMobileProductsOpen"
            class="p-2 -m-2 text-brand-slate-light hover:text-white"
            :aria-expanded="isMobileProductsOpen"
            aria-label="Toggle Products categories"
          >
            <svg
              class="w-4 h-4 transition-transform duration-150 [transition-timing-function:var(--ease-out)]"
              :class="{ 'rotate-180': isMobileProductsOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div
          v-if="isMobileProductsOpen && productCategories.length"
          class="mt-2 ml-3 pl-3 border-l border-brand-rose-border/20 space-y-2.5"
        >
          <template v-for="cat in productCategories" :key="cat._id">
            <NuxtLink
              :to="categoryHref(cat)"
              @click="isMobileMenuOpen = false"
              class="block text-sm hover:text-white"
              :class="
                isCategoryActive(cat)
                  ? 'text-white font-semibold'
                  : 'text-brand-slate-light/80'
              "
              :aria-current="isCategoryCurrentPage(cat) ? 'page' : undefined"
            >
              {{ cat.name }}
            </NuxtLink>
            <NuxtLink
              v-for="sub in cat.children"
              :key="sub._id"
              :to="subcategoryHref(cat, sub)"
              @click="isMobileMenuOpen = false"
              class="block pl-3 text-sm hover:text-white"
              :class="
                isSubcategoryActive(cat, sub)
                  ? 'text-white font-semibold'
                  : 'text-brand-slate-light/60'
              "
              :aria-current="isSubcategoryActive(cat, sub) ? 'page' : undefined"
            >
              {{ sub.name }}
            </NuxtLink>
          </template>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between gap-2">
          <NuxtLink
            to="/solutions/"
            @click="isMobileMenuOpen = false"
            class="block text-base font-medium text-brand-slate-light hover:text-white"
          >
            Solutions
          </NuxtLink>
          <button
            v-if="solutionMenuItems.length"
            type="button"
            @click="isMobileSolutionsOpen = !isMobileSolutionsOpen"
            class="p-2 -m-2 text-brand-slate-light hover:text-white"
            :aria-expanded="isMobileSolutionsOpen"
            aria-label="Toggle Solutions list"
          >
            <svg
              class="w-4 h-4 transition-transform duration-150 [transition-timing-function:var(--ease-out)]"
              :class="{ 'rotate-180': isMobileSolutionsOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div
          v-if="isMobileSolutionsOpen && solutionMenuItems.length"
          class="mt-2 ml-3 pl-3 border-l border-brand-rose-border/20 space-y-2.5"
        >
          <NuxtLink
            v-for="sol in solutionMenuItems"
            :key="sol._id"
            :to="solutionPagePath(sol.slug)"
            @click="isMobileMenuOpen = false"
            class="block text-sm hover:text-white"
            :class="isSolutionActive(sol) ? 'text-white font-semibold' : 'text-brand-slate-light/80'"
            :aria-current="isSolutionActive(sol) ? 'page' : undefined"
          >
            {{ sol.name }}
          </NuxtLink>
        </div>
      </div>
      <NuxtLink
        to="/about/"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        About Us
      </NuxtLink>
      <NuxtLink
        to="/gallery/"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Gallery
      </NuxtLink>
      <NuxtLink
        to="/contact/"
        @click="isMobileMenuOpen = false"
        class="block text-base font-medium text-brand-slate-light hover:text-white"
      >
        Contact Us
      </NuxtLink>

      <!-- Mobile Quick Contact Row -->
      <div class="pt-2 flex items-center gap-2">
        <a
          :href="whatsAppUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="flex-1 bg-[#075E54] hover:bg-[#128C7E] text-white font-semibold text-xs px-3 py-2.5 rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm min-w-0"
        >
          <svg class="w-4 h-4 text-emerald-300 fill-current shrink-0" viewBox="0 0 24 24">
            <path
              d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
            />
          </svg>
          <span class="truncate">{{ whatsAppDisplay }}</span>
        </a>
        <a
          :href="phoneTelHref"
          class="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2.5 rounded-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0"
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
        <button
          type="button"
          @click="scrollToLocation"
          class="flex items-center justify-center w-10 h-10 rounded-full hover:text-white bg-slate-800/80 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red cursor-pointer transition-colors duration-150 shrink-0 group"
          title="View Our Location"
          aria-label="Scroll to Location Map"
        >
          <div
            class="w-7 h-7 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSanityQuery } from "#imports";
import { useQuickContact } from "~/composables/useQuickContact";
import { CATEGORY_TREE_QUERY, type CategoryTreeChild, type CategoryTreeNode } from "~/queries/catalog";
import { PRODUCT_LINES_NAV_QUERY, type ProductLineNavItem } from "~/queries/productLines";
import { SOLUTIONS_NAV_QUERY, type SolutionNavItem } from "~/queries/solutions";
import { catalogueFilterPath, productLinePathsByCategory } from "~/utils/productLines";
import { solutionPagePath } from "~~/shared/utils/sitePages";
import { isSameSitePath } from "~~/shared/utils/sitePath";

const route = useRoute();
const router = useRouter();
const { phoneDisplay, phoneTelHref, whatsAppDisplay, whatsAppUrl, hasQuoteItems, quoteCount } = useQuickContact();
const isMobileMenuOpen = ref(false);
const isMobileProductsOpen = ref(false);
const isMobileSolutionsOpen = ref(false);

// Desktop dropdowns open on CSS hover/focus-within. Clicking a link inside one navigates without
// moving the pointer or focus, so the dropdown would otherwise stay visually open over the new
// page until the pointer/focus actually leaves it. These flags force it closed on click, and clear
// once the pointer or focus genuinely leaves so hovering it again behaves normally.
const productsMenuClosedByNav = ref(false);
const solutionsMenuClosedByNav = ref(false);

function onProductsMenuFocusOut(event: FocusEvent) {
  const container = event.currentTarget as HTMLElement;
  if (!container.contains(event.relatedTarget as Node | null)) {
    productsMenuClosedByNav.value = false;
  }
}

function onSolutionsMenuFocusOut(event: FocusEvent) {
  const container = event.currentTarget as HTMLElement;
  if (!container.contains(event.relatedTarget as Node | null)) {
    solutionsMenuClosedByNav.value = false;
  }
}

const { data: categoryTree } = await useSanityQuery<CategoryTreeNode[]>(CATEGORY_TREE_QUERY);
const { data: solutionsList } = await useSanityQuery<SolutionNavItem[]>(SOLUTIONS_NAV_QUERY);
const { data: productLines } = await useSanityQuery<ProductLineNavItem[]>(PRODUCT_LINES_NAV_QUERY);

const productCategories = computed(() => categoryTree.value ?? []);
const solutionMenuItems = computed(() => solutionsList.value ?? []);
const productLinePaths = computed(() => productLinePathsByCategory(productLines.value ?? []));

// A catalogue entry links to its Product Line page when one lists that category, else to the
// catalogue filtered to it.
function categoryHref(cat: CategoryTreeNode) {
  return productLinePaths.value.get(cat._id) ?? catalogueFilterPath(cat.slug);
}

function subcategoryHref(cat: CategoryTreeNode, sub: CategoryTreeChild) {
  return productLinePaths.value.get(sub._id) ?? catalogueFilterPath(sub.slug, cat.slug);
}

const isOnProductLinePage = computed(() =>
  (productLines.value ?? []).some((line) => isSameSitePath(route.path, line.path)),
);

const isProductsActive = computed(() => {
  return route.path.startsWith("/products") || isOnProductLinePage.value;
});

const isSolutionsActive = computed(() => {
  return route.path.startsWith("/solutions");
});

const activeCategorySlug = computed(() => {
  const category = route.query.category;
  return typeof category === "string" ? category : null;
});

const activeSubcategorySlug = computed(() => {
  const subcategory = route.query.subcategory;
  return typeof subcategory === "string" ? subcategory : null;
});

const isProductsShowAllActive = computed(() => {
  return isSameSitePath(route.path, "/products/") && !activeCategorySlug.value;
});

function isCategoryFilterActive(cat: CategoryTreeNode) {
  return isSameSitePath(route.path, "/products/") && activeCategorySlug.value === cat.slug;
}

/** In this category's section: its filter, its own page, or one of its subcategories' pages. */
function isCategoryActive(cat: CategoryTreeNode) {
  return (
    isCategoryFilterActive(cat) ||
    isCategoryCurrentPage(cat) ||
    cat.children.some((sub) => isSubcategoryActive(cat, sub))
  );
}

function isCategoryCurrentPage(cat: CategoryTreeNode) {
  const linePath = productLinePaths.value.get(cat._id);
  if (linePath) return isSameSitePath(route.path, linePath);
  return isCategoryFilterActive(cat) && !activeSubcategorySlug.value;
}

function isSubcategoryActive(cat: CategoryTreeNode, sub: CategoryTreeChild) {
  const linePath = productLinePaths.value.get(sub._id);
  if (linePath) return isSameSitePath(route.path, linePath);
  return isCategoryFilterActive(cat) && activeSubcategorySlug.value === sub.slug;
}

const isSolutionsShowAllActive = computed(() => isSameSitePath(route.path, "/solutions/"));

function isSolutionActive(sol: SolutionNavItem) {
  return isSameSitePath(route.path, solutionPagePath(sol.slug));
}

function scrollToLocation() {
  isMobileMenuOpen.value = false;
  const mapSection = document.getElementById("map-section");
  if (mapSection) {
    mapSection.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  router.push("/contact/#map-section");
}
</script>
