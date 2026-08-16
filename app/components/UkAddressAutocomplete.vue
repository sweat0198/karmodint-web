<template>
  <div class="relative w-full" ref="containerRef">
    <!-- Header / Label with Manual Entry Toggle -->
    <div class="flex items-center justify-between mb-1.5">
      <label v-if="label" :for="id" class="label-caps text-slate-500 block">
        {{ label }} <span v-if="required" class="text-brand-red">*</span>
      </label>
      <button
        v-if="showManualToggle"
        type="button"
        @click="toggleManualMode"
        class="text-xs font-semibold text-brand-red hover:text-brand-red-hover transition-colors duration-150 focus:outline-none"
      >
        {{ isManualMode ? "Use address search" : "Enter manually" }}
      </button>
    </div>

    <!-- Mode A: Autocomplete Search Input -->
    <div v-if="!isManualMode" class="relative">
      <div class="relative flex items-center">
        <!-- Leading Icon -->
        <div
          class="absolute left-3.5 flex items-center pointer-events-none text-slate-400"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <!-- Input Field -->
        <input
          :id="id"
          ref="inputRef"
          type="text"
          :value="displayQuery"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required && !hasValidAddress"
          autocomplete="off"
          role="combobox"
          :aria-expanded="isDropdownOpen"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          @input="onInput"
          @focus="onFocus"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.enter.prevent="onEnter"
          @keydown.esc.prevent="closeDropdown"
          class="w-full bg-white border border-slate-300 rounded pl-10 pr-10 py-2.5 text-sm text-gray-800 placeholder-slate-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all duration-150 shadow-sm"
          :class="{
            'opacity-60 cursor-not-allowed bg-slate-50': disabled,
            'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500':
              hasValidAddress && !isDropdownOpen,
          }"
        />

        <!-- Trailing Spinner / Clear / Status -->
        <div class="absolute right-3 flex items-center gap-1.5">
          <!-- Loading Spinner -->
          <svg
            v-if="isSearching"
            class="animate-spin h-4 w-4 text-brand-red"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>

          <!-- Valid Checkmark -->
          <svg
            v-else-if="hasValidAddress && !isDropdownOpen"
            class="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M5 13l4 4L19 7"
            />
          </svg>

          <!-- Clear Button -->
          <button
            v-if="displayQuery && !disabled"
            type="button"
            @click="clearSearch"
            class="p-0.5 text-slate-400 hover:text-slate-600 transition-colors duration-100 rounded focus:outline-none"
            aria-label="Clear address input"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Dropdown Suggestions Menu -->
      <transition name="dropdown-fade">
        <div
          v-if="isDropdownOpen && predictions.length > 0"
          role="listbox"
          class="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        >
          <ul class="divide-y divide-slate-100 py-1">
            <li
              v-for="(item, idx) in predictions"
              :key="item.placeId"
              role="option"
              :aria-selected="highlightedIndex === idx"
              @mouseenter="highlightedIndex = idx"
              @mousedown.prevent="selectPrediction(item)"
              class="px-3.5 py-2.5 text-left cursor-pointer transition-colors duration-100 flex items-start gap-2.5"
              :class="{
                'bg-brand-rose-bg text-brand-navy-heading':
                  highlightedIndex === idx,
                'hover:bg-slate-50 text-slate-700': highlightedIndex !== idx,
              }"
            >
              <svg
                class="w-4 h-4 mt-0.5 shrink-0"
                :class="
                  highlightedIndex === idx ? 'text-brand-red' : 'text-slate-400'
                "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>

              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate text-gray-800">
                  {{ item.mainText }}
                </div>
                <div
                  v-if="item.secondaryText"
                  class="text-xs text-slate-500 truncate mt-0.5"
                >
                  {{ item.secondaryText }}
                </div>
              </div>
            </li>
          </ul>

          <!-- Google TOS Attribution Footer -->
          <div
            class="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex items-center justify-end"
          >
            <span class="text-[10px] text-slate-400 font-medium tracking-tight"
              >powered by</span
            >
            <span class="text-[11px] font-semibold text-slate-600 ml-1"
              >Google</span
            >
          </div>
        </div>
      </transition>

      <!-- Selected Address Details Pill -->
      <div
        v-if="selectedAddress && !isDropdownOpen"
        class="mt-2.5 p-3 bg-brand-rose-bg border border-brand-rose-border rounded text-xs text-brand-rose-text flex items-start justify-between gap-3 animate-fade-in"
      >
        <div class="space-y-0.5">
          <div class="font-bold text-brand-navy-heading text-sm">
            {{ selectedAddress.addressLine1 }}
          </div>
          <div v-if="selectedAddress.addressLine2" class="text-slate-600">
            {{ selectedAddress.addressLine2 }}
          </div>
          <div class="text-slate-600">
            {{
              [
                selectedAddress.townCity,
                selectedAddress.county,
                selectedAddress.postcode,
              ]
                .filter(Boolean)
                .join(", ")
            }}
          </div>
        </div>
        <span
          class="shrink-0 inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800"
        >
          UK Verified
        </span>
      </div>
    </div>

    <!-- Mode B: Manual Address Entry Form -->
    <div
      v-else
      class="space-y-3 bg-slate-50/70 p-4 border border-slate-200 rounded animate-fade-in"
    >
      <div>
        <label class="label-caps text-slate-500 mb-1 block"
          >Address Line 1 *</label
        >
        <input
          v-model="manualAddress.addressLine1"
          type="text"
          required
          placeholder="Building name, number and street"
          @input="emitManualChange"
          class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
        />
      </div>

      <div>
        <label class="label-caps text-slate-500 mb-1 block"
          >Address Line 2 (Optional)</label
        >
        <input
          v-model="manualAddress.addressLine2"
          type="text"
          placeholder="Apartment, suite, unit, etc."
          @input="emitManualChange"
          class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="label-caps text-slate-500 mb-1 block"
            >Town / City *</label
          >
          <input
            v-model="manualAddress.townCity"
            type="text"
            required
            placeholder="e.g. London or Manchester"
            @input="emitManualChange"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
          />
        </div>

        <div>
          <label class="label-caps text-slate-500 mb-1 block"
            >UK Postcode *</label
          >
          <input
            v-model="manualAddress.postcode"
            type="text"
            required
            placeholder="e.g. SW1A 2AA"
            @input="emitManualChange"
            class="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-gray-800 uppercase focus:outline-none focus:border-brand-red"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  useGooglePlacesAutocomplete,
  type AddressPrediction,
  type ParsedUkAddress,
} from "~/composables/useGooglePlacesAutocomplete";

