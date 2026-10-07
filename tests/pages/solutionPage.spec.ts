// @vitest-environment jsdom

import { flushPromises, mount, RouterLinkStub } from "@vue/test-utils";
import { defineComponent, h, ref, Suspense } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

const queries = vi.fn();
const head = vi.fn();

vi.mock("#imports", () => ({
  useSanityQuery: async (query: string, params?: Record<string, unknown>) => ({
    data: ref(queries(query, params)),
  }),
  createError: (input: { statusCode: number; statusMessage: string }) =>
    Object.assign(new Error(input.statusMessage), input),
  useRuntimeConfig: () => ({
    public: {
      siteUrl: "https://www.karmodint.co.uk",
      sanityProjectId: "proj",
      sanityDataset: "production",
    },
  }),
  useSeoMeta: () => undefined,
  useHead: (input: unknown) => head(input),
}));

vi.mock("vue-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-router")>()),
  useRoute: () => ({ params: { slug: "site-offices" } }),
}));

// The cards pull in the quote store; this page's own job is the copy and FAQs around them.
vi.mock("~/components/ProductCard.vue", () => ({
  default: defineComponent({ name: "ProductCard", props: ["card"], render: () => h("product-card-stub") }),
}));

const { default: SolutionPage } = await import("~/pages/solutions/[slug].vue");

const text = (value: string, extra: Record<string, unknown> = {}) => ({
  _type: "block",
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", text: value, marks: [] }],
  ...extra,
});

const siteOffices = {
  _id: "solution-site-offices",
  name: "Site Offices",
  slug: "site-offices",
  description: "Site cabins for offices and accommodation.",
  coverImage: { alt: "A site office", asset: { _type: "reference", _ref: "image-cover-1376x768-jpg" } },
  products: [],
  body: [text("Site Cabin Sizes and Dimensions", { style: "h2" }), text("Our site cabins are ideal.")],
  faqs: [
    { _key: "faq-0", question: "What is a site cabin?", answer: [text("A portable, prefabricated structure.")] },
    { _key: "faq-1", question: "What size are site cabins?", answer: [text("10 to 40 feet in length.")] },
  ],
};

async function mountWith(solution: Record<string, unknown>) {
  queries.mockReturnValue(solution);
  const Host = defineComponent({
    setup: () => () => h(Suspense, null, { default: () => h(SolutionPage) }),
  });
  const wrapper = mount(Host, { global: { stubs: { NuxtLink: RouterLinkStub } } });
  await flushPromises();
  return wrapper;
}

function jsonLdTypes(): Array<Record<string, any>> {
  const config = head.mock.calls.at(-1)?.[0];
  return config.script.map((script: { children: string }) => JSON.parse(script.children));
}

describe("Solution page", () => {
  beforeEach(() => {
    queries.mockReset();
    head.mockClear();
  });

  it("renders the Page Copy and an FAQ accordion headed with the Solution's name", async () => {
    const wrapper = await mountWith(siteOffices);

    expect(wrapper.get("article h2").text()).toBe("Site Cabin Sizes and Dimensions");
    expect(wrapper.get("article").text()).toContain("Our site cabins are ideal.");
    expect(wrapper.text()).toContain("Site Offices Frequently Asked Questions");
    expect(wrapper.findAll("details").map((item) => item.get("summary").text())).toEqual([
      "What is a site cabin?",
      "What size are site cabins?",
    ]);
    expect(wrapper.findAll("details")[1].text()).toContain("10 to 40 feet in length.");
  });

  it("declares FAQPage from the same Q&A it shows", async () => {
    await mountWith(siteOffices);

    const faqPage = jsonLdTypes().find((schema) => schema["@type"] === "FAQPage");
    expect(faqPage?.mainEntity).toEqual([
      {
        "@type": "Question",
        name: "What is a site cabin?",
        acceptedAnswer: { "@type": "Answer", text: "A portable, prefabricated structure." },
      },
      {
        "@type": "Question",
        name: "What size are site cabins?",
        acceptedAnswer: { "@type": "Answer", text: "10 to 40 feet in length." },
      },
    ]);
  });

  // Studio can save a half-filled FAQ; the accordion and FAQPage must still list the same questions.
  it("leaves a FAQ without question or answer text out of both the accordion and FAQPage", async () => {
    const wrapper = await mountWith({
      ...siteOffices,
      faqs: [
        { _key: "blank-q", question: "  ", answer: [text("An answer with no question.")] },
        siteOffices.faqs[0],
        { _key: "blank-a", question: "A question with no answer?", answer: [text("  ")] },
        { _key: "no-a", question: "Another unanswered question?", answer: null },
      ],
    });

    const shown = wrapper.findAll("details").map((item) => item.get("summary").text());
    const declared = jsonLdTypes()
      .find((schema) => schema["@type"] === "FAQPage")
      ?.mainEntity.map((entry: { name: string }) => entry.name);
    expect(shown).toEqual(["What is a site cabin?"]);
    expect(declared).toEqual(shown);
  });

  it("renders a Solution without Legacy copy as before: no copy, no accordion, no FAQPage", async () => {
    const wrapper = await mountWith({ ...siteOffices, body: null, faqs: null });

    expect(wrapper.find("article").exists()).toBe(false);
    expect(wrapper.find("details").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("Frequently Asked Questions");
    expect(jsonLdTypes().map((schema) => schema["@type"])).toEqual(["BreadcrumbList", "ItemList"]);
  });

  it("keeps the copy but leaves out FAQPage when a Solution has copy and no FAQs", async () => {
    const wrapper = await mountWith({ ...siteOffices, faqs: [] });

    expect(wrapper.find("article").exists()).toBe(true);
    expect(wrapper.find("details").exists()).toBe(false);
    expect(jsonLdTypes().map((schema) => schema["@type"])).not.toContain("FAQPage");
  });
});
