<template>
  <div>
    <GalleryFilterBar
      :categories="categories"
      :active-category="activeCategory"
      :total-count="tiles.length"
      @update:active-category="activeCategory = $event"
    />

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
          <GalleryTile :tile="tile" @select="openTileId = tile.id" />
        </div>
      </div>
      <template v-else>
        <div
          v-for="tile in filteredTiles"
          :key="tile.id"
          class="absolute"
          :style="placementToStyle(layout.placements.find((p) => p.id === tile.id))"
        >
          <GalleryTile :tile="tile" @select="openTileId = tile.id" />
        </div>
      </template>
    </div>

    <GalleryLightbox :tile="openTile" @close="openTileId = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import GalleryFilterBar from "~/components/gallery/GalleryFilterBar.vue";
import GalleryLightbox from "~/components/gallery/GalleryLightbox.vue";
import GalleryTile from "~/components/gallery/GalleryTile.vue";
import type { GalleryCategoryOption, GalleryTile as GalleryTileData } from "~/types/gallery";
import { computeMasonryLayout, placementToStyle, resolveGalleryColumns } from "~/utils/galleryLayout";

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

const categories = computed<GalleryCategoryOption[]>(() => {
  const bySlug = new Map<string, GalleryCategoryOption>();
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

const openTile = computed(
  () => props.tiles.find((tile) => tile.id === openTileId.value) ?? null,
);
</script>
