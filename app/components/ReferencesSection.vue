<template>
  <ReferencesMarquee :references="tiles" />
</template>

<script setup lang="ts">
import { useRuntimeConfig, useSanityQuery } from "#imports";
import { computed } from "vue";
import { REFERENCES_QUERY, type ClientReference } from "~/queries/references";
import { toReferenceTiles } from "~/utils/referenceTiles";

const config = useRuntimeConfig();
const { data: references } =
  await useSanityQuery<ClientReference[]>(REFERENCES_QUERY);

const tiles = computed(() =>
  toReferenceTiles(
    references.value,
    config.public.sanityProjectId,
    config.public.sanityDataset,
  ),
);
</script>
