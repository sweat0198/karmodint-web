import { PUBLISHED_PRODUCT_LINE_FILTER } from "../../shared/utils/productLineRoutes";
import { STATIC_PAGES, solutionPagePath, type SitemapHints, type StaticPage } from "../../shared/utils/sitePages";
import { toAbsoluteSiteUrl, toSitePath } from "../../shared/utils/sitePath";

/** The Sanity documents that have an indexable page of their own. */
export interface SitemapDocuments {
  solutionSlugs: string[];
  productLinePaths: string[];
}

/**
 * Every published Solution and Product Line not marked noindex in Studio (`seo.noIndex`), as the
 * values their pages build canonicals from. `!(x == true)` rather than `x != true`: a missing `seo`
 * must count as indexable under every GROQ version, apiVersion "1" included.
 */
export const SITEMAP_DOCUMENTS_QUERY = `{
  "solutionSlugs": *[
    _type == "solution" && defined(slug.current) && !(_id in path("drafts.**")) && !(seo.noIndex == true)
  ] | order(slug.current asc).slug.current,
  "productLinePaths": *[
    ${PUBLISHED_PRODUCT_LINE_FILTER} && !(seo.noIndex == true)
  ] | order(path asc).path
}`;

export interface SitemapEntry {
  /** Page path; `<loc>` is its `/`-ending absolute URL. */
  path: string;
  changefreq: SitemapHints["changefreq"];
  priority: string;
}

const PRODUCT_LINE_HINTS: SitemapHints = { changefreq: "weekly", priority: "0.8" };
const SOLUTION_HINTS: SitemapHints = { changefreq: "weekly", priority: "0.7" };

/** No project configured (tests, a fresh clone): the build has no Sanity pages to list either. */
export function hasSanityProject(projectId: string | undefined): projectId is string {
  return Boolean(projectId) && projectId !== "dummy_project_id";
}

/**
 * Reads the Solutions and Product Lines to list. A failed read fails the build: a sitemap missing the
 * Product Line Kept URLs would quietly drop ranking Legacy addresses from Search Console.
 */
export async function readSitemapDocuments(projectId: string, dataset: string): Promise<SitemapDocuments> {
  const url = new URL(`https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}`);
  url.searchParams.set("query", SITEMAP_DOCUMENTS_QUERY);

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read sitemap pages from Sanity: ${reason}`);
  }
  if (!response.ok) {
    throw new Error(`Could not read sitemap pages from Sanity: status ${response.status}`);
  }

  const { result } = (await response.json()) as { result?: Partial<SitemapDocuments> };
  return {
    solutionSlugs: nonEmptyStrings(result?.solutionSlugs),
    productLinePaths: nonEmptyStrings(result?.productLinePaths),
  };
}

function nonEmptyStrings(values: unknown): string[] {
  return (Array.isArray(values) ? values : []).filter(
    (value): value is string => typeof value === "string" && value !== "",
  );
}

/** Every indexable page: static pages in list order, then Product Lines, then Solutions. Each address once. */
export function sitemapEntries(documents: SitemapDocuments): SitemapEntry[] {
  const staticPages: StaticPage[] = Object.values(STATIC_PAGES);
  const entries: SitemapEntry[] = [
    ...staticPages.flatMap((page) => (page.sitemap ? [{ path: page.path, ...page.sitemap }] : [])),
    ...documents.productLinePaths.map((path) => ({ path: toSitePath(path), ...PRODUCT_LINE_HINTS })),
    ...documents.solutionSlugs.map((slug) => ({ path: solutionPagePath(slug), ...SOLUTION_HINTS })),
  ];

  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.path)) return false;
    seen.add(entry.path);
    return true;
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderSitemapXml(siteUrl: string, entries: SitemapEntry[], lastmod: string): string {
  const urls = entries.map(
    (entry) => `  <url>
    <loc>${escapeXml(toAbsoluteSiteUrl(siteUrl, entry.path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}