interface Props {
  modelValue?: string | ParsedUkAddress | null;
  id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showManualToggle?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  id: () => `uk-address-${Math.random().toString(36).slice(2, 9)}`,
  label: "Delivery Address",
  placeholder:
    "Start typing street address or postcode (e.g. 10 Downing St)...",
  required: false,
  disabled: false,
  showManualToggle: true,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | ParsedUkAddress): void;
  (e: "select", address: ParsedUkAddress): void;
  (e: "clear"): void;
}>();

const {
  predictions,
  isSearching,
  search,
  getPlaceDetails,
  clearPredictions,
  resetSessionToken,
} = useGooglePlacesAutocomplete({
  countryCode: "gb",
  debounceMs: 350,
  types: ["address"],
});

const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

const displayQuery = ref("");
const isDropdownOpen = ref(false);
const highlightedIndex = ref(-1);
const isManualMode = ref(false);
const selectedAddress = ref<ParsedUkAddress | null>(null);

const manualAddress = ref({
  addressLine1: "",
  addressLine2: "",
  townCity: "",
  county: "",
  postcode: "",
  country: "United Kingdom",
});

const hasValidAddress = computed(() => {
  if (selectedAddress.value && selectedAddress.value.postcode) return true;
  if (
    isManualMode.value &&
    manualAddress.value.addressLine1 &&
    manualAddress.value.postcode
  )
    return true;
  return false;
});

