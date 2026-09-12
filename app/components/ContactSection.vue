<template>
  <section
    class="w-full py-12 lg:py-20 px-6 lg:px-12 bg-slate-50 flex justify-center"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-12">
      <!-- 1. Top Split Section (Hero Visual + Consultation Form) -->
      <div
        class="bg-white border border-brand-rose-border rounded-lg shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-2"
      >
        <!-- Left Column: Illustrative Hero -->
        <div
          class="relative min-h-[380px] lg:min-h-[580px] flex flex-col justify-end p-8 lg:p-12 overflow-hidden"
        >
          <img
            src="/images/get-in-touch-metro-city.webp"
            alt="Illustration of engineers reviewing plans beside a Metro City security cabin and a two-storey modular office."
            width="1024"
            height="1536"
            fetchpriority="high"
            class="absolute inset-0 w-full h-full object-cover object-[center_30%]"
          />
          <!-- Dark Gradient Overlay -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
          ></div>

          <!-- Hero Content -->
          <div class="relative z-10 text-white space-y-3">
            <h1
              class="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight"
            >
              Get in Touch
            </h1>
            <p
              class="text-white/90 text-base lg:text-lg leading-relaxed max-w-md"
            >
              Discuss your next modular construction project with our
              engineering experts. We deliver precision-built solutions tailored
              to your operational requirements.
            </p>
          </div>
        </div>

        <!-- Right Column: Project Consultation Form -->
        <div class="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <h2
            class="text-brand-navy-heading text-2xl lg:text-3xl font-bold tracking-tight mb-6"
          >
            Project Consultation
          </h2>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Row 1: Full Name & Company -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label
                  class="text-brand-rose-text text-xs font-semibold uppercase tracking-[1.2px]"
                >
                  Full Name
                </label>
                <input
                  v-model="form.fullName"
                  type="text"
                  required
                  placeholder="John Doe"
                  class="w-full bg-white border border-brand-rose-border rounded px-4 py-3 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-brand-rose-text text-xs font-semibold uppercase tracking-[1.2px]"
                >
                  Company / Organization
                </label>
                <input
                  v-model="form.companyName"
                  type="text"
                  required
                  placeholder="BuildCo Ltd"
                  class="w-full bg-white border border-brand-rose-border rounded px-4 py-3 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <!-- Row 2: Business Email & Phone Number -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label
                  class="text-brand-rose-text text-xs font-semibold uppercase tracking-[1.2px]"
                >
                  Business Email
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="john@company.co.uk"
                  class="w-full bg-white border border-brand-rose-border rounded px-4 py-3 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label
                  class="text-brand-rose-text text-xs font-semibold uppercase tracking-[1.2px]"
                >
                  Phone Number
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  required
                  placeholder="+44 ..."
                  class="w-full bg-white border border-brand-rose-border rounded px-4 py-3 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:border-brand-red transition-colors"
                />
              </div>
            </div>

            <!-- Row 3: Project Details -->
            <div class="flex flex-col gap-2">
              <label
                class="text-brand-rose-text text-xs font-semibold uppercase tracking-[1.2px]"
              >
                Project Details
              </label>
              <textarea
                v-model="form.details"
                rows="4"
                placeholder="Briefly describe your requirements, scale, and timeline..."
                class="w-full bg-white border border-brand-rose-border rounded px-4 py-3 text-gray-700 placeholder-gray-400 text-base focus:outline-none focus:border-brand-red transition-colors resize-none"
              ></textarea>
            </div>

            <!-- Error Alert -->
            <div
              v-if="errorMessage"
              class="p-3 bg-red-50 border border-red-200 text-brand-red text-xs rounded"
            >
              {{ errorMessage }}
            </div>

            <!-- Success Alert -->
            <div
              v-if="submitted"
              class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded flex items-center gap-2"
            >
              <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Thank you! Your project consultation request has been submitted. Our engineering team will contact you shortly.</span>
            </div>

            <!-- Row 4: Submit Button -->
            <div class="flex justify-end pt-2">
              <button
                type="submit"
                :disabled="isSubmitting || submitted"
                class="bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold uppercase tracking-[1.2px] px-8 py-4 rounded transition-colors inline-flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <svg
                  v-if="isSubmitting"
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{{ isSubmitting ? "SENDING..." : submitted ? "REQUEST SENT" : "SUBMIT REQUEST" }}</span>
                <svg
                  v-if="!isSubmitting"
                  class="w-3.5 h-3.5"
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
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 2. Horizontal Contact Info Bar (3 Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Card 1: Direct Line -->
        <div
          class="bg-white border border-brand-rose-border rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-lg bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div>
            <span
              class="text-brand-slate-muted text-xs font-semibold uppercase tracking-[1.2px] block"
            >
              Direct Line
            </span>
            <a
              :href="COMPANY_DETAILS.contact.phoneTelHref"
              class="text-brand-navy-heading hover:text-brand-red text-xl lg:text-2xl font-semibold tracking-tight transition-colors block"
            >
              {{ COMPANY_DETAILS.contact.phoneDisplay }}
            </a>
            <p class="text-brand-slate-muted text-xs lg:text-sm">
              {{ COMPANY_DETAILS.contact.openingHours }}
            </p>
          </div>
        </div>

        <!-- Card 2: Sales & Enquiries -->
        <div
          class="bg-white border border-brand-rose-border rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-lg bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <span
              class="text-brand-slate-muted text-xs font-semibold uppercase tracking-[1.2px] block"
            >
              Sales &amp; Enquiries
            </span>
            <a
              :href="`mailto:${COMPANY_DETAILS.contact.salesEmail}`"
              class="text-brand-navy-heading hover:text-brand-red text-xl lg:text-2xl font-semibold tracking-tight transition-colors"
            >
              {{ COMPANY_DETAILS.contact.salesEmail }}
            </a>
          </div>
        </div>

        <!-- Card 3: UK Headquarters -->
        <div
          class="bg-white border border-brand-rose-border rounded-lg p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="w-14 h-14 rounded-lg bg-brand-rose-card flex items-center justify-center text-brand-red shrink-0"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <span
              class="text-brand-slate-muted text-xs font-semibold uppercase tracking-[1.2px] block"
            >
              UK Headquarters
            </span>
            <p class="text-brand-navy-heading text-lg font-semibold">
              {{ COMPANY_DETAILS.legalName }}
            </p>
            <p
              class="text-brand-slate-muted text-xs lg:text-sm leading-relaxed"
            >
              {{ COMPANY_DETAILS.address.formatted }}
            </p>
          </div>
        </div>
      </div>

      <!-- 3. Map Section (Integrated) -->
      <div
        id="map-section"
        class="border border-brand-rose-border rounded-lg shadow-sm overflow-hidden h-[400px] relative bg-slate-200 scroll-mt-24"
      >
        <iframe
          title="Karmod UK Location Map"
          :src="COMPANY_DETAILS.maps.googleMapsEmbedUrl"
          class="w-full h-full border-0 filter grayscale contrast-125 opacity-90 hover:grayscale-0 hover:opacity-100 hover:contrast-100 transition-all duration-1000 ease-in-out"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { COMPANY_DETAILS } from "~/constants/company";

const form = ref({
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  details: "",
});

const isSubmitting = ref(false);
const submitted = ref(false);
const errorMessage = ref("");

async function handleSubmit() {
  if (!form.value.fullName || !form.value.email || !form.value.details) return;

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const res: any = await $fetch("/api/contact", {
      method: "POST",
      body: {
        fullName: form.value.fullName,
        companyName: form.value.companyName,
        email: form.value.email,
        phone: form.value.phone,
        details: form.value.details,
      },
    });

    if (res?.success) {
      submitted.value = true;
      form.value = {
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        details: "",
      };
    } else {
      errorMessage.value = res?.message || "Failed to submit request. Please try again.";
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || "Failed to send consultation request. Please try again or call our direct line.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
