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

    expect(xml).toContain("<loc>https://example.com/products/</loc>");
    expect(xml).not.toContain("/catalog");
    expect(globalThis.setHeader).toHaveBeenCalledWith(
      expect.anything(),
      "Content-Type",
      "application/xml; charset=utf-8",
    );
  });

  it("lists every page at its `/`-ending address (ADR-003)", () => {
    const xml: string = sitemapHandler({} as any);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    expect(locs).toContain("https://example.com/");
    expect(locs.length).toBeGreaterThan(1);
    for (const loc of locs) expect(loc).toMatch(/\/$/);
  });

  it("lists the Privacy Policy Kept URL", () => {
    const xml: string = sitemapHandler({} as any);

    expect(xml).toContain("<loc>https://example.com/privacy-policy/</loc>");
  });
});
