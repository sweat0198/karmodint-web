/**
 * Public URL format (ADR-003): every page path ends in `/` — `/products/`, `/solutions/site-offices/`,
 * `/products/?category=cabin`. Build any URL that leaves the app (canonical, `og:url`, sitemap,
 * structured data) through these helpers so the format lives in one place.
 */

/** A page path in its public, `/`-ending form. Query string and hash are kept after the slash; file paths (`/sitemap.xml`) are left as they are. */
export function toSitePath(path: string): string {
  const suffixStart = path.search(/[?#]/);
  const pathname = suffixStart === -1 ? path : path.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : path.slice(suffixStart);

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const lastSegment = withLeadingSlash.slice(withLeadingSlash.lastIndexOf("/") + 1);
  if (withLeadingSlash.endsWith("/") || lastSegment.includes(".")) {
    return `${withLeadingSlash}${suffix}`;
  }
  return `${withLeadingSlash}/${suffix}`;
}

/** The absolute public URL of a page, e.g. `https://www.karmodint.co.uk/products/`. */
export function toAbsoluteSiteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, "")}${toSitePath(path)}`;
}

/** Whether a path is already in public form — false for a slashless page path such as `/products`. */
export function isSitePath(path: string): boolean {
  return toSitePath(path) === path;
}

/** Whether two paths name the same page, ignoring the trailing slash (`route.path` may arrive in either form). */
export function isSameSitePath(a: string, b: string): boolean {
  return toSitePath(a) === toSitePath(b);
}
