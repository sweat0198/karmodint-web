<template>
  <section class="w-full py-16 lg:py-24 px-6 flex justify-center bg-slate-50/50">
    <div class="max-w-[1184px] w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
      <!-- Left Column: Content -->
      <div class="lg:col-span-6 flex flex-col gap-6">
        <h1 class="text-brand-navy text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
          Pioneering Modular Construction.
        </h1>
        <p class="text-brand-slate-muted text-base sm:text-lg leading-relaxed">
          Karmod UK stands at the forefront of innovative modular building solutions. With decades of engineering excellence, we deliver rapid, reliable, and highly organized structures tailored for complex B2B developments and government infrastructure.
        </p>
      </div>

      <!-- Right Column: Image Card -->
      <div class="lg:col-span-6">
        <figure class="relative h-80 w-full overflow-hidden rounded-lg border border-brand-rose-border/30 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] sm:h-96">
          <picture class="block h-full w-full">
            <source
              type="image/webp"
              srcset="/images/about/about-modular-site-compound-640.webp 640w, /images/about/about-modular-site-compound-1280.webp 1280w"
              sizes="(min-width: 1024px) 560px, calc(100vw - 48px)"
            />
            <img
              src="/images/about/about-modular-site-compound.jpg"
              alt="Aerial photograph of a large modular construction compound with accommodation and site buildings."
              width="1280"
              height="720"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="h-full w-full object-cover"
            />
          </picture>
        </figure>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Hero section for About Us page
</script>
