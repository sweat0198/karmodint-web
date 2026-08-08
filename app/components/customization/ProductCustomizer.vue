<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  CheckboxOption,
  CounterOption,
  CustomizationStep,
  OptionItem,
  SpecSummaryItem,
} from "~/types/customization";

export type {
  CheckboxOption,
  CounterOption,
  CustomizationStep,
  OptionItem,
  SpecSummaryItem,
};

interface Props {
  title: string;
  subtitle?: string;
  previewImage?: string;
  specSummaryItems?: SpecSummaryItem[];
  specSheetUrl?: string;
  currencySymbol?: string;
  steps: CustomizationStep[];
  // Active selection state passed from parent or initialized
  modelValue?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  previewImage: "",
  specSummaryItems: () => [],
  specSheetUrl: "#",
  currencySymbol: "£",
  modelValue: () => ({}),
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Record<string, any>): void;
  (e: "option-change", stepId: string, value: any): void;
}>();

// Internal reactive selections state sync
const selections = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const updateSelection = (stepId: string, val: any) => {
  const updated = { ...selections.value, [stepId]: val };
  emit("update:modelValue", updated);
  emit("option-change", stepId, val);
};

const getStepSelection = (stepId: string) => {
  return selections.value[stepId];
};

// Format price label
const formatPriceBadge = (price: number) => {
  if (price === 0) return "Included";
  return `+${props.currencySymbol}${price.toLocaleString()}`;
};

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

    <!-- Right Column: Step-by-Step Customization Panel (2/5 width on desktop) -->
    <div class="lg:w-2/5 bg-white relative flex flex-col min-h-0">
      <div class="lg:absolute lg:inset-0 p-6 md:p-8 overflow-y-auto">
        <div class="flex flex-col gap-8 max-w-[480px]">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="relative flex flex-col gap-4"
          >
            <!-- Connecting vertical line except for last item -->
            <div
              v-if="index < steps.length - 1"
              class="absolute left-[12px] top-[32px] bottom-[-32px] w-px bg-brand-rose-border/40 pointer-events-none"
            ></div>

            <!-- Step Header -->
            <div class="flex items-center gap-3 relative z-10">
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                :class="[
                  getStepSelection(step.id)
                    ? 'bg-brand-red text-white'
                    : 'bg-brand-rose-card text-gray-800 border border-brand-rose-border',
                ]"
              >
                {{ step.stepNumber }}
              </div>
              <h2 class="text-lg font-normal text-gray-800">
                {{ step.title }}
              </h2>
            </div>

            <!-- Step Content Body (pl-9 to align with step header title) -->
            <div class="pl-9 w-full flex flex-col gap-3">
              <!-- TYPE 1: Full-width Option Cards (e.g. Dimensions) -->
              <template v-if="step.type === 'card' && step.options">
                <div
                  v-for="opt in step.options"
                  :key="opt.id"
                  class="relative border rounded p-4 transition-all cursor-pointer select-none"
                  :class="[
                    getStepSelection(step.id) === opt.id
                      ? 'border-2 border-brand-red bg-white shadow-sm'
                      : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
                  ]"
                  @click="updateSelection(step.id, opt.id)"
                >
                  <!-- Active Checkmark Indicator Badge -->
                  <div
                    v-if="getStepSelection(step.id) === opt.id"
                    class="absolute -top-2 -right-2 bg-brand-red text-white rounded-full w-5 h-5 flex items-center justify-center shadow"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>

                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-base font-medium text-gray-800">
                        {{ opt.name }}
                      </h3>
                      <p
                        v-if="opt.description"
                        class="text-sm text-brand-slate-muted mt-0.5"
                      >
                        {{ opt.description }}
                      </p>
                    </div>
                    <span
                      class="text-sm font-semibold shrink-0"
                      :class="
                        opt.price === 0 ? 'text-brand-red' : 'text-gray-800'
                      "
                    >
                      {{ formatPriceBadge(opt.price) }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- TYPE 2: Grid Option Cards (e.g. Exterior Finish) -->
              <template v-else-if="step.type === 'grid' && step.options">
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="opt in step.options"
                    :key="opt.id"
                    class="border rounded p-3 transition-all cursor-pointer select-none flex flex-col gap-2"
                    :class="[
                      getStepSelection(step.id) === opt.id
                        ? 'border-2 border-brand-red bg-white shadow-sm'
                        : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
                    ]"
                    @click="updateSelection(step.id, opt.id)"
                  >
                    <!-- Preview Box / Image -->
                    <div
                      class="w-full h-20 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center"
                    >
                      <img
                        v-if="opt.image"
                        :src="opt.image"
                        :alt="opt.name"
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-else
                        class="w-full h-full bg-slate-200/60 flex items-center justify-center text-xs text-slate-400 font-medium"
                      >
                        Preview
                      </div>
                    </div>
                    <div class="text-center">
                      <h3
                        class="text-sm font-medium text-gray-800 leading-tight"
                      >
                        {{ opt.name }}
                      </h3>
                      <p class="text-xs text-brand-slate-muted mt-0.5">
                        {{ formatPriceBadge(opt.price) }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- TYPE 3: Counter & Checkboxes (e.g. Doors & Windows) -->
              <template v-else-if="step.type === 'counter-checkbox'">
                <div
                  class="bg-white border border-brand-rose-border/50 rounded p-4 flex flex-col gap-4"
                >
                  <!-- Counter Row -->
                  <div
                    v-if="step.counter"
                    class="flex items-center justify-between"
                  >
                    <span class="text-sm font-medium text-gray-800">
                      {{ step.counter.name }}
                    </span>
                    <div
                      class="flex items-center gap-3 bg-brand-rose-bg border border-brand-rose-border/30 rounded p-1"
                    >
                      <button
                        type="button"
                        class="w-6 h-6 rounded flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
                        :disabled="
                          (getStepSelection(step.id)?.counterValue ??
                            step.counter.min ??
                            0) <= (step.counter.min ?? 0)
                        "
                        @click="
                          () => {
                            const current =
                              getStepSelection(step.id)?.counterValue ??
                              step.counter?.min ??
                              0;
                            if (current > (step.counter?.min ?? 0)) {
                              updateSelection(step.id, {
                                ...getStepSelection(step.id),
                                counterValue: current - 1,
                              });
                            }
                          }
                        "
                      >
                        -
                      </button>
                      <span
                        class="text-sm font-medium text-brand-navy-heading min-w-[16px] text-center"
                      >
                        {{ getStepSelection(step.id)?.counterValue ?? 0 }}
                      </span>
                      <button
                        type="button"
                        class="w-6 h-6 rounded flex items-center justify-center text-gray-800 hover:bg-white transition-colors"
                        :disabled="
                          (getStepSelection(step.id)?.counterValue ?? 0) >=
                          (step.counter.max ?? 99)
                        "
                        @click="
                          () => {
                            const current =
                              getStepSelection(step.id)?.counterValue ?? 0;
                            if (current < (step.counter?.max ?? 99)) {
                              updateSelection(step.id, {
                                ...getStepSelection(step.id),
                                counterValue: current + 1,
                              });
                            }
                          }
                        "
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div
                    v-if="step.checkboxes && step.checkboxes.length"
                    class="w-full h-px bg-brand-rose-border/30"
                  ></div>

                  <!-- Checkbox options -->
                  <div
                    v-for="chk in step.checkboxes"
                    :key="chk.id"
                    class="flex items-center justify-between cursor-pointer"
                    @click="
                      () => {
                        const currentObj = getStepSelection(step.id) || {};
                        const chkState = currentObj.checkboxes || {};
                        updateSelection(step.id, {
                          ...currentObj,
                          checkboxes: {
                            ...chkState,
                            [chk.id]: !chkState[chk.id],
                          },
                        });
                      }
                    "
                  >
                    <label
                      class="flex items-center gap-3 cursor-pointer text-sm text-gray-800"
                    >
                      <input
                        type="checkbox"
                        class="rounded text-brand-red focus:ring-brand-red w-4 h-4 border-brand-rose-border"
                        :checked="
                          getStepSelection(step.id)?.checkboxes?.[chk.id]
                        "
                      />
                      <span>{{ chk.name }}</span>
                    </label>
                    <span class="text-sm text-brand-slate-muted">
                      +{{ currencySymbol }}{{ chk.price }}{{ chk.priceSuffix }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- TYPE 4: List Single Select (e.g. Electrical & HVAC) -->
              <template v-else-if="step.type === 'list' && step.options">
                <div
                  v-for="opt in step.options"
                  :key="opt.id"
                  class="border rounded p-4 flex items-center justify-between transition-all cursor-pointer select-none"
                  :class="[
                    getStepSelection(step.id) === opt.id
                      ? 'border-brand-red bg-brand-red/5 shadow-sm'
                      : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
                  ]"
                  @click="updateSelection(step.id, opt.id)"
                >
                  <div class="flex items-center gap-3">
                    <!-- Icon placeholder or feature mark -->
                    <div
                      class="w-5 h-5 flex items-center justify-center text-brand-red"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </div>
                    <span class="text-sm font-medium text-gray-800">{{
                      opt.name
                    }}</span>
                  </div>
                  <span
                    class="text-sm font-medium"
                    :class="
                      opt.price === 0 ? 'text-brand-red' : 'text-gray-800'
                    "
                  >
                    {{ formatPriceBadge(opt.price) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
