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
          class="text-brand-navy-heading text-4xl sm:text-[48px] font-bold leading-[1.1] tracking-[-0.96px]"
        >
          Pioneering Modular<br />Building Solutions
        </h1>

        <p
          class="text-brand-slate-muted text-base sm:text-[18px] leading-[27px]"
        >
          Engineered for durability, designed for efficiency. We deliver premium
          modular and portable buildings across the UK, ensuring rapid
          deployment and uncompromising quality.
        </p>

        <div class="pt-2">
          <NuxtLink
            to="/catalog"
            class="bg-brand-red hover:bg-brand-red-dark text-white text-[12px] font-semibold tracking-[0.6px] uppercase px-6 py-3 rounded-[2px] transition-colors inline-block text-center shadow-sm"
          >
            CONFIGURE &amp; QUOTE
          </NuxtLink>
        </div>

        <!-- Badges Row -->
        <div class="w-full pt-2">
          <div
            class="border-t border-brand-rose-border/50 pt-6 flex flex-wrap items-center gap-6"
          >
            <!-- Badge 1 -->
            <div class="flex items-center gap-2">
              <svg
                class="w-[22px] h-[21px] text-brand-slate-muted"
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
                class="text-brand-slate-muted text-[12px] font-semibold tracking-[1.2px] uppercase"
                >ISO 9001</span
              >
            </div>

            <!-- Badge 2 -->
            <div class="flex items-center gap-2">
              <svg
                class="w-[18px] h-[19px] text-brand-slate-muted"
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
                class="text-brand-slate-muted text-[12px] font-semibold tracking-[1.2px] uppercase"
                >UK Regs Compliant</span
              >
            </div>

            <!-- Badge 3 -->
            <div class="flex items-center gap-2">
              <svg
                class="w-[18px] h-[18px] text-brand-slate-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span
                class="text-brand-slate-muted text-[12px] font-semibold tracking-[1.2px] uppercase"
                >Est. 1986</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Right Image Carousel Block (Span 7) -->
      <div
        class="lg:col-span-7 h-[380px] sm:h-[480px] lg:h-[520px] bg-brand-rose-card rounded-[12px] overflow-hidden shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_10px_10px_-5px_rgba(0,0,0,0.04)] border border-brand-rose-border/40 relative group"
        @mouseenter="pauseAutoplay"
        @mouseleave="startAutoplay"
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

        <!-- Floating Glassmorphism Badge Bottom-Left (Dynamic per slide) -->
        <div
          class="absolute bottom-6 left-6 z-20 backdrop-blur-md bg-white/90 border border-white/50 px-4 py-3 rounded-[8px] shadow-lg flex items-center gap-3 transition-all duration-300"
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
              {{ slides[currentIndex].title }}
            </p>
            <p class="text-brand-slate-muted text-[11px] font-medium">
              {{ slides[currentIndex].subtitle }}
            </p>
          </div>
        </div>

        <!-- Floating Live Indicator Badge Top-Right -->
        <div
          class="absolute top-6 right-6 z-20 backdrop-blur-md bg-brand-navy-heading/80 border border-white/20 px-3.5 py-2 rounded-[6px] shadow-md flex items-center gap-2 text-white"
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const slides = [
  {
    image: "/images/hero-building-enhanced.png",
    title: "Multi-Story Modular Complex",
    subtitle: "Commercial grade steel frame architecture",
  },
  {
    image: "/images/hero-building-interior.png",
    title: "Ergonomic Interior Workspaces",
    subtitle: "Insulated, climate-controlled interiors",
  },
  {
    image: "/images/hero-building-site.png",
    title: "Rapid Site Office Deployment",
    subtitle: "Delivered and assembled across the UK",
  },
  {
    image: "/images/hero-building-kiosk.png",
    title: "Retail & Commercial Kiosks",
    subtitle: "Custom timber & composite panel finish",
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

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  pauseAutoplay();
});
</script>
