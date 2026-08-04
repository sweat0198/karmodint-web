<template>
  <div class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Breadcrumb & Header -->
    <div class="mb-8">
      <NuxtLink to="/" class="text-sm font-semibold text-[#E31E24] hover:text-[#BA0013] flex items-center gap-1 mb-2">
        ← Back to Home
      </NuxtLink>
      <span class="label-caps text-slate-500 block mb-1">Catalog Category</span>
      <h1 class="text-4xl font-bold text-[#1F2937] capitalize">{{ categoryName }}</h1>
      <p class="text-slate-600 mt-2">Browse available units and request direct factory pricing.</p>
    </div>

    <!-- Product Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div 
        v-for="product in categoryProducts" 
        :key="product.id"
        class="structural-card p-6 flex flex-col justify-between hover:border-slate-300 transition-all"
      >
        <div>
          <div class="h-40 bg-slate-50 border border-slate-100 rounded-[4px] flex items-center justify-center mb-4">
            <UIcon name="i-heroicons-cube" class="w-16 h-16 text-slate-400" />
          </div>
          <span class="label-caps text-[#E31E24] block mb-1">Indicative Base Price</span>
          <div class="text-2xl font-bold text-[#1F2937] mb-2">£{{ product.basePrice }}</div>
          <h3 class="text-xl font-bold text-[#1F2937] mb-2">{{ product.name }}</h3>
          <p class="text-sm text-slate-600 mb-4">{{ product.description }}</p>
        </div>

        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <NuxtLink :to="`/products/${product.slug}`" class="text-sm font-semibold text-slate-700 hover:text-[#1F2937]">
            Details & Variants
          </NuxtLink>
          <button 
            @click="addToQuote(product)"
            class="btn-primary px-4 py-2 text-xs font-semibold"
          >
            Add to Quote List
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useQuoteStore } from '~/stores/quote'

const route = useRoute()
const quoteStore = useQuoteStore()

const categorySlug = computed(() => route.params.slug as string)
const categoryName = computed(() => categorySlug.value.replace(/-/g, ' '))

const categoryProducts = computed(() => [
  {
    id: `cat-${categorySlug.value}-1`,
    name: `Karmod Compact ${categoryName.value} Unit 15ft`,
    slug: `karmod-compact-${categorySlug.value}-15ft`,
    basePrice: 2800,
    description: `Heavy-duty insulated ${categoryName.value} unit designed for rapid site deployment.`
  },
  {
    id: `cat-${categorySlug.value}-2`,
    name: `Karmod Executive ${categoryName.value} Unit 24ft`,
    slug: `karmod-executive-${categorySlug.value}-24ft`,
    basePrice: 4950,
    description: `Expanded capacity ${categoryName.value} featuring upgraded insulation and sliding counter windows.`
  }
])

function addToQuote(product: any) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: 'Standard Spec',
    basePrice: product.basePrice,
    quantity: 1
  })
}
</script>
