<template>
  <div
    class="relative w-full h-full"
    :class="{ 'touch-pan-y': swipeable }"
    @touchstart.passive="handleTouchStart"
    @touchend.passive="handleTouchEnd"
    @touchcancel.passive="handleTouchCancel"
  >
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
        class="absolute inset-0 m-auto transition-opacity duration-500 ease-in-out"
        :class="[
          idx === activeIndex ? 'opacity-100' : 'opacity-0',
          frameFitClass,
          frameClass,
        ]"
      />
    </div>

    <!--
      Controls stay visible on touch, where there is no hover to reveal them, and are reachable by
      keyboard regardless — `focus-visible:opacity-100` brings them back when tabbed to.
    -->
    <template v-if="images.length > 1 && showArrows">
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
      v-if="images.length > 1 && showDots && (persistentControls || active || isUserControlled)"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
  /** Advance to the next/previous frame on a horizontal touch swipe, pausing autoplay mid-gesture. */
  swipeable?: boolean;
  /** Hide the built-in arrows, e.g. when a host renders its own and drives navigation via `goTo`. */
  showArrows?: boolean;
  /** Hide the built-in dots, e.g. when a host renders its own. */
  showDots?: boolean;
  /**
   * How each frame fills its box: `contain` (default) centers product photography at its own
   * aspect ratio; `cover` fills the box edge-to-edge, for a full-bleed banner image.
   */
  fit?: "contain" | "cover";
}

const props = withDefaults(defineProps<ProductImageCarouselProps>(), {
  active: false,
  intervalMs: 1000,
  persistentControls: false,
  zoomOnHover: false,
  frameClass: "",
  dotsPlacement: "bottom",
  frameStyle: () => ({}),
  swipeable: false,
  showArrows: true,
  showDots: true,
  fit: "contain",
});

const emit = defineEmits<{
  /**
   * Fires on every frame change — arrow, swipe, autoplay tick, or an external `goTo` — so a host
   * can drop whatever view state belonged to the old frame, or mirror the active index for its own
   * chrome (e.g. a title overlay keyed to the current slide).
   */
  (e: "frame-change", index: number): void;
}>();

const activeIndex = ref(0);
/** Set once an arrow is used: the viewer has taken over, so auto-advance stops until they leave. */
const isUserControlled = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

const controlVisibilityClass = computed(() =>
  props.persistentControls ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100",
);

const frameFitClass = computed(() =>
  props.fit === "cover" ? "w-full h-full object-cover" : "max-h-full max-w-full w-auto object-contain",
);

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

/** Wraps in both directions, so `-1` lands on the last frame and `length` back on the first. */
function setActiveIndex(index: number) {
  const count = props.images.length;
  activeIndex.value = (index + count) % count;
  emit("frame-change", activeIndex.value);
}

function startTimer() {
  clearTimer();
  if (props.active && props.images.length > 1) {
    timer = setInterval(() => setActiveIndex(activeIndex.value + 1), props.intervalMs);
  }
}

function goTo(index: number) {
  // Auto-advance would otherwise pull the frame away mid-inspection.
  isUserControlled.value = true;
  clearTimer();
  setActiveIndex(index);
}

// A shrinking gallery must not strand the index past the end.
watch(
  () => props.images.length,
  (count) => {
    if (activeIndex.value >= count) activeIndex.value = 0;
  },
);

/**
 * Not `{ immediate: true }`: `setInterval` throws under SSR, and the initial render already
 * shows frame 0, matching what this would otherwise set up. `onMounted` runs the same logic
 * once it's safe to touch timers, and the watcher covers every change after that.
 */
function applyActiveState(isActive: boolean) {
  if (isActive && props.images.length > 1) {
    startTimer();
  } else {
    clearTimer();
    if (!props.persistentControls) {
      // Leaving a card resets it to its canonical look and hands control back. A persistent
      // viewer keeps whatever angle the viewer chose.
      activeIndex.value = 0;
      isUserControlled.value = false;
    }
  }
}

watch(() => props.active, applyActiveState);
onMounted(() => applyActiveState(props.active));

/**
 * Touch swipe, gated behind `swipeable` so cards and the customizer's pan surface — which also
 * receive touch input — are unaffected. Mirrors `active`'s pause/resume rather than `goTo`'s
 * permanent handoff: a swipe is a momentary detour, not a takeover, so autoplay resumes right after.
 */
const swipeThreshold = 50;
let touchStartX: number | null = null;
let touchStartY: number | null = null;

function handleTouchStart(event: TouchEvent) {
  if (!props.swipeable) return;
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  clearTimer();
}

function handleTouchEnd(event: TouchEvent) {
  if (!props.swipeable) return;
  if (touchStartX === null || touchStartY === null) {
    startTimer();
    return;
  }

  const touch = event.changedTouches[0];
  if (touch) {
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      setActiveIndex(activeIndex.value + (deltaX < 0 ? 1 : -1));
    }
  }

  touchStartX = null;
  touchStartY = null;
  startTimer();
}

function handleTouchCancel() {
  if (!props.swipeable) return;
  touchStartX = null;
  touchStartY = null;
  startTimer();
}

onBeforeUnmount(clearTimer);

defineExpose({ goTo });
</script>
