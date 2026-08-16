<template>
  <Teleport to="body">
    <!-- Backdrop Overlay with Asymmetric Easing -->
    <Transition
      enter-active-class="transition-opacity duration-[220ms] ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-[180ms] ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-xs z-60 will-change-[opacity]"
        @click="closeDrawer"
        aria-hidden="true"
      />
    </Transition>

    <!-- Bottom Sheet Drawer with Emil iOS-like Drawer Curve & Asymmetric Timing -->
    <Transition
      enter-active-class="transition-transform duration-[280ms] [transition-timing-function:var(--ease-drawer)] motion-reduce:transition-opacity motion-reduce:duration-200"
      enter-from-class="translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0"
      enter-to-class="translate-y-0 motion-reduce:opacity-100"
      leave-active-class="transition-transform duration-[200ms] [transition-timing-function:var(--ease-drawer)] motion-reduce:transition-opacity motion-reduce:duration-150"
      leave-from-class="translate-y-0 motion-reduce:opacity-100"
      leave-to-class="translate-y-full motion-reduce:translate-y-0 motion-reduce:opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed bottom-0 inset-x-0 z-70 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[85vh] h-[85vh] flex flex-col will-change-transform select-none"
        role="dialog"
        aria-modal="true"
        aria-label="Categories Selection"
      >
        <!-- Drag Handle Indicator -->
        <div class="w-full pt-3 pb-1 flex justify-center">
          <span class="w-10 h-1 bg-slate-300 rounded-full"></span>
        </div>

        <!-- Drawer Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 class="text-xl font-bold text-gray-800 tracking-tight">Categories</h2>
          <button
            type="button"
            @click="closeDrawer"
            class="cursor-pointer text-slate-500 hover:text-slate-800 active:scale-95 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-transform duration-150 [transition-timing-function:var(--ease-out)] focus-visible:ring-2 focus-visible:ring-brand-red focus:outline-none"
            aria-label="Close categories drawer"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Category List with Smooth Momentum -->
        <div class="overflow-y-auto overscroll-contain touch-pan-y p-6 flex-grow space-y-6">
          <ul class="space-y-6">
            <li
              v-for="(cat, idx) in categories"
              :key="cat.name"
              :class="{ 'border-t border-slate-100 pt-6': idx > 0 }"
            >
              <!-- Parent Category Toggle Button -->
              <button
                type="button"
                @click="onToggleCategory(cat.name)"
                class="flex items-center justify-between w-full text-left text-lg font-medium active:scale-[0.99] transition-[color,transform] duration-150 [transition-timing-function:var(--ease-out)] cursor-pointer"
                :class="activeCategory === cat.name ? 'text-gray-800 font-semibold' : 'text-slate-600 hover:text-gray-800'"
              >
                <span>{{ cat.name }}</span>
                <svg
                  class="w-5 h-5 transition-transform duration-200 [transition-timing-function:var(--ease-out)] shrink-0"
                  :class="{ 'rotate-180': expandedCat === cat.name }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Subcategories Accordion List -->
              <div
                v-if="expandedCat === cat.name && cat.subcategories.length"
                class="mt-4 ml-2 border-l-2 border-slate-100 space-y-2.5 transition-all"
              >
                <div
                  v-for="sub in cat.subcategories"
                  :key="sub"
                >
                  <button
                    type="button"
                    @click="onSelectSubcategory(sub, cat.name)"
                    class="block w-full text-left pl-5 py-2.5 text-base rounded-r-md active:scale-[0.99] transition-[background-color,color,transform] duration-150 [transition-timing-function:var(--ease-out)] cursor-pointer"
                    :class="
                      activeSubcategory === sub
                        ? 'border-l-2 border-brand-red -ml-[2px] bg-[#f9e9ea] text-gray-800 font-bold'
                        : 'text-slate-600 hover:text-gray-800 hover:bg-slate-50 font-normal'
                    "
                  >
                    {{ sub }}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Drawer Footer CTA -->
        <div class="p-5 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            @click="onApply"
            class="w-full block text-center bg-brand-red hover:bg-brand-red-dark active:scale-[0.98] text-white font-semibold text-xs tracking-wider uppercase py-4 rounded-lg transition-transform duration-150 [transition-timing-function:var(--ease-out)] shadow-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-navy focus:outline-none"
          >
            Apply Categories
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";

export interface CategoryItem {
  name: string;
  subcategories: string[];
}

const props = defineProps<{
  isOpen: boolean;
  categories: CategoryItem[];
  activeCategory: string;
  activeSubcategory: string;
  expandedCategory?: string;
}>();

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void;
  (e: "select", subcategory: string, parentCategory: string): void;
  (e: "apply"): void;
}>();

const expandedCat = ref(props.expandedCategory || props.activeCategory || "");

watch(
  () => props.expandedCategory,
  (newVal) => {
    if (newVal) expandedCat.value = newVal;
  }
);

watch(
  () => props.activeCategory,
  (newVal) => {
    if (newVal && !expandedCat.value) expandedCat.value = newVal;
  }
);

// Lock body scroll while open
watch(
  () => props.isOpen,
  (open) => {
    if (typeof document !== "undefined") {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  }
);

function closeDrawer() {
  emit("update:isOpen", false);
}

function onToggleCategory(catName: string) {
  expandedCat.value = expandedCat.value === catName ? "" : catName;
}

function onSelectSubcategory(sub: string, parentCategory: string) {
  emit("select", sub, parentCategory);
}

function onApply() {
  emit("apply");
  closeDrawer();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.isOpen) {
    closeDrawer();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
