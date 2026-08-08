<template>
  <div class="w-full bg-slate-50 border-b border-brand-slate-light/30">
    <!-- Top Progress Tracker -->
    <ProgressTracker :current-step="currentStep" />

    <!-- Step Info & Action Bar Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Main Step Header & Actions Row -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <!-- Left: Step Info -->
        <div class="max-w-3xl">
          <div class="flex items-center gap-2 mb-1.5">
            <span
              class="label-caps text-brand-red font-bold text-xs tracking-wider uppercase"
            >
              {{ stepLabel || `Step ${currentStep} of 4` }}
            </span>
            <slot name="badge" />
          </div>

          <h1
            class="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy-heading tracking-tight mb-2"
          >
            {{ title }}
          </h1>

          <p
            v-if="description"
            class="text-brand-slate-muted text-sm sm:text-base leading-relaxed"
          >
            {{ description }}
          </p>
          <slot name="description" />
        </div>

        <!-- Right: Actions Area (Continue, Proceed to Review, Clear All, etc.) -->
        <div
          v-if="$slots.actions || primaryAction"
          class="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-end"
        >
          <slot name="actions">
            <NuxtLink
              v-if="primaryAction && primaryAction.to"
              :to="primaryAction.to"
              class="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-[2px] transition-colors duration-150 shadow-sm hover:shadow active:scale-[0.99]"
            >
              <span>{{ primaryAction.label }}</span>
              <svg
                class="w-4 h-4 text-white shrink-0"
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
            </NuxtLink>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PrimaryAction {
  label: string;
  to: string;
}

const props = withDefaults(
  defineProps<{
    currentStep: number;
    stepLabel?: string;
    title: string;
    description?: string;
    primaryAction?: PrimaryAction;
  }>(),
  {
    currentStep: 1,
  },
);
</script>
