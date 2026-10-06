<template>
  <article class="bg-white border border-slate-100 rounded shadow-sm overflow-hidden flex flex-col justify-between">
    <div class="bg-slate-50 h-60 p-4 flex items-center justify-center relative border-b border-slate-100">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="card.representativeImage?.alt ?? `${card.productName} representative image`"
        class="max-h-full max-w-full object-contain mix-blend-multiply"
      >
      <span v-else class="text-sm text-brand-slate-muted">Image coming soon</span>
      <span
        v-if="card.representativeImage"
        class="absolute left-3 bottom-3 rounded bg-white/90 px-2 py-1 text-[11px] font-semibold text-brand-navy-heading shadow-sm"
      >
        Representative image
      </span>
    </div>

    <div class="p-6 flex flex-1 flex-col justify-between gap-6">
      <div>
        <h3 class="text-brand-navy-heading text-xl font-bold leading-snug">{{ card.productName }}</h3>
        <div class="mt-4">
          <p class="text-xs font-semibold tracking-wide uppercase text-brand-slate-muted">Available sizes</p>
          <ul class="mt-2 flex flex-wrap gap-2" aria-label="Available sizes">
            <li v-for="size in card.sizes" :key="size.sizeKey" class="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-brand-navy-heading">
              {{ size.sizeLabel }}
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <p class="text-brand-navy-heading text-2xl font-bold">
          <template v-if="card.isPoaOnly">Price on application</template>
          <template v-else>From £{{ card.lowestPrice?.toLocaleString() }}</template>
        </p>
        <p v-if="!card.isPoaOnly" class="mt-0.5 text-xs text-brand-slate-muted">+ VAT</p>
        <button
          type="button"
          class="mt-4 w-full bg-brand-red hover:bg-brand-red-hover text-white text-sm font-semibold py-2.5 px-3 rounded-xs transition-colors duration-150"
          @click="chooseSizeAndCustomize"
        >
          Choose size &amp; customize
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuoteStore } from '~/stores/quote'
import type { PortableContainerCard } from '~/utils/portableContainerCards'
import { sanityImageUrl } from '~/utils/sanityImageUrl'
import { resolveSanityImageConfig } from '~/utils/sanityImageConfig'

const props = defineProps<{ card: PortableContainerCard }>()
const router = useRouter()
const quoteStore = useQuoteStore()

const imageUrl = computed(() => {
  const { projectId, dataset } = resolveSanityImageConfig()
  return sanityImageUrl(props.card.representativeImage?.asset?._ref, projectId, dataset)
})

function chooseSizeAndCustomize() {
  quoteStore.addPortableContainer(props.card)
  router.push('/customize/')
}
</script>
