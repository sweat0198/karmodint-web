<script setup lang="ts">
import type { SanityCustomizationGroup, SanityCustomizationItem } from "~/types/catalog";
import type { CustomizationNotes } from "~/types/customization";
import { formatPriceBadge, noteKey } from "~/composables/useCustomizationPricing";

interface Props {
  group: SanityCustomizationGroup;
  modelValue: string[];
  notes: CustomizationNotes;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void;
  (e: "update:notes", value: CustomizationNotes): void;
}>();

function isSelected(item: SanityCustomizationItem) {
  return props.modelValue.includes(item._key ?? "");
}

function toggle(item: SanityCustomizationItem) {
  const key = item._key ?? "";
  const next = isSelected(item)
    ? props.modelValue.filter((k) => k !== key)
    : [...props.modelValue, key];
  emit("update:modelValue", next);
}

function updateNote(item: SanityCustomizationItem, value: string) {
  emit("update:notes", { ...props.notes, [noteKey(props.group._id, item._key)]: value });
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="item in group.items"
      :key="item._key"
      class="border rounded p-4 flex flex-col gap-3 transition-colors"
      :class="[
        item.selectionDisabled
          ? 'border-slate-200 bg-slate-50 text-slate-400'
          : isSelected(item)
          ? 'border-brand-red bg-brand-red/5 shadow-sm'
          : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
      ]"
    >
      <label
        class="flex items-center justify-between gap-3"
        :class="item.selectionDisabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      >
        <span class="flex items-center gap-3">
          <input
            type="checkbox"
            class="rounded text-brand-red focus:ring-brand-red w-4 h-4 border-brand-rose-border"
            :checked="isSelected(item)"
            :disabled="item.selectionDisabled"
            @change="toggle(item)"
          />
          <span class="text-sm font-medium" :class="item.selectionDisabled ? 'text-slate-400' : 'text-gray-800'">
            {{ item.title }}
          </span>
        </span>
        <span
          class="text-sm font-medium shrink-0"
          :class="item.selectionDisabled ? 'text-slate-400' : 'text-gray-800'"
        >
          {{ formatPriceBadge(item) }}
        </span>
      </label>

      <p v-if="item.selectionDisabledReason" class="text-xs font-medium text-amber-700">
        {{ item.selectionDisabledReason }}
      </p>

      <CustomizationNote
        v-if="isSelected(item) && item.requiresTextInput"
        :model-value="notes[noteKey(group._id, item._key)] ?? ''"
        :placeholder="item.textInputPlaceholder"
        @update:model-value="updateNote(item, $event)"
      />
    </div>
  </div>
</template>
