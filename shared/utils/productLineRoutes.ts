import { PRODUCT_LINE_SEED_HINT } from "../migration/keptUrls";
import { toSitePath } from "./sitePath";

/**
 * Every published Product Line path. Lives here rather than in `app/queries/` because
 * `nuxt.config.ts` reads it at build time, where the app's `~` alias does not resolve.
 */
/** A published Product Line with a page: the filter behind both the prerender list and the sitemap. */
export const PUBLISHED_PRODUCT_LINE_FILTER = `_type == "productLine" && defined(path) && !(_id in path("drafts.**"))`;

export const PRODUCT_LINE_PATHS_QUERY = `*[${PUBLISHED_PRODUCT_LINE_FILTER}].path`;

/**
 * The Product Line pages to prerender. Nothing links to a Product Line until the header and footer
 * do, so the crawler alone cannot be trusted to find them: each is a Kept URL, and a missing one
 * is a 404 on a ranking Legacy address. A failed read therefore fails the build, and so does a
 * `required` path (`PRODUCT_LINE_URLS`) the dataset doesn't have.
 */
export async function productLinePrerenderRoutes(
  fetch: (query: string) => Promise<unknown>,
  { required = [] }: { required?: readonly string[] } = {},
): Promise<string[]> {
  let paths: unknown;
  try {
    paths = await fetch(PRODUCT_LINE_PATHS_QUERY);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read Product Line paths to prerender: ${reason}`);
  }

  const routes = (Array.isArray(paths) ? paths : [])
    .filter((path): path is string => typeof path === "string" && path.length > 0)
    .map(toSitePath);

  const missing = required.filter((path) => !routes.includes(path));
  if (missing.length > 0) {
    throw new Error(`Product Line pages missing from the Sanity dataset: ${missing.join(", ")}. ${PRODUCT_LINE_SEED_HINT}`);
  }

  return [...new Set(routes)].sort();
}
