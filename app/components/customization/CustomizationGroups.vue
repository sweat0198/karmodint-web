<script setup lang="ts">
import { computed } from "vue";
import type { SanityCustomizationGroup } from "~/types/catalog";
import type { CustomizationNotes, CustomizationSelections } from "~/types/customization";
import SingleChoiceGroup from "./groups/SingleChoiceGroup.vue";
import MultipleChoiceGroup from "./groups/MultipleChoiceGroup.vue";
import BooleanToggleGroup from "./groups/BooleanToggleGroup.vue";
import { hasGroupSelection } from "~/composables/useCustomizationPricing";

interface Props {
  groups: SanityCustomizationGroup[];
  modelValue: CustomizationSelections;
  notes: CustomizationNotes;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update:modelValue", value: CustomizationSelections): void;
  (e: "update:notes", value: CustomizationNotes): void;
}>();

const sortedGroups = computed(() =>
  [...props.groups].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)),
);

function hasSelection(group: SanityCustomizationGroup) {
  return hasGroupSelection(group, props.modelValue);
}

function updateSelection(groupId: string, value: CustomizationSelections[string]) {
  emit("update:modelValue", { ...props.modelValue, [groupId]: value });
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <p v-if="sortedGroups.length === 0" class="text-sm text-brand-slate-muted">
      Standard specification — no options for this unit
    </p>

    <div
      v-for="(group, index) in sortedGroups"
      :id="`group-${group._id}`"
      :key="group._id"
      class="relative flex flex-col gap-4"
    >
      <div
        v-if="index < sortedGroups.length - 1"
        class="absolute left-3 top-8 bottom-[-32px] w-px bg-brand-rose-border/40 pointer-events-none"
      ></div>

      <div class="flex items-center gap-3 relative z-10">
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
          :class="[
            hasSelection(group)
              ? 'bg-brand-red text-white'
              : 'bg-brand-rose-card text-gray-800 border border-brand-rose-border',
          ]"
        >
          {{ index + 1 }}
        </div>
        <h2 class="text-lg font-normal text-gray-800">{{ group.title }}</h2>
        <span
          v-if="group.isMandatory"
          class="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-brand-rose-card px-1.5 py-0.5 rounded-xs"
        >
          Required
        </span>
      </div>

      <div class="pl-9 w-full flex flex-col gap-3">
        <SingleChoiceGroup
          v-if="group.selectionType === 'single'"
          :group="group"
          :model-value="(modelValue[group._id] as string | null) ?? null"
          :notes="notes"
          @update:model-value="updateSelection(group._id, $event)"
          @update:notes="emit('update:notes', $event)"
        />
        <MultipleChoiceGroup
          v-else-if="group.selectionType === 'multiple'"
          :group="group"
          :model-value="(modelValue[group._id] as string[]) ?? []"
          :notes="notes"
          @update:model-value="updateSelection(group._id, $event)"
          @update:notes="emit('update:notes', $event)"
        />
        <BooleanToggleGroup
          v-else
          :group="group"
          :model-value="(modelValue[group._id] as boolean) ?? false"
          :notes="notes"
          @update:model-value="updateSelection(group._id, $event)"
          @update:notes="emit('update:notes', $event)"
        />
      </div>
    </div>
  </div>
</template>
