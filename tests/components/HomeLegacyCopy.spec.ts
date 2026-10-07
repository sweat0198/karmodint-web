// @vitest-environment jsdom

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import HomeAboutSection from "../../app/components/home/HomeAboutSection.vue";
import HomeCategoriesSection from "../../app/components/home/HomeCategoriesSection.vue";
import HomeCompanySection from "../../app/components/home/HomeCompanySection.vue";

// Legacy home copy (www.karmodint.co.uk/, fetched 2026-10-06), ported word for word, minus the
// founding year and country count the client cut (issue #31).
const NuxtLinkStub = {
  props: ["to"],
  template: '<a :href="to"><slot /></a>',
};

const text = (html: string) => html.replace(/\s+/g, " ").trim();

describe("HomeCategoriesSection", () => {
  const wrapper = mount(HomeCategoriesSection, { global: { stubs: { NuxtLink: NuxtLinkStub } } });

  it("shows the Legacy category heading and strapline", () => {
    expect(wrapper.find("h2").text()).toBe("We Are the Best in the Field");
    expect(text(wrapper.text())).toContain("Reliable and Leading Brand of Portable Systems");
  });

  it("links each Legacy category tile to its page, never to a redirected Legacy URL", () => {
    const tiles = wrapper.findAll("[data-category-tile]");

    expect(
      tiles.map((tile) => [tile.find("h3").text(), tile.attributes("href")]),
    ).toEqual([
      ["Portable Cabin", "/portable-cabin/"],
      ["GRP Kiosk", "/grp-kiosk-cabin/"],
      ["Panel Cabins", "/panel-cabin/"],
      ["MetroCity Cabin", "/products/?category=cabin&subcategory=metro-city"],
    ]);
    for (const tile of tiles) {
      expect(tile.text()).toContain("View Products");
    }
  });

  it("gives every tile an existing image with alt text", () => {
    for (const image of wrapper.findAll("img")) {
      expect(image.attributes("alt")).toBeTruthy();
      expect(image.attributes("loading")).toBe("lazy");
      expect(existsSync(resolve(process.cwd(), "public", image.attributes("src")!.slice(1)))).toBe(true);
    }
  });
});

describe("HomeAboutSection", () => {
  const wrapper = mount(HomeAboutSection, { global: { stubs: { NuxtLink: NuxtLinkStub } } });
  const body = text(wrapper.text());

  it("shows the Legacy about heading and copy", () => {
    expect(text(wrapper.find("h2").text())).toBe(
      "Karmod International Portable Buildings, Unleash Possibilities!",
    );
    expect(body).toContain(
      "\"Portable Buildings, Unleash Possibilities!\" Our slogan embodies the limitless potential that these versatile structures offer. They're not just buildings; they're pathways to creativity, adaptability, and innovation. Whether you're expanding your business, creating a dynamic workspace, or pursuing your dreams on the go, portable buildings are the key. With them, your imagination knows no bounds.",
    );
    expect(body).toContain(
      "Join us in the journey of redefining spaces and unlocking opportunities. Discover a world where you can set up, learn, explore, or relax wherever your vision takes you.",
    );
  });

  it("shows the Legacy slogan with its Read More link retargeted to the gallery", () => {
    const slogan = wrapper.get("[data-slogan]");
    expect(slogan.findAll("[data-slogan-line]").map((line) => text(line.text()))).toEqual([
      "Karmod International",
      "Portable Cabins,",
      "Your Space, Your Way!",
      "Your instant retreat, your mobile workspace, your personalized haven – all in one compact package.",
    ]);
    expect(wrapper.get("[data-slogan-link]").attributes("href")).toBe("/gallery/");
    expect(wrapper.get("[data-slogan-link]").text()).toBe("Read More");
  });

  it("shows the Legacy WhatsApp prompt with the current WhatsApp number", () => {
    expect(body).toContain(
      "You can contact us via WhatsApp for more information about our products and services and for a price quote.",
    );
    const whatsApp = wrapper.get("[data-whatsapp-link]");
    expect(whatsApp.attributes("href")).toBe("https://wa.me/447359538937");
    expect(text(whatsApp.text())).toBe("WhatsApp +44 7359 538937");
  });

  it("shows the Legacy catalogue and certificate boxes", () => {
    const catalogs = wrapper.get("[data-catalogs-link]");
    expect(catalogs.attributes("href")).toBe("/products/");
    expect(catalogs.get("h3").text()).toBe("Online Catalogs");
    expect(catalogs.get("p").text()).toBe("You can reach our catalogs of our portable solutions here.");

    const certificates = wrapper.get("[data-certificates]");
    expect(certificates.get("h3").text()).toBe("Our Quality Certificates");
    expect(certificates.get("p").text()).toBe(
      "We believe that customer satisfaction comes from superior product and service quality.",
    );
  });
});

describe("HomeCompanySection", () => {
  const wrapper = mount(HomeCompanySection);

  it("shows the Legacy company heading as an h2, so the hero keeps the page's h1", () => {
    expect(wrapper.find("h1").exists()).toBe(false);
    expect(wrapper.get("h2").text()).toBe("Karmod International");
    expect(wrapper.get("[data-company-strapline]").text()).toBe(
      "Leading the Innovation in Modular and Prefabricated Solutions",
    );
  });

  it("shows the Legacy introduction and closing paragraphs, without the founding year", () => {
    const paragraphs = wrapper.findAll("[data-company-paragraph]").map((p) => text(p.text()));

    expect(paragraphs).toEqual([
      "Karmod International stands as a distinguished leader in the field of modular and prefabricated construction. The company has continuously pushed the boundaries of construction innovation. Here's an in-depth look at this influential organization:",
      "Karmod International's unwavering commitment to excellence, sustainability, and innovation has firmly established its position as a leader in the modular and prefabricated construction industry. As the demand for efficient and sustainable building solutions continues to rise, Karmod International remains a dependable partner for businesses and organizations seeking top-tier modular and prefabricated structures.",
    ]);
  });

  it("shows the seven Legacy strengths, label and text, without a country count", () => {
    const items = wrapper.findAll("[data-company-strength]");

    expect(items.map((item) => item.get("h3").text())).toEqual([
      "Global Reach:",
      "Diverse Product Portfolio:",
      "Cutting-Edge Technology:",
      "Sustainability Focus:",
      "Tailored Solutions:",
      "Swift Assembly:",
      "Quality Assurance:",
    ]);
    expect(text(items[0]!.get("p").text())).toBe(
      "Karmod International boasts a global presence. This extensive network highlights the company's unwavering commitment to delivering top-notch modular and prefabricated structures on a worldwide scale.",
    );
    expect(text(items[6]!.get("p").text())).toBe(
      "Karmod International places a high priority on quality assurance, adhering to international standards and certifications. Clients can have complete confidence that their structures are built to endure.",
    );
    expect(wrapper.text()).not.toMatch(/1986|\d+ countries/);
  });
});
