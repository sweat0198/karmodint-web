<template>
  <section class="w-full py-16 lg:py-24 px-6 flex justify-center bg-white">
    <div class="max-w-[896px] w-full grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-6 items-start">
      <!-- Left Column: Details -->
      <div class="flex flex-col gap-6 pt-2">
        <div>
          <h2 class="text-brand-navy-heading text-3xl sm:text-[32px] font-bold leading-[38.4px] tracking-[-0.32px] mb-4">
            Discuss Your Project
          </h2>
          <p class="text-brand-slate-muted text-base sm:text-[18px] leading-[27px]">
            Our technical team is ready to assist with specifications, bespoke layouts, and complex deployments. Request a callback to get started.
          </p>
        </div>

        <div class="flex flex-col gap-6 pt-4">
          <!-- Item 1: Headquarters -->
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-[4px] bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h4 class="text-brand-navy-heading text-[18px] font-normal leading-[27px]">
                UK Headquarters
              </h4>
              <p class="text-brand-slate-muted text-base leading-[24px]">
                Unit 4, Industrial Estate<br />
                London, NW10 7RQ
              </p>
            </div>
          </div>

          <!-- Item 2: Sales & Support -->
          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-[4px] bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0 mt-0.5">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 class="text-brand-navy-heading text-[18px] font-normal leading-[27px]">
                Sales &amp; Support
              </h4>
              <a href="mailto:sales@karmodint.co.uk" class="text-brand-slate-muted hover:text-brand-red text-base leading-[24px] transition-colors">
                sales@karmodint.co.uk
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Callback Request Form -->
      <div class="bg-white border border-brand-rose-border/30 shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05),0px_4px_6px_-2px_rgba(0,0,0,0.1)] rounded-[8px] p-6 sm:p-[33px]">
        <div class="border-b border-brand-rose-border pb-4 mb-6">
          <h3 class="text-brand-navy-heading text-2xl font-semibold tracking-[-0.24px]">
            Request Callback
          </h3>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <!-- Full Name -->
          <div class="flex flex-col gap-1">
            <label class="text-[#5D3F3C] text-[12px] font-semibold tracking-[0.6px] uppercase">
              FULL NAME
            </label>
            <input 
              v-model="form.fullName" 
              type="text" 
              required
              placeholder="John Doe"
              class="w-full bg-white border border-brand-rose-border rounded-[2px] px-3 py-2.5 text-brand-navy-heading placeholder-[#6B7280] text-base focus:outline-none focus:border-brand-red transition-colors shadow-sm"
            />
          </div>

          <!-- Company Name -->
          <div class="flex flex-col gap-1">
            <label class="text-[#5D3F3C] text-[12px] font-semibold tracking-[0.6px] uppercase">
              COMPANY NAME
            </label>
            <input 
              v-model="form.companyName" 
              type="text" 
              required
              placeholder="Acme Construction Ltd"
              class="w-full bg-white border border-brand-rose-border rounded-[2px] px-3 py-2.5 text-brand-navy-heading placeholder-[#6B7280] text-base focus:outline-none focus:border-brand-red transition-colors shadow-sm"
            />
          </div>

          <!-- Phone Number -->
          <div class="flex flex-col gap-1">
            <label class="text-[#5D3F3C] text-[12px] font-semibold tracking-[0.6px] uppercase">
              PHONE NUMBER
            </label>
            <input 
              v-model="form.phone" 
              type="tel" 
              required
              placeholder="07123 456789"
              class="w-full bg-white border border-brand-rose-border rounded-[2px] px-3 py-2.5 text-brand-navy-heading placeholder-[#6B7280] text-base focus:outline-none focus:border-brand-red transition-colors shadow-sm"
            />
          </div>

          <!-- Primary Interest -->
          <div class="flex flex-col gap-1">
            <label class="text-[#5D3F3C] text-[12px] font-semibold tracking-[0.6px] uppercase">
              PRIMARY INTEREST
            </label>
            <div class="relative">
              <select 
                v-model="form.primaryInterest"
                class="w-full bg-white border border-brand-rose-border rounded-[2px] px-3 py-2.5 text-brand-navy-heading text-base appearance-none focus:outline-none focus:border-brand-red transition-colors shadow-sm pr-10"
              >
                <option value="Flat Pack Containers">Flat Pack Containers</option>
                <option value="Guard Huts & Gatehouses">Guard Huts &amp; Gatehouses</option>
                <option value="Ticket Booths & Kiosks">Ticket Booths &amp; Kiosks</option>
                <option value="Custom Modular Layout">Custom Modular Layout</option>
              </select>
              <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-brand-slate-muted">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="submitted"
            class="w-full bg-brand-red hover:bg-brand-red-dark text-white text-[12px] font-semibold tracking-[0.6px] uppercase py-3 rounded-[2px] transition-colors text-center mt-2 shadow-sm disabled:opacity-50"
          >
            {{ submitted ? 'REQUEST SENT' : 'SUBMIT REQUEST' }}
          </button>

          <p v-if="submitted" class="text-green-600 text-sm text-center font-medium mt-1">
            Thank you! We will get back to you shortly.
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref({
  fullName: '',
  companyName: '',
  phone: '',
  primaryInterest: 'Flat Pack Containers'
})

const submitted = ref(false)

function handleSubmit() {
  submitted.value = true
  setTimeout(() => {
    form.value = {
      fullName: '',
      companyName: '',
      phone: '',
      primaryInterest: 'Flat Pack Containers'
    }
  }, 3000)
}
</script>
