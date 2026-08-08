<template>
  <section class="w-full bg-brand-rose-bg border-t border-b border-brand-rose-border/30 py-16 lg:py-24 px-6 flex justify-center">
    <div class="max-w-[1280px] w-full flex flex-col items-center gap-12">
      <!-- Section Title & Subtitle -->
      <div class="flex flex-col items-center gap-2 text-center max-w-[672px]">
        <h2 class="text-brand-navy text-3xl sm:text-[32px] font-bold tracking-[-0.32px] leading-[38.4px]">
          Our Legacy of Innovation
        </h2>
        <p class="text-brand-slate-muted text-base leading-[24px]">
          A timeline of engineering milestones and corporate growth.
        </p>
      </div>

      <!-- Timeline Container -->
      <div class="relative max-w-[896px] w-full py-8">
        <!-- Vertical Divider Stem -->
        <div class="absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-[2px] bg-brand-rose-border/60"></div>

        <!-- Timeline Items List -->
        <div class="flex flex-col gap-16 relative">

          <!-- Milestone 1 (Top / Present Day): Right-aligned text on left side, Red Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="w-1/2 pr-10 text-right flex flex-col gap-1 items-end">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">PRESENT DAY</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">UK Operations</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-[24px] max-w-[420px]">
                Solidified our presence in the UK market, delivering automated production and bespoke commercial and educational modular facilities.
              </p>
            </div>
            <!-- Center Node Block (Red) -->
            <div class="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-[12px] bg-brand-red border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/80"></div>
            </div>
            <div class="w-1/2 pl-10"></div>
          </div>

          <!-- Milestone 2 (Middle / 2005): Left-aligned text on right side, AppHeader Navy Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="w-1/2 pr-10"></div>
            <!-- Center Node Block (AppHeader bg-brand-navy) -->
            <div class="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-[12px] bg-brand-navy border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
            <div class="w-1/2 pl-10 text-left flex flex-col gap-1 items-start">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">2005</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">Global Expansion</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-[24px] max-w-[420px]">
                Operations expanded internationally, delivering robust prefabricated modular solutions to complex logistical environments worldwide.
              </p>
            </div>
          </div>

          <!-- Milestone 3 (Bottom / 1986): Right-aligned text on left side, AppHeader Navy Node Block -->
          <div class="relative flex items-center w-full min-h-[114px]">
            <div class="w-1/2 pr-10 text-right flex flex-col gap-1 items-end">
              <span class="text-brand-red text-xs font-semibold uppercase tracking-[1.2px]">1986</span>
              <h3 class="text-brand-navy text-xl sm:text-2xl font-semibold tracking-[-0.24px]">Foundation Established</h3>
              <p class="text-brand-slate-muted text-sm sm:text-base leading-[24px] max-w-[420px]">
                Karmod began operations, setting the standard for durable, quick-assembly modular units in industrial sectors.
              </p>
            </div>
            <!-- Center Node Block (AppHeader bg-brand-navy) -->
            <div class="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-[12px] bg-brand-navy border-4 border-white shadow-md flex items-center justify-center z-10">
              <div class="w-2.5 h-2.5 rounded-full bg-white/40"></div>
            </div>
            <div class="w-1/2 pl-10"></div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Timeline Section using AppHeader bg color (bg-brand-navy) for milestone blocks and headings
</script>
