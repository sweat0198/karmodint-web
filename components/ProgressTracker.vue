<template>
  <div
    class="w-full bg-white border-b border-brand-slate-light/30 py-6 px-4 md:px-12 relative"
  >
    <div class="max-w-5xl mx-auto relative">
      <div class="relative flex items-center justify-between w-full">
        <!-- Connecting Line Background -->
        <div
          class="absolute top-[20px] left-0 right-0 h-[2px] bg-brand-slate-light/50 -z-0"
        >
          <!-- Active Line Fill -->
          <div
            class="h-full bg-brand-red transition-all duration-300"
            :style="{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }"
          ></div>
        </div>

        <!-- Steps -->
        <template v-for="step in steps" :key="step.number">
          <!-- Enabled / Accessible Step (Clickable NuxtLink) -->
          <NuxtLink
            v-if="isStepEnabled(step)"
            :to="step.route"
            :aria-current="step.number === currentStep ? 'step' : undefined"
            class="group bg-white px-2 sm:px-3 flex flex-col items-center z-10 select-none cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red rounded-lg"
          >
            <!-- Step Indicator Icon/Number -->
            <div class="h-10 flex items-start pb-2 relative">
              <!-- Vivid Pulsing Outer Ring & Radar Ping for Current Step -->
              <span
                v-if="step.number === currentStep"
                class="absolute inset-0 w-8 h-8 rounded-xl bg-brand-red/35 animate-ping-slow pointer-events-none"
              ></span>

              <div
                :class="[
                  'w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-200 shrink-0 relative z-10',
                  step.number <= currentStep
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-brand-navy text-brand-slate-light border border-brand-navy',
                  isStepEnabled(step) && step.number !== currentStep
                    ? 'group-hover:bg-brand-red-hover group-hover:scale-105 group-hover:shadow'
                    : '',
                ]"
              >
                <span class="leading-none text-center">{{ step.number }}</span>
              </div>
            </div>

            <!-- Step Label -->
            <div class="flex flex-col items-center">
              <span
                :class="[
                  'text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors',
                  step.number <= currentStep
                    ? 'text-brand-navy-heading font-bold'
                    : 'text-brand-slate-muted',
                  isStepEnabled(step) && step.number !== currentStep
                    ? 'group-hover:text-brand-red'
                    : '',
                ]"
              >
                {{ step.label }}
              </span>
            </div>
          </NuxtLink>

          <!-- Disabled / Unreached Step (Div) -->
          <div
            v-else
            class="bg-white px-2 sm:px-3 flex flex-col items-center z-10 select-none cursor-not-allowed opacity-80"
          >
            <!-- Step Indicator Icon/Number -->
            <div class="h-10 flex items-start pb-2">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-base transition-all duration-200 shrink-0 bg-brand-navy text-brand-slate-light border border-brand-navy"
              >
                <span class="leading-none text-center">{{ step.number }}</span>
              </div>
            </div>

            <!-- Step Label -->
            <div class="flex flex-col items-center">
              <span
                class="text-xs font-semibold tracking-wider uppercase whitespace-nowrap text-brand-slate-muted"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Step {
  number: number;
  label: string;
  route?: string;
}

const props = withDefaults(
  defineProps<{
    currentStep?: number;
    steps?: Step[];
  }>(),
  {
    currentStep: 1,
    steps: () => [
      { number: 1, label: "SELECT PRODUCTS", route: "/products" },
      { number: 2, label: "CUSTOMIZE", route: "/customize" },
      { number: 3, label: "REVIEW", route: "/quote" },
      { number: 4, label: "FINAL QUOTE", route: "/quote" },
    ],
  },
);

const isStepEnabled = (step: Step): boolean => {
  return !!step.route && step.number <= props.currentStep;
};
</script>

<style scoped>
@keyframes ping-radar {
  0% {
    transform: scale(0.95);
    opacity: 0.85;
  }
  70%,
  100% {
    transform: scale(1.65);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-radar 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
