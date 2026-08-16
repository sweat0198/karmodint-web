<template>
  <section
    class="w-full py-16 lg:py-24 px-6 flex justify-center bg-slate-50/30"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-8">
      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2
            class="text-brand-navy text-3xl sm:text-4xl font-bold tracking-tight leading-tight"
          >
            Projects &amp; Works
          </h2>
          <p class="text-brand-slate-muted text-base leading-6 mt-1">
            A selection of our high-performance modular installations.
          </p>
        </div>

        <!-- Button to Gallery -->
        <NuxtLink
          to="/gallery"
          class="inline-flex items-center gap-2 border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-6 py-2.5 rounded-xs text-xs font-semibold uppercase tracking-[1.2px] transition-colors self-start sm:self-auto shrink-0 shadow-sm"
        >
          <span>EXPLORE FULL GALLERY</span>
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </NuxtLink>
      </div>

      <!-- Bento Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Large Item (Col Span 8) -->
        <div
          class="lg:col-span-8 relative h-80 sm:h-96 rounded-lg overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] group"
        >
          <img
            src="/images/hero-building.png"
            alt="Corporate Headquarters Ext."
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- Bottom Gradient Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-brand-navy-heading/85 via-brand-navy-heading/20 to-transparent"
          ></div>

          <!-- Content Overlay -->
          <div
            class="absolute bottom-6 left-6 right-6 flex flex-col gap-2 items-start"
          >
            <div
              class="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xs text-white text-xs font-semibold tracking-[1.2px] uppercase"
            >
              Commercial
            </div>
            <h3 class="text-white text-2xl font-semibold tracking-[-0.24px]">
              Corporate Headquarters Ext.
            </h3>
          </div>
        </div>

        <!-- Small Item (Col Span 4) -->
        <div
          class="lg:col-span-4 relative h-80 sm:h-96 rounded-lg overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] group"
        >
          <img
            src="/images/hero-building-kiosk.png"
            alt="Site Facilities Infrastructure"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <!-- Bottom Gradient Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-brand-navy-heading/85 via-brand-navy-heading/20 to-transparent"
          ></div>

          <!-- Content Overlay -->
          <div
            class="absolute bottom-6 left-6 right-6 flex flex-col gap-2 items-start"
          >
            <div
              class="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-xs text-white text-xs font-semibold tracking-[1.2px] uppercase"
            >
              Infrastructure
            </div>
            <h3 class="text-white text-xl font-bold">Site Facilities</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Bento Grid Showcase Section for About Us page
</script>
