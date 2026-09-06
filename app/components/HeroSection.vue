<template>
  <section
    class="w-full py-16 lg:py-24 px-6 lg:px-12 flex justify-center bg-brand-rose-bg/50"
  >
    <div
      class="max-w-[1184px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center"
    >
      <!-- Left Content (Span 5) -->
      <div class="lg:col-span-5 flex flex-col items-start gap-6">
        <h1
          class="text-brand-navy-heading text-4xl sm:text-5xl font-bold leading-tight tracking-tight"
        >
          Modular Cabins &amp;<br />Building Solutions
        </h1>

        <p class="text-brand-slate-muted text-base sm:text-lg leading-relaxed">
          Engineered for durability, designed for efficiency. We deliver premium
          modular containers, GRP &amp; sandwich panel cabins, and bulletproof
          security gatehouses across the UK.
        </p>

        <div class="pt-2">
          <NuxtLink
            to="/products"
            class="bg-brand-red hover:bg-brand-red-dark text-white text-xs font-semibold tracking-wider uppercase px-6 py-3 rounded-xs transition-colors inline-block text-center shadow-sm"
          >
            CONFIGURE &amp; QUOTE
          </NuxtLink>
        </div>

        <!-- Badges Row -->
        <div class="w-full pt-2">
          <div
            class="border-t border-brand-rose-border/50 pt-5 flex flex-wrap sm:flex-nowrap items-center gap-y-2.5 gap-x-4 sm:gap-x-3 lg:gap-x-2.5 xl:gap-x-4"
          >
            <!-- Badge 1 -->
            <div class="flex items-center gap-1.5 shrink-0">
              <svg
                class="w-4 h-4 text-brand-slate-muted shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span
                class="text-brand-slate-muted text-xs sm:text-[10.5px] xl:text-xs font-semibold tracking-wider sm:tracking-[0.5px] xl:tracking-[1px] uppercase whitespace-nowrap"
                >ISO 9001</span
              >
            </div>

            <!-- Badge 2 -->
            <div class="flex items-center gap-1.5 shrink-0">
              <svg
                class="w-4 h-4 text-brand-slate-muted shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4m-4-4l4 4"
                />
              </svg>
              <span
                class="text-brand-slate-muted text-xs sm:text-[10.5px] xl:text-xs font-semibold tracking-wider sm:tracking-[0.5px] xl:tracking-[1px] uppercase whitespace-nowrap"
                >UK Regs Compliant</span
              >
            </div>

            <!-- Badge 3 -->
            <div class="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
              <svg
                class="w-4 h-4 text-brand-slate-muted shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"
                />
              </svg>
              <span
                class="text-brand-slate-muted text-xs sm:text-[10.5px] xl:text-xs font-semibold tracking-wider sm:tracking-[0.5px] xl:tracking-[1px] uppercase whitespace-nowrap"
                >Nationwide UK Delivery</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Right Image Carousel Block (Span 7) -->
      <div class="lg:col-span-7 lg:relative">
        <div
          class="h-95 sm:h-120 lg:h-130 bg-brand-rose-card rounded-xl overflow-hidden shadow-xl border border-brand-rose-border/40 relative group touch-pan-y"
          @mouseenter="pauseAutoplay"
          @mouseleave="startAutoplay"
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
          @touchcancel.passive="handleTouchCancel"
        >
          <!-- Slides Container -->
          <div class="w-full h-full relative">
            <div
              v-for="(slide, index) in slides"
              :key="index"
              class="absolute inset-0 transition-opacity duration-700 ease-in-out"
              :class="
                currentIndex === index
                  ? 'opacity-100 z-10'
                  : 'opacity-0 z-0 pointer-events-none'
              "
            >
              <img
                :src="slide.image"
                :alt="slide.title"
                class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
              ></div>
            </div>
          </div>

          <!-- Floating Live Indicator Badge Top-Right -->
          <div
            class="absolute top-6 right-6 z-20 backdrop-blur-md bg-brand-navy-heading/80 border border-white/20 px-3.5 py-2 rounded-md shadow-md flex items-center gap-2 text-white"
          >
            <span class="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
            <span class="text-[11px] font-semibold tracking-[0.8px] uppercase">
              Slide {{ currentIndex + 1 }} / {{ slides.length }}
            </span>
          </div>

          <!-- Carousel Navigation Controls -->
          <!-- Prev Arrow -->
          <button
            @click="prevSlide"
            aria-label="Previous Slide"
            class="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white text-brand-navy-heading flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/40"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Next Arrow -->
          <button
            @click="nextSlide"
            aria-label="Next Slide"
            class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full backdrop-blur-md bg-white/70 hover:bg-white text-brand-navy-heading flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-md border border-white/40"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Carousel Indicators (Dots) -->
          <div class="absolute bottom-6 right-6 z-20 flex items-center gap-2">
            <button
              v-for="(_, idx) in slides"
              :key="idx"
              @click="goToSlide(idx)"
              :aria-label="`Go to slide ${idx + 1}`"
              class="h-2 rounded-full transition-all duration-300"
              :class="
                currentIndex === idx
                  ? 'w-6 bg-brand-red'
                  : 'w-2 bg-white/60 hover:bg-white'
              "
            ></button>
          </div>
        </div>

        <!-- Slide Info Card (Dynamic per slide): stacked under the images on mobile, floating over them from lg -->
        <div
          class="mt-4 lg:mt-0 lg:absolute lg:bottom-6 lg:left-6 lg:z-20 w-fit backdrop-blur-md bg-white/90 border border-white/50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300"
        >
          <div
            class="w-9 h-9 rounded-full bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red shrink-0"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4m-4-4l4 4"
              />
            </svg>
          </div>
          <div>
            <p
              class="text-brand-navy-heading text-xs font-semibold tracking-wide uppercase"
            >
              {{ slides[currentIndex]?.title }}
            </p>
            <p class="text-brand-slate-muted text-[11px] font-medium">
              {{ slides[currentIndex]?.subtitle }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const slides = [
  {
    image: "/images/hero/hero-container-3x7-uk.webp",
    title: "3 × 7 m Modular Container",
    subtitle: "Spacious 3 × 7 m site office for larger teams",
  },
  {
    image: "/images/hero/hero-container-2-3x6-uk.webp",
    title: "2.3 × 6 m Modular Container",
    subtitle: "Compact 2.3 × 6 m site office for UK projects",
  },
  {
    image: "/images/hero/hero-grp-1-5x1-5-uk.webp",
    title: "1.5 × 1.5 m GRP Cabin",
    subtitle: "Compact weatherproof gatehouse for schools and sports grounds",
  },
  {
    image: "/images/hero/hero-panel-1-35x2-1-uk.webp",
    title: "1.35 × 2.1 m Panel Cabin",
    subtitle: "Insulated site gatehouse for year-round UK projects",
  },
  {
    image: "/images/hero/hero-metrocity-2-15x2-65-uk.webp",
    title: "2.15 × 2.65 m MetroCity Modular Cabin",
    subtitle: "Architectural security office for premium developments",
  },
  {
    image: "/images/hero/hero-kompocity-2-65x2-65-uk.webp",
    title: "2.65 × 2.65 m KompoCity Composite Cabin",
    subtitle: "Composite-clad reception cabin for commercial entrances",
  },
  {
    image: "/images/hero/hero-bulletproof-2x4-uk.webp",
    title: "2.00 × 4.00 m Bulletproof Security Cabin",
    subtitle: "Armoured checkpoint for critical infrastructure sites",
  },
];

const currentIndex = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % slides.length;
}

function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + slides.length) % slides.length;
}

function goToSlide(index: number) {
  currentIndex.value = index;
}

function startAutoplay() {
  if (!timer) {
    timer = setInterval(nextSlide, 5000);
  }
}

function pauseAutoplay() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

const swipeThreshold = 50;
let touchStartX: number | null = null;
let touchStartY: number | null = null;

function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (!touch) return;
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  pauseAutoplay();
}

function handleTouchEnd(event: TouchEvent) {
  if (touchStartX === null || touchStartY === null) {
    startAutoplay();
    return;
  }

  const touch = event.changedTouches[0];
  if (touch) {
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) >= swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  touchStartX = null;
  touchStartY = null;
  startAutoplay();
}

function handleTouchCancel() {
  touchStartX = null;
  touchStartY = null;
  startAutoplay();
}

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  pauseAutoplay();
});
</script>
