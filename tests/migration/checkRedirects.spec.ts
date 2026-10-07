import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { checkRedirects } from "../../scripts/migration/checkRedirects";
import type { Redirect } from "../../shared/migration/redirects";

type StubResponse = { status: number; location?: string };

const servers: Server[] = [];

/** A local host that answers each listed path with a fixed status (and `Location`), and 404 for anything else. */
async function stubHost(routes: Record<string, StubResponse>): Promise<{ origin: string; requested: string[] }> {
  const requested: string[] = [];
  const server = createServer((request, response) => {
    const url = request.url ?? "/";
    requested.push(url);
    const route = routes[url] ?? { status: 404 };
    response.writeHead(route.status, route.location ? { Location: route.location } : {});
    response.end();
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return { origin: `http://127.0.0.1:${port}`, requested };
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

const redirects: Redirect[] = [
  { from: "/about-us/", to: "/about/", status: 301 },
  { from: "/faq/", to: "/contact/", status: 302 },
  { from: "/metrocity-cabin/", to: "/products/?category=cabin&subcategory=metro-city", status: 301 },
];
const keptUrls = ["/", "/portable-cabin/"];

/** What a correct deploy answers: both forms of each source redirect in one hop, every page is a 200. */
const correctHost: Record<string, StubResponse> = {
  "/about-us/": { status: 301, location: "/about/" },
  "/about-us": { status: 301, location: "/about/" },
  "/faq/": { status: 302, location: "/contact/" },
  "/faq": { status: 302, location: "/contact/" },
  "/metrocity-cabin/": { status: 301, location: "/products/?category=cabin&subcategory=metro-city" },
  "/metrocity-cabin": { status: 301, location: "/products/?category=cabin&subcategory=metro-city" },
  "/about/": { status: 200 },
  "/contact/": { status: 200 },
  "/products/?category=cabin&subcategory=metro-city": { status: 200 },
  "/": { status: 200 },
  "/portable-cabin/": { status: 200 },
};

describe("checkRedirects", () => {
  it("finds no failures when every source form redirects in one hop and every Kept URL is a 200", async () => {
    const host = await stubHost(correctHost);

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([]);
    expect(host.requested).toEqual(
      expect.arrayContaining(["/about-us/", "/about-us", "/faq/", "/faq", "/metrocity-cabin/", "/metrocity-cabin"]),
    );
    expect(host.requested).toEqual(expect.arrayContaining(["/", "/portable-cabin/"]));
  });

  it("lists a source form answering with the wrong status, or not redirecting at all", async () => {
    const host = await stubHost({
      ...correctHost,
      "/faq": { status: 301, location: "/contact/" },
      "/about-us": { status: 404 },
    });

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([
      { path: "/about-us", problem: "expected 301 → /about/, got 404" },
      { path: "/faq", problem: "expected 302 → /contact/, got 301 → /contact/" },
    ]);
  });

  it("lists a source redirecting to the wrong Location, comparing absolute and relative forms by URL", async () => {
    const routes: Record<string, StubResponse> = {
      ...correctHost,
      "/about-us/": { status: 301, location: "/about" },
      "/metrocity-cabin": { status: 301, location: "/products/" },
    };
    const host = await stubHost(routes);
    // An absolute Location on the checked host is the same target, so it passes.
    routes["/faq/"] = { status: 302, location: `${host.origin}/contact/` };

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([
      { path: "/about-us/", problem: "expected 301 → /about/, got 301 → /about" },
      {
        path: "/metrocity-cabin",
        problem: "expected 301 → /products/?category=cabin&subcategory=metro-city, got 301 → /products/",
      },
    ]);
  });

  it("lists a chain: the target redirects again, so the source takes more than one hop", async () => {
    const host = await stubHost({ ...correctHost, "/about/": { status: 308, location: "/about-karmod/" } });

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([
      { path: "/about-us/", problem: "chain: 301 → /about/, then 308 → /about-karmod/" },
      { path: "/about-us", problem: "chain: 301 → /about/, then 308 → /about-karmod/" },
    ]);
  });

  it("lists a source whose target page isn't a 200", async () => {
    const host = await stubHost({ ...correctHost, "/contact/": { status: 404 } });

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([
      { path: "/faq/", problem: "302 → /contact/, which answers 404" },
      { path: "/faq", problem: "302 → /contact/, which answers 404" },
    ]);
  });

  it("lists a Kept URL that doesn't answer 200, including one that redirects", async () => {
    const host = await stubHost({
      ...correctHost,
      "/": { status: 301, location: "/home/" },
      "/portable-cabin/": { status: 404 },
    });

    const report = await checkRedirects({ origin: host.origin, redirects, keptUrls });

    expect(report.failures).toEqual([
      { path: "/", problem: "Kept URL: expected 200, got 301 → /home/" },
      { path: "/portable-cabin/", problem: "Kept URL: expected 200, got 404" },
    ]);
  });

  it("lists a request that fails outright instead of throwing", async () => {
    const host = await stubHost({});
    await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));

    const report = await checkRedirects({ origin: host.origin, redirects: redirects.slice(0, 1), keptUrls: ["/"] });

    expect(report.failures.map((failure) => failure.path)).toEqual(["/about-us/", "/about-us", "/"]);
    expect(report.failures.every((failure) => failure.problem.startsWith("request failed: "))).toBe(true);
  });
});
