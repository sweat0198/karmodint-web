// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import HeroSection from "~/components/HeroSection.vue";
import ProductImageCarousel from "~/components/ProductImageCarousel.vue";
import type { HeroSlide } from "~/constants/heroSlides";

const fixtureSlides: HeroSlide[] = [
  { image: "/fixtures/slide-a.webp", title: "Slide A", subtitle: "First fixture slide" },
  { image: "/fixtures/slide-b.webp", title: "Slide B", subtitle: "Second fixture slide" },
  { image: "/fixtures/slide-c.webp", title: "Slide C", subtitle: "Third fixture slide" },
];

function mountHero(slides: HeroSlide[] = fixtureSlides) {
  return mount(HeroSection, {
    props: { slides },
    global: {
      stubs: {
        NuxtLink: { template: "<a><slot /></a>" },
      },
    },
  });
}

describe("HeroSection", () => {
  it("hands its slides to the carousel as frames, in the order given", () => {
    const wrapper = mountHero();

    const carousel = wrapper.getComponent(ProductImageCarousel);
    expect(carousel.props("images")).toEqual([
      { src: "/fixtures/slide-a.webp", alt: "Slide A" },
      { src: "/fixtures/slide-b.webp", alt: "Slide B" },
      { src: "/fixtures/slide-c.webp", alt: "Slide C" },
    ]);

    wrapper.unmount();
  });

  it("delegates advancing, autoplay and swipe to the carousel rather than reimplementing them", () => {
    const wrapper = mountHero();

    const carousel = wrapper.getComponent(ProductImageCarousel);
    expect(carousel.props("swipeable")).toBe(true);
    expect(carousel.props("active")).toBe(true);

    wrapper.unmount();
  });

  it("tracks the carousel's active frame in its slide badge and dot indicators", async () => {
    const wrapper = mountHero();

    expect(wrapper.text()).toContain("Slide 1 / 3");
    expect(wrapper.get('button[aria-label="Go to slide 1"]').classes()).toContain("bg-brand-red");

    await wrapper.getComponent(ProductImageCarousel).vm.$emit("frame-change", 1);

    expect(wrapper.text()).toContain("Slide 2 / 3");
    expect(wrapper.get('button[aria-label="Go to slide 2"]').classes()).toContain("bg-brand-red");

    wrapper.unmount();
  });

  it("commands the carousel via its own dots and arrows, rather than tracking its own index", async () => {
    const wrapper = mountHero();

    await wrapper.get('button[aria-label="Go to slide 3"]').trigger("click");
    expect(wrapper.text()).toContain("Slide 3 / 3");
    expect(wrapper.text()).toContain("Slide C");

    await wrapper.get('button[aria-label="Previous Slide"]').trigger("click");
    expect(wrapper.text()).toContain("Slide 2 / 3");

    await wrapper.get('button[aria-label="Next Slide"]').trigger("click");
    expect(wrapper.text()).toContain("Slide 3 / 3");

    wrapper.unmount();
  });

  it("advances on a left swipe and back on a right swipe, via the carousel's own gesture handling", async () => {
    const wrapper = mountHero();
    const carousel = wrapper.getComponent(ProductImageCarousel);

    await carousel.trigger("touchstart", { touches: [{ clientX: 300, clientY: 200 }] });
    await carousel.trigger("touchend", { changedTouches: [{ clientX: 200, clientY: 200 }] });
    expect(wrapper.text()).toContain("Slide 2 / 3");

    await carousel.trigger("touchstart", { touches: [{ clientX: 200, clientY: 200 }] });
    await carousel.trigger("touchend", { changedTouches: [{ clientX: 300, clientY: 200 }] });
    expect(wrapper.text()).toContain("Slide 1 / 3");

    wrapper.unmount();
  });

  it("ignores a swipe that is shorter than the threshold or mostly vertical", async () => {
    const wrapper = mountHero();
    const carousel = wrapper.getComponent(ProductImageCarousel);

    await carousel.trigger("touchstart", { touches: [{ clientX: 300, clientY: 200 }] });
    await carousel.trigger("touchend", { changedTouches: [{ clientX: 280, clientY: 200 }] });
    expect(wrapper.text()).toContain("Slide 1 / 3");

    await carousel.trigger("touchstart", { touches: [{ clientX: 300, clientY: 200 }] });
    await carousel.trigger("touchend", { changedTouches: [{ clientX: 200, clientY: 320 }] });
    expect(wrapper.text()).toContain("Slide 1 / 3");

    wrapper.unmount();
  });

  it("pauses autoplay on hover and resumes without losing the current slide", async () => {
    vi.useFakeTimers();
    const wrapper = mountHero();
    const surface = wrapper.get(".group");

    await surface.trigger("mouseenter");
    await vi.advanceTimersByTimeAsync(10_000);
    expect(wrapper.text()).toContain("Slide 1 / 3");

    await surface.trigger("mouseleave");
    await vi.advanceTimersByTimeAsync(5000);
    expect(wrapper.text()).toContain("Slide 2 / 3");

    vi.useRealTimers();
    wrapper.unmount();
  });

  it("places the slide info card after the image carousel so it stacks under the images on mobile", () => {
    const wrapper = mountHero();

    const carousel = wrapper.get(".group").element;
    const siblings = Array.from(carousel.parentElement!.children);
    const carouselIndex = siblings.indexOf(carousel);
    const infoCardIndex = siblings.findIndex(
      (el) => el !== carousel && el.textContent?.includes("Slide A"),
    );

    expect(infoCardIndex).toBeGreaterThan(carouselIndex);

    wrapper.unmount();
  });
});
