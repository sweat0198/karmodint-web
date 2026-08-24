<script setup lang="ts">
import { computed } from "vue";
import type { SanityCustomizationGroup, SanityCustomizationItem } from "~/types/catalog";
import type { CustomizationNotes } from "~/types/customization";
import { formatPriceBadge, noteKey } from "~/composables/useCustomizationPricing";

interface Props {
  group: SanityCustomizationGroup;
  modelValue: string | null;
  notes: CustomizationNotes;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "update:notes", value: CustomizationNotes): void;
}>();

const hasPictures = computed(
  () => props.group.items.length > 0 && props.group.items.every((item) => !!item.image),
);

const selectedItem = computed(() =>
  props.group.items.find((item) => item._key === props.modelValue),
);

function select(key: string | null) {
  emit("update:modelValue", key);
}

function updateNote(item: SanityCustomizationItem, value: string) {
  emit("update:notes", { ...props.notes, [noteKey(props.group._id, item._key)]: value });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <button
      v-if="!group.isMandatory"
      type="button"
      class="border rounded p-3 flex items-center justify-between transition-colors text-left"
      :class="[
        modelValue === null
          ? 'border-brand-red bg-brand-red/5'
          : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
      ]"
      @click="select(null)"
    >
      <span class="text-sm font-medium text-gray-800">None / Not required</span>
      <span class="text-sm text-brand-slate-muted">—</span>
    </button>

    <div v-if="hasPictures" class="grid grid-cols-2 gap-3">
      <button
        v-for="item in group.items"
        :key="item._key"
        type="button"
        class="border rounded p-3 transition-colors flex flex-col gap-2 text-left"
        :class="[
          modelValue === item._key
            ? 'border-2 border-brand-red bg-white shadow-sm'
            : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
        ]"
        @click="select(item._key ?? null)"
      >
        <div class="w-full h-20 bg-slate-100 rounded border border-slate-200 overflow-hidden">
          <CustomizationImage :image="item.image" :alt="item.title" />
        </div>
        <div class="text-center">
          <h3 class="text-sm font-medium text-gray-800 leading-tight">{{ item.title }}</h3>
          <p class="text-xs text-brand-slate-muted mt-0.5">{{ formatPriceBadge(item) }}</p>
        </div>
      </button>
    </div>

    <template v-else>
      <button
        v-for="item in group.items"
        :key="item._key"
        type="button"
        class="border rounded p-4 flex items-center justify-between transition-colors text-left"
        :class="[
          modelValue === item._key
            ? 'border-brand-red bg-brand-red/5 shadow-sm'
            : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
        ]"
        @click="select(item._key ?? null)"
      >
        <span class="text-sm font-medium text-gray-800">{{ item.title }}</span>
        <span class="text-sm font-medium text-gray-800">{{ formatPriceBadge(item) }}</span>
      </button>
    </template>

    <CustomizationNote
      v-if="selectedItem?.requiresTextInput"
      :model-value="notes[noteKey(group._id, selectedItem._key)] ?? ''"
      :placeholder="selectedItem.textInputPlaceholder"
      @update:model-value="updateNote(selectedItem, $event)"
    />
  </div>
</template>
