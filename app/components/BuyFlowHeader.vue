<template>
  <div class="w-full">
    <!-- Top Progress Tracker -->
    <ProgressTracker :current-step="currentStep" />
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
