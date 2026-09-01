// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mirrors tests/stores/quote.spec.ts: outside Nuxt's runtime this auto-import doesn't exist, and
// AppHeader pulls in the quote store transitively via useQuickContact.
(globalThis as any).piniaPluginPersistedstate = { localStorage: () => undefined };

const AppHeader = (await import("~/components/AppHeader.vue")).default;

function makeRouter(initialPath: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", component: { template: "<div />" } },
      { path: "/contact", component: { template: "<div />" } },
      { path: "/catalog", component: { template: "<div />" } },
    ],
  });
  router.push(initialPath);
  return router;
}

async function flushRouterNavigation(router: ReturnType<typeof makeRouter>) {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await router.isReady();
}

async function mountHeader(initialPath: string) {
  const router = makeRouter(initialPath);
  await router.isReady();

  const wrapper = mount(AppHeader, {
    global: {
      plugins: [createPinia(), router],
      stubs: {
        NuxtLink: { template: "<a><slot /></a>" },
      },
    },
  });

  return { wrapper, router };
}

describe("AppHeader location button", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("scrolls the on-page map section into view instead of navigating", async () => {
    const mapSection = document.createElement("div");
    mapSection.id = "map-section";
    mapSection.scrollIntoView = vi.fn();
    document.body.appendChild(mapSection);

    const { wrapper, router } = await mountHeader("/");
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.get('button[aria-label="Scroll to Location Map"]').trigger("click");

    expect(mapSection.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });
    expect(pushSpy).not.toHaveBeenCalled();

    document.body.removeChild(mapSection);
    wrapper.unmount();
  });

  it("navigates to the contact page's map section when it isn't on the current page", async () => {
    const { wrapper, router } = await mountHeader("/catalog");
    const pushSpy = vi.spyOn(router, "push");

    await wrapper.get('button[aria-label="Scroll to Location Map"]').trigger("click");
    await flushRouterNavigation(router);

    expect(pushSpy).toHaveBeenCalledWith("/contact#map-section");
    expect(router.currentRoute.value.fullPath).toBe("/contact#map-section");

    wrapper.unmount();
  });
});
