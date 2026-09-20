<template>
  <div
    class="pointer-events-auto quick-contact-root"
    :class="[
      isLeftSide ? 'origin-bottom-left is-left-side' : 'origin-bottom-right',
      isAnchored
        ? isLeftSide
          ? 'relative flex flex-col items-start gap-2 is-anchored'
          : 'relative flex flex-col items-end gap-2 is-anchored'
        : isLeftSide
          ? 'fixed left-4 sm:left-6 bottom-6 z-50 flex flex-col items-start gap-2'
          : 'fixed right-4 sm:right-6 bottom-6 z-50 flex flex-col items-end gap-2',
    ]"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Top Action Row (Map + Phone + Close) -->
    <div
      class="quick-contact-top-bar flex items-center gap-1 p-1 rounded-full text-slate-200"
      :class="{
        'is-hidden': !isOpen,
        'is-visible': isOpen,
      }"
    >
      <!-- Navigation Map Button (Home page only) -->
      <button
        v-if="isHomePage"
        type="button"
        @click="scrollToMap"
        class="quick-contact-icon-btn group flex items-center justify-center w-7 h-7 rounded-full hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 cursor-pointer transition-colors duration-150"
        title="Scroll to Location Map"
        aria-label="Scroll to Location Map"
      >
        <div
          class="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
        >
          <UIcon name="i-tabler-location" class="w-3.5 h-3.5" />
        </div>
      </button>

      <!-- Direct Phone Dial Pill -->
      <a
        :href="phoneTelHref"
        class="quick-contact-phone-link group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-200 hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red transition-colors duration-150"
        :title="`Call Direct: ${phoneDisplay}`"
        aria-label="Direct Phone Call"
      >
        <div
          class="w-5 h-5 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
        <span class="font-semibold text-[11px] tracking-wide">{{
          phoneDisplay
        }}</span>
      </a>

      <!-- Close / Minimize Button -->
      <button
        type="button"
        @click="closeWidget"
        class="quick-contact-close-btn group flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 cursor-pointer transition-colors duration-150"
        title="Minimize"
        aria-label="Minimize quick contact widget"
      >
        <UIcon
          name="i-tabler-x"
          class="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110"
        />
      </button>
    </div>

    <!-- Primary Action: WhatsApp Quick Contact Fluid Capsule -->
    <a
      :href="whatsAppUrl"
      :target="!isOpen ? undefined : '_blank'"
      :rel="!isOpen ? undefined : 'noopener noreferrer'"
      @click="handleWhatsAppClick"
      class="quick-contact-main-btn group relative flex items-center text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 cursor-pointer"
      :class="{
        'is-collapsed': !isOpen,
        'is-expanded': isOpen,
      }"
      :title="
        !isOpen
          ? 'Open Quick Contact'
          : hasQuoteItems
            ? 'Chat on WhatsApp with active quote breakdown'
            : 'Chat with Karmod UK on WhatsApp'
      "
      :aria-label="!isOpen ? 'Open Quick Contact' : 'Chat on WhatsApp'"
    >
      <!-- WhatsApp Brand Icon (Fixed Anchor 48px square) -->
      <div
        class="icon-anchor relative shrink-0 flex items-center justify-center"
      >
        <svg
          class="w-6 h-6 fill-current text-emerald-300 group-hover:text-white transition-colors duration-200"
          viewBox="0 0 24 24"
        >
          <path
            d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"
          />
        </svg>

        <!-- Live Quote Items Counter Badge -->
        <span
          v-if="hasQuoteItems"
          class="absolute top-2 right-2 w-4 h-4 bg-brand-red text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border border-[#075E54] shadow-sm badge-pop pointer-events-none"
        >
          {{ quoteCount }}
        </span>
      </div>

      <!-- Fluid Morphing Label Container -->
      <div class="label-morph-container overflow-hidden">
        <div
          class="label-inner flex flex-col items-start pr-4 whitespace-nowrap"
        >
          <span
            class="text-xs font-bold leading-tight flex items-center gap-1.5 text-white"
          >
            WhatsApp Us
            <span
              v-if="hasQuoteItems"
              class="text-[10px] bg-emerald-950/70 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-400/20"
            >
              Quote Active
            </span>
          </span>
          <span class="text-[10px] text-emerald-100/90 font-medium">
            {{
              hasQuoteItems
                ? "Send unit spec & price"
                : "Instant modular support"
            }}
          </span>
        </div>
      </div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useQuickContact } from "~/composables/useQuickContact";

