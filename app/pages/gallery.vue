<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Main Content Container -->
    <div
      class="w-full max-w-[1280px] mx-auto px-6 lg:px-12 pt-[60px] md:pt-[79px] pb-[80px] flex flex-col gap-10"
    >
      <!-- Header Section -->
      <div class="flex flex-col gap-4 items-start pb-6 border-b border-slate-100">
        <div class="flex flex-col gap-2">
          <h1
            class="text-3xl md:text-4xl lg:text-[48px] font-bold text-[#291715] tracking-tight leading-tight"
          >
            Project Gallery
          </h1>
          <p class="text-base md:text-lg text-slate-600 max-w-[672px] leading-relaxed">
            Explore our portfolio of modular construction projects across various sectors,
            demonstrating our commitment to quality, speed, and design excellence.
          </p>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="border-b border-slate-200 pb-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-4 py-2 rounded-[2px] text-xs font-semibold tracking-[1.2px] uppercase whitespace-nowrap transition-all duration-200"
          :class="
            activeCategory === cat.id
              ? 'bg-brand-red text-white shadow-sm'
              : 'bg-[#f1f5f9] text-[#64748b] hover:bg-slate-200 hover:text-slate-900'
          "
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Bento Grid Gallery -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[260px] min-h-[500px]"
      >
        <div
          v-for="item in visibleItems"
          :key="item.id"
          @click="openModal(item)"
          class="group relative overflow-hidden rounded-[2px] shadow-md bg-white border border-slate-100 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          :class="item.gridSpan"
        >
          <!-- Background Image -->
          <div class="absolute inset-0 w-full h-full overflow-hidden">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          <!-- Gradient Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#291715]/90 via-[#291715]/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 p-6 flex flex-col justify-end text-white"
          >
            <!-- Category Tag -->
            <span
              class="text-xs font-semibold tracking-[1.2px] text-brand-red uppercase mb-1 drop-shadow-sm"
            >
              {{ item.category }}
            </span>

            <!-- Heading -->
            <h3
              class="font-bold tracking-tight text-white transition-colors duration-200"
              :class="
                item.gridSpan.includes('col-span-2') && item.gridSpan.includes('row-span-2')
                  ? 'text-2xl lg:text-3xl'
                  : 'text-lg lg:text-xl'
              "
            >
              {{ item.title }}
            </h3>

            <!-- Action Prompt on Hover -->
            <div
              class="flex items-center gap-2 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pt-2"
            >
              <span>View Case Study</span>
              <svg
                class="w-4 h-4 fill-none stroke-current stroke-2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State if filter returns no items -->
      <div
        v-if="filteredItems.length === 0"
        class="py-16 text-center flex flex-col items-center justify-center gap-3 bg-slate-50 rounded-[2px]"
      >
        <p class="text-slate-500 text-lg font-medium">
          No projects found in this category.
        </p>
        <button
          @click="activeCategory = 'ALL'"
          class="text-brand-red text-sm font-semibold underline"
        >
          View All Projects
        </button>
      </div>

      <!-- Load More Button Section -->
      <div
        v-if="hasMoreItems && filteredItems.length > 0"
        class="flex flex-col items-center pt-4"
      >
        <button
          @click="showAll = true"
          class="border border-[#291715] text-[#291715] hover:bg-[#291715] hover:text-white transition-colors px-[33px] py-[13px] rounded-[2px] text-xs font-semibold tracking-[0.6px] uppercase shadow-sm"
        >
          LOAD MORE PROJECTS
        </button>
      </div>
    </div>

    <!-- Project Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/70 backdrop-blur-sm transition-opacity"
        @click.self="closeModal"
      >
        <div
          class="bg-white rounded-[2px] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative"
        >
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Modal Image Side -->
          <div class="md:w-1/2 min-h-[300px] md:min-h-full relative bg-slate-900">
            <img
              :src="selectedItem.image"
              :alt="selectedItem.title"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Modal Content Side -->
          <div class="md:w-1/2 p-6 md:p-8 flex flex-col justify-between gap-6">
            <div class="space-y-4">
              <div>
                <span
                  class="text-xs font-semibold tracking-[1.2px] text-brand-red uppercase"
                >
                  {{ selectedItem.category }}
                </span>
                <h2 class="text-2xl md:text-3xl font-bold text-[#291715] mt-1">
                  {{ selectedItem.title }}
                </h2>
              </div>

              <p class="text-slate-600 leading-relaxed text-sm md:text-base">
                {{ selectedItem.description }}
              </p>

              <div class="space-y-2 pt-2 border-t border-slate-100">
                <h4 class="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Project Highlights
                </h4>
                <ul class="grid grid-cols-2 gap-2 text-xs md:text-sm text-slate-700">
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                    Fast Track Modular Build
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                    High Thermal Rating
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                    ISO 9001 Certified
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-red"></span>
                    Custom Interior Layout
                  </li>
                </ul>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <NuxtLink
                to="/quote"
                @click="closeModal"
                class="w-full bg-brand-red hover:bg-brand-red-hover text-white text-center font-semibold text-xs tracking-[0.6px] uppercase px-6 py-3 rounded-[2px] transition-colors"
              >
                REQUEST QUOTE FOR SIMILAR PROJECT
              </NuxtLink>
              <button
                @click="closeModal"
                class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs tracking-[0.6px] uppercase px-6 py-2.5 rounded-[2px] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useAppSeo } from "~/composables/useAppSeo";

const { setPageSeo, getBreadcrumbSchema } = useAppSeo();

