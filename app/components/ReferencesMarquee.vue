<template>
  <section
    v-if="references.length"
    aria-labelledby="references-heading"
    class="w-full overflow-hidden bg-white py-12 lg:py-16"
  >
    <div
      class="mx-auto flex w-full max-w-[1184px] flex-col gap-8 px-6 lg:px-12"
    >
      <h2
        id="references-heading"
        class="text-center text-2xl font-semibold tracking-[-0.24px] text-brand-navy-heading"
      >
        Trusted by organisations worldwide
      </h2>

      <div class="references-marquee references-mask overflow-hidden">
        <div class="references-track flex w-max">
          <div
            v-for="copy in ['original', 'duplicate'] as const"
            :key="copy"
            class="references-group flex shrink-0 gap-4 pr-4"
            :class="{ 'references-copy': copy === 'duplicate' }"
            :data-reference-copy="copy"
            :aria-hidden="copy === 'duplicate' ? 'true' : undefined"
          >
            <component
              :is="reference.website ? 'a' : 'div'"
              v-for="reference in references"
              :key="`${copy}-${reference._id}`"
              data-reference-tile
              :href="reference.website"
              :target="reference.website ? '_blank' : undefined"
              :rel="reference.website ? 'noopener noreferrer' : undefined"
              :tabindex="
                copy === 'duplicate' && reference.website ? -1 : undefined
              "
              class="group flex w-60 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100 border-brand-rose-border px-5 py-5 text-center md:w-72"
              :class="
                reference.website
                  ? 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red'
                  : ''
              "
            >
              <div
                class="flex h-24 w-full items-center justify-center overflow-hidden"
              >
                <img
                  :src="reference.logoUrl"
                  alt=""
                  class="max-h-20 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p class="mt-4 text-sm font-semibold text-brand-navy-heading">
                {{ reference.companyName }}
              </p>
              <p
                v-if="reference.location"
                class="mt-1 text-xs text-brand-slate-muted"
              >
                {{ reference.location }}
              </p>
            </component>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ReferenceTile } from "~/types/reference";

defineProps<{ references: ReferenceTile[] }>();
</script>

<style scoped>
.references-mask {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 6%,
    black 94%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 6%,
    black 94%,
    transparent
  );
}

.references-track {
  animation: references-marquee 40s linear infinite;
  will-change: transform;
}

@media (hover: hover) and (pointer: fine) {
  .references-marquee:hover .references-track {
    animation-play-state: paused;
  }
}

.references-marquee:focus-within .references-track,
.references-marquee:active .references-track {
  animation-play-state: paused;
}

@keyframes references-marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .references-mask {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .references-track {
    width: 100%;
    animation: none;
    transform: none;
  }

  .references-group {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    padding-right: 0;
  }

  .references-copy {
    display: none;
  }
}
</style>
