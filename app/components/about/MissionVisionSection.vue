<template>
  <section class="w-full py-16 lg:py-24 px-6 flex justify-center bg-white">
    <div class="max-w-[1184px] w-full grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Card 1: Mission -->
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
            To engineer and deliver superior modular building systems that accelerate project timelines while maintaining the highest standards of durability and architectural integrity for our B2B partners.
          </p>
        </div>

        <!-- Image Container -->
        <div class="w-full h-48 rounded overflow-hidden bg-brand-rose-card relative">
          <img 
            src="/images/hero-building-site.png" 
            alt="Karmod Mission Site Assembly" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
      </div>

      <!-- Card 2: Vision -->
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
            To be the definitive choice for structural modularity across the UK and beyond, recognized for our uncompromising quality, technical expertise, and commitment to sustainable construction practices.
          </p>
        </div>

        <!-- Image Container -->
        <div class="w-full h-48 rounded overflow-hidden bg-brand-rose-card relative">
          <img 
            src="/images/hero-building-interior.png" 
            alt="Karmod Vision Modern Facility" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Mission & Vision Dual Card Section
</script>