interface GalleryItem {
  id: string;
  title: string;
  category: "SECURITY" | "COMMERCIAL" | "INDUSTRIAL" | "HEALTHCARE" | "EDUCATION";
  image: string;
  gridSpan: string;
  description: string;
}

const activeCategory = ref<string>("ALL");
const showAll = ref<boolean>(false);
const selectedItem = ref<GalleryItem | null>(null);

const categories = [
  { id: "ALL", label: "ALL" },
  { id: "HEALTHCARE", label: "HEALTHCARE" },
  { id: "INDUSTRIAL", label: "INDUSTRIAL" },
  { id: "COMMERCIAL", label: "COMMERCIAL" },
  { id: "SECURITY", label: "SECURITY" },
  { id: "EDUCATION", label: "EDUCATION" },
];

const galleryItems: GalleryItem[] = [
  {
    id: "item-1",
    title: "Premium Security Kiosk",
    category: "SECURITY",
    image: "/images/gallery/kiosk.png",
    gridSpan: "lg:col-span-2 lg:row-span-2 md:col-span-2 md:row-span-2",
    description:
      "High-security modular guard booth engineered for corporate entrances, government facilities, and critical infrastructure access control points.",
  },
  {
    id: "item-2",
    title: "Corporate Office Complex",
    category: "COMMERCIAL",
    image: "/images/gallery/office.png",
    gridSpan: "lg:col-span-2 lg:row-span-1 md:col-span-2 md:row-span-1",
    description:
      "Multi-storey energy-efficient modular headquarters featuring panoramic architectural glazing, quiet acoustic partitioning, and modern ergonomic workspaces.",
  },
  {
    id: "item-3",
    title: "Workforce Accommodation",
    category: "INDUSTRIAL",
    image: "/images/gallery/accommodation.png",
    gridSpan: "lg:col-span-1 lg:row-span-1 md:col-span-1 md:row-span-1",
    description:
      "Heavy-duty modular residential housing units designed to provide comfortable, climate-controlled living quarters for remote construction and industrial teams.",
  },
  {
    id: "item-4",
    title: "Modern Health Clinic",
    category: "HEALTHCARE",
    image: "/images/gallery/clinic.png",
    gridSpan: "lg:col-span-1 lg:row-span-2 md:col-span-1 md:row-span-2",
    description:
      "Rapidly deployable clinical facility designed with medical-grade sterile walling, integrated HVAC filtration, and full NHS-compliant accessibility.",
  },
  {
    id: "item-5",
    title: "Modular Classroom Block",
    category: "EDUCATION",
    image: "/images/gallery/education.png",
    gridSpan: "lg:col-span-1 lg:row-span-1 md:col-span-1 md:row-span-1",
    description:
      "Sustainable educational facility engineered for optimal acoustic comfort, bright daylighting, and adaptable learning environments for schools and colleges.",
  },
  {
    id: "item-6",
    title: "Winter Worker Camp Array",
    category: "INDUSTRIAL",
    image: "/images/hero-building-site.png",
    gridSpan: "lg:col-span-2 lg:row-span-1 md:col-span-2 md:row-span-1",
    description:
      "All-weather insulated modular camp complex specifically built to maintain internal warmth and structural integrity under severe weather conditions.",
  },
  {
    id: "item-7",
    title: "Rapid Deployment Medical Unit",
    category: "HEALTHCARE",
    image: "/images/hero-building-interior.png",
    gridSpan: "lg:col-span-2 lg:row-span-1 md:col-span-2 md:row-span-1",
    description:
      "Field-ready modular hospital extension offering emergency triage, patient isolation rooms, and diagnostic equipment housing.",
  },
  {
    id: "item-8",
    title: "Port Perimeter Checkpoint",
    category: "SECURITY",
    image: "/images/product-security-cabin-110.png",
    gridSpan: "lg:col-span-1 lg:row-span-1 md:col-span-1 md:row-span-1",
    description:
      "Weatherproof reinforced security cabin with 360-degree visibility, automated barrier control interfaces, and heavy climate shielding.",
  },
  {
    id: "item-9",
    title: "Commercial Retail Kiosk",
    category: "COMMERCIAL",
    image: "/images/hero-building-kiosk.png",
    gridSpan: "lg:col-span-1 lg:row-span-1 md:col-span-1 md:row-span-1",
    description:
      "Dynamic modular pop-up kiosk configured for high-street retail, customer service points, and event exhibitions.",
  },
];

const filteredItems = computed(() => {
  if (activeCategory.value === "ALL") {
    return galleryItems;
  }
  return galleryItems.filter((item) => item.category === activeCategory.value);
});

const visibleItems = computed(() => {
  if (showAll.value || activeCategory.value !== "ALL") {
    return filteredItems.value;
  }
  return filteredItems.value.slice(0, 6);
});

const hasMoreItems = computed(() => {
  return !showAll.value && activeCategory.value === "ALL" && filteredItems.value.length > 6;
});

const openModal = (item: GalleryItem) => {
  selectedItem.value = item;
};

const closeModal = () => {
  selectedItem.value = null;
};

setPageSeo({
  title: "Modular Building Project Gallery | Karmod International",
  description:
    "Explore Karmod's portfolio of modular construction projects across healthcare, commercial, industrial, security, and education sectors across the UK and internationally.",
  canonicalPath: "/gallery",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Project Gallery", path: "/gallery" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Karmod Modular Projects Gallery",
      description:
        "Portfolio of prefabricated structures, modular hospital wings, security checkpoints, and commercial kiosks.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: galleryItems.map((item, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: item.title,
          description: item.description,
        })),
      },
    },
  ],
});
</script>
