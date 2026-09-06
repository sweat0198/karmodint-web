import { describe, expect, it, vi } from "vitest";

globalThis.defineEventHandler = (handler: any) => handler;
globalThis.useRuntimeConfig = () => ({
  public: { siteUrl: "https://example.com" },
});
globalThis.setHeader = vi.fn();

const sitemapHandler = (await import("~~/server/routes/sitemap.xml")).default;

describe("sitemap", () => {
  it("publishes the products route without the pre-launch catalog route", () => {
    const xml = sitemapHandler({} as any);

    expect(xml).toContain("https://example.com/products");
    expect(xml).not.toContain("/catalog");
    expect(globalThis.setHeader).toHaveBeenCalledWith(
      expect.anything(),
      "Content-Type",
      "application/xml; charset=utf-8",
    );
  });
});
