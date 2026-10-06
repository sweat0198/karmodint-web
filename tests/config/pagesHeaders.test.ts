import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const publicDir = path.join(__dirname, "../../public");

type HeaderRule = { pattern: string; headers: Record<string, string> };

/** Parses `public/_headers` the way Cloudflare Pages does: an unindented URL line, then indented `Name: value` lines. */
function parseHeadersFile(source: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const line of source.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (/^\s/.test(line)) {
      const [name, ...value] = line.trim().split(":");
      rules.at(-1)!.headers[name!.trim().toLowerCase()] = value.join(":").trim();
    } else {
      rules.push({ pattern: line.trim(), headers: {} });
    }
  }
  return rules;
}

/**
 * Cloudflare Pages `_headers` matching (developers.cloudflare.com/pages/configuration/headers/):
 * a `:placeholder` matches anything but the delimiter (`.` or `/` in the host, `/` in the path),
 * a `*` splat matches greedily, and path-only rules apply on every host.
 */
function ruleMatches(pattern: string, url: URL): boolean {
  const absolute = pattern.startsWith("https://");
  const target = absolute ? `https://${url.hostname}${url.pathname}` : url.pathname;
  const hostEnd = absolute ? pattern.indexOf("/", "https://".length) : 0;
  let regex = "";
  let i = 0;
  while (i < pattern.length) {
    const placeholder = /^:[A-Za-z0-9_]+/.exec(pattern.slice(i));
    if (placeholder) {
      regex += i < hostEnd ? "[^./]+" : "[^/]+";
      i += placeholder[0].length;
    } else if (pattern[i] === "*") {
      regex += ".*";
      i += 1;
    } else {
      regex += pattern[i]!.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${regex}$`).test(target);
}

function headersFor(url: string): Record<string, string> {
  const rules = parseHeadersFile(readFileSync(path.join(publicDir, "_headers"), "utf8"));
  return Object.assign(
    {},
    ...rules.filter((rule) => ruleMatches(rule.pattern, new URL(url))).map((rule) => rule.headers),
  );
}

describe("pages.dev noindex", () => {
  it("marks the production pages.dev host noindex", () => {
    expect(headersFor("https://karmodint-web.pages.dev/")["x-robots-tag"]).toBe("noindex");
    expect(headersFor("https://karmodint-web.pages.dev/products/")["x-robots-tag"]).toBe("noindex");
  });

  it("marks preview deploys and branch aliases noindex", () => {
    expect(headersFor("https://3f2a9c1b.karmodint-web.pages.dev/")["x-robots-tag"]).toBe("noindex");
    expect(headersFor("https://uk-migration.karmodint-web.pages.dev/about/")["x-robots-tag"]).toBe("noindex");
  });

  it("never sends X-Robots-Tag on the production custom domain", () => {
    for (const url of [
      "https://www.karmodint.co.uk/",
      "https://www.karmodint.co.uk/products/",
      "https://karmodint.co.uk/",
      // "pages.dev" in the path must not count: the rule matches on the host.
      "https://www.karmodint.co.uk/karmodint-web.pages.dev/",
    ]) {
      expect(headersFor(url), url).not.toHaveProperty("x-robots-tag");
    }
  });

  it("keeps robots.txt allowing crawls, so Google can see the noindex header", () => {
    const robots = readFileSync(path.join(publicDir, "robots.txt"), "utf8");

    expect(robots).toMatch(/^User-Agent: \*$/m);
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).not.toMatch(/^Disallow: \/\s*$/m);
  });
});
