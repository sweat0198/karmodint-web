// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import ProductImageCarousel from "~/components/ProductImageCarousel.vue";
import ProductCustomizer from "~/components/customization/ProductCustomizer.vue";

function mountCustomizer() {
  return mount(ProductCustomizer, {
    props: {
      title: "Test product",
      previewImages: [
        { src: "front.jpg", alt: "Front view" },
        { src: "side.jpg", alt: "Side view" },
      ],
      groups: [],
    },
    global: {
      components: { ProductImageCarousel },
      stubs: { CustomizationGroups: true },
    },
  });
}

type Customizer = ReturnType<typeof mountCustomizer>;

/** jsdom lays nothing out, so the stage reports a zero box until it is given one. */
function measureStage(wrapper: Customizer, width: number, height: number) {
  const stage = wrapper.get('[data-testid="viewer-stage"]').element;
  Object.defineProperty(stage, "clientWidth", { value: width, configurable: true });
  Object.defineProperty(stage, "clientHeight", { value: height, configurable: true });
}

/**
 * `trigger` builds a plain MouseEvent and then assigns the extra params onto it, which throws on
 * jsdom's read-only `clientX`/`button` — so the pointer events are constructed and dispatched here.
 */
async function pointer(
  wrapper: Customizer,
  type: string,
  { x, y, from = '[data-testid="viewer-stage"]' }: { x: number; y: number; from?: string },
) {
  const event = new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true });
  Object.defineProperty(event, "pointerId", { value: 1 });
  wrapper.get(from).element.dispatchEvent(event);
  await nextTick();
}

function frameTransform(wrapper: Customizer): string {
  const stack = wrapper.get('[data-testid="carousel-frame"]').element.parentElement as HTMLElement;
  return stack.style.transform;
}

function activeFrameIndex(wrapper: Customizer): number {
  return wrapper
    .findAll('[data-testid="carousel-frame"]')
    .findIndex((frame) => frame.classes().includes("opacity-100"));
}

describe("ProductCustomizer", () => {
  it("insets the carousel indicator from the clipped top edge", () => {
    const wrapper = mountCustomizer();

    const indicatorClasses = wrapper.get("div.bg-white\\/90.rounded-full").classes();
    expect(indicatorClasses).toContain("top-6");
    expect(indicatorClasses).not.toContain("top-2");
  });

  describe("panning the zoomed preview", () => {
    it("offers no drag affordance while the whole frame is in view", async () => {
      const wrapper = mountCustomizer();

      const stage = wrapper.get('[data-testid="viewer-stage"]');
      expect(stage.classes()).not.toContain("cursor-grab");
      expect(stage.attributes("tabindex")).toBe("-1");

      await wrapper.get('[data-testid="viewer-zoom-out"]').trigger("click");
      expect(wrapper.get('[data-testid="viewer-stage"]').classes()).not.toContain("cursor-grab");
    });

    it("becomes grabbable once zoomed past the stage", async () => {
      const wrapper = mountCustomizer();

      await wrapper.get('[data-testid="viewer-zoom-in"]').trigger("click");

      const stage = wrapper.get('[data-testid="viewer-stage"]');
      expect(stage.classes()).toContain("cursor-grab");
      expect(stage.classes()).toContain("touch-none");
      expect(stage.attributes("tabindex")).toBe("0");
      expect(stage.attributes("aria-label")).toContain("arrow keys");
    });

    it("drags the frames under the pointer, leaving the carousel controls put", async () => {
      const wrapper = mountCustomizer();
      measureStage(wrapper, 640, 360);

      await wrapper.get('[data-testid="viewer-zoom-in"]').trigger("click");
      await pointer(wrapper, "pointerdown", { x: 300, y: 200 });
      await pointer(wrapper, "pointermove", { x: 340, y: 190 });

      expect(wrapper.get('[data-testid="viewer-stage"]').classes()).toContain("cursor-grabbing");
      expect(frameTransform(wrapper)).toBe("translate(40px, -10px) scale(1.2)");
      // The arrows sit outside the transformed stack, so they never ride along with the frame.
      expect(
        (wrapper.get('[data-testid="carousel-next"]').element as HTMLElement).style.transform,
      ).toBe("");

      await pointer(wrapper, "pointerup", { x: 340, y: 190 });
      expect(wrapper.get('[data-testid="viewer-stage"]').classes()).toContain("cursor-grab");
    });

    it("changes frame from the arrows while zoomed, back at 100% on the new angle", async () => {
      const wrapper = mountCustomizer();
      measureStage(wrapper, 640, 360);

      await wrapper.get('[data-testid="viewer-zoom-in"]').trigger("click");
      await pointer(wrapper, "pointerdown", { x: 300, y: 200 });
      await pointer(wrapper, "pointermove", { x: 340, y: 200 });
      await pointer(wrapper, "pointerup", { x: 340, y: 200 });

      // A press on an arrow is a click, not the start of a drag.
      await pointer(wrapper, "pointerdown", {
        x: 10,
        y: 200,
        from: '[data-testid="carousel-next"]',
      });
      await wrapper.get('[data-testid="carousel-next"]').trigger("click");

      expect(activeFrameIndex(wrapper)).toBe(1);
      expect(frameTransform(wrapper)).toBe("translate(0px, 0px) scale(1)");
      expect(wrapper.get('[data-testid="viewer-stage"]').classes()).not.toContain("cursor-grab");
    });

    it("keeps the reset control in place, live only once the view has moved", async () => {
      const wrapper = mountCustomizer();
      measureStage(wrapper, 640, 360);

      const reset = wrapper.get('[data-testid="viewer-reset"]');
      expect(reset.attributes("disabled")).toBeDefined();

      await wrapper.get('[data-testid="viewer-zoom-in"]').trigger("click");
      await pointer(wrapper, "pointerdown", { x: 300, y: 200 });
      await pointer(wrapper, "pointermove", { x: 340, y: 200 });
      await pointer(wrapper, "pointerup", { x: 340, y: 200 });
      expect(wrapper.get('[data-testid="viewer-reset"]').attributes("disabled")).toBeUndefined();

      await wrapper.get('[data-testid="viewer-reset"]').trigger("click");

      expect(frameTransform(wrapper)).toBe("translate(0px, 0px) scale(1)");
      expect(wrapper.get('[data-testid="viewer-reset"]').attributes("disabled")).toBeDefined();
    });
  });
});
