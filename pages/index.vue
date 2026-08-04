<template>
  <div>
    <!-- Hero Banner -->
    <section class="relative py-20 overflow-hidden bg-[#F8FAFC] border-b border-slate-200">
      <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-red-50 border border-red-200 text-[#E31E24] label-caps mb-6">
            <span class="w-2 h-2 rounded-full bg-[#E31E24]"></span>
            Direct Manufacturer Enquiries
          </div>
          <h1 class="text-4xl sm:text-6xl font-bold text-[#1F2937] tracking-tight leading-tight mb-6">
            Modular Buildings, Cabins & <span class="text-[#E31E24]">Retail Kiosks</span>
          </h1>
          <p class="text-lg text-slate-600 leading-relaxed mb-8">
            Explore Karmod's official catalog of high-durability portable cabins, security gatehouses, ticket booths, and kiosk structures. Select your specifications, build a multi-item quote request, and get direct manufacturer pricing.
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <NuxtLink to="/categories/portable-cabins" class="btn-primary px-6 py-3.5 text-sm font-semibold shadow-sm inline-block">
              Browse Categories
            </NuxtLink>
            <NuxtLink to="/quote" class="btn-secondary px-6 py-3.5 text-sm font-semibold inline-block">
              View Quote List ({{ quoteStore.totalItemsCount }})
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Categories Section -->
    <section class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-16">
        <span class="label-caps text-[#E31E24] block mb-2">Architectural Modules</span>
        <h2 class="text-3xl font-bold text-[#1F2937]">Product Categories</h2>
        <p class="text-slate-600 mt-2">Find the right modular unit or cabin structure for your site.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NuxtLink 
          v-for="cat in categories" 
          :key="cat.slug" 
          :to="`/categories/${cat.slug}`"
          class="structural-card p-6 hover:border-[#E31E24] transition-all group"
        >
          <div class="w-12 h-12 rounded-[4px] bg-red-50 border border-red-100 flex items-center justify-center text-[#E31E24] text-2xl mb-4 group-hover:bg-[#E31E24] group-hover:text-white transition-colors">
            <UIcon :name="cat.icon" />
          </div>
          <h3 class="text-xl font-bold text-[#1F2937] group-hover:text-[#E31E24] transition-colors mb-2">{{ cat.name }}</h3>
          <p class="text-sm text-slate-600 leading-relaxed">{{ cat.description }}</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products Showcase -->
    <section class="py-16 bg-white border-y border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-12">
          <div>
            <span class="label-caps text-[#E31E24] block mb-1">Standard Configurations</span>
            <h2 class="text-3xl font-bold text-[#1F2937]">Featured Models</h2>
            <p class="text-slate-600 mt-1">Popular pre-configured cabins & kiosk units ready for specification.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="product in featuredProducts" 
            :key="product.id"
            class="structural-card overflow-hidden flex flex-col hover:border-slate-300 transition-all"
          >
            <div class="h-48 bg-slate-50 flex items-center justify-center relative p-4 border-b border-slate-100">
              <div class="text-slate-500 text-center">
                <UIcon :name="product.icon" class="w-16 h-16 text-slate-400 mb-2" />
                <span class="label-caps block text-slate-500">{{ product.categoryName }}</span>
              </div>
              <span class="absolute top-3 right-3 px-3 py-1 bg-[#E31E24] text-white font-bold text-xs rounded-[4px]">
                From £{{ product.basePrice }}
              </span>
            </div>

            <div class="p-6 flex flex-col flex-grow">
              <h3 class="text-xl font-bold text-[#1F2937] mb-2">{{ product.name }}</h3>
              <p class="text-sm text-slate-600 mb-4 line-clamp-2">{{ product.description }}</p>

              <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <NuxtLink :to="`/products/${product.slug}`" class="text-sm font-semibold text-[#E31E24] hover:text-[#BA0013]">
                  View Specs →
                </NuxtLink>
                <button 
                  @click="quickAddToQuote(product)"
                  class="btn-primary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  <UIcon name="i-heroicons-plus" class="w-4 h-4" />
                  Add to Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useQuoteStore } from '~/stores/quote'

const quoteStore = useQuoteStore()

const categories = [
  { slug: 'portable-cabins', name: 'Portable Cabins', description: 'Insulated mobile site offices, accommodation, and utility cabins.', icon: 'i-heroicons-home' },
  { slug: 'kiosks', name: 'Retail & Food Kiosks', description: 'Customizable kiosks for food vendors, retail stalls, and information desks.', icon: 'i-heroicons-building-storefront' },
  { slug: 'gatehouses', name: 'Gatehouses & Security', description: 'High-visibility security control rooms and site perimeter guard cabins.', icon: 'i-heroicons-shield-check' },
  { slug: 'ticket-booths', name: 'Ticket Booths', description: 'Compact entrance booths equipped with counter windows for event facilities.', icon: 'i-heroicons-ticket' }
]

const featuredProducts = [
  {
    id: 'prod-1',
    name: 'Karmod Standard Office Cabin 20ft',
    slug: 'karmod-standard-office-cabin-20ft',
    categoryName: 'Portable Cabins',
    basePrice: 3450,
    description: '20ft x 8ft insulated steel frame office cabin with double-glazed window and electric heating package.',
    icon: 'i-heroicons-home'
  },
  {
    id: 'prod-2',
    name: 'Karmod Premium Security Gatehouse 2.2m',
    slug: 'karmod-premium-security-gatehouse-22m',
    categoryName: 'Gatehouses',
    basePrice: 2150,
    description: '360-degree glass perimeter guard booth with sliding glass counter window and insulated GRP sandwich panels.',
    icon: 'i-heroicons-shield-check'
  },
  {
    id: 'prod-3',
    name: 'Karmod Modular Retail Kiosk Unit 3m',
    slug: 'karmod-modular-retail-kiosk-unit-3m',
    categoryName: 'Kiosks',
    basePrice: 4200,
    description: '3m x 2m modern fiberglass retail kiosk with shutter window and heavy-duty floor structure.',
    icon: 'i-heroicons-building-storefront'
  }
]

function quickAddToQuote(product: any) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: 'Standard Configuration',
    basePrice: product.basePrice,
    quantity: 1
  })
}
</script>
