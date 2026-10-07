import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { KEPT_URLS } from "../../shared/migration/keptUrls";
import {
  PENDING_REDIRECT_GROUPS,
  REDIRECT_GROUPS,
  REDIRECTS,
  toRedirects,
  type Redirect,
} from "../../shared/migration/redirects";

const tsvPath = path.join(__dirname, "../../docs/plans/2026-10-06-uk-migration-redirects.tsv");

/** The migration's source data: `source<TAB>target<TAB>code<TAB>origin`, one rule per line. */
function readTsvRules(): string[] {
  return readFileSync(tsvPath, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.split("\t").slice(0, 3).join(" "));
}

const asLine = (rule: Redirect) => `${rule.from} ${rule.to} ${rule.status}`;
const pathnameOf = (url: string) => url.split(/[?#]/)[0]!;

/** The invariants every shipped redirect map must hold (design doc, "Redirects"). */
function expectValidMap(rules: readonly Redirect[]) {
  const sources = rules.map((rule) => rule.from);
  const targets = new Set(rules.map((rule) => pathnameOf(rule.to)));

  expect(sources.filter((source) => targets.has(source)), "sources that are also targets (chains)").toEqual([]);
  expect(sources.filter((source) => (KEPT_URLS as readonly string[]).includes(source)), "Kept URL sources").toEqual([]);
  expect(
    rules.flatMap((rule) => [rule.from, pathnameOf(rule.to)]).filter((p) => !p.startsWith("/") || !p.endsWith("/")),
    "paths not ending in /",
  ).toEqual([]);
  expect(sources.filter((source, i) => sources.indexOf(source) !== i), "duplicate sources").toEqual([]);
}

describe("redirect map", () => {
  it("holds the invariants: no chains, no Kept URL sources, every path ends in /, no duplicate sources", () => {
    expectValidMap(REDIRECTS);
  });

  it("still holds them once every pending group ships", () => {
    expectValidMap(toRedirects([...REDIRECT_GROUPS, ...PENDING_REDIRECT_GROUPS]));
  });

  it("covers the migration TSV exactly: every row is shipped or pending, nothing else", () => {
    const mapped = toRedirects([...REDIRECT_GROUPS, ...PENDING_REDIRECT_GROUPS]).map(asLine);

    expect([...mapped].sort()).toEqual(readTsvRules().sort());
    expect(mapped).toHaveLength(192);
  });

  it("ships only rules whose targets exist today: Solutions, /gallery/, /about/, /contact/, /products/, /privacy-policy/ and /", () => {
    const existing = /^\/(solutions\/[a-z0-9-]+\/|gallery\/|about\/|contact\/|products\/|privacy-policy\/|)$/;

    expect(REDIRECTS.map((rule) => pathnameOf(rule.to)).filter((target) => !existing.test(target))).toEqual([]);
    expect(REDIRECTS).toHaveLength(118);
  });

  it("holds back the rules targeting Product Line pages", () => {
    const pendingTargets = new Set(toRedirects(PENDING_REDIRECT_GROUPS).map((rule) => rule.to));

    expect([...pendingTargets].sort()).toEqual([
      "/bulletproof-cabin/",
      "/grp-kiosk-cabin/",
      "/panel-cabin/",
      "/portable-cabin/",
      "/portable-cabin/portable-classroom/",
    ]);
  });

  it("moves the Legacy policy pages to /privacy-policy/", () => {
    expect(REDIRECTS.filter((rule) => rule.to === "/privacy-policy/")).toEqual([
      { from: "/corporate-personal-data-protection-policy/", to: "/privacy-policy/", status: 301 },
      { from: "/kvkk/", to: "/privacy-policy/", status: 301 },
    ]);
  });

  it("sends the metro-city cabin page to the filtered products list", () => {
    expect(REDIRECTS).toContainEqual({
      from: "/metrocity-cabin/",
      to: "/products/?category=cabin&subcategory=metro-city",
      status: 301,
    });
  });

  it("uses 302 only for the interim /faq/ and /cookies-policy/ moves", () => {
    expect(REDIRECTS.filter((rule) => rule.status !== 301)).toEqual([
      { from: "/cookies-policy/", to: "/contact/", status: 302 },
      { from: "/faq/", to: "/contact/", status: 302 },
    ]);
  });
});
