<template>
  <div class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-6">
      <NuxtLink to="/" class="text-sm font-semibold text-[#E31E24] hover:text-[#BA0013]">
        ← Return to Product Catalog
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Product Gallery & Spec Overview -->
      <div>
        <div class="structural-card h-96 flex flex-col items-center justify-center p-8 mb-6 text-center bg-white border border-slate-200">
          <UIcon name="i-heroicons-cube-transparent" class="w-32 h-32 text-[#E31E24] mb-4" />
          <h3 class="text-lg font-bold text-[#1F2937]">{{ product.name }}</h3>
          <p class="text-xs text-slate-500 mt-1">High Resolution Gallery & Sanity Media Hotspot</p>
        </div>

        <div class="structural-card p-6">
          <h3 class="text-lg font-bold text-[#1F2937] mb-4">Technical Specifications</h3>
          <div class="space-y-3 text-sm">
            <div v-for="spec in product.specs" :key="spec.key" class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-slate-500 font-medium">{{ spec.key }}</span>
              <span class="text-[#1F2937] font-semibold">{{ spec.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Customization & Add to Quote Panel -->
      <div class="structural-card p-8 flex flex-col justify-between">
        <div>
          <span class="label-caps text-[#E31E24] block mb-1">
            Catalog Item
          </span>
          <h1 class="text-3xl font-bold text-[#1F2937] mt-2 mb-2">{{ product.name }}</h1>
          <p class="text-slate-600 text-sm leading-relaxed mb-6">{{ product.description }}</p>

          <div class="mb-6 p-4 rounded-[4px] bg-slate-50 border border-slate-200">
            <div class="label-caps text-slate-500 mb-1">Indicative Base Price</div>
            <div class="text-3xl font-bold text-[#1F2937]">
              £{{ computedPrice }}
              <span class="text-xs font-normal text-slate-500"> (Excl. VAT & Delivery)</span>
            </div>
          </div>

          <!-- Variant Selector -->
          <div class="mb-6">
            <label class="label-caps text-slate-500 mb-2 block">Select Variant Option</label>
            <div class="space-y-2">
              <div 
                v-for="variant in product.variants" 
                :key="variant.label"
                @click="selectedVariant = variant"
                :class="[
                  'p-4 rounded-[4px] border cursor-pointer transition-all flex items-center justify-between',
                  selectedVariant.label === variant.label 
                    ? 'border-[#E31E24] bg-red-50 text-[#1F2937] shadow-sm' 
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                ]"
              >
                <div>
                  <div class="font-bold text-sm">{{ variant.label }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ variant.description }}</div>
                </div>
                <div class="text-sm font-semibold text-[#E31E24]">
                  {{ variant.priceModifier >= 0 ? `+£${variant.priceModifier}` : `-£${Math.abs(variant.priceModifier)}` }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="mb-6">
            <label class="label-caps text-slate-500 mb-2 block">Quantity</label>
            <div class="flex items-center gap-3">
              <button @click="quantity = Math.max(1, quantity - 1)" class="w-10 h-10 rounded-[4px] bg-slate-100 border border-slate-200 text-[#1F2937] font-bold hover:bg-slate-200">-</button>
              <input type="number" v-model.number="quantity" min="1" class="w-20 text-center py-2 bg-white border border-slate-300 rounded-[4px] font-bold text-[#1F2937]" />
              <button @click="quantity++" class="w-10 h-10 rounded-[4px] bg-slate-100 border border-slate-200 text-[#1F2937] font-bold hover:bg-slate-200">+</button>
            </div>
          </div>

          <!-- Custom Item Notes -->
          <div class="mb-6">
            <label class="label-caps text-slate-500 mb-2 block">Custom Modifications / Item Notes (Optional)</label>
            <textarea 
              v-model="customNotes"
              rows="2" 
              placeholder="e.g. Specify custom door placement, RAL color code, or power point positions..."
              class="w-full bg-white border border-slate-300 rounded-[4px] p-3 text-sm text-[#1F2937] placeholder-slate-400 focus:outline-none focus:border-[#E31E24]"
            ></textarea>
          </div>
        </div>

        <div>
          <!-- Notification Toast Banner -->
          <div v-if="addedBanner" class="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-[4px] flex items-center justify-between">
            <span>✓ Added to your Quote List!</span>
            <NuxtLink to="/quote" class="underline font-bold text-emerald-900">View Quote List →</NuxtLink>
          </div>

          <button 
            @click="handleAddToQuote"
            class="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <UIcon name="i-heroicons-plus-circle" class="w-5 h-5" />
            Add Selected Unit to Quote List
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

const product = ref({
  id: 'prod-detail-1',
  name: 'Karmod Modular Retail Kiosk Unit 3m',
  slug: route.params.slug as string,
  basePrice: 4200,
  description: 'Versatile insulated kiosk structure suitable for coffee shops, ticket counters, information stalls, and site offices.',
  specs: [
    { key: 'External Dimensions', value: '3.00m x 2.40m x 2.60m' },
    { key: 'Wall Panel Insulation', value: '50mm Polyurethane Sandwich Panel' },
    { key: 'Roof Insulation', value: '80mm Mineral Wool with Galvanized Steel Decking' },
    { key: 'Window Counter', value: 'Aluminium Heavy-Duty Roller Shutter Window' },
    { key: 'Electrical Package', value: 'Consumer Unit, LED Panel Light, 2x Twin Sockets' }
  ],
  variants: [
    { label: 'Standard Configuration', priceModifier: 0, description: 'Base 3m unit with standard white finish & single shutter window.' },
    { label: 'Thermal Plus Insulation (+100mm)', priceModifier: 450, description: 'Upgraded polyurethane insulation package for extreme weather durability.' },
    { label: 'Dual Counter & Double Window Pack', priceModifier: 620, description: 'Adds second serving window counter on side wall.' }
  ]
})

const selectedVariant = ref(product.value.variants[0])
const quantity = ref(1)
const customNotes = ref('')
const addedBanner = ref(false)

const computedPrice = computed(() => {
  return product.value.basePrice + selectedVariant.value.priceModifier
})

function handleAddToQuote() {
  quoteStore.addItem({
    productId: product.value.id,
    productName: product.value.name,
    productSlug: product.value.slug,
    variantLabel: selectedVariant.value.label,
    basePrice: computedPrice.value,
    quantity: quantity.value,
    notes: customNotes.value
  })

  addedBanner.value = true
  setTimeout(() => {
    addedBanner.value = false
  }, 4000)
}
</script>
