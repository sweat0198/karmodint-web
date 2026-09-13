<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-[250ms] [transition-timing-function:var(--ease-out)]"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-[250ms] [transition-timing-function:var(--ease-out)]"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="tile"
        class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <Transition
      enter-active-class="transition-[opacity,transform] duration-[250ms] [transition-timing-function:var(--ease-out)] motion-reduce:transition-opacity"
      enter-from-class="opacity-0 scale-[0.96]"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-[opacity,transform] duration-[250ms] [transition-timing-function:var(--ease-out)] motion-reduce:transition-opacity"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-[0.96]"
    >
      <div
        v-if="tile"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        @click.self="emit('close')"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="tile.title"
          class="relative flex max-h-[90vh] w-full max-w-4xl origin-center flex-col overflow-y-auto rounded-xs bg-white shadow-2xl md:flex-row"
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors duration-150 hover:bg-black"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="min-h-[300px] bg-slate-900 md:min-h-full md:w-1/2">
            <img
              :src="tile.image.src"
              :srcset="tile.image.srcset"
              sizes="(min-width: 768px) 50vw, 100vw"
              :alt="tile.image.alt"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="flex flex-col justify-between gap-6 p-6 md:w-1/2 md:p-8">
            <div class="space-y-4">
              <div>
                <span class="text-xs font-semibold uppercase tracking-[1.2px] text-brand-red">{{
                  tile.category.name
                }}</span>
                <h2 class="mt-1 text-2xl font-bold text-brand-navy-heading md:text-3xl">
                  {{ tile.title }}
                </h2>
              </div>
              <p v-if="tile.description" class="text-sm leading-relaxed text-slate-600 md:text-base">
                {{ tile.description }}
              </p>
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <NuxtLink
                :to="toCategoryProductsLink(tile.category)"
                class="w-full rounded-xs bg-brand-red px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.6px] text-white transition-colors duration-150 hover:bg-brand-red-hover"
                @click="emit('close')"
              >
                Request a quote for a similar project
              </NuxtLink>
              <button
                type="button"
                class="w-full rounded-xs bg-slate-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.6px] text-slate-700 transition-colors duration-150 hover:bg-slate-200"
                @click="emit('close')"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import type { GalleryTile } from "~/types/gallery";
import { toCategoryProductsLink } from "~/utils/galleryCategoryLink";

const props = defineProps<{ tile: GalleryTile | null }>();
const emit = defineEmits<{ close: [] }>();

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.tile) emit("close");
}

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  if (typeof document !== "undefined") document.body.style.overflow = "";
  window.removeEventListener("keydown", handleKeydown);
});

watch(
  () => props.tile,
  (tile) => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = tile ? "hidden" : "";
  },
);
</script>
