/**
 * Kept URLs (glossary "Kept URL", design doc "Kept URLs"): Legacy URLs the new site serves at the exact same address.
 * No Redirect may use one as its source. Product Line paths are also stored in Sanity (`productLine.path`); this list
 * is the migration's fixed contract they must match.
 */
export const KEPT_URLS = [
  "/",
  "/products/",
  "/modular-buildings/",
  "/portable-cabin/",
  "/portable-cabin/steel-cabin/",
  "/portable-cabin/flat-pack-cabins/",
  "/portable-cabin/jackleg-cabin/",
  "/portable-cabin/portable-classroom/",
  "/portable-cabin/portable-house/",
  "/grp-kiosk-cabin/",
  "/panel-cabin/",
  "/bulletproof-cabin/",
  "/privacy-policy/",
] as const;

export type KeptUrl = (typeof KEPT_URLS)[number];

/** The Kept URLs served by Product Line pages (ADR-004), built from Sanity content (`pnpm product-lines:seed`). */
export const PRODUCT_LINE_URLS: readonly KeptUrl[] = KEPT_URLS.filter(
  (url) => url !== "/" && url !== "/products/" && url !== "/privacy-policy/",
);

/** How a build tells its runner to put missing Product Line pages in the dataset it reads. */
export const PRODUCT_LINE_SEED_HINT =
  "Apply the Product Line seed (`pnpm product-lines:seed`, scripts/product-lines/) to the Sanity dataset this build reads, then rebuild.";

export function isKeptUrl(path: string): path is KeptUrl {
  return (KEPT_URLS as readonly string[]).includes(path);
}
