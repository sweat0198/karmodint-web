import { describe, expect, it } from "vitest";
import { findWorkerRoutedPaths } from "../../modules/legacy-redirects/workerRoutes";

describe("findWorkerRoutedPaths", () => {
  it("flags paths Nitro's default catch-all hands to the worker, where _redirects never runs", () => {
    const nitroDefault = { version: 1, include: ["/*"], exclude: ["/_nuxt/*", "/", "/about", "/contact"] };

    expect(findWorkerRoutedPaths(nitroDefault, ["/container/", "/container", "/about", "/"])).toEqual([
      "/container/",
      "/container",
    ]);
  });

  it("lets everything outside /api/* reach the static asset server", () => {
    const apiOnly = { version: 1, include: ["/api/*"], exclude: [] };

    expect(findWorkerRoutedPaths(apiOnly, ["/container/", "/container", "/blog/york-modular-kiosks/", "/api/quote"])).toEqual([
      "/api/quote",
    ]);
  });
});
