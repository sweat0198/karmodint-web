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

    expect(images).toHaveLength(5);
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
});