// Initialize from initial modelValue if provided
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      if (!isManualMode.value && !displayQuery.value) {
        selectedAddress.value = null;
      }
      return;
    }
    if (typeof val === "string") {
      if (val !== displayQuery.value && !selectedAddress.value) {
        displayQuery.value = val;
      }
    } else if (typeof val === "object" && val.formattedAddress) {
      selectedAddress.value = val;
      displayQuery.value = val.formattedAddress;
    }
  },
  { immediate: true },
);

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  displayQuery.value = target.value;
  selectedAddress.value = null;
  highlightedIndex.value = -1;
  isDropdownOpen.value = true;

  emit("update:modelValue", target.value);
  search(target.value);
}

function onFocus() {
  if (predictions.value.length > 0 && !selectedAddress.value) {
    isDropdownOpen.value = true;
  }
}

function onArrowDown() {
  if (!isDropdownOpen.value) {
    isDropdownOpen.value = true;
    return;
  }
  if (predictions.value.length === 0) return;
  highlightedIndex.value =
    (highlightedIndex.value + 1) % predictions.value.length;
}

function onArrowUp() {
  if (!isDropdownOpen.value || predictions.value.length === 0) return;
  highlightedIndex.value =
    highlightedIndex.value <= 0
      ? predictions.value.length - 1
      : highlightedIndex.value - 1;
}

function onEnter() {
  if (
    isDropdownOpen.value &&
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < predictions.value.length
  ) {
    const item = predictions.value[highlightedIndex.value];
    if (item) {
      selectPrediction(item);
    }
  }
}

async function selectPrediction(item: AddressPrediction) {
  displayQuery.value = item.description;
  isDropdownOpen.value = false;
  clearPredictions();

  const detailed = await getPlaceDetails(item.placeId);
  if (detailed) {
    selectedAddress.value = detailed;
    displayQuery.value = detailed.formattedAddress || item.description;
    emit("update:modelValue", detailed);
    emit("select", detailed);
  } else {
    // Fallback if details call fails
    const fallback: ParsedUkAddress = {
      placeId: item.placeId,
      formattedAddress: item.description,
      addressLine1: item.mainText,
      addressLine2: "",
      townCity: item.secondaryText.split(",")[0]?.trim() || "",
      county: "",
      postcode: "",
      country: "United Kingdom",
    };
    selectedAddress.value = fallback;
    emit("update:modelValue", fallback);
    emit("select", fallback);
  }
}

function clearSearch() {
  displayQuery.value = "";
  selectedAddress.value = null;
  highlightedIndex.value = -1;
  clearPredictions();
  resetSessionToken();
  emit("update:modelValue", "");
  emit("clear");
  inputRef.value?.focus();
}

function closeDropdown() {
  isDropdownOpen.value = false;
  highlightedIndex.value = -1;
}

function toggleManualMode() {
  isManualMode.value = !isManualMode.value;
  if (isManualMode.value) {
    closeDropdown();
    // Populate manual if already selected
    if (selectedAddress.value) {
      manualAddress.value.addressLine1 =
        selectedAddress.value.addressLine1 || "";
      manualAddress.value.addressLine2 =
        selectedAddress.value.addressLine2 || "";
      manualAddress.value.townCity = selectedAddress.value.townCity || "";
      manualAddress.value.postcode = selectedAddress.value.postcode || "";
      manualAddress.value.county = selectedAddress.value.county || "";
    }
  }
}

function emitManualChange() {
  const formatted = [
    manualAddress.value.addressLine1,
    manualAddress.value.addressLine2,
    manualAddress.value.townCity,
    manualAddress.value.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const payload: ParsedUkAddress = {
    placeId: "manual",
    formattedAddress: formatted,
    addressLine1: manualAddress.value.addressLine1,
    addressLine2: manualAddress.value.addressLine2,
    townCity: manualAddress.value.townCity,
    county: manualAddress.value.county,
    postcode: manualAddress.value.postcode.toUpperCase().trim(),
    country: "United Kingdom",
  };

  emit("update:modelValue", payload);
  emit("select", payload);
}

function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s cubic-bezier(0.23, 1, 0.32, 1),
    transform 0.15s cubic-bezier(0.23, 1, 0.32, 1);
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

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
  animation: fadeIn 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}
</style>
