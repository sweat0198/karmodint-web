// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PrivacyPolicyArticle from "~/components/legal/PrivacyPolicyArticle.vue";

const NuxtLinkStub = {
  props: ["to"],
  template: '<a :href="to"><slot /></a>',
};

/**
 * The client-supplied policy (docs/assets/privacy-policy.md), one entry per line of text, markup stripped: the part
 * after the `---` rule, without `###`, `*` emphasis, `•` bullets or Markdown line-break spaces.
 */
function sourceLines(): string[] {
  const markdown = readFileSync(resolve(process.cwd(), "docs/assets/privacy-policy.md"), "utf8");
  return markdown
    .slice(markdown.indexOf("\n---\n") + 5)
    .split("\n")
    .map((line) => line.replace(/^### /, "").replace(/^•\s+/, "").replaceAll("*", "").trim())
    .filter(Boolean);
}

const BLOCKS = new Set(["ADDRESS", "ARTICLE", "DIV", "H1", "H2", "H3", "HEADER", "LI", "OL", "P", "SECTION", "UL"]);

/** The rendered text as the reader sees it: one entry per block element or `<br>`-separated line. */
function renderedLines(root: Element): string[] {
  let text = "";
  const walk = (node: Node) => {
    if (node.nodeType === node.TEXT_NODE) text += node.textContent;
    if (node.nodeName === "BR") text += "\n";
    const block = BLOCKS.has(node.nodeName);
    if (block) text += "\n";
    node.childNodes.forEach(walk);
    if (block) text += "\n";
  };
  walk(root);
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

describe("PrivacyPolicyArticle", () => {
  const wrapper = mount(PrivacyPolicyArticle, { global: { stubs: { NuxtLink: NuxtLinkStub } } });
  const lines = renderedLines(wrapper.element);
  const source = sourceLines();

  it("titles the page Privacy Policy", () => {
    expect(wrapper.findAll("h1").map((h1) => h1.text())).toEqual(["Privacy Policy"]);
    expect(source[0]).toBe("PRIVACY POLICY");
  });

  it("renders the client-supplied text word for word, in order", () => {
    expect(lines.slice(1)).toEqual(source.slice(1));
  });

  it("gives each numbered section its own heading", () => {
    const headings = wrapper.findAll("h2").map((h2) => h2.text());

    expect(headings).toHaveLength(14);
    expect(headings[0]).toBe("1. Who We Are");
    expect(headings[13]).toBe("14. Contact Us");
  });

  it("renders the bulleted passages as lists", () => {
    expect(wrapper.findAll("ul").map((ul) => ul.findAll("li").length)).toEqual([10, 6, 9, 5, 6, 7]);
  });

  it("puts the contact details in an address block with working phone and email links", () => {
    const address = wrapper.get("address");

    expect(address.text()).toContain("LE14 4AJ");
    expect(address.get('a[href="tel:+441164030143"]').text()).toBe("0116 403 0143");
    expect(address.get('a[href="mailto:info@karmodint.co.uk"]').text()).toBe("info@karmodint.co.uk");
    expect(address.get('a[href="/"]').text()).toBe("www.karmodint.co.uk");
  });
});
