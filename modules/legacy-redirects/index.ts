import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { KEPT_URLS } from "../../shared/migration/keptUrls";
import { REDIRECTS, redirectSourceForms } from "../../shared/migration/redirects";
import { hasSanityProject } from "../../shared/utils/sanityProject";
import { findMissingPages, missingPagesError } from "./builtPages";
import {
  CATALOGUE_CATEGORY_TREE_QUERY,
  findUnknownCatalogueFilters,
  type CatalogueCategoryNode,
} from "./catalogueFilters";
import { withRedirects } from "./redirectsFile";
import { findWorkerRoutedPaths, type PagesRoutes } from "./workerRoutes";

/**
 * Writes the redirect map (`shared/migration/redirects.ts`) into Cloudflare Pages' `_redirects` at build time, and fails
 * the build when a redirect would not work: its target isn't a built page, its catalogue filter names a category the
 * dataset doesn't have, or `_routes.json` sends its source to the Functions worker (Pages skips `_redirects` there).
 * Also fails when a Kept URL wasn't built. Auto-registered by Nuxt (local `modules/` dir).
 *
 * Runs on Nitro's `compiled` hook, after prerendering and after the cloudflare-pages preset has written
 * `_redirects` (public/_redirects + its own lines) and `_routes.json`.
 */
export default defineNuxtModule({
  meta: { name: "legacy-redirects" },
  setup(_options, nuxt) {
    if (nuxt.options.dev) return;
    const logger = useLogger("legacy-redirects");

    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("compiled", async () => {
        const { dir: outputDir, publicDir } = nitro.options.output;

        // Every redirect target, plus every Kept URL: each is a ranking Legacy address the new site must serve.
        const pages = [...new Set([...REDIRECTS.map((redirect) => redirect.to), ...KEPT_URLS])];
        const missing = findMissingPages(publicDir, pages);
        if (missing.length > 0) throw missingPagesError(missing);

        // A built `/products/` says nothing about its query string: check filter targets against the dataset's tree.
        const { sanityProjectId, sanityDataset } = nuxt.options.runtimeConfig.public as Record<string, string>;
        if (hasSanityProject(sanityProjectId)) {
          const client = createClient({
            projectId: sanityProjectId,
            dataset: sanityDataset,
            apiVersion: "2025-02-19",
            useCdn: false,
          });
          const tree = await client.fetch<CatalogueCategoryNode[]>(CATALOGUE_CATEGORY_TREE_QUERY);
          const unknown = findUnknownCatalogueFilters(pages, tree);
          if (unknown.length > 0) {
            throw new Error(`Redirect targets filter the catalogue by unknown categories:\n  ${unknown.join("\n  ")}`);
          }
        }

        const routesPath = path.join(outputDir, "_routes.json");
        if (existsSync(routesPath)) {
          const routes = JSON.parse(await readFile(routesPath, "utf8")) as PagesRoutes;
          const sources = REDIRECTS.flatMap((redirect) => redirectSourceForms(redirect.from));
          const routed = findWorkerRoutedPaths(routes, sources);
          if (routed.length > 0) {
            throw new Error(
              `_routes.json sends redirect sources to the Functions worker, where _redirects never runs: ` +
                `${routed.slice(0, 5).join(", ")}${routed.length > 5 ? ", …" : ""}. ` +
                "Keep nitro.cloudflare.pages.routes limited to /api/* (nuxt.config.ts).",
            );
          }
        }

        const redirectsPath = path.join(outputDir, "_redirects");
        const existing = existsSync(redirectsPath) ? await readFile(redirectsPath, "utf8") : "";
        await writeFile(redirectsPath, withRedirects(existing, REDIRECTS));
        logger.success(`Wrote ${REDIRECTS.length} Legacy Site redirects (×2 with slashless sources) to _redirects`);
      });
    });
  },
});
