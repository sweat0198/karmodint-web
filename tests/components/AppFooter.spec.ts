// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppFooter from "~/components/AppFooter.vue";

describe("AppFooter", () => {
  it("reserves space for the sticky price bar when it is visible", () => {
    const wrapper = mount(AppFooter, { props: { hasPriceBar: true } });

    expect(wrapper.get("footer").classes()).toContain("pb-36");
    expect(wrapper.get("footer").classes()).toContain("sm:pb-24");
  });

  it("does not add sticky price bar spacing when the bar is hidden", () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.get("footer").classes()).not.toContain("pb-36");
    expect(wrapper.get("footer").classes()).not.toContain("sm:pb-24");
  });
});
