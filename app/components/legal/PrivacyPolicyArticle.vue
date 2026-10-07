<template>
  <article class="flex max-w-3xl flex-col gap-12">
    <header class="flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <h1
          class="text-3xl font-bold leading-tight tracking-tight text-balance text-brand-navy-heading md:text-4xl lg:text-5xl"
        >
          Privacy Policy
        </h1>
        <p class="text-sm text-brand-slate-muted">
          <time :datetime="policy.lastUpdated.iso">{{ policy.lastUpdated.label }}</time>
        </p>
      </div>

      <div class="flex flex-col gap-4 border-l-2 border-brand-red pl-5">
        <p
          v-for="paragraph in policy.intro"
          :key="paragraph"
          class="text-base leading-relaxed text-pretty text-slate-700 md:text-lg"
        >
          {{ paragraph }}
        </p>
      </div>
    </header>

    <section
      v-for="section in policy.sections"
      :key="section.id"
      :aria-labelledby="section.id"
      class="flex flex-col gap-4 border-t border-slate-100 pt-10"
    >
      <h2
        :id="section.id"
        class="scroll-mt-24 text-xl font-semibold leading-snug tracking-tight text-balance text-brand-navy-heading md:text-2xl"
      >
        <span class="tabular-nums text-brand-red">{{ section.number }}.</span> {{ section.title }}
      </h2>

      <template v-for="(block, index) in section.blocks" :key="index">
        <p v-if="block.kind === 'paragraph'" class="text-base leading-7 text-pretty text-slate-600">
          {{ block.text }}
        </p>
        <ul
          v-else
          class="flex list-disc flex-col gap-2 pl-5 text-base leading-7 text-slate-600 marker:text-brand-red"
        >
          <li v-for="item in block.items" :key="item" class="pl-1 text-pretty">{{ item }}</li>
        </ul>
      </template>

      <address
        v-if="section.id === 'contact-us'"
        class="mt-2 grid gap-6 rounded-lg border border-slate-200 bg-slate-50 p-6 not-italic sm:grid-cols-2 sm:p-8"
      >
        <p class="text-base leading-7 text-slate-600">
          <span class="font-semibold text-brand-navy-heading">{{ contact.name }}</span>
          <template v-for="line in contact.addressLines" :key="line"><br />{{ line }}</template>
        </p>

        <div class="flex flex-col gap-2 text-base leading-7 text-slate-600">
          <p>
            <span class="font-semibold text-brand-navy-heading">Telephone:</span> <a :href="contact.telephone.href" :class="linkClass">{{ contact.telephone.display }}</a>
          </p>
          <p>
            <span class="font-semibold text-brand-navy-heading">Email:</span> <a :href="contact.email.href" :class="linkClass">{{ contact.email.display }}</a>
          </p>
          <p>
            <span class="font-semibold text-brand-navy-heading">Website:</span> <NuxtLink :to="contact.website.path" :class="linkClass">{{ contact.website.display }}</NuxtLink>
          </p>
        </div>
      </address>
    </section>
  </article>
</template>

<script setup lang="ts">
import { PRIVACY_POLICY } from "~/constants/privacyPolicy";

const policy = PRIVACY_POLICY;
const contact = PRIVACY_POLICY.contact;

// Colour-only hover: no motion on a link readers hit while scanning a long document.
const linkClass =
  "rounded-sm font-medium text-brand-red underline decoration-brand-red/30 underline-offset-4 transition-[color,text-decoration-color] duration-150 ease-out hover:text-brand-red-hover hover:decoration-brand-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red";
</script>
