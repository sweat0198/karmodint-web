<template>
  <footer class="bg-brand-navy text-white border-t border-brand-rose-border/20">
    <div class="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <!-- Col 1: Brand & Description (Spans 2 cols on desktop) -->
        <div class="md:col-span-2 flex flex-col gap-4 items-start">
          <div>
            <span
              class="text-brand-red text-[12px] font-semibold tracking-[1.2px] uppercase"
            >
              KARMOD UK
            </span>
          </div>

          <div class="max-w-[384px]">
            <p class="text-brand-slate-light text-base leading-6">
              Delivering high-quality, precision-engineered modular building
              solutions across the United Kingdom.
            </p>
          </div>

          <div class="pt-2">
            <p class="text-brand-slate-light text-base leading-6">
              © {{ currentYear }} Karmod UK Modular Building Solutions. All
              rights reserved.
            </p>
          </div>

          <!-- Social Media Links -->
          <div class="flex items-center gap-3 pt-2">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              class="w-10 h-10 rounded-[8px] border border-brand-slate-light/30 flex items-center justify-center text-brand-slate-light hover:text-white hover:border-brand-red hover:bg-brand-red/10 transition-colors"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                />
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              class="w-10 h-10 rounded-[8px] border border-brand-slate-light/30 flex items-center justify-center text-brand-slate-light hover:text-white hover:border-brand-red hover:bg-brand-red/10 transition-colors"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7.5v-3H10V9.5C10 7.01 11.49 5.65 13.73 5.65c1.07 0 2.19.19 2.19.19v2.41h-1.24c-1.23 0-1.62.77-1.62 1.56V12h2.77l-.44 3h-2.33v6.8c4.56-.93 8-4.96 8-9.8z"
                />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              class="w-10 h-10 rounded-[8px] border border-brand-slate-light/30 flex items-center justify-center text-brand-slate-light hover:text-white hover:border-brand-red hover:bg-brand-red/10 transition-colors"
            >
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Col 2: Company Links -->
        <div class="flex flex-col gap-4 items-start">
          <div>
            <h4
              class="text-brand-red text-[12px] font-semibold tracking-[0.6px] uppercase"
            >
              COMPANY
            </h4>
          </div>
          <ul class="flex flex-col gap-2 w-full">
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                About Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/gallery"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                Projects Gallery
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                ISO 9001 Certified
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                Environment Policy
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Col 3: Legal Links -->
        <div class="flex flex-col gap-4 items-start pb-8 md:pb-0">
          <div>
            <h4
              class="text-brand-red text-[12px] font-semibold tracking-[0.6px] uppercase"
            >
              LEGAL
            </h4>
          </div>
          <ul class="flex flex-col gap-2 w-full">
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                Terms of Service
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                Privacy Policy
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/about"
                class="text-brand-slate-light hover:text-white transition-colors text-base leading-6"
              >
                Cookie Policy
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";

const currentYear = computed(() => new Date().getFullYear());
</script>
