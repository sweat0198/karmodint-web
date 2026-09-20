// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
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

  it("keeps unmet multiple-choice requirements visible but disabled with a reason", () => {
    const wrapper = mount(MultipleChoiceGroup, {
      props: {
        group: {
          ...multipleGroup,
          items: [{
            _key: "blue",
            title: "Blue Male Socket",
            pricingType: "fixed",
            price: 75,
            selectionDisabled: true,
            selectionDisabledReason: "Requires Standard Electrical Pack",
          }],
        },
        modelValue: [],
        notes: {},
      },
      global: { stubs: { CustomizationNote: true } },
    });

    expect(wrapper.get('input[type="checkbox"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Requires Standard Electrical Pack");
  });

  it("disables a boolean option without hiding its requirement reason", () => {
    const wrapper = mount(BooleanToggleGroup, {
      props: {
        group: {
          ...booleanGroup,
          items: [{
            ...booleanGroup.items[0],
            selectionDisabled: true,
            selectionDisabledReason: "Requires Standard Electrical Pack",
          }],
        },
        modelValue: false,
        notes: {},
      },
      global: { stubs: { CustomizationNote: true } },
    });

    expect(wrapper.get('button[role="switch"]').attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Requires Standard Electrical Pack");
  });

  it("disables a single-choice item through the same item contract", () => {
    const wrapper = mount(SingleChoiceGroup, {
      props: {
        group: {
          ...singleGroup,
          items: [{
            ...singleGroup.items[0],
            selectionDisabled: true,
            selectionDisabledReason: "Requires another option",
          }],
        },
        modelValue: null,
        notes: {},
      },
      global: { stubs: { CustomizationNote: true, CustomizationImage: true } },
    });

    expect(wrapper.findAll('button').at(-1)?.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("Requires another option");
  });
});
