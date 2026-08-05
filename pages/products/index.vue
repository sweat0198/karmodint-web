<template>
  <div class="w-full bg-white min-h-screen py-12 px-6 lg:px-12 flex justify-center">
    <div class="max-w-[1280px] w-full flex flex-col gap-8">
      
      <!-- Nav - Breadcrumbs -->
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-xs font-semibold tracking-wider text-brand-slate-muted uppercase flex-wrap">
        <NuxtLink to="/products" class="hover:text-brand-navy-heading transition-colors">Products</NuxtLink>
        <svg class="w-3 h-3 text-brand-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="hover:text-brand-navy-heading cursor-pointer transition-colors">{{ activeCategory }}</span>
        <svg class="w-3 h-3 text-brand-slate-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-brand-navy-heading font-bold">{{ activeSubcategory }}</span>
      </nav>

      <!-- Main Layout Container: Sidebar + Product Grid -->
      <div class="flex flex-col lg:flex-row gap-8 items-start w-full">
        
        <!-- Sidebar - Categories (290px width) -->
        <aside class="w-full lg:w-[290px] shrink-0 bg-white border border-slate-100 rounded-[4px] p-6 shadow-sm">
          <h2 class="text-brand-navy-heading text-2xl font-semibold tracking-tight mb-6">
            Categories
          </h2>

          <div class="space-y-4">
            <div 
              v-for="cat in categories" 
              :key="cat.name"
              class="flex flex-col"
            >
              <!-- Parent Category Header -->
              <button 
                @click="toggleCategory(cat.name)"
                class="flex items-center justify-between w-full text-left py-1 text-lg font-medium transition-colors"
                :class="activeCategory === cat.name ? 'text-brand-navy-heading font-semibold' : 'text-brand-slate-muted hover:text-brand-navy-heading'"
              >
                <span>{{ cat.name }}</span>
                <svg 
                  class="w-4 h-4 transition-transform duration-200" 
                  :class="{ 'rotate-180': expandedCategory === cat.name }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Subcategories Accordion List -->
              <div 
                v-if="expandedCategory === cat.name && cat.subcategories.length" 
                class="ml-4 mt-2 border-l border-slate-200 space-y-1"
              >
                <button
                  v-for="sub in cat.subcategories"
                  :key="sub"
                  @click="selectSubcategory(sub, cat.name)"
                  class="w-full text-left py-2 px-4 text-sm transition-all block"
                  :class="activeSubcategory === sub 
                    ? 'bg-brand-rose-card border-l-2 border-brand-red text-brand-navy-heading font-bold' 
                    : 'text-brand-slate-muted hover:text-brand-navy-heading font-normal'"
                >
                  {{ sub }}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Product Grid Section -->
        <main class="flex-1 w-full flex flex-col gap-6">
          
          <!-- Category Title & Description -->
          <div class="flex flex-col gap-2 pb-2">
            <h1 class="text-brand-navy-heading text-3xl font-bold tracking-tight">
              {{ activeSubcategory }}
            </h1>
            <p class="text-brand-slate-muted text-base leading-relaxed">
              Durable, high-performance modular units and cabins tailored for site facilities, offices, and custom requirements.
            </p>
          </div>

          <!-- Product Cards Grid (3 Columns) -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="bg-white border border-slate-100 rounded-[4px] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <!-- Thumbnail Header -->
              <div class="bg-slate-50 h-[192px] p-4 flex items-center justify-center relative border-b border-slate-100">
                <img 
                  :src="product.image" 
                  :alt="product.name" 
                  class="max-h-[160px] w-auto object-contain mix-blend-multiply transition-transform hover:scale-105 duration-300"
                />
              </div>

              <!-- Content Body -->
              <div class="p-6 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <h3 class="text-brand-navy-heading text-xl font-bold mb-4 leading-snug">
                    {{ product.name }}
                  </h3>

                  <!-- Feature Icons & Specs -->
                  <div class="space-y-3">
                    <div 
                      v-for="(spec, idx) in product.specs" 
                      :key="idx" 
                      class="flex items-center gap-2 text-sm text-brand-slate-muted"
                    >
                      <svg class="w-4 h-4 text-brand-red shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{{ spec }}</span>
                    </div>
                  </div>
                </div>

                <!-- Pricing & Action Button -->
                <div class="pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div>
                    <span class="text-brand-slate-muted text-xs font-semibold tracking-wider uppercase block">FROM</span>
                    <div class="flex items-baseline gap-1.5 mt-0.5">
                      <span class="text-brand-navy-heading text-2xl font-bold">
                        £{{ product.price.toLocaleString() }}
                      </span>
                      <span class="text-brand-slate-muted text-sm">+ VAT</span>
                    </div>
                  </div>

                  <button 
                    @click="handleSelect(product)"
                    class="w-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold tracking-wider uppercase py-3 rounded-[2px] transition-colors text-center"
                  >
                    SELECT &amp; CUSTOMIZE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- Footer CTA Section -->
      <section class="bg-brand-rose-bg border border-brand-rose-border rounded-[4px] p-8 lg:p-12 text-center flex flex-col items-center gap-4 mt-8 shadow-sm">
        <h2 class="text-brand-navy-heading text-2xl font-semibold tracking-tight">
          Need a custom configuration not listed here?
        </h2>
        <p class="text-brand-slate-muted text-base max-w-2xl leading-relaxed">
          Our engineering team can design and build bespoke units tailored to your exact site requirements, including specialized glazing, reinforced panels, and integrated facilities.
        </p>
        <NuxtLink 
          to="/about-contact#contact"
          class="mt-2 border border-brand-navy-heading text-brand-navy-heading hover:bg-brand-navy-heading hover:text-white px-8 py-3 rounded-[2px] text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Request Callback
        </NuxtLink>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuoteStore } from '~/stores/quote'

