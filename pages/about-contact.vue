<template>
  <div class="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mb-12">
      <span class="label-caps text-[#E31E24] block mb-2">Corporate Information</span>
      <h1 class="text-4xl font-bold text-[#1F2937] mb-4">About & Contact Karmod International</h1>
      <p class="text-slate-600 text-lg leading-relaxed">
        Karmod International Ltd is a global manufacturer of prefabricated structures, modular buildings, portable cabins, retail kiosks, security gatehouses, and ticket booths.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div class="structural-card p-8 space-y-6">
        <h2 class="text-2xl font-bold text-[#1F2937]">Direct Manufacturer Sales</h2>
        <p class="text-sm text-slate-600 leading-relaxed">
          Transitioning from our official eBay storefront, our web platform allows commercial clients, construction site managers, event operators, and private buyers to specify custom modular configurations directly.
        </p>

        <div class="space-y-4 pt-4 border-t border-slate-100">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-envelope" class="w-6 h-6 text-[#E31E24]" />
            <div>
              <div class="label-caps text-slate-500">Enquiry Email</div>
              <div class="text-[#1F2937] font-bold">enquiries@karmod-international.com</div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-globe-alt" class="w-6 h-6 text-[#E31E24]" />
            <div>
              <div class="label-caps text-slate-500">Global Operations</div>
              <div class="text-[#1F2937] font-bold">UK & International Shipping Available</div>
            </div>
          </div>
        </div>
      </div>

      <div class="structural-card p-8">
        <h2 class="text-2xl font-bold text-[#1F2937] mb-2">General Inquiries</h2>
        <p class="text-xs text-slate-500 mb-6">For general questions or technical advice, leave us a message.</p>

        <form @submit.prevent="sent = true" class="space-y-4">
          <div>
            <label class="label-caps text-slate-500 mb-1 block">Your Name</label>
            <input type="text" required class="w-full bg-white border border-slate-300 rounded-[4px] px-3.5 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#E31E24]" />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">Email Address</label>
            <input type="email" required class="w-full bg-white border border-slate-300 rounded-[4px] px-3.5 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#E31E24]" />
          </div>

          <div>
            <label class="label-caps text-slate-500 mb-1 block">Message</label>
            <textarea rows="4" required class="w-full bg-white border border-slate-300 rounded-[4px] px-3.5 py-2 text-sm text-[#1F2937] focus:outline-none focus:border-[#E31E24]"></textarea>
          </div>

          <div v-if="sent" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[4px]">
            Message sent! Our team will reply shortly.
          </div>

          <button type="submit" class="btn-primary w-full py-3 text-sm font-semibold">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const sent = ref(false)
</script>
