<script setup lang="ts">
import { ref } from "vue";
import type { SanityCustomizationGroup } from "~/types/catalog";
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

// 3D Viewer overlay controls
const zoomLevel = ref(100);
const rotateDegrees = ref(0);

const resetViewer = () => {
  zoomLevel.value = 100;
  rotateDegrees.value = 0;
};

const zoomIn = () => {
  if (zoomLevel.value < 160) zoomLevel.value += 20;
};

const zoomOut = () => {
  if (zoomLevel.value > 60) zoomLevel.value -= 20;
};
</script>

<template>
  <div
    class="w-full bg-slate-50 flex flex-col lg:flex-row items-stretch"
    data-node-id="1:38"
  >
    <!-- Left Column: 3D Preview Canvas & Product Info (3/5 width on desktop) -->
    <div
      class="lg:w-3/5 border-b lg:border-b-0 lg:border-r border-brand-rose-border/30 p-6 md:p-8 flex flex-col justify-between relative min-h-[500px]"
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
        class="flex-1 flex items-center justify-center relative my-8 py-4 overflow-hidden"
      >
        <div
          class="relative w-full max-w-[640px] aspect-video flex items-center justify-center transition-transform duration-300 ease-out"
          :style="{
            transform: `scale(${zoomLevel / 100}) rotate(${rotateDegrees}deg)`,
          }"
        >
          <!-- Image or 3D fallback visual -->
          <img
            v-if="previewImage"
            :src="previewImage"
            :alt="title"
            class="max-h-full max-w-full object-contain drop-shadow-xl"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center border border-slate-200/60 shadow-inner"
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

        <!-- Canvas Controls Overlay -->
        <div
          class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-brand-rose-border/20 rounded-xl shadow-md p-1.5 flex items-center gap-1.5 z-20"
        >
          <button
            type="button"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset View"
            @click="resetViewer"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
          </button>
          <div class="w-px h-6 bg-brand-rose-border/30"></div>
          <button
            type="button"
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
        </div>
      </div>

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

    <!-- Right Column: Customization Panel (2/5 width on desktop) -->
    <div class="lg:w-2/5 bg-white relative flex flex-col min-h-0">
      <div class="lg:absolute lg:inset-0 p-6 md:p-8 overflow-y-auto">
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
            <strong class="font-semibold">Demo data.</strong> Options and prices shown here are
            placeholders, not the live catalogue. Do not send this quote to a customer.
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
