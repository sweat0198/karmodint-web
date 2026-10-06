/** Cloudflare Pages `_routes.json`: which requests invoke the Functions worker (`_worker.js`). */
export interface PagesRoutes {
  version: number;
  include: string[];
  exclude: string[];
}

/** `*` matches anything, `/` included (developers.cloudflare.com/pages/functions/routing/). */
function matches(pattern: string, pathname: string): boolean {
  const regex = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${regex}$`).test(pathname);
}

/**
 * The paths Pages would hand to the worker instead of serving statically. `_redirects` and `_headers` are not
 * applied to those requests, so a redirect source here would never redirect.
 */
export function findWorkerRoutedPaths(routes: PagesRoutes, pathnames: readonly string[]): string[] {
  return pathnames.filter(
    (pathname) =>
      routes.include.some((pattern) => matches(pattern, pathname)) &&
      !routes.exclude.some((pattern) => matches(pattern, pathname)),
  );
}
