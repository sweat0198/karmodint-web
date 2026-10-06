<template>
  <main class="flex min-h-screen w-full flex-col items-center bg-white">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-[60px] md:pt-[79px] lg:px-12">
      <div class="flex flex-col gap-4 items-start border-b border-slate-100 pb-6">
        <div class="flex flex-col gap-2">
          <h1
            class="text-3xl font-bold leading-tight tracking-tight text-brand-navy-heading md:text-4xl lg:text-5xl"
          >
            Project Gallery
          </h1>
          <p class="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Explore our portfolio of modular construction projects across various sectors,
            demonstrating our commitment to quality, speed, and design excellence.
          </p>
        </div>
      </div>

      <GalleryMasonry :tiles="tiles" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRuntimeConfig, useSanityQuery } from "#imports";
import GalleryMasonry from "~/components/gallery/GalleryMasonry.vue";
import { useAppSeo } from "~/composables/useAppSeo";
import { GALLERY_ENTRIES_QUERY, type GalleryEntry } from "~/queries/gallery";
import { toGalleryTiles } from "~/utils/galleryTiles";

const config = useRuntimeConfig();
const { setPageSeo, getBreadcrumbSchema } = useAppSeo();

const { data: entries } = await useSanityQuery<GalleryEntry[]>(GALLERY_ENTRIES_QUERY);

const tiles = computed(() =>
  toGalleryTiles(entries.value, config.public.sanityProjectId, config.public.sanityDataset),
);

setPageSeo({
  title: "Modular Building Project Gallery | Karmod International",
  description:
    "Explore Karmod's portfolio of modular construction projects across the UK and internationally, from portable cabins and containers to bulletproof security units.",
  canonicalPath: "/gallery/",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Project Gallery", path: "/gallery/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Karmod Modular Projects Gallery",
      description:
        "Portfolio of prefabricated structures, portable cabins, containers, and bulletproof security units delivered across the UK and internationally.",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: tiles.value.map((tile, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: tile.title,
          description: tile.description,
        })),
      },
    },
  ],
});
</script>
