import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { findSitemapProblems } from "./checkSitemap";

/**
 * Fails the build when the prerendered sitemap and the prerendered pages disagree: a `<loc>` that isn't built, isn't
 * the page's canonical or is noindex, or an indexable page left out. Auto-registered by Nuxt (local `modules/` dir).
 * Runs on Nitro's `compiled` hook, after prerendering.
 */
export default defineNuxtModule({
  meta: { name: "sitemap-check" },
  setup(_options, nuxt) {
    if (nuxt.options.dev) return;
    const logger = useLogger("sitemap-check");

    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("compiled", async () => {
        const { publicDir } = nitro.options.output;
        const sitemapPath = path.join(publicDir, "sitemap.xml");
        // `nuxi build` without prerendering writes no pages to check against.
        if (!existsSync(sitemapPath)) return;

        const sitemap = await readFile(sitemapPath, "utf8");
        const problems = findSitemapProblems(publicDir, sitemap);
        if (problems.length > 0) {
          throw new Error(`sitemap.xml does not match the built pages:\n  ${problems.join("\n  ")}`);
        }
        logger.success(`sitemap.xml: ${(sitemap.match(/<loc>/g) ?? []).length} pages, each its page's canonical`);
      });
    });
  },
});
