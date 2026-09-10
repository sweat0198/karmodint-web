<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { usePanZoom } from "~/composables/usePanZoom";
import type { CarouselImage, SanityCustomizationGroup } from "~/types/catalog";
import type {
  CustomizationNotes,
  CustomizationSelections,
  SpecSummaryItem,
} from "~/types/customization";

export type { SpecSummaryItem };

interface Props {
  title: string;
  subtitle?: string;
  previewImage?: string;
  /** Every angle of this size. Falls back to `previewImage` as a single frame when unsupplied. */
  previewImages?: CarouselImage[];
  specSummaryItems?: SpecSummaryItem[];
  specSheetUrl?: string;
  currencySymbol?: string;
  groups: SanityCustomizationGroup[];
  modelValue?: CustomizationSelections;
  notes?: CustomizationNotes;
  showDemoNotice?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  previewImage: "",
  previewImages: () => [],
  specSummaryItems: () => [],
  specSheetUrl: "#",
  currencySymbol: "£",
  modelValue: () => ({}),
  notes: () => ({}),
  showDemoNotice: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: CustomizationSelections): void;
  (e: "update:notes", value: CustomizationNotes): void;
}>();

/**
 * The viewer's frames. A cart persisted before `images` existed — or any item carrying only a
 * static fallback render — still shows its one image, just without arrows.
 */
const previewFrames = computed<CarouselImage[]>(() => {
  if (props.previewImages.length) return props.previewImages;
  return props.previewImage
    ? [{ src: props.previewImage, alt: props.title }]
    : [];
});

// 3D Viewer overlay controls
const stage = ref<HTMLElement | null>(null);

const {
  zoom,
  isPanning,
  canPan,
  isDefaultView,
  frameStyle,
  zoomIn,
  zoomOut,
  resetView,
  refreshView,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onKeydown,
} = usePanZoom(() => ({
  width: stage.value?.clientWidth ?? 0,
  height: stage.value?.clientHeight ?? 0,
}));

// The stage is fluid, so a narrower viewport shrinks the travel the current offset was clamped to.
onMounted(() => window.addEventListener("resize", refreshView));
onBeforeUnmount(() => window.removeEventListener("resize", refreshView));
</script>

