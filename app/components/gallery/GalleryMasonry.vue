<template>
  <div>
    <div
      class="flex items-center gap-3 overflow-x-auto border-b border-slate-200 pb-4 no-scrollbar"
      role="tablist"
      aria-label="Filter projects by category"
    >
      <button
        type="button"
        role="tab"
        :aria-selected="activeCategory === ALL"
        data-gallery-chip="ALL"
        class="flex items-center gap-1.5 whitespace-nowrap rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-[1.2px] transition-all duration-200"
        :class="
          activeCategory === ALL
            ? 'bg-brand-red text-white shadow-sm'
            : 'bg-slate-100 text-brand-slate-muted hover:bg-slate-200 hover:text-slate-900'
        "
        @click="activeCategory = ALL"
      >
        All projects
        <span class="text-[11px] font-medium normal-case tracking-normal opacity-60">{{
          tiles.length
        }}</span>
      </button>
      <button
        v-for="category in categories"
        :key="category.slug"
        type="button"
        role="tab"
        :aria-selected="activeCategory === category.slug"
        :data-gallery-chip="category.slug"
        class="flex items-center gap-1.5 whitespace-nowrap rounded-xs px-4 py-2 text-xs font-semibold uppercase tracking-[1.2px] transition-all duration-200"
        :class="
          activeCategory === category.slug
            ? 'bg-brand-red text-white shadow-sm'
            : 'bg-slate-100 text-brand-slate-muted hover:bg-slate-200 hover:text-slate-900'
        "
        @click="activeCategory = category.slug"
      >
        {{ category.name }}
        <span class="text-[11px] font-medium normal-case tracking-normal opacity-60">{{
          category.count
        }}</span>
      </button>
    </div>

    <p data-gallery-count class="py-4 text-sm text-brand-slate-muted">
      {{ filteredTiles.length }} {{ filteredTiles.length === 1 ? "project" : "projects" }}
    </p>

    <div
      v-if="filteredTiles.length === 0"
      class="flex flex-col items-center justify-center gap-3 rounded-xs bg-slate-50 py-16 text-center"
    >
      <p class="text-lg font-medium text-slate-500">No projects found in this category.</p>
      <button
        type="button"
        class="text-sm font-semibold text-brand-red underline"
        @click="activeCategory = ALL"
      >
        View All Projects
      </button>
    </div>

    <div v-else ref="gridEl" class="relative" :style="layout ? { height: layout.height + 'px' } : undefined">
      <div v-if="!layout" class="columns-2 gap-3 sm:columns-3 lg:columns-4">
        <div v-for="tile in filteredTiles" :key="tile.id" class="mb-3 break-inside-avoid">
          <GalleryTile :tile="tile" @select="openLightbox(tile.id)" />
        </div>
      </div>
      <template v-else>
        <div
          v-for="tile in filteredTiles"
          :key="tile.id"
          class="absolute transition-[left,top,width,height] duration-200 ease-out"
          :style="tilePlacementStyle(tile.id)"
        >
          <GalleryTile :tile="tile" @select="openLightbox(tile.id)" />
        </div>
      </template>
    </div>

    <Teleport to="body">
      <div
        v-if="openTile"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm md:p-8"
        role="dialog"
        aria-modal="true"
        :aria-label="openTile.title"
        @click.self="closeLightbox"
        @keydown="onKeydown"
      >
        <div
          class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-y-auto rounded-xs bg-white shadow-2xl md:flex-row"
        >
          <button
            type="button"
            class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black"
            aria-label="Close"
            @click="closeLightbox"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="min-h-[300px] bg-slate-900 md:min-h-full md:w-1/2">
            <img
              :src="openTile.image.src"
              :srcset="openTile.image.srcset"
              sizes="(min-width: 768px) 50vw, 100vw"
              :alt="openTile.image.alt"
              class="h-full w-full object-cover"
            />
          </div>

          <div class="flex flex-col justify-between gap-6 p-6 md:w-1/2 md:p-8">
            <div class="space-y-4">
              <div>
                <span class="text-xs font-semibold uppercase tracking-[1.2px] text-brand-red">{{
                  openTile.category.name
                }}</span>
                <h2 class="mt-1 text-2xl font-bold text-brand-navy-heading md:text-3xl">
                  {{ openTile.title }}
                </h2>
              </div>
              <p v-if="openTile.description" class="text-sm leading-relaxed text-slate-600 md:text-base">
                {{ openTile.description }}
              </p>
            </div>

            <div class="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <NuxtLink
                to="/quote"
                class="w-full rounded-xs bg-brand-red px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.6px] text-white transition-colors hover:bg-brand-red-hover"
                @click="closeLightbox"
              >
                Request a quote for a similar project
              </NuxtLink>
              <button
                type="button"
                class="w-full rounded-xs bg-slate-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.6px] text-slate-700 transition-colors hover:bg-slate-200"
                @click="closeLightbox"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import GalleryTile from "~/components/gallery/GalleryTile.vue";
import type { GalleryTile as GalleryTileData } from "~/types/gallery";
import { computeMasonryLayout, resolveGalleryColumns } from "~/utils/galleryLayout";

const ALL = "ALL";
/** Wide/panoramic photos span two columns instead of being squeezed into one. */
const WIDE_AT = 1.7;
/** Lets each column's last tile stretch a little to square off the bottom edge. */
const FLUSH = 0.08;

const props = defineProps<{ tiles: GalleryTileData[] }>();

const activeCategory = ref<string>(ALL);
const openTileId = ref<string | null>(null);
const gridEl = ref<HTMLElement | null>(null);
const containerWidth = ref(0);

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!gridEl.value || typeof ResizeObserver === "undefined") return;
  resizeObserver = new ResizeObserver((entries) => {
    const width = entries[0]?.target.getBoundingClientRect().width;
    if (width) containerWidth.value = width;
  });
  resizeObserver.observe(gridEl.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

interface CategoryOption {
  slug: string;
  name: string;
  displayOrder: number;
  count: number;
}

const categories = computed<CategoryOption[]>(() => {
  const bySlug = new Map<string, CategoryOption>();
  for (const tile of props.tiles) {
    const existing = bySlug.get(tile.category.slug);
    if (existing) {
      existing.count += 1;
    } else {
      bySlug.set(tile.category.slug, {
        slug: tile.category.slug,
        name: tile.category.name,
        displayOrder: tile.category.displayOrder ?? Number.MAX_SAFE_INTEGER,
        count: 1,
      });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name),
  );
});

const filteredTiles = computed(() =>
  activeCategory.value === ALL
    ? props.tiles
    : props.tiles.filter((tile) => tile.category.slug === activeCategory.value),
);

const layout = computed(() => {
  if (!containerWidth.value) return null;
  const { columns, gap } = resolveGalleryColumns(containerWidth.value);
  return computeMasonryLayout(
    filteredTiles.value.map((tile) => ({ id: tile.id, aspectRatio: tile.image.aspectRatio })),
    { containerWidth: containerWidth.value, columns, gap, wideAt: WIDE_AT, flush: FLUSH },
  );
});

function tilePlacementStyle(id: string) {
  const placement = layout.value?.placements.find((p) => p.id === id);
  if (!placement) return { display: "none" };
  return {
    left: `${placement.left}px`,
    top: `${placement.top}px`,
    width: `${placement.width}px`,
    height: `${placement.height}px`,
  };
}

const openTile = computed(
  () => props.tiles.find((tile) => tile.id === openTileId.value) ?? null,
);

function openLightbox(id: string) {
  openTileId.value = id;
}
function closeLightbox() {
  openTileId.value = null;
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeLightbox();
}
</script>
