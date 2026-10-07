import { redirectSourceForms, type Redirect } from "../../shared/migration/redirects";

const BEGIN = "# --- Legacy Site redirects: generated from shared/migration/redirects.ts, do not edit ---";
const END = "# --- end Legacy Site redirects ---";

/**
 * Cloudflare Pages' `_redirects` with the redirect map placed first.
 *
 * - Sources match exactly, trailing slash included (`/container/` doesn't catch `/container`), so every source is
 *   written in both forms. See `docs/research/cloudflare-pages-redirects.md`.
 * - Rules only count as static (2,000 max) until the first `*`/`:placeholder` rule; everything after that is dynamic
 *   (100 max, the rest dropped). The Studio rewrites are dynamic, so the map must come before them.
 * - The status is always written: Cloudflare defaults to 302.
 */
export function withRedirects(existing: string, redirects: readonly Redirect[]): string {
  const lines = redirects.flatMap(({ from, to, status }) =>
    redirectSourceForms(from).map((source) => `${source} ${to} ${status}`),
  );
  return [BEGIN, ...lines, END, "", existing].join("\n");
}
