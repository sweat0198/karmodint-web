<template>
  <section
    aria-labelledby="home-categories-heading"
    class="w-full bg-white py-16 lg:py-24 px-6 lg:px-12 flex justify-center"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-10">
      <div class="border-b border-brand-rose-border pb-4">
        <h2
          id="home-categories-heading"
          class="text-brand-navy-heading text-2xl font-semibold tracking-[-0.24px] text-balance"
        >
          We Are the Best in the Field
        </h2>
        <p class="text-brand-slate-muted text-base mt-1">
          Reliable and Leading Brand of Portable Systems
        </p>
      </div>

      <ul class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <li v-for="tile in tiles" :key="tile.to">
          <NuxtLink
            :to="tile.to"
            data-category-tile
            class="category-tile group relative flex aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-lg border border-brand-rose-border/40 bg-brand-rose-card shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <img
              :src="tile.image"
              :alt="tile.alt"
              width="1448"
              height="1086"
              loading="lazy"
              decoding="async"
              class="category-tile__image absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
            ></div>

            <div class="relative mt-auto flex w-full flex-col gap-1 sm:gap-1.5 p-4 sm:p-5 text-white">
              <h3 class="text-base sm:text-lg font-semibold leading-snug">{{ tile.name }}</h3>
              <span
                class="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold uppercase tracking-[1px] sm:tracking-[1.2px] text-white/85"
              >
                View Products
                <svg
                  aria-hidden="true"
                  class="category-tile__arrow h-3 w-3"
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
              </span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
// Legacy home "section-cats" tiles. Links go to the Kept URL (Product Line page) for each
// category, or to the redirect-map target when the Legacy URL is a Redirect (/metrocity-cabin/).
const tiles = [
  {
    name: "Portable Cabin",
    to: "/portable-cabin/",
    image: "/images/hero/hero-container-2-3x6-uk.webp",
    alt: "2.3 × 6 m portable cabin used as a site office",
  },
  {
    name: "GRP Kiosk",
    to: "/grp-kiosk-cabin/",
    image: "/images/hero/hero-grp-1-5x1-5-uk.webp",
    alt: "1.5 × 1.5 m GRP kiosk cabin used as a gatehouse",
  },
  {
    name: "Panel Cabins",
    to: "/panel-cabin/",
    image: "/images/hero/hero-panel-1-35x2-1-uk.webp",
    alt: "1.35 × 2.1 m insulated panel cabin used as a site gatehouse",
  },
  {
    name: "MetroCity Cabin",
    to: "/products/?category=cabin&subcategory=metro-city",
    image: "/images/hero/hero-metrocity-2-15x2-65-uk.webp",
    alt: "2.15 × 2.65 m MetroCity modular cabin used as a security office",
  },
] as const;
</script>

<style scoped>
.category-tile {
  transition: transform 160ms var(--ease-out);
}

.category-tile:active {
  transform: scale(0.98);
}

.category-tile__image,
.category-tile__arrow {
  transition: transform 300ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .category-tile:hover .category-tile__image {
    transform: scale(1.04);
  }

  .category-tile:hover .category-tile__arrow {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .category-tile,
  .category-tile__image,
  .category-tile__arrow {
    transition: none;
  }
}
</style>
