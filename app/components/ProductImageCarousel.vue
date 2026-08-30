<template>
  <div class="relative w-full h-full">
    <!-- Frame stack. Transforms as a unit, so the arrows and dots stay put under zoom and rotate. -->
    <div
      class="relative w-full h-full transition-transform duration-200 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none"
      :class="{ 'group-hover:scale-105': zoomOnHover }"
      :style="frameStyle"
    >
      <img
        v-for="(image, idx) in images"
        :key="image.src"
        :src="image.src"
        :alt="image.alt"
        data-testid="carousel-frame"
        draggable="false"
        class="absolute inset-0 m-auto max-h-full max-w-full w-auto object-contain transition-opacity duration-500 ease-in-out"
        :class="[
          idx === activeIndex ? 'opacity-100' : 'opacity-0',
          frameClass,
        ]"
      />
    </div>

    <!--
      Controls stay visible on touch, where there is no hover to reveal them, and are reachable by
      keyboard regardless — `focus-visible:opacity-100` brings them back when tabbed to.
    -->
    <template v-if="images.length > 1">
      <button
        type="button"
        aria-label="Previous image"
        data-testid="carousel-prev"
        class="absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-brand-navy-heading hover:bg-white hover:shadow-sm active:scale-95 transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
        :class="[controlVisibilityClass, persistentControls ? 'left-2' : '-left-2']"
        @click.stop="goTo(activeIndex - 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Next image"
        data-testid="carousel-next"
        class="absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-200 shadow-xs flex items-center justify-center text-brand-navy-heading hover:bg-white hover:shadow-sm active:scale-95 transition-all duration-150 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
        :class="[controlVisibilityClass, persistentControls ? 'right-2' : '-right-2']"
        @click.stop="goTo(activeIndex + 1)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </template>

    <div
      v-if="images.length > 1 && (persistentControls || active || isUserControlled)"
      class="absolute left-1/2 -translate-x-1/2 z-10 flex gap-1 items-center bg-white/90 rounded-full px-1.5 py-1 shadow-xs"
      :class="dotsPlacement === 'top' ? 'top-6' : 'bottom-2'"
    >
      <span
        v-for="(image, idx) in images"
        :key="`dot-${image.src}`"
        class="w-1.5 h-1.5 rounded-full transition-colors duration-300"
        :class="idx === activeIndex ? 'bg-brand-red' : 'bg-slate-300'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import type { CarouselImage } from "~/types/catalog";

export interface ProductImageCarouselProps {
  images: CarouselImage[];
  /** Auto-advance while true. Catalog cards bind this to hover; always-on viewers leave it off. */
  active?: boolean;
  intervalMs?: number;
  /**
   * Keep the arrows and dots on screen instead of revealing them on hover, and tuck the arrows
   * inside the frame rather than hanging them off its edges. For a primary viewer, where the
   * controls are the point rather than an accent on a card — and where the host usually clips
   * overflow to contain a zoomed frame, which would otherwise swallow the arrows.
   */
  persistentControls?: boolean;
  /** The card treatment: the frames grow slightly when the enclosing `.group` is hovered. */
  zoomOnHover?: boolean;
  /** Extra classes for each frame, e.g. `mix-blend-multiply` to sink a render into a tinted panel. */
  frameClass?: string;
  /** Move the position dots off the bottom edge when the host already has chrome there. */
  dotsPlacement?: "bottom" | "top";
  /**
   * Inline style for the frame stack only — a host's own zoom/rotate belongs here rather than on a
   * wrapper, so the controls stay put and unclipped instead of riding along with the transform.
   */
  frameStyle?: Record<string, string>;
}

const props = withDefaults(defineProps<ProductImageCarouselProps>(), {
  active: false,
  intervalMs: 1000,
  persistentControls: false,
  zoomOnHover: false,
  frameClass: "",
  dotsPlacement: "bottom",
  frameStyle: () => ({}),
});

const emit = defineEmits<{
  /** A viewer-driven frame change, so a host can drop whatever view state belonged to the old frame. */
  (e: "frame-change", index: number): void;
}>();

const activeIndex = ref(0);
/** Set once an arrow is used: the viewer has taken over, so auto-advance stops until they leave. */
const isUserControlled = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

const controlVisibilityClass = computed(() =>
  props.persistentControls ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
);

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

/** Wraps in both directions, so `-1` lands on the last frame and `length` back on the first. */
function goTo(index: number) {
  const count = props.images.length;
  activeIndex.value = (index + count) % count;
  // Auto-advance would otherwise pull the frame away mid-inspection.
  isUserControlled.value = true;
  clearTimer();
  emit("frame-change", activeIndex.value);
}

// A shrinking gallery must not strand the index past the end.
watch(
  () => props.images.length,
  (count) => {
    if (activeIndex.value >= count) activeIndex.value = 0;
  },
);

watch(
  () => props.active,
  (isActive) => {
    clearTimer();
    if (isActive && props.images.length > 1) {
      timer = setInterval(() => {
        activeIndex.value = (activeIndex.value + 1) % props.images.length;
      }, props.intervalMs);
    } else if (!props.persistentControls) {
      // Leaving a card resets it to its canonical look and hands control back. A persistent
      // viewer keeps whatever angle the viewer chose.
      activeIndex.value = 0;
      isUserControlled.value = false;
    }
  },
  { immediate: true },
);

onBeforeUnmount(clearTimer);
</script>
