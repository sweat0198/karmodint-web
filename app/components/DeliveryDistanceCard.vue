<template>
  <div class="w-full">
    <!-- Loading State Skeleton -->
    <div
      v-if="isLoading"
      class="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-[4px] space-y-2 animate-pulse"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-slate-200 rounded-full animate-spin"></div>
          <div class="h-3.5 bg-slate-200 rounded w-48"></div>
        </div>
        <div class="h-3.5 bg-slate-200 rounded w-16"></div>
      </div>
      <div class="space-y-2 pt-1">
        <div class="flex justify-between items-center">
          <div class="h-3 bg-slate-200 rounded w-24"></div>
          <div class="h-3 bg-slate-200 rounded w-20"></div>
        </div>
        <div class="flex justify-between items-center">
          <div class="h-3 bg-slate-200 rounded w-24"></div>
          <div class="h-3 bg-slate-200 rounded w-36"></div>
        </div>
      </div>
    </div>

    <!-- Calculated Result Card -->
    <div
      v-else-if="result && result.distance"
      class="mt-2.5 p-3.5 bg-linear-to-br from-slate-50 to-brand-rose-bg/30 border border-slate-200 hover:border-brand-rose-border rounded-[4px] shadow-sm transition-all duration-200 animate-fade-in"
    >
      <!-- Top Row: Route Icon & Mileage Badge -->
      <div
        class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80"
      >
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="w-6 h-6 rounded bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0"
          >
            <UIcon name="i-heroicons-truck" class="w-3.5 h-3.5" />
          </div>
          <div class="truncate">
            <span class="text-xs font-bold text-brand-navy-heading"
              >Road Logistics Distance</span
            >
          </div>
        </div>

        <div class="flex items-center shrink-0">
          <span
            class="px-2 py-0.5 bg-brand-navy-heading text-white text-[11px] font-bold tracking-tight rounded-[2px]"
          >
            {{ result.distance.miles }} miles
          </span>
        </div>
      </div>

      <!-- Middle: Route transit details on separate lines -->
      <div class="space-y-2 pt-2.5 text-xs">
        <div class="flex items-center justify-between gap-2">
          <span
            class="text-[10px] uppercase font-bold text-slate-500 tracking-wider"
          >
            Est. Transit Time
          </span>
          <div
            class="font-semibold text-brand-navy-heading flex items-center gap-1"
          >
            <UIcon
              name="i-heroicons-clock"
              class="w-3.5 h-3.5 text-brand-red shrink-0"
            />
            <span>{{ result.duration.formatted }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2">
          <span
            class="text-[10px] uppercase font-bold text-slate-500 tracking-wider"
          >
            Dispatch Depot
          </span>
          <UTooltip
            :text="depotFullAddress"
            :popper="{ placement: 'top', arrow: true }"
            :open-delay="0"
          >
            <div
              class="font-semibold text-brand-navy-heading flex items-center gap-1 cursor-pointer hover:text-brand-red transition-colors duration-100"
            >
              <UIcon
                name="i-heroicons-map-pin"
                class="w-3.5 h-3.5 text-brand-red shrink-0"
              />
              <span class="truncate">Melton Mowbray</span>
            </div>
          </UTooltip>
        </div>
      </div>

      <!-- Bottom: Subtle Logistics notice -->
      <div
        class="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500"
      >
        <span class="flex items-center gap-1">
          <UIcon
            name="i-heroicons-check"
            class="w-3.5 h-3.5 text-emerald-600 shrink-0"
          />
          HIAB crane offload & road transport available
        </span>
        <span
          class="text-[10px] font-medium text-slate-600 uppercase tracking-wider"
        >
          Direct Route
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DistanceCalculationData } from "~/composables/useDeliveryDistance";
import { COMPANY_ADDRESS } from "~/constants/company";

interface Props {
  result?: DistanceCalculationData | null;
  isLoading?: boolean;
}

defineProps<Props>();

const depotFullAddress = COMPANY_ADDRESS.formatted;
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
