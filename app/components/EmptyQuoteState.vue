<template>
  <div class="structural-card p-12 sm:p-16 text-center max-w-xl mx-auto my-12">
    <UIcon
      :name="icon"
      class="w-20 h-20 text-slate-400 mx-auto mb-4"
    />
    <h3 class="text-2xl font-bold text-[#1F2937] mb-2">
      {{ title }}
    </h3>
    <p class="text-slate-600 text-sm mb-6 max-w-md mx-auto leading-relaxed">
      {{ description }}
    </p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <slot name="actions">
        <NuxtLink
          :to="buttonTo"
          class="btn-primary px-8 py-3 text-xs font-semibold uppercase tracking-wider inline-block"
        >
          {{ buttonText }}
        </NuxtLink>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonTo?: string;
  }>(),
  {
    icon: "i-heroicons-shopping-bag",
    title: "Your Quote List is Empty",
    description:
      "Browse our portable cabins, kiosks, and security gatehouses to add items.",
    buttonText: "Browse Catalog",
    buttonTo: "/catalog",
  },
);
</script>
