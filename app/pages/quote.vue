<template>
  <div class="w-full bg-white min-h-screen pb-16">
    <!-- Buy Flow Header (Step 3: Review) -->
    <BuyFlowHeader
      v-if="!submittedSuccess"
      :current-step="3"
      step-label="Step 3 of 4 • Specifications Summary & Review"
      title="Quote List & Enquiry"
      description="Review your selected modular structures and request direct factory pricing."
    >
      <template #actions>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/catalog"
            class="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-white hover:bg-slate-100 text-brand-navy-heading border border-slate-300 font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm hover:shadow"
          >
            <svg
              class="w-4 h-4 text-brand-slate-muted shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add More Items</span>
          </NuxtLink>

          <NuxtLink
            v-if="!quoteStore.isEmpty"
            to="/customize"
            class="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-red hover:bg-brand-red-hover text-white font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm hover:shadow"
          >
            <span>Customize Units</span>
            <svg
              class="w-4 h-4 text-white shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </NuxtLink>
        </div>
      </template>
    </BuyFlowHeader>

    <!-- Buy Flow Header (Step 4: Confirmation) -->
    <BuyFlowHeader
      v-else
      :current-step="4"
      step-label="Step 4 of 4 • Final Quote Confirmation"
      title="Quote Request Submitted!"
      description="Thank you for submitting your enquiry. A copy of your quote request has been dispatched to your email."
    >
      <template #actions>
        <NuxtLink
          to="/catalog"
          class="flex items-center justify-center gap-2 px-8 py-3 bg-brand-navy-heading hover:bg-brand-navy text-white font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors duration-150 shadow-sm hover:shadow"
        >
          <span>Return to Catalog</span>
        </NuxtLink>
      </template>
    </BuyFlowHeader>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <!-- Success Confirmation View (Step 4) -->
      <div v-if="submittedSuccess" class="structural-card p-12 text-center max-w-2xl mx-auto my-12 border-emerald-200">
        <div class="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl border border-emerald-200">
          ✓
        </div>
        <h2 class="text-3xl font-bold text-brand-navy-heading mb-4">Quote Request Submitted!</h2>
        <p class="text-slate-600 mb-6 leading-relaxed">
          Thank you for submitting your enquiry. A copy of your quote request has been dispatched to your email address (<strong>{{ customer.email }}</strong>), and our sales team is reviewing your specification.
        </p>
        <div class="flex justify-center gap-4">
          <NuxtLink to="/catalog" class="btn-primary px-6 py-3 text-sm font-semibold">
            Return to Catalog
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyQuoteState
        v-else-if="quoteStore.isEmpty"
        button-to="/catalog"
      />

    <!-- Active Quote List & Contact Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items Summary Column (2 cols) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 class="text-xl font-bold text-gray-800">Selected Units ({{ quoteStore.totalItemsCount }})</h2>
          <button @click="quoteStore.clearQuote()" class="text-xs text-brand-red hover:text-brand-red-dark font-semibold">Clear All</button>
        </div>

        <div 
          v-for="item in quoteStore.items" 
          :key="item.id"
          class="structural-card p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between"
        >
          <div class="flex gap-4 items-center">
            <div class="w-16 h-16 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-brand-red text-2xl flex-shrink-0">
              <UIcon name="i-heroicons-cube" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">{{ item.productName }}</h3>
              <p class="label-caps text-brand-red mt-0.5">{{ item.variantLabel || 'Standard Spec' }}</p>
              
              <!-- Configured Spec Summary Badges -->
              <div v-if="item.specSummary && item.specSummary.length" class="flex flex-wrap gap-1.5 mt-2">
                <span 
                  v-for="(spec, idx) in item.specSummary" 
                  :key="idx"
                  class="bg-slate-100 border border-slate-200 text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-xs"
                >
                  {{ spec.label }}: {{ spec.value }}
                </span>
              </div>

              <!-- Price Per Unit and Total -->
              <div class="mt-2 text-sm font-bold text-brand-navy-heading">
                £{{ ((item.customTotal || item.basePrice || 0) * item.quantity).toLocaleString() }}
                <span class="text-xs font-normal text-slate-500">(£{{ (item.customTotal || item.basePrice || 0).toLocaleString() }}/ea + VAT)</span>
              </div>

              <p v-if="item.notes" class="text-xs text-slate-500 italic mt-1">Note: "{{ item.notes }}"</p>
            </div>
          </div>

          <div class="flex items-center gap-6 w-full sm:w-auto justify-between border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
            <!-- Quantity Controls -->
            <div class="flex items-center gap-2">
              <button @click="quoteStore.updateQuantity(item.id, item.quantity - 1)" class="w-8 h-8 rounded bg-slate-100 border border-slate-200 text-gray-800 font-bold hover:bg-slate-200 text-sm">-</button>
              <span class="w-8 text-center font-bold text-gray-800 text-sm">{{ item.quantity }}</span>
              <button @click="quoteStore.updateQuantity(item.id, item.quantity + 1)" class="w-8 h-8 rounded bg-slate-100 border border-slate-200 text-gray-800 font-bold hover:bg-slate-200 text-sm">+</button>
            </div>

            <!-- Remove Action -->
            <button @click="quoteStore.removeItem(item.id)" class="text-slate-400 hover:text-brand-red p-2">
              <UIcon name="i-heroicons-trash" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Contact Details Form (1 col) -->
      <div class="structural-card p-6 h-fit">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Contact Details</h2>
        <p class="text-xs text-slate-500 mb-6">Enter your details to receive an official quote by email.</p>

        <form @submit.prevent="submitQuote" class="space-y-4">
          <div>
            <label class="label-caps text-slate-500 mb-1 block">Full Name *</label>
            <input 
              v-model="customer.name" 
              type="text" 
              required
              placeholder="John Doe"
              class="w-full bg-white border border-slate-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">Work Email *</label>
            <input 
              v-model="customer.email" 
              type="email" 
              required
              placeholder="john@company.com"
              class="w-full bg-white border border-slate-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">Phone Number</label>
            <input 
              v-model="customer.phone" 
              type="tel" 
              placeholder="+44 7123 456789"
              class="w-full bg-white border border-slate-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">Company / Site Name</label>
            <input 
              v-model="customer.company" 
              type="text" 
              placeholder="Acme Construction Ltd"
              class="w-full bg-white border border-slate-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
            />
          </div>

          <!-- Delivery Address Autocomplete & Logistics Distance Calculation -->
          <div>
            <UkAddressAutocomplete
              v-model="customer.address"
              label="Delivery Site Address"
              placeholder="Search postcode or address (e.g. LE14 4AJ)..."
              :show-manual-toggle="true"
              @select="onAddressSelected"
              @clear="onAddressCleared"
            />

            <!-- Real-time Logistics Distance Estimate -->
            <DeliveryDistanceCard
              :result="distanceResult"
              :is-loading="isCalculatingDistance"
            />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">General Instructions / Access Details</label>
            <textarea 
              v-model="customer.notes" 
              rows="3" 
              placeholder="Access restrictions, site contact, or target delivery date..."
              class="w-full bg-white border border-slate-300 rounded px-3.5 py-2 text-sm text-gray-800 focus:outline-none focus:border-brand-red"
            ></textarea>
          </div>

          <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-brand-red text-xs rounded">
            {{ errorMessage }}
          </div>

          <button 
            type="submit" 
            :disabled="submitting"
            class="btn-primary w-full py-3 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <UIcon v-if="submitting" name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
            <span>{{ submitting ? 'Submitting Request...' : 'Submit Combined Quote Request' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useQuoteStore } from '~/stores/quote'
import { useAppSeo } from '~/composables/useAppSeo'
import { useDeliveryDistance } from '~/composables/useDeliveryDistance'
import type { ParsedUkAddress } from '~/composables/useGooglePlacesAutocomplete'

const { setPageSeo } = useAppSeo()

setPageSeo({
  title: 'Review Quote & Request Pricing | Karmod International',
  description: 'Review chosen modular building specifications and submit for official direct quotation.',
  canonicalPath: '/quote',
  noindex: true
})

const quoteStore = useQuoteStore()
const {
  distanceResult,
  isLoading: isCalculatingDistance,
  calculateDistance,
  reset: resetDistance
} = useDeliveryDistance()

const customer = ref({
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '' as string | ParsedUkAddress,
  notes: ''
})

const submitting = ref(false)
const submittedSuccess = ref(false)
const errorMessage = ref('')

onMounted(() => {
  quoteStore.setLastVisitedRoute('/quote')
  if (customer.value.address) {
    calculateDistance(customer.value.address, { immediate: true })
  }
})

function onAddressSelected(address: ParsedUkAddress) {
  calculateDistance(address, { immediate: true })
}

function onAddressCleared() {
  resetDistance()
}

// Watch for manual address changes or dynamic updates
watch(
  () => customer.value.address,
  (newAddress) => {
    if (!newAddress) {
      resetDistance()
      return
    }
    calculateDistance(newAddress, { immediate: false, debounceMs: 450 })
  },
  { deep: true }
)

async function submitQuote() {
  if (!customer.value.name || !customer.value.email) return

  submitting.value = true
  errorMessage.value = ''

  try {
    const res: any = await $fetch('/api/quote', {
      method: 'POST',
      body: {
        items: quoteStore.items,
        customer: {
          ...customer.value,
          deliveryEstimate: distanceResult.value ? {
            miles: distanceResult.value.distance.miles,
            km: distanceResult.value.distance.km,
            duration: distanceResult.value.duration.formatted,
            originPostcode: distanceResult.value.origin.postcode,
            destinationPostcode: distanceResult.value.destination.postcode,
            provider: distanceResult.value.provider
          } : undefined
        }
      }
    })

    if (res?.success) {
      submittedSuccess.value = true
      quoteStore.clearQuote()
    } else {
      errorMessage.value = 'Failed to process request. Please check details.'
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err.message || 'Submission error.'
  } finally {
    submitting.value = false
  }
}
</script>
