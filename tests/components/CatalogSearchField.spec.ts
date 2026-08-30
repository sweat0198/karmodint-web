// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import CatalogSearchField from "~/components/CatalogSearchField.vue";

describe("CatalogSearchField", () => {
  it("exposes native search semantics and emits typed values", async () => {
    const wrapper = mount(CatalogSearchField, {
      props: { modelValue: "", inputId: "catalog-search-test" },
    });

    const input = wrapper.get('input[type="search"]');
    expect(input.attributes("id")).toBe("catalog-search-test");
    expect(input.attributes("placeholder")).toBe("Search catalog…");
    expect(wrapper.get('label[for="catalog-search-test"]').text()).toBe(
      "Search products and categories",
    );

    await input.setValue("panel cabin");
    expect(wrapper.emitted("update:modelValue")).toEqual([["panel cabin"]]);
  });

  it("offers an accessible clear action only when text exists", async () => {
    const wrapper = mount(CatalogSearchField, {
      props: { modelValue: "panel", inputId: "catalog-search-clear" },
    });

    await wrapper.get('button[aria-label="Clear catalog search"]').trigger("click");
    expect(wrapper.emitted("clear")).toEqual([[]]);

    await wrapper.setProps({ modelValue: "" });
    expect(wrapper.find('button[aria-label="Clear catalog search"]').exists()).toBe(false);
  });
});
