import { existsSync } from "node:fs";
import path from "node:path";

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
