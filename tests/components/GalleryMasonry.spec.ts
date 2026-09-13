// @vitest-environment jsdom

import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GalleryMasonry from "~/components/gallery/GalleryMasonry.vue";
import type { GalleryTile } from "~/types/gallery";

function tile(overrides: Partial<GalleryTile> = {}): GalleryTile {
  return {
    id: "tile-1",
    title: "Container house in a garden",
    description: "A short description.",
    category: { _id: "cat-containers", name: "Containers", slug: "containers", displayOrder: 1 },
    image: {
      src: "https://cdn.sanity.io/images/proj/production/a-1600x1200.jpg?w=800",
      srcset: "https://cdn.sanity.io/images/proj/production/a-1600x1200.jpg?w=480 480w",
      alt: "A white container house.",
      width: 1600,
      height: 1200,
      aspectRatio: 1600 / 1200,
    },
    ...overrides,
  };
}

const TILES: GalleryTile[] = [
  tile({ id: "t1", title: "Container house", category: { _id: "c1", name: "Containers", slug: "containers", displayOrder: 1 } }),
  tile({ id: "t2", title: "Metro City cabin", category: { _id: "c2", name: "Metro City", slug: "metro-city", displayOrder: 2, parentSlug: "cabin" } }),
  tile({ id: "t3", title: "Another container project", category: { _id: "c1", name: "Containers", slug: "containers", displayOrder: 1 } }),
];

/** Mirrors vue-router's own path+query resolution closely enough to assert on the rendered href. */
const NuxtLinkStub = {
  props: ["to"],
  template: '<a :href="href"><slot /></a>',
  computed: {
    href(): string {
      if (typeof this.to === "string") return this.to;
      const query = this.to?.query
        ? `?${new URLSearchParams(this.to.query as Record<string, string>).toString()}`
        : "";
      return `${this.to?.path ?? ""}${query}`;
    },
  },
};

const mountOptions = {
  global: {
    stubs: {
      NuxtLink: NuxtLinkStub,
    },
  },
};

let mountedWrappers: VueWrapper[] = [];

/** `Teleport to="body"` renders outside the mounted root, so lightbox assertions query the real DOM. */
function mountGallery(tiles: GalleryTile[]) {
  const wrapper = mount(GalleryMasonry, { props: { tiles }, attachTo: document.body, ...mountOptions });
  mountedWrappers.push(wrapper);
  return wrapper;
}

/** Clicks the first tile whose title matches, and waits for the lightbox to open. */
async function openTile(wrapper: VueWrapper, titleText: string) {
  const button = [...document.querySelectorAll("button")].find((b) => b.textContent?.includes(titleText));
  button!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await wrapper.vm.$nextTick();
}

describe("GalleryMasonry", () => {
  let originalResizeObserver: typeof ResizeObserver | undefined;

  beforeEach(() => {
    originalResizeObserver = globalThis.ResizeObserver;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        callback: ResizeObserverCallback;
        constructor(callback: ResizeObserverCallback) {
          this.callback = callback;
        }
        observe(target: Element) {
          this.callback(
            [{ target } as ResizeObserverEntry],
            this as unknown as ResizeObserver,
          );
        }
        unobserve() {}
        disconnect() {}
      },
    );
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 1024,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  afterEach(() => {
    // Unmount every wrapper (not just wipe the DOM) so no component is left with pending reactive
    // updates targeting nodes that are about to disappear — a leftover instance's queued update
    // can otherwise flush mid-way through a *later* test and crash on a now-detached Teleport target.
    for (const wrapper of mountedWrappers) wrapper.unmount();
    mountedWrappers = [];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    if (originalResizeObserver) globalThis.ResizeObserver = originalResizeObserver;
    document.body.innerHTML = "";
  });

  it("renders one chip per distinct category plus an All projects chip, with counts", () => {
    const wrapper = mountGallery(TILES);

    expect(wrapper.get('[data-gallery-chip="ALL"]').text()).toContain("3");
    expect(wrapper.get('[data-gallery-chip="containers"]').text()).toContain("Containers");
    expect(wrapper.get('[data-gallery-chip="containers"]').text()).toContain("2");
    expect(wrapper.get('[data-gallery-chip="metro-city"]').text()).toContain("1");
  });

  it("filters tiles when a category chip is clicked", async () => {
    const wrapper = mountGallery(TILES);

    expect(wrapper.get("[data-gallery-count]").text()).toContain("3 projects");

    await wrapper.get('[data-gallery-chip="metro-city"]').trigger("click");

    expect(wrapper.get("[data-gallery-count]").text()).toContain("1 project");
    expect(wrapper.text()).toContain("Metro City cabin");
    expect(wrapper.text()).not.toContain("Container house");
  });

  it("shows an empty state with a reset link when a category has no tiles", async () => {
    const wrapper = mountGallery([]);

    expect(wrapper.text()).toContain("No projects found in this category.");

    await wrapper.get('[data-gallery-chip="ALL"]').trigger("click");
    expect(wrapper.props("tiles")).toEqual([]);
  });

  it("opens the lightbox with the selected tile's details on click", async () => {
    const wrapper = mountGallery(TILES);

    expect(document.querySelector('[role="dialog"]')).toBeNull();

    await openTile(wrapper, "Container house");

    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog!.getAttribute("aria-label")).toBe("Container house");
    expect(dialog!.textContent).toContain("A short description.");
  });

  it("closes the lightbox on Escape and via the close button", async () => {
    const wrapper = mountGallery(TILES);

    await openTile(wrapper, "Container house");
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    document
      .querySelector('[role="dialog"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("positions filtered tiles absolutely once the grid container has been measured", async () => {
    const wrapper = mountGallery(TILES);
    await wrapper.vm.$nextTick();

    const positioned = wrapper.findAll(".absolute").filter((el) => el.attributes("style")?.includes("width"));
    expect(positioned.length).toBe(TILES.length);
  });

  it("links the quote CTA to the tile's category on the catalogue", async () => {
    const wrapper = mountGallery(TILES);

    // t1 "Container house" is a top-level category (no parentSlug) — plain ?category=.
    await openTile(wrapper, "Container house");
    const containersLink = document.querySelector('a[href^="/products"]');
    expect(containersLink!.getAttribute("href")).toBe("/products?category=containers");
    expect(containersLink!.textContent?.toLowerCase()).toContain("request a quote");

    document.querySelector('[aria-label="Close"]')!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await wrapper.vm.$nextTick();

    // t2 "Metro City cabin" is a subcategory of "cabin" — nested ?category=cabin&subcategory=.
    await openTile(wrapper, "Metro City cabin");
    const metroCityLink = document.querySelector('a[href^="/products"]');
    expect(metroCityLink!.getAttribute("href")).toBe("/products?category=cabin&subcategory=metro-city");
  });
});