interface Props {
  isAnchored?: boolean;
}

withDefaults(defineProps<Props>(), {
  isAnchored: false,
});

const route = useRoute();
const { phoneDisplay, phoneTelHref, whatsAppUrl, hasQuoteItems, quoteCount } =
  useQuickContact();

const isHomePage = computed(() => route.path === "/");
// Products page: category sidebar now lives on the left, so the floating
// contact chips move to the left to keep clear of it.
const isLeftSide = computed(() => route.path === "/products");

const isHovered = ref(false);
const isCollapsed = ref(false);
const isManuallyClosed = ref(false);

const isOpen = computed(() => {
  if (isManuallyClosed.value) {
    return !isCollapsed.value;
  }
  return !isCollapsed.value || isHovered.value;
});

let lastScrollY = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let ticking = false;

function scrollToMap() {
  const mapElement =
    document.getElementById("map-section") ||
    document.querySelector('iframe[title*="Map"]') ||
    document.getElementById("location-map");
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function closeWidget() {
  isCollapsed.value = true;
  isManuallyClosed.value = true;
  if (idleTimer) clearTimeout(idleTimer);
}

function expandWidget() {
  isCollapsed.value = false;
  isManuallyClosed.value = false;
}

function handleWhatsAppClick(e: MouseEvent) {
  if (!isOpen.value) {
    e.preventDefault();
    expandWidget();
  }
}

function handleScroll() {
  if (isManuallyClosed.value) return;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Only toggle on deliberate scroll movements (18px threshold)
      if (currentScrollY > 100 && scrollDelta > 18) {
        // Scrolling down -> Collapse
        isCollapsed.value = true;
      } else if (scrollDelta < -14 || currentScrollY <= 60) {
        // Scrolling up or near top -> Expand
        isCollapsed.value = false;
      }

      lastScrollY = currentScrollY;
      ticking = false;

      // Idle expand timer (only if not manually closed)
      if (idleTimer) clearTimeout(idleTimer);
      if (!isManuallyClosed.value) {
        idleTimer = setTimeout(() => {
          if (!isManuallyClosed.value) {
            isCollapsed.value = false;
          }
        }, 2400);
      }
    });
    ticking = true;
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (idleTimer) clearTimeout(idleTimer);
});
</script>

<style scoped>
/* ─── Apple / Emil Kowalski 120fps Fluid Motion Design Tokens ─── */

.quick-contact-root:not(.is-anchored) {
  will-change: transform, opacity;
}

.quick-contact-root.is-left-side .quick-contact-top-bar,
.quick-contact-root.is-left-side .quick-contact-main-btn {
  transform-origin: bottom left;
}

/* Top Action Bar (Map + Phone + Close) */
.quick-contact-top-bar {
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(51, 65, 85, 0.7);
  box-shadow:
    0 8px 20px -4px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.12);
  transform-origin: bottom right;
  will-change: transform, opacity, max-height, margin, padding;
  backface-visibility: hidden;
  overflow: hidden;
  box-sizing: border-box;
}

.quick-contact-top-bar.is-visible {
  opacity: 1;
  max-height: 44px;
  transform: translateY(0) scale(1);
  pointer-events: auto;
  margin-bottom: 0;
  transition:
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 240ms cubic-bezier(0.16, 1, 0.3, 1),
    max-height 300ms cubic-bezier(0.16, 1, 0.3, 1),
    margin-bottom 300ms cubic-bezier(0.16, 1, 0.3, 1),
    padding 240ms ease;
}

