<template>
  <section class="w-full py-16 lg:py-24 px-6 flex justify-center bg-white">
    <div class="max-w-[1184px] w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Card 1: Vision -->
      <div class="bg-white border border-brand-rose-border/30 rounded-lg p-6 sm:p-[33px] flex flex-col justify-between shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] group">
        <div class="flex flex-col gap-4 pb-8">
          <!-- Icon Badge -->
          <div class="w-12 h-12 rounded bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <!-- Heading -->
          <h2 class="text-brand-navy text-2xl font-semibold tracking-[-0.24px]">
            Our Vision
          </h2>
          <!-- Description -->
          <p class="text-brand-slate-muted text-base leading-6">
            To become a trusted name in the UK modular construction industry by delivering innovative, practical and sustainable building solutions that shape the future of construction.
          </p>
        </div>

        <!-- Image Container -->
        <figure class="relative aspect-[23/10] w-full overflow-hidden rounded bg-brand-rose-card">
          <img
            src="/images/about/vision-modular-campus-v2.png"
            srcset="/images/about/vision-modular-campus-v2.webp 1280w"
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="Concept visualisation of a landscaped modular business campus"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </figure>
      </div>

      <!-- Card 2: Mission -->
      <div class="bg-white border border-brand-rose-border/30 rounded-lg p-6 sm:p-[33px] flex flex-col justify-between shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] group">
        <div class="flex flex-col gap-4 pb-8">
          <!-- Icon Badge -->
          <div class="w-12 h-12 rounded bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <!-- Heading -->
          <h2 class="text-brand-navy text-2xl font-semibold tracking-[-0.24px]">
            Our Mission
          </h2>
          <!-- Description -->
          <p class="text-brand-slate-muted text-base leading-6">
            To provide high-quality modular and prefabricated buildings that meet the needs of our customers through reliable products, flexible solutions and professional service — while continuously improving the way we design, manufacture and deliver.
          </p>
        </div>

        <!-- Image Container -->
        <figure class="relative aspect-[23/10] w-full overflow-hidden rounded bg-brand-rose-card">
          <img
            src="/images/about/mission-community-campus-v2.png"
            srcset="/images/about/mission-community-campus-v2.webp 1280w"
            sizes="(min-width: 768px) 50vw, 100vw"
            alt="Concept visualisation of a modular community campus with support cabins"
            loading="lazy"
            decoding="async"
            class="h-full w-full object-cover"
          />
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Mission & Vision Dual Card Section
</script>
