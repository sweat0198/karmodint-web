<script setup lang="ts">
import type { SanityCustomizationGroup } from "~/types/catalog";
import type { CustomizationNotes } from "~/types/customization";
import { formatPriceBadge, noteKey } from "~/composables/useCustomizationPricing";

interface Props {
  group: SanityCustomizationGroup;
  modelValue: boolean;
  notes: CustomizationNotes;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "update:notes", value: CustomizationNotes): void;
}>();

const item = props.group.items[0];

function updateNote(value: string) {
  emit("update:notes", { ...props.notes, [noteKey(props.group._id, item?._key)]: value });
}
</script>

<template>
  <div v-if="item" class="flex flex-col gap-3">
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="border rounded p-4 flex items-center justify-between gap-3 transition-colors text-left"
      :class="[
        modelValue
          ? 'border-brand-red bg-brand-red/5 shadow-sm'
          : 'border-brand-rose-border/60 bg-white hover:border-brand-red/40',
      ]"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span class="flex flex-col">
        <span class="text-sm font-medium text-gray-800">{{ group.title }}</span>
        <span class="text-xs text-brand-slate-muted mt-0.5">{{ item.title }}</span>
      </span>

      <span class="flex items-center gap-3 shrink-0">
        <span class="text-sm font-medium text-gray-800">{{ formatPriceBadge(item) }}</span>
        <span
          class="w-9 h-5 rounded-full p-0.5 transition-colors shrink-0"
          :class="modelValue ? 'bg-brand-red' : 'bg-brand-rose-border/60'"
        >
          <span
            class="block w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 [transition-timing-function:var(--ease-in-out)]"
            :class="modelValue ? 'translate-x-4' : 'translate-x-0'"
          />
        </span>
      </span>
    </button>

    <CustomizationNote
      v-if="modelValue && item.requiresTextInput"
      :model-value="notes[noteKey(group._id, item._key)] ?? ''"
      :placeholder="item.textInputPlaceholder"
      @update:model-value="updateNote"
    />
  </div>
</template>
