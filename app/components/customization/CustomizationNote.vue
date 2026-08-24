<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  label?: string;
}

withDefaults(defineProps<Props>(), {
  placeholder: "Describe your requirements...",
  label: "Your specification",
});

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <label class="flex flex-col gap-1.5">
    <span class="text-xs font-medium text-brand-slate-muted">{{ label }}</span>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      rows="3"
      class="w-full rounded border border-brand-rose-border/60 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red resize-none"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @click.stop
    ></textarea>
  </label>
</template>
