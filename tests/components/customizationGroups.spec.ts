// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import CustomizationGroups from "~~/app/components/customization/CustomizationGroups.vue";
import SingleChoiceGroup from "~~/app/components/customization/groups/SingleChoiceGroup.vue";
import MultipleChoiceGroup from "~~/app/components/customization/groups/MultipleChoiceGroup.vue";
import BooleanToggleGroup from "~~/app/components/customization/groups/BooleanToggleGroup.vue";
import type { SanityCustomizationGroup } from "~~/app/types/catalog";

const singleGroup: SanityCustomizationGroup = {
  _id: "g-single",
  _type: "customizationGroup",
  title: "Exterior Finish",
  identifier: "exterior-finish",
  selectionType: "single",
  isMandatory: true,
  displayOrder: 20,
  items: [{ _key: "a", title: "A", pricingType: "included" }],
};

const multipleGroup: SanityCustomizationGroup = {
  _id: "g-multi",
  _type: "customizationGroup",
  title: "Security Glazing",
  identifier: "security-glazing",
  selectionType: "multiple",
  isMandatory: false,
  displayOrder: 10,
  items: [{ _key: "b", title: "B", pricingType: "fixed", price: 100 }],
};

const booleanGroup: SanityCustomizationGroup = {
  _id: "g-bool",
  _type: "customizationGroup",
  title: "Air Conditioning",
  identifier: "air-conditioning",
  selectionType: "boolean",
  isMandatory: false,
  displayOrder: 30,
  items: [{ _key: "c", title: "C", pricingType: "fixed", price: 450 }],
};

function mountGroups(groups: SanityCustomizationGroup[]) {
  return shallowMount(CustomizationGroups, {
    props: { groups, modelValue: {}, notes: {} },
  });
}

describe("CustomizationGroups", () => {
  it("mounts SingleChoiceGroup for a single group", () => {
    const wrapper = mountGroups([singleGroup]);
    expect(wrapper.findComponent(SingleChoiceGroup).exists()).toBe(true);
  });

  it("mounts MultipleChoiceGroup for a multiple group", () => {
    const wrapper = mountGroups([multipleGroup]);
    expect(wrapper.findComponent(MultipleChoiceGroup).exists()).toBe(true);
  });

  it("mounts BooleanToggleGroup for a boolean group", () => {
    const wrapper = mountGroups([booleanGroup]);
    expect(wrapper.findComponent(BooleanToggleGroup).exists()).toBe(true);
  });

  it("renders groups in displayOrder ascending", () => {
    const wrapper = mountGroups([singleGroup, multipleGroup, booleanGroup]);
    const titles = wrapper.findAll("h2").map((h) => h.text());
    expect(titles).toEqual([multipleGroup.title, singleGroup.title, booleanGroup.title]);
  });

  it("shows the standard-specification message for an empty groups array", () => {
    const wrapper = mountGroups([]);
    expect(wrapper.text()).toContain("Standard specification — no options for this unit");
  });
});
