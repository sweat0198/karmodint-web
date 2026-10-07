// @vitest-environment jsdom

import { mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PortableTextContent from "~/components/content/PortableTextContent.vue";
import FaqAccordion from "~/components/content/FaqAccordion.vue";

const span = (text: string, marks: string[] = []) => ({ _type: "span" as const, text, marks });
const block = (children: ReturnType<typeof span>[], extra: Record<string, unknown> = {}) => ({
  _type: "block" as const,
  style: "normal",
  markDefs: [] as Array<{ _key: string; _type: string; href?: string }>,
  children,
  ...extra,
});

const stubs = { NuxtLink: RouterLinkStub };

describe("PortableTextContent", () => {
  it("renders headings, paragraphs, decorators and lists as HTML", () => {
    const wrapper = mount(PortableTextContent, {
      props: {
        blocks: [
          block([span("Transparent Quality")], { style: "h2" }),
          block([span("Discover Value")], { style: "h3" }),
          block([span("Vertical Scope:", ["strong"]), span(" Taller kiosks.")], { listItem: "bullet" }),
          block([span("Horizontal Reach:", ["strong"]), span(" Wider units.")], { listItem: "bullet" }),
          block([span("Plain "), span("emphasis", ["em"])]),
        ],
      },
      global: { stubs },
    });

    expect(wrapper.get("h2").text()).toBe("Transparent Quality");
    expect(wrapper.get("h3").text()).toBe("Discover Value");
    expect(wrapper.findAll("ul > li").map((li) => li.text())).toEqual([
      "Vertical Scope: Taller kiosks.",
      "Horizontal Reach: Wider units.",
    ]);
    expect(wrapper.get("ul > li strong").text()).toBe("Vertical Scope:");
    expect(wrapper.get("p em").text()).toBe("emphasis");
  });

  it("nests a deeper list item inside the item before it", () => {
    const wrapper = mount(PortableTextContent, {
      props: {
        blocks: [
          block([span("3 bedroom portable house:")], { listItem: "bullet", level: 1 }),
          block([span("A master suite.")], { listItem: "bullet", level: 2 }),
          block([span("Two secondary bedrooms.")], { listItem: "bullet", level: 2 }),
          block([span("2 bedroom portable house:")], { listItem: "bullet", level: 1 }),
        ],
      },
      global: { stubs },
    });

    const outer = wrapper.findAll(":scope > ul > li");
    expect(outer).toHaveLength(2);
    expect(outer[0]!.findAll("ul > li").map((li) => li.text())).toEqual(["A master suite.", "Two secondary bedrooms."]);
    expect(outer[1]!.find("ul").exists()).toBe(false);
  });

  it("routes internal links through NuxtLink and leaves external links as anchors", () => {
    const wrapper = mount(PortableTextContent, {
      props: {
        blocks: [
          block([span("modular kiosk", ["strong", "l1"]), span(" and "), span("Karmod", ["l2"])], {
            markDefs: [
              { _key: "l1", _type: "link", href: "/solutions/retail-and-food-service-kiosks/" },
              { _key: "l2", _type: "link", href: "https://www.karmod.com/" },
            ],
          }),
        ],
      },
      global: { stubs },
    });

    const internal = wrapper.getComponent(RouterLinkStub);
    expect(internal.props("to")).toBe("/solutions/retail-and-food-service-kiosks/");
    expect(internal.text()).toBe("modular kiosk");
    expect(internal.find("strong").exists()).toBe(true);

    const external = wrapper.get('a[href="https://www.karmod.com/"]');
    expect(external.text()).toBe("Karmod");
  });
});

describe("FaqAccordion", () => {
  const faqs = [
    { _key: "q1", question: "What size is a GRP kiosk?", answer: [block([span("Sizes vary.")])] },
    { _key: "q2", question: "What is a GRP kiosk?", answer: [block([span("A prefabricated structure.")])] },
  ];

  it("renders a heading and one disclosure per question, answers present in the HTML", () => {
    const wrapper = mount(FaqAccordion, {
      props: { heading: "GRP Kiosk Cabin Frequently Asked Questions", faqs },
      global: { stubs },
    });

    expect(wrapper.get("h2").text()).toBe("GRP Kiosk Cabin Frequently Asked Questions");
    const items = wrapper.findAll("details");
    expect(items).toHaveLength(2);
    expect(items[0].get("summary").text()).toContain("What size is a GRP kiosk?");
    // Closed answers stay in the markup, so crawlers and the FAQPage data see the same text.
    expect(items[1].text()).toContain("A prefabricated structure.");
  });

  it("renders nothing when there are no FAQs", () => {
    const wrapper = mount(FaqAccordion, { props: { heading: "FAQs", faqs: [] }, global: { stubs } });
    expect(wrapper.find("section").exists()).toBe(false);
  });
});
