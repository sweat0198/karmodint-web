<template>
  <section
    aria-labelledby="home-about-heading"
    class="w-full bg-white py-16 lg:py-24 px-6 lg:px-12 flex justify-center"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-8 lg:gap-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <!-- Legacy "section-about" -->
        <div class="lg:col-span-7 flex flex-col gap-5 lg:py-4">
          <h2
            id="home-about-heading"
            class="text-brand-navy-heading text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-balance"
          >
            <span class="text-brand-red">Karmod International</span> Portable Buildings, Unleash Possibilities!
          </h2>
          <p class="text-brand-slate-muted text-base sm:text-lg leading-relaxed text-pretty">
            "Portable Buildings, Unleash Possibilities!" Our slogan embodies the limitless potential that these versatile structures offer. They're not just buildings; they're pathways to creativity, adaptability, and innovation. Whether you're expanding your business, creating a dynamic workspace, or pursuing your dreams on the go, portable buildings are the key. With them, your imagination knows no bounds.
          </p>
          <p class="text-brand-slate-muted text-base sm:text-lg leading-relaxed text-pretty">
            Join us in the journey of redefining spaces and unlocking opportunities. Discover a world where you can set up, learn, explore, or relax wherever your vision takes you.
          </p>
        </div>

        <!-- Legacy "section-slogan" -->
        <div
          data-slogan
          class="lg:col-span-5 relative overflow-hidden rounded-lg bg-brand-navy p-8 lg:p-10 text-white shadow-xl flex flex-col justify-between gap-8"
        >
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-red/20 blur-3xl"
          ></div>
          <div class="relative flex flex-col gap-4">
            <p data-slogan-line class="label-caps text-white/60">Karmod International</p>
            <p class="text-3xl lg:text-4xl font-bold leading-tight tracking-tight">
              <span data-slogan-line class="block">Portable Cabins,</span>
              <span data-slogan-line class="block text-brand-rose-footer">Your Space, Your Way!</span>
            </p>
            <p data-slogan-line class="text-white/75 text-base leading-relaxed text-pretty">
              Your instant retreat, your mobile workspace, your personalized haven – all in one compact package.
            </p>
          </div>
          <NuxtLink
            to="/gallery/"
            data-slogan-link
            class="home-press relative self-start inline-flex items-center gap-1.5 rounded-xs bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-navy shadow-sm hover:bg-brand-rose-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >Read More</NuxtLink>
        </div>
      </div>

      <!-- Legacy "section-projekt" boxes and certificates heading -->
      <ul class="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <li class="home-box flex flex-col gap-4 p-6">
          <p class="text-brand-navy-heading text-base leading-relaxed text-pretty">
            You can contact us via WhatsApp for more information about our products and services and for a price quote.
          </p>
          <a
            :href="COMPANY_CONTACT.whatsAppUrl"
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-link
            class="home-press mt-auto self-start inline-flex items-center gap-2 rounded-xs bg-[#075e54] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#064c44] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#075e54]"
          >
            <svg aria-hidden="true" class="h-4 w-4 fill-current" viewBox="0 0 24 24">
              <path :d="WHATSAPP_ICON_PATH" />
            </svg>
            <span>WhatsApp {{ COMPANY_CONTACT.whatsAppDisplay }}</span>
          </a>
        </li>

        <li>
          <NuxtLink
            to="/products/"
            data-catalogs-link
            class="home-box home-box--link group flex h-full flex-col gap-2 p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red"
          >
            <div class="flex items-center justify-between gap-3">
              <h3 class="text-brand-navy-heading text-lg font-semibold">Online Catalogs</h3>
              <svg
                aria-hidden="true"
                class="home-box__arrow h-4 w-4 shrink-0 text-brand-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
            <p class="text-brand-slate-muted text-base leading-relaxed">
              You can reach our catalogs of our portable solutions here.
            </p>
          </NuxtLink>
        </li>

        <li data-certificates class="home-box flex flex-col gap-2 p-6">
          <h3 class="text-brand-navy-heading text-lg font-semibold">Our Quality Certificates</h3>
          <p class="text-brand-slate-muted text-base leading-relaxed text-pretty">
            We believe that customer satisfaction comes from superior product and service quality.
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { COMPANY_CONTACT } from "~/constants/company";

const WHATSAPP_ICON_PATH =
  "M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z";
</script>

<style scoped>
.home-box {
  background-color: var(--brand-rose-bg);
  border: 1px solid color-mix(in srgb, var(--brand-rose-border) 50%, transparent);
  border-radius: 0.5rem;
}

.home-box--link {
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    transform 160ms var(--ease-out);
}

.home-box--link:active,
.home-press:active {
  transform: scale(0.98);
}

.home-press {
  transition:
    background-color 200ms ease,
    transform 160ms var(--ease-out);
}

.home-box__arrow {
  transition: transform 200ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .home-box--link:hover {
    border-color: var(--brand-rose-border);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -2px rgb(0 0 0 / 0.05);
  }

  .home-box--link:hover .home-box__arrow {
    transform: translateX(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-box--link,
  .home-press,
  .home-box__arrow {
    transition: none;
  }
}
</style>
