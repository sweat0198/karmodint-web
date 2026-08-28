// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ProductImageCarousel from "~/components/ProductImageCarousel.vue";
import ProductCustomizer from "~/components/customization/ProductCustomizer.vue";

describe("ProductCustomizer", () => {
  it("insets the carousel indicator from the clipped top edge", () => {
    const wrapper = mount(ProductCustomizer, {
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

    const indicatorClasses = wrapper.get("div.bg-white\\/90.rounded-full").classes();
    expect(indicatorClasses).toContain("top-6");
    expect(indicatorClasses).not.toContain("top-2");
  });
});