useHead({
  title: 'Products & Cabins | Karmod International',
  meta: [
    { name: 'description', content: 'Explore Karmod standard modular units, security cabins, gatehouses, and portable accommodation.' }
  ]
})

const router = useRouter()
const route = useRoute()
const quoteStore = useQuoteStore()

const activeCategory = ref('Standard Units')
const activeSubcategory = ref('Security Cabins')
const expandedCategory = ref('Standard Units')

const categories = ref([
  {
    name: 'Standard Units',
    subcategories: ['Accommodation', 'Security Cabins', 'Sanitary Units']
  },
  {
    name: 'Modular Buildings',
    subcategories: ['Site Offices', 'Classrooms', 'Healthcare Units']
  },
  {
    name: 'Container Conversions',
    subcategories: ['Pop-up Shops', 'Storage Units', 'Workshops']
  },
  {
    name: 'Flat Pack Solutions',
    subcategories: ['K2004 Series', 'Quick Build Cabins']
  }
])

function toggleCategory(catName: string) {
  expandedCategory.value = expandedCategory.value === catName ? '' : catName
}

function selectSubcategory(sub: string, parentCatName?: string) {
  activeSubcategory.value = sub
  if (parentCatName) {
    activeCategory.value = parentCatName
    expandedCategory.value = parentCatName
  } else {
    const parent = categories.value.find(c => c.subcategories.includes(sub))
    if (parent) {
      activeCategory.value = parent.name
      expandedCategory.value = parent.name
    }
  }

  router.replace({
    query: {
      ...route.query,
      category: activeCategory.value.toLowerCase().replace(/\s+/g, '-'),
      subcategory: sub.toLowerCase().replace(/\s+/g, '-')
    }
  })
}

onMounted(() => {
  const queryCat = route.query.category as string
  const querySub = route.query.subcategory as string

  if (queryCat || querySub) {
    categories.value.forEach(cat => {
      const matchCat = cat.name.toLowerCase().replace(/\s+/g, '-') === queryCat
      if (matchCat || querySub) {
        cat.subcategories.forEach(sub => {
          if (sub.toLowerCase().replace(/\s+/g, '-') === querySub) {
            activeSubcategory.value = sub
            activeCategory.value = cat.name
            expandedCategory.value = cat.name
          }
        })
      }
    })
  }
})

const products = [
  {
    id: 'sec-guard-house',
    name: 'Compact Guard House',
    slug: 'compact-guard-house',
    image: '/images/product-security-cabin-110.png',
    price: 2450,
    specs: [
      '1.5m x 1.5m External Dimensions',
      'Standard EPS Sandwich Insulation',
      '1 Security Door, 3 Windows'
    ]
  },
  {
    id: 'sec-std-gatehouse',
    name: 'Standard Gatehouse',
    slug: 'standard-gatehouse',
    image: '/images/product-service-cabin-135.png',
    price: 3100,
    specs: [
      '2.0m x 2.0m External Dimensions',
      'Premium PUR Thermal Insulation',
      '1 Security Door, 3 Large Windows'
    ]
  },
  {
    id: 'sec-ext-access',
    name: 'Extended Access Cabin',
    slug: 'extended-access-cabin',
    image: '/images/product-container-k2004.png',
    price: 4250,
    specs: [
      '2.5m x 2.5m External Dimensions',
      'Integrated Electrics & Lighting',
      'Optional WC Module Integration'
    ]
  },
  {
    id: 'sec-multi-role',
    name: 'Multi-Role Security Office',
    slug: 'multi-role-security-office',
    image: '/images/product-container-k2004.png',
    price: 7800,
    specs: [
      '6.0m x 2.4m External Dimensions',
      'High Security Steel Doors & Windows',
      '2 Internal Compartments'
    ]
  }
]

function handleSelect(product: typeof products[0]) {
  quoteStore.addItem({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    variantLabel: activeSubcategory.value,
    basePrice: product.price,
    quantity: 1
  })
  router.push('/quote')
}
</script>
