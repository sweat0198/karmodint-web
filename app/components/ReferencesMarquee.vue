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

      <div class="relative">
        <button
          type="button"
          data-reference-prev
          aria-label="Show previous references"
          class="references-arrow left-0"
          @click="slide(-1)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div
          ref="scroller"
          data-reference-scroller
          class="references-scroller references-mask overflow-x-auto"
          @pointerenter="hovering = true"
          @pointerleave="hovering = false"
          @focusin="focusWithin = true"
          @focusout="focusWithin = false"
        >
          <div class="flex w-max">
            <div
              v-for="copy in ['original', 'duplicate'] as const"
              :key="copy"
              class="flex shrink-0 gap-4 pr-4"
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

        <button
          type="button"
          data-reference-next
          aria-label="Show next references"
          class="references-arrow right-0"
          @click="slide(1)"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { ReferenceTile } from "~/types/reference";

defineProps<{ references: ReferenceTile[] }>();

/** Auto-scroll speed in pixels per second — matches the previous 40s marquee pace. */
const SCROLL_SPEED = 40;
/** How long auto-scroll stays paused after an arrow click. */
const ARROW_PAUSE_MS = 2500;
/** Fallback step when tile width cannot be measured (jsdom, hidden section). */
const FALLBACK_STEP = 288;

const scroller = ref<HTMLElement | null>(null);
const hovering = ref(false);
const focusWithin = ref(false);
const cooling = ref(false);
const paused = computed(
  () => hovering.value || focusWithin.value || cooling.value,
);

let frame = 0;
let lastFrame = 0;
let resumeTimer: ReturnType<typeof setTimeout> | undefined;
// Sub-pixel per-frame steps would be lost to scrollLeft rounding, so the exact
// position is tracked here and only mirrored onto the element.
let position = 0;
let appliedPosition = 0;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The track holds two identical groups, so scrolling past the first group is
 * visually identical to being back at the start. Wrapping there keeps the
 * carousel endless in both directions.
 */
const wrap = (el: HTMLElement, position: number) => {
  const half = el.scrollWidth / 2;
  if (half <= 0) return position;
  if (position >= half) return position - half;
  if (position < 0) return position + half;
  return position;
};

const stepSize = (el: HTMLElement) => {
  const tile = el.querySelector<HTMLElement>("[data-reference-tile]");
  const gap = 16;
  return tile?.offsetWidth ? tile.offsetWidth + gap : FALLBACK_STEP;
};

const coolDown = (ms: number) => {
  cooling.value = true;
  clearTimeout(resumeTimer);
  resumeTimer = setTimeout(() => {
    cooling.value = false;
  }, ms);
};

const slide = (direction: 1 | -1) => {
  const el = scroller.value;
  if (!el) return;

  const amount = stepSize(el);
  const half = el.scrollWidth / 2;

  // Jump a full group ahead before scrolling backwards past zero, so the
  // smooth scroll always has room to run instead of clamping at the edge.
  if (half > 0 && direction === -1 && el.scrollLeft - amount < 0) {
    el.scrollLeft += half;
  }

  el.scrollBy({
    left: direction * amount,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  coolDown(ARROW_PAUSE_MS);
};

const tick = (time: number) => {
  const el = scroller.value;
  if (el && !paused.value) {
    // Anything that moved the scroller elsewhere (arrows, drag, wheel) wins.
    if (Math.abs(el.scrollLeft - appliedPosition) > 1) position = el.scrollLeft;

    const elapsed = lastFrame ? time - lastFrame : 0;
    position = wrap(el, position + (SCROLL_SPEED * elapsed) / 1000);
    el.scrollLeft = position;
    appliedPosition = el.scrollLeft;
  }
  lastFrame = time;
  frame = requestAnimationFrame(tick);
};

onMounted(() => {
  if (prefersReducedMotion()) return;
  frame = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  clearTimeout(resumeTimer);
});
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

.references-scroller {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior-x: contain;
}

.references-scroller::-webkit-scrollbar {
  display: none;
}

.references-arrow {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
  transform: translateY(-50%);
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background-color: rgb(255 255 255 / 0.92);
  color: var(--color-brand-navy-heading, #0f172a);
  box-shadow: 0 4px 12px rgb(15 23 42 / 0.12);
  transition:
    background-color 200ms ease,
    box-shadow 200ms ease,
    transform 200ms ease;
}

.references-arrow:hover {
  background-color: rgb(255 255 255);
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.18);
  transform: translateY(-50%) scale(1.05);
}

.references-arrow:focus-visible {
  outline: 2px solid var(--color-brand-red, #d61f26);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .references-arrow {
    transition: none;
  }

  .references-arrow:hover {
    transform: translateY(-50%);
  }
}
</style>
