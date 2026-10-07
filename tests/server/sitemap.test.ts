import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let runtimeConfig: { public: Record<string, string> };

globalThis.defineEventHandler = (handler: any) => handler;
globalThis.useRuntimeConfig = () => runtimeConfig;
globalThis.setHeader = vi.fn();

const sitemapHandler = (await import("~~/server/routes/sitemap.xml")).default;

const sanityFetch = vi.fn();

function sanityAnswers(result: unknown) {
  sanityFetch.mockResolvedValue(new Response(JSON.stringify({ result }), { status: 200 }));
}

async function locs(): Promise<string[]> {
  const xml: string = await sitemapHandler({} as any);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
}

const STATIC_LOCS = [
  "https://example.com/",
  "https://example.com/products/",
  "https://example.com/solutions/",
  "https://example.com/gallery/",
  "https://example.com/about/",
  "https://example.com/contact/",
  "https://example.com/privacy-policy/",
];

beforeEach(() => {
  runtimeConfig = {
    public: { siteUrl: "https://example.com", sanityProjectId: "abc123", sanityDataset: "production" },
  };
  sanityFetch.mockReset();
  sanityAnswers({ solutionSlugs: [], productLinePaths: [] });
  vi.stubGlobal("fetch", sanityFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sitemap", () => {
  it("serves XML", async () => {
    await sitemapHandler({} as any);

    expect(globalThis.setHeader).toHaveBeenCalledWith(
      expect.anything(),
      "Content-Type",
      "application/xml; charset=utf-8",
    );
  });

  it("lists the static pages, Privacy Policy included, and leaves out /quote/ and /customize/", async () => {
    expect(await locs()).toEqual(STATIC_LOCS);
  });

  it("lists every Product Line and Solution the dataset returns, at `/`-ending URLs", async () => {
    sanityAnswers({
      solutionSlugs: ["events", "site-offices"],
      productLinePaths: ["/grp-kiosk-cabin/", "/portable-cabin/steel-cabin/", "/panel-cabin"],
    });

    expect(await locs()).toEqual([
      ...STATIC_LOCS,
      "https://example.com/grp-kiosk-cabin/",
      "https://example.com/portable-cabin/steel-cabin/",
      "https://example.com/panel-cabin/",
      "https://example.com/solutions/events/",
      "https://example.com/solutions/site-offices/",
    ]);
  });

  it("reads them from the configured Sanity project and dataset with the sitemap query", async () => {
    await sitemapHandler({} as any);

    const url = new URL(String(sanityFetch.mock.calls[0]![0]));
    expect(url.hostname).toBe("abc123.api.sanity.io");
    expect(url.pathname).toMatch(/\/data\/query\/production$/);
    const { SITEMAP_DOCUMENTS_QUERY } = await import("~~/server/utils/sitemap");
    expect(url.searchParams.get("query")).toBe(SITEMAP_DOCUMENTS_QUERY);
  });

  it("never lists API routes, the quote flow or the customizer", async () => {
    sanityAnswers({ solutionSlugs: ["site-offices"], productLinePaths: ["/portable-cabin/"] });

    for (const loc of await locs()) {
      expect(loc).not.toMatch(/\/(api|quote|customize)\//);
    }
  });

  it("lists each page once", async () => {
    sanityAnswers({ solutionSlugs: ["events", "events"], productLinePaths: ["/panel-cabin/", "/panel-cabin"] });

    const all = await locs();
    expect(all).toHaveLength(new Set(all).size);
  });

  it("fails rather than publishing a sitemap without the Sanity pages when the read fails", async () => {
    sanityFetch.mockResolvedValue(new Response("nope", { status: 500 }));

    await expect(sitemapHandler({} as any)).rejects.toThrow(/sitemap/i);
  });

  it("lists only the static pages when no Sanity project is configured (tests, a fresh clone)", async () => {
    runtimeConfig.public.sanityProjectId = "dummy_project_id";

    expect(await locs()).toEqual(STATIC_LOCS);
    expect(sanityFetch).not.toHaveBeenCalled();
  });
});