.quick-contact-top-bar.is-hidden {
  opacity: 0;
  max-height: 0;
  transform: translateY(8px) scale(0.94);
  pointer-events: none;
  margin-bottom: -8px;
  padding-top: 0;
  padding-bottom: 0;
  border-color: transparent;
  transition:
    transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 180ms cubic-bezier(0.16, 1, 0.3, 1),
    max-height 260ms cubic-bezier(0.16, 1, 0.3, 1),
    margin-bottom 260ms cubic-bezier(0.16, 1, 0.3, 1),
    padding 260ms cubic-bezier(0.16, 1, 0.3, 1),
    border-color 180ms ease;
}

.quick-contact-icon-btn:active,
.quick-contact-phone-link:active,
.quick-contact-close-btn:active {
  transform: scale(0.94);
  transition-duration: 80ms;
}

/* Primary WhatsApp Fluid Capsule */
.quick-contact-main-btn {
  height: 48px;
  background-color: #075e54;
  border: 1px solid rgba(52, 211, 153, 0.4);
  box-shadow:
    0 12px 28px -4px rgba(7, 94, 84, 0.45),
    0 4px 12px -2px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.25);
  transform-origin: bottom right;
  will-change: max-width, transform, background-color, box-shadow;
  backface-visibility: hidden;
  overflow: hidden;
  transition:
    max-width 300ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
    background-color 200ms ease,
    box-shadow 260ms cubic-bezier(0.16, 1, 0.3, 1);
}

.quick-contact-main-btn.is-collapsed {
  max-width: 48px;
}

.quick-contact-main-btn.is-expanded {
  max-width: 280px;
}

.icon-anchor {
  width: 48px;
  height: 48px;
  min-width: 48px;
  max-width: 48px;
}

/* Fluid Label Morphing */
.label-morph-container {
  display: grid;
  transition:
    grid-template-columns 300ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 240ms cubic-bezier(0.16, 1, 0.3, 1),
    filter 240ms ease;
  will-change: grid-template-columns, opacity;
}

.is-expanded .label-morph-container {
  grid-template-columns: 1fr;
  opacity: 1;
  filter: blur(0px);
}

.is-collapsed .label-morph-container {
  grid-template-columns: 0fr;
  opacity: 0;
  filter: blur(1px);
  pointer-events: none;
}

.label-inner {
  min-width: 0;
  overflow: hidden;
  transition:
    transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 240ms cubic-bezier(0.16, 1, 0.3, 1);
}

.is-collapsed .label-inner {
  transform: translateX(8px);
  opacity: 0;
}

.is-expanded .label-inner {
  transform: translateX(0);
  opacity: 1;
}

/* Desktop Hover Elevation */
@media (hover: hover) and (pointer: fine) {
  .quick-contact-main-btn:hover {
    background-color: #128c7e;
    box-shadow:
      0 16px 36px -4px rgba(18, 140, 126, 0.55),
      0 6px 16px -2px rgba(0, 0, 0, 0.28),
      inset 0 1px 0 0 rgba(255, 255, 255, 0.35);
  }
}

.quick-contact-main-btn:active {
  transform: scale(0.96) translateY(1px);
  transition-duration: 80ms;
}

/* Badge Micro-Spring Pop */
.badge-pop {
  animation: popIn 240ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes popIn {
  from {
    transform: scale(0.75);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Reduced Motion Mode */
@media (prefers-reduced-motion: reduce) {
  .quick-contact-root,
  .quick-contact-top-bar,
  .quick-contact-main-btn,
  .label-morph-container,
  .label-inner,
  .badge-pop {
    transition: opacity 150ms ease !important;
    transform: none !important;
    animation: none !important;
  }
}
</style>
