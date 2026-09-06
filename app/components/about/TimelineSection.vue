<template>
  <section class="w-full bg-brand-rose-bg border-t border-b border-brand-rose-border/30 py-16 lg:py-24 px-6 flex justify-center">
    <div class="max-w-7xl w-full flex flex-col items-center gap-12">
      <!-- Section Title & Subtitle -->
      <div class="flex flex-col items-center gap-2 text-center max-w-2xl">
        <h2 class="text-brand-navy text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
          Our Legacy of Innovation
        </h2>
        <p class="text-brand-slate-muted text-base leading-6">
          A timeline of engineering milestones and corporate growth.
        </p>
      </div>

      <!-- Timeline Container -->
      <div class="relative max-w-4xl w-full py-8">
        <!-- Vertical Divider Stem -->
        <div class="absolute left-6 md:left-1/2 -translate-x-1/2 top-4 bottom-4 w-0.5 bg-brand-rose-border/60"></div>

        <!-- Timeline Items List -->
        <div class="flex flex-col gap-16 relative">

          <!-- Milestone 1 (Top / Today): Left side text on desktop, Red Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="w-full pl-16 pr-4 md:w-1/2 md:pl-0 md:pr-10 text-left md:text-right flex flex-col gap-1 items-start md:items-end">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">TODAY</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">Building the Future Together</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-6 max-w-[420px]">
                Today, we combine decades of manufacturing experience with a strong local presence, delivering reliable, flexible and high-quality modular building solutions for our customers across the UK.
              </p>
            </div>
            <!-- Center Node Block (Red) -->
            <div class="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-brand-red border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/80"></div>
            </div>
            <div class="hidden md:block md:w-1/2 md:pl-10"></div>
          </div>

          <!-- Milestone 2 (Middle / 2023): Right side text on desktop, Navy Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="hidden md:block md:w-1/2 md:pr-10"></div>
            <!-- Center Node Block (AppHeader bg-brand-navy) -->
            <div class="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-brand-navy border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
            <div class="w-full pl-16 pr-4 md:w-1/2 md:pl-10 md:pr-0 text-left flex flex-col gap-1 items-start">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">2023</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">Karmod International Begins Operations in the UK</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-6 max-w-[420px]">
                In January 2023, Karmod International began its journey in the United Kingdom, bringing this long-standing experience and expertise to the UK market.
              </p>
            </div>
          </div>

          <!-- Milestone 3 (Bottom / 1986): Left side text on desktop, Navy Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="w-full pl-16 pr-4 md:w-1/2 md:pl-0 md:pr-10 text-left md:text-right flex flex-col gap-1 items-start md:items-end">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">1986</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">Karmod Established in Türkiye</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-6 max-w-[420px]">
                Founded in Türkiye in 1986, Karmod has grown into an internationally recognised manufacturer of modular and prefabricated building solutions, with projects delivered across more than 100 countries.
              </p>
            </div>
            <!-- Center Node Block (AppHeader bg-brand-navy) -->
            <div class="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-brand-navy border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
            <div class="hidden md:block md:w-1/2 md:pl-10"></div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Timeline Section using AppHeader bg color (bg-brand-navy) for milestone blocks and headings
</script>
