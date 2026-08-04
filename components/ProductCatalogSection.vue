<template>
  <section class="w-full bg-[#FFF8F7] border-t border-b border-[#E7BDB8] py-16 lg:py-24 px-6 lg:px-12 flex justify-center">
    <div class="max-w-[1184px] w-full flex flex-col gap-12">
      <!-- Section Header -->
      <div class="border-b border-[#E7BDB8] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="text-[#291715] text-2xl font-semibold tracking-[-0.24px]">
            Standard Modular Units
          </h2>
          <p class="text-[#64748b] text-base mt-1">
            Precision-engineered for immediate deployment.
          </p>
        </div>

        <NuxtLink 
          to="/categories/portable-cabins" 
          class="text-[#BA0013] hover:text-[#90000f] text-xs font-semibold tracking-[1.2px] uppercase inline-flex items-center gap-1 transition-colors"
        >
          <span>VIEW ALL SPECIFICATIONS</span>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </NuxtLink>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Product Card 1 -->
        <div 
          v-for="product in products" 
          :key="product.id"
          class="bg-white border border-[#E7BDB8]/30 rounded-[4px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group transition-all hover:shadow-lg"
        >
          <!-- Thumbnail Container -->
          <div class="bg-[#FFE9E6] h-[192px] relative overflow-hidden">
            <img 
              :src="product.image" 
              :alt="product.name" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div class="absolute top-4 right-4 bg-[#FFF8F7]/90 backdrop-blur-[2px] px-2.5 py-1 rounded-[2px] shadow-sm">
              <span class="text-[#291715] text-[12px] font-semibold tracking-[1.2px]">
                {{ product.categoryTag }}
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="p-6 flex flex-col flex-1 justify-between gap-6">
            <div>
              <h3 class="text-[#291715] text-xl font-normal mb-4">
                {{ product.name }}
              </h3>

              <!-- Specification Items -->
              <div class="flex flex-col gap-3">
                <div 
                  v-for="(spec, index) in product.specs" 
                  :key="index"
                  class="border-b border-[#E7BDB8]/50 pb-2.5 flex items-center justify-between text-sm"
                >
                  <span class="text-[#64748b] font-normal">{{ spec.label }}</span>
                  <span class="text-[#291715] font-medium">{{ spec.value }}</span>
                </div>
              </div>
            </div>

            <!-- Price & Action CTA -->
            <div class="flex flex-col gap-3 pt-2">
              <div>
                <span class="text-[#64748b] text-[12px] font-semibold tracking-[1.2px] uppercase block">
                  Starting From
                </span>
                <div class="flex items-baseline gap-1.5 mt-0.5">
                  <span class="text-[#BA0013] text-2xl font-semibold tracking-[-0.24px]">
                    £{{ product.price.toLocaleString() }}
                  </span>
                  <span class="text-[#64748b] text-sm font-normal">+ VAT</span>
                </div>
              </div>

              <button 
                @click="handleSelect(product)"
                class="w-full border border-[#3D4756] text-[#3D4756] hover:bg-[#3D4756] hover:text-white transition-colors text-[12px] font-semibold tracking-[0.6px] uppercase text-center py-2.5 rounded-[2px]"
              >
                SELECT &amp; CUSTOMIZE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useQuoteStore } from '~/stores/quote'

const quoteStore = useQuoteStore()
const router = useRouter()

const products = [
  {
    id: 'prod-k2004',
    name: 'Container K-2004',
    slug: 'container-k-2004',
    categoryTag: 'Flat Pack',
    image: '/images/product-container-k2004.png',
    price: 3450,
    specs: [
      { label: 'Dimensions', value: '3m x 7m' },
      { label: 'Insulation', value: '60mm EPS' },
      { label: 'Layout', value: 'Open Plan' }
    ]
  },
  {
    id: 'prod-sec110',
    name: 'Security Cabin 110',
    slug: 'security-cabin-110',
    categoryTag: 'Guard Hut',
    image: '/images/product-security-cabin-110.png',
    price: 1200,
    specs: [
      { label: 'Dimensions', value: '1.1m x 1.1m' },
      { label: 'Insulation', value: '40mm PUR' },
      { label: 'Glazing', value: '3-Side Visibility' }
    ]
  },
  {
    id: 'prod-serv135',
    name: 'Service Cabin 135',
    slug: 'service-cabin-135',
    categoryTag: 'Ticket Office',
    image: '/images/product-service-cabin-135.png',
    price: 1850,
    specs: [
      { label: 'Dimensions', value: '1.35m x 2.1m' },
      { label: 'Insulation', value: '40mm PUR' },
      { label: 'Features', value: 'Serving Hatch' }
    ]
  }
]

function handleSelect(product: typeof products[0]) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: product.categoryTag,
    basePrice: product.price,
    quantity: 1
  })
  router.push('/quote')
}
</script>
