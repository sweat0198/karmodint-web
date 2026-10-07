import { existsSync } from "node:fs";
import path from "node:path";
import { PRODUCT_LINE_SEED_HINT, PRODUCT_LINE_URLS } from "../../shared/migration/keptUrls";

/**
 * The page paths (`/` form, query/hash allowed) with no `dir/index.html` in the static output, in input order.
 * Use for anything that must exist as a built page: redirect targets, Kept URLs.
 */
export function findMissingPages(publicDir: string, pagePaths: readonly string[]): string[] {
  return pagePaths.filter((pagePath) => {
    const pathname = pagePath.split(/[?#]/)[0]!;
    return !existsSync(path.join(publicDir, pathname, "index.html"));
  });
}

/**
 * The build error for pages `findMissingPages` reported. A missing Product Line page means its Sanity content isn't in
 * the dataset, so the message says to apply the seed; any other missing redirect target means a group shipped early.
 */
export function missingPagesError(missing: readonly string[]): Error {
  const productLines = missing.filter((page) => (PRODUCT_LINE_URLS as readonly string[]).includes(page));
  const others = missing.filter((page) => !productLines.includes(page));
  const advice = [
    productLines.length > 0 ? `Product Line pages missing: ${productLines.join(", ")}. ${PRODUCT_LINE_SEED_HINT}` : "",
    others.length > 0
      ? "Ship a redirect group only once its target page is prerendered (shared/migration/redirects.ts)."
      : "",
  ].filter(Boolean);
  return new Error(`Pages missing from the build (no dir/index.html): ${missing.join(", ")}. ${advice.join(" ")}`);
}
