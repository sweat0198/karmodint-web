<template>
  <section
    aria-labelledby="home-company-heading"
    class="w-full bg-brand-rose-bg border-t border-brand-rose-border py-16 lg:py-24 px-6 lg:px-12 flex justify-center"
  >
    <div class="max-w-[1184px] w-full flex flex-col gap-10 lg:gap-12">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <!-- Legacy "section-seo": the Legacy page h1, kept as an h2 under the hero's h1 -->
        <div class="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-[calc(var(--app-header-h)+2rem)]">
          <h2
            id="home-company-heading"
            class="text-brand-navy-heading text-3xl sm:text-4xl font-bold leading-tight tracking-tight"
          >
            Karmod International
          </h2>
          <p
            data-company-strapline
            class="text-brand-red-dark text-lg font-semibold leading-snug text-balance"
          >
            Leading the Innovation in Modular and Prefabricated Solutions
          </p>
          <p data-company-paragraph class="text-brand-slate-muted text-base leading-relaxed text-pretty">
            Karmod International stands as a distinguished leader in the field of modular and prefabricated construction. Established in 1986, the company has continuously pushed the boundaries of construction innovation. <em>Here's an in-depth look at this influential organization:</em>
          </p>
        </div>

        <ul class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <li
            v-for="(strength, idx) in strengths"
            :key="strength.label"
            data-company-strength
            class="flex flex-col gap-2 rounded-lg border border-brand-rose-border/50 bg-white p-5 shadow-sm"
            :class="{ 'sm:col-span-2': idx === strengths.length - 1 }"
          >
            <div class="flex items-center gap-3">
              <span
                aria-hidden="true"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-brand-rose-card text-xs font-semibold tabular-nums text-brand-red"
              >{{ String(idx + 1).padStart(2, "0") }}</span>
              <h3 class="text-brand-navy-heading text-base font-semibold">{{ strength.label }}</h3>
            </div>
            <p class="text-brand-slate-muted text-sm leading-relaxed text-pretty">{{ strength.text }}</p>
          </li>
        </ul>
      </div>

      <p
        data-company-paragraph
        class="border-t border-brand-rose-border pt-8 text-brand-navy-slate text-base sm:text-lg leading-relaxed text-pretty max-w-4xl"
      >
        Karmod International's unwavering commitment to excellence, sustainability, and innovation has firmly established its position as a leader in the modular and prefabricated construction industry. As the demand for efficient and sustainable building solutions continues to rise, Karmod International remains a dependable partner for businesses and organizations seeking top-tier modular and prefabricated structures.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const strengths = [
  {
    label: "Global Reach:",
    text: "Karmod International boasts a global presence, serving clients across 135 countries. This extensive network highlights the company's unwavering commitment to delivering top-notch modular and prefabricated structures on a worldwide scale.",
  },
  {
    label: "Diverse Product Portfolio:",
    text: "Karmod International offers a comprehensive array of modular solutions, encompassing prefabricated buildings, containers, cabins, and more. These versatile structures cater to various sectors, spanning from construction and education to healthcare and tourism.",
  },
  {
    label: "Cutting-Edge Technology:",
    text: "Karmod International embraces cutting-edge technology in its manufacturing processes, ensuring that its modular and prefabricated structures consistently meet the highest standards of quality and durability.",
  },
  {
    label: "Sustainability Focus:",
    text: "The company places a strong emphasis on sustainability, utilizing eco-friendly materials and energy-efficient designs in its products. Karmod International's commitment to sustainability aligns seamlessly with the growing global demand for environmentally responsible construction solutions.",
  },
  {
    label: "Tailored Solutions:",
    text: "Karmod International recognizes the uniqueness of each project. Therefore, they offer customization options to meet specific client requirements. From design to layout, clients enjoy the flexibility to tailor structures to their exact needs.",
  },
  {
    label: "Swift Assembly:",
    text: "One of the primary advantages of Karmod International's products is their rapid assembly. Modular and prefabricated structures can be installed swiftly, resulting in reduced project timelines and costs.",
  },
  {
    label: "Quality Assurance:",
    text: "Karmod International places a high priority on quality assurance, adhering to international standards and certifications. Clients can have complete confidence that their structures are built to endure.",
  },
] as const;
</script>
