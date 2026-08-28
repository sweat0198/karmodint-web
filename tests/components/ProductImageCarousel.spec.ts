// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ProductImageCarousel from "~/components/ProductImageCarousel.vue";
import type { CarouselImage } from "~/types/catalog";

function image(view: string, src: string): CarouselImage {
  return { src, alt: `${view} view` };
}

function activeFrameIndex(wrapper: ReturnType<typeof mount>): number {
  return wrapper
    .findAll('[data-testid="carousel-frame"]')
    .findIndex((frame) => frame.classes().includes("opacity-100"));
}

describe("ProductImageCarousel", () => {
  it("shows only the first frame while inactive", () => {
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b"), image("top", "c")],
        active: false,
      },
    });

    expect(activeFrameIndex(wrapper)).toBe(0);
    expect(wrapper.find('[data-testid="carousel-frame"]').classes()).not.toContain("opacity-0");
  });

  it("cycles through frames on an interval while active, wrapping back to the first", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b"), image("top", "c")],
        active: false,
        intervalMs: 1000,
      },
    });

    await wrapper.setProps({ active: true });
    expect(activeFrameIndex(wrapper)).toBe(0);

    await vi.advanceTimersByTimeAsync(1000);
    expect(activeFrameIndex(wrapper)).toBe(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(activeFrameIndex(wrapper)).toBe(2);

    await vi.advanceTimersByTimeAsync(1000);
    expect(activeFrameIndex(wrapper)).toBe(0);

    vi.useRealTimers();
  });

  it("resets to the first frame and stops advancing once no longer active", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b")],
        active: true,
        intervalMs: 1000,
      },
    });

    await vi.advanceTimersByTimeAsync(1000);
    expect(activeFrameIndex(wrapper)).toBe(1);

    await wrapper.setProps({ active: false });
    expect(activeFrameIndex(wrapper)).toBe(0);

    await vi.advanceTimersByTimeAsync(5000);
    expect(activeFrameIndex(wrapper)).toBe(0);

    vi.useRealTimers();
  });

  it("steps forward and back through the arrows, wrapping in both directions", async () => {
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b"), image("top", "c")],
        active: false,
      },
    });

    await wrapper.get('[data-testid="carousel-next"]').trigger("click");
    expect(activeFrameIndex(wrapper)).toBe(1);

    // Back past the first frame wraps to the last.
    await wrapper.get('[data-testid="carousel-prev"]').trigger("click");
    await wrapper.get('[data-testid="carousel-prev"]').trigger("click");
    expect(activeFrameIndex(wrapper)).toBe(2);

    // Forward past the last wraps to the first.
    await wrapper.get('[data-testid="carousel-next"]').trigger("click");
    expect(activeFrameIndex(wrapper)).toBe(0);
  });

  it("stops auto-advancing once an arrow is used, then resumes on the next hover", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b"), image("top", "c")],
        active: true,
        intervalMs: 1000,
      },
    });

    await wrapper.get('[data-testid="carousel-next"]').trigger("click");
    expect(activeFrameIndex(wrapper)).toBe(1);

    // The viewer has taken control, so the frame must not slide away under them.
    await vi.advanceTimersByTimeAsync(5000);
    expect(activeFrameIndex(wrapper)).toBe(1);

    // Leaving and re-entering the card hands control back to the auto-cycle.
    await wrapper.setProps({ active: false });
    expect(activeFrameIndex(wrapper)).toBe(0);
    await wrapper.setProps({ active: true });
    await vi.advanceTimersByTimeAsync(1000);
    expect(activeFrameIndex(wrapper)).toBe(1);

    vi.useRealTimers();
  });

  it("omits the arrows entirely with a single image", () => {
    const wrapper = mount(ProductImageCarousel, {
      props: { images: [image("left-diagonal", "a")], active: true },
    });

    expect(wrapper.find('[data-testid="carousel-next"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="carousel-prev"]').exists()).toBe(false);
  });

  describe("persistentControls (the customize page's always-on viewer)", () => {
    const frames = [image("left-diagonal", "a"), image("front", "b"), image("top", "c")];

    it("shows arrows and dots without hover, and never auto-advances", async () => {
      vi.useFakeTimers();
      const wrapper = mount(ProductImageCarousel, {
        props: { images: frames, persistentControls: true, intervalMs: 1000 },
      });

      // No hover-gated opacity classes — the controls are the point here, not a card accent.
      expect(wrapper.get('[data-testid="carousel-next"]').classes()).not.toContain(
        "md:opacity-0",
      );
      expect(wrapper.find(".bg-white\\/90.rounded-full").exists()).toBe(true);

      await vi.advanceTimersByTimeAsync(5000);
      expect(activeFrameIndex(wrapper)).toBe(0);

      vi.useRealTimers();
    });

    it("tucks the arrows inside the frame, clear of a host that clips its overflow", () => {
      const wrapper = mount(ProductImageCarousel, {
        props: { images: frames, persistentControls: true },
      });

      for (const testid of ["carousel-prev", "carousel-next"]) {
        const classes = wrapper.get(`[data-testid="${testid}"]`).classes();
        expect(classes.some((name) => name.startsWith("-left-") || name.startsWith("-right-"))).toBe(
          false,
        );
      }
    });

    it("applies a host transform to the frames only, leaving the controls put", () => {
      const wrapper = mount(ProductImageCarousel, {
        props: {
          images: frames,
          persistentControls: true,
          frameStyle: { transform: "scale(1.6) rotate(90deg)" },
        },
      });

      const frameStack = wrapper.get('[data-testid="carousel-frame"]').element
        .parentElement as HTMLElement;
      expect(frameStack.style.transform).toBe("scale(1.6) rotate(90deg)");
      expect(
        (wrapper.get('[data-testid="carousel-next"]').element as HTMLElement).style.transform,
      ).toBe("");
    });

    it("keeps the chosen angle instead of resetting, since there is no hover to leave", async () => {
      const wrapper = mount(ProductImageCarousel, {
        props: { images: frames, persistentControls: true },
      });

      await wrapper.get('[data-testid="carousel-next"]').trigger("click");
      expect(activeFrameIndex(wrapper)).toBe(1);

      // `active` staying false must not yank the viewer back to the first frame.
      await wrapper.setProps({ active: false });
      expect(activeFrameIndex(wrapper)).toBe(1);
    });
  });

  it("recovers when the gallery shrinks past the current frame", async () => {
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a"), image("front", "b"), image("top", "c")],
        persistentControls: true,
      },
    });

    await wrapper.get('[data-testid="carousel-prev"]').trigger("click");
    expect(activeFrameIndex(wrapper)).toBe(2);

    await wrapper.setProps({ images: [image("left-diagonal", "a")] });
    expect(activeFrameIndex(wrapper)).toBe(0);
  });

  it("never advances or shows dots with a single image", async () => {
    vi.useFakeTimers();
    const wrapper = mount(ProductImageCarousel, {
      props: {
        images: [image("left-diagonal", "a")],
        active: true,
        intervalMs: 1000,
      },
    });

    await vi.advanceTimersByTimeAsync(5000);
    expect(activeFrameIndex(wrapper)).toBe(0);
    expect(wrapper.findAll('[data-testid="carousel-frame"]')).toHaveLength(1);

    vi.useRealTimers();
  });
});