<template>
  <div
    class="w-full bg-slate-50 flex flex-col lg:flex-row lg:items-start"
    data-node-id="1:38"
  >
    <!-- Left Column: 3D Preview Canvas & Product Info (55% width on desktop, sticky) -->
    <div
      class="lg:w-[55%] border-b lg:border-b-0 p-6 md:p-8 flex flex-col justify-between relative min-h-[500px] lg:min-h-0 lg:sticky lg:self-start lg:top-(--customizer-sticky-top) lg:max-h-(--customizer-sticky-max-h)"
    >
      <!-- Header / Breadcrumbs -->
      <div class="w-full z-10">
        <h1 class="text-lg md:text-xl font-normal text-gray-800 tracking-tight">
          {{ title }}
        </h1>
        <p
          v-if="subtitle"
          class="text-sm md:text-base font-normal text-brand-slate-muted mt-0.5"
        >
          {{ subtitle }}
        </p>
      </div>

      <!-- Interactive 3D Viewer / Image Stage -->
      <div
        class="flex-1 flex items-center justify-center relative mt-8 pt-4 pb-2 overflow-hidden"
      >
        <!--
          The pan surface. It is only interactive once the frame overflows it: at 100% there is
          nothing to drag to, so it takes no cursor, no tab stop and no arrow keys.
        -->
        <div
          ref="stage"
          data-testid="viewer-stage"
          role="group"
          class="relative w-full max-w-[640px] aspect-video max-h-full flex items-center justify-center select-none rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          :class="
            canPan
              ? ['touch-none', isPanning ? 'cursor-grabbing' : 'cursor-grab']
              : ''
          "
          :tabindex="canPan ? 0 : -1"
          :aria-label="
            canPan
              ? `${title} preview, zoomed to ${zoom}%. Drag or use the arrow keys to move the image.`
              : `${title} preview`
          "
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerEnd"
          @pointercancel="onPointerEnd"
          @pointerleave="onPointerEnd"
          @lostpointercapture="onPointerEnd"
          @keydown="onKeydown"
        >
          <!--
            Image or 3D fallback visual. The viewer's zoom/rotate rides on the frames alone, so the
            carousel's arrows and dots stay put and clear of the stage's `overflow-hidden`.
          -->
          <ProductImageCarousel
            v-if="previewFrames.length"
            :images="previewFrames"
            persistent-controls
            frame-class="drop-shadow-xl"
            dots-placement="top"
            :frame-style="frameStyle"
            @frame-change="resetView"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-slate-200/60 shadow-inner transition-transform duration-200 [transition-timing-function:var(--ease-out)] motion-reduce:transition-none"
            :style="frameStyle"
          >
            <div class="text-center p-6">
              <svg
                class="w-16 h-16 text-slate-400 mx-auto mb-2 opacity-70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0H7m7 0h3M7 11V7m0 4v4m10-4V7m0 4v4"
                ></path>
              </svg>
              <p class="text-sm text-slate-500 font-medium">
                Interactive 3D Preview
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Canvas Controls: below the image stage, clear of the artwork -->
      <div class="flex items-center justify-center mt-2">
        <div
          class="bg-white border border-brand-rose-border/20 rounded-xl shadow-md p-1.5 flex items-center gap-1.5"
        >
          <button
            type="button"
            data-testid="viewer-zoom-in"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            title="Zoom In"
            @click="zoomIn"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              ></path>
            </svg>
          </button>
          <button
            type="button"
            data-testid="viewer-zoom-out"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
            @click="zoomOut"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              ></path>
            </svg>
          </button>

          <span class="w-px h-5 bg-slate-200" aria-hidden="true"></span>
          <span
            class="w-10 text-center text-[11px] font-medium text-slate-500 tabular-nums"
            aria-live="polite"
          >
            {{ zoom }}%
          </span>

          <!--
            Always rendered, disabled while there is nothing to undo: a control that comes and goes
            would shift the rest of the cluster sideways under the pointer.
          -->
          <button
            type="button"
            data-testid="viewer-reset"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 transition-colors enabled:hover:bg-slate-100 disabled:text-slate-300 disabled:cursor-default"
            title="Reset view"
            aria-label="Reset view"
            :disabled="isDefaultView"
            @click="resetView"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.3 6.3L4 9m16 6a8 8 0 01-13.7 2.7L4 15"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <p
        v-if="canPan"
        class="text-[11px] text-brand-slate-muted text-center mt-1.5"
        aria-hidden="true"
      >
        Drag the image to move around
      </p>

      <!-- Features Summary Overlay at Bottom -->
      <div
        v-if="specSummaryItems.length"
        class="w-full flex flex-wrap gap-4 items-center z-10 pt-2"
      >
        <div
          v-for="(item, idx) in specSummaryItems"
          :key="idx"
          class="bg-white/80 backdrop-blur-md border border-brand-rose-border/20 shadow-sm px-4 py-2 rounded flex flex-col"
        >
          <span
            class="text-[10px] text-brand-slate-muted leading-snug uppercase tracking-wider"
            >{{ item.label }}</span
          >
          <span class="text-sm font-medium text-gray-800 leading-snug">{{
            item.value
          }}</span>
        </div>
      </div>
    </div>

    <!-- Right Column: Customization Panel (45% width on desktop) -->
    <div class="lg:w-[45%] bg-white lg:border-l border-brand-rose-border/30">
      <div class="p-6 md:p-8">
        <slot name="before-demo-notice" />
        <div
          v-if="showDemoNotice"
          class="mb-6 flex items-start gap-2.5 rounded border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900"
        >
          <svg
            class="w-4 h-4 shrink-0 mt-0.5 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span>
            <strong class="font-semibold">Demo data.</strong> Options and prices
            shown here are placeholders, not the live product data. Do not send
            this quote to a customer.
          </span>
        </div>

        <CustomizationGroups
          :groups="groups"
          :model-value="modelValue"
          :notes="notes"
          @update:model-value="emit('update:modelValue', $event)"
          @update:notes="emit('update:notes', $event)"
        />
      </div>
    </div>
  </div>
</template>
