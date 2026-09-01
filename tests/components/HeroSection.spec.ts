// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HeroSection from "~/components/HeroSection.vue";

describe("HeroSection", () => {
  it("presents the 2.3 × 6 m and 3 × 7 m containers as the first two slides", async () => {
    const wrapper = mount(HeroSection, {
      global: {
        stubs: {
          NuxtLink: { template: "<a><slot /></a>" },
        },
      },
    });

    const images = wrapper.findAll("img");

    expect(images).toHaveLength(7);
    expect(images[0].attributes()).toMatchObject({
      src: "/images/hero/hero-container-2-3x6-uk.webp",
      alt: "2.3 × 6 m Modular Container",
    });
    expect(wrapper.text()).toContain("Compact 2.3 × 6 m site office for UK projects");

    await wrapper.get('button[aria-label="Go to slide 2"]').trigger("click");

    expect(images[1].attributes()).toMatchObject({
      src: "/images/hero/hero-container-3x7-uk.webp",
      alt: "3 × 7 m Modular Container",
    });
    expect(wrapper.text()).toContain("Spacious 3 × 7 m site office for larger teams");

    wrapper.unmount();
  });

  it("presents five size-specific cabin products after the container slides", async () => {
    const wrapper = mount(HeroSection, {
      global: {
        stubs: {
          NuxtLink: { template: "<a><slot /></a>" },
        },
      },
    });

    const expectedSlides = [
      {
        number: 3,
        src: "/images/hero/hero-grp-1-5x1-5-uk.webp",
        title: "1.5 × 1.5 m GRP Cabin",
        subtitle: "Compact weatherproof gatehouse for schools and sports grounds",
      },
      {
        number: 4,
        src: "/images/hero/hero-panel-1-35x2-1-uk.webp",
        title: "1.35 × 2.1 m Panel Cabin",
        subtitle: "Insulated site gatehouse for year-round UK projects",
      },
      {
        number: 5,
        src: "/images/hero/hero-metrocity-2-15x2-65-uk.webp",
        title: "2.15 × 2.65 m MetroCity Modular Cabin",
        subtitle: "Architectural security office for premium developments",
      },
      {
        number: 6,
        src: "/images/hero/hero-kompocity-2-65x2-65-uk.webp",
        title: "2.65 × 2.65 m KompoCity Composite Cabin",
        subtitle: "Composite-clad reception cabin for commercial entrances",
      },
      {
        number: 7,
        src: "/images/hero/hero-bulletproof-2x4-uk.webp",
        title: "2.00 × 4.00 m Bulletproof Security Cabin",
        subtitle: "Armoured checkpoint for critical infrastructure sites",
      },
    ];

    const images = wrapper.findAll("img");

    expect(images).toHaveLength(7);

    for (const slide of expectedSlides) {
      expect(images[slide.number - 1].attributes()).toMatchObject({
        src: slide.src,
        alt: slide.title,
      });

      await wrapper
        .get(`button[aria-label="Go to slide ${slide.number}"]`)
        .trigger("click");

      expect(wrapper.text()).toContain(slide.title);
      expect(wrapper.text()).toContain(slide.subtitle);
    }

    wrapper.unmount();
  });
});
