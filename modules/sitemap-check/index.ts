import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";
import { findCanonicalProblems, findSitemapProblems } from "./checkSitemap";

/**
 * Fails the build when a prerendered page's canonical isn't its own `/`-ending address, or when the prerendered
 * sitemap and pages disagree: a `<loc>` that isn't built, isn't the page's canonical or is noindex, or an indexable
 * page left out. Auto-registered by Nuxt (local `modules/` dir). Runs on Nitro's `compiled` hook, after prerendering.
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

        const canonicalProblems = findCanonicalProblems(publicDir, nuxt.options.runtimeConfig.public.siteUrl as string);
        if (canonicalProblems.length > 0) {
          throw new Error(`Built pages without their own \`/\` canonical:\n  ${canonicalProblems.join("\n  ")}`);
        }

        const sitemap = await readFile(sitemapPath, "utf8");
        const problems = findSitemapProblems(publicDir, sitemap);
        if (problems.length > 0) {
          throw new Error(`sitemap.xml does not match the built pages:\n  ${problems.join("\n  ")}`);
        }
        logger.success(
          `Every built page is canonical to its own / address; sitemap.xml lists ` +
            `${(sitemap.match(/<loc>/g) ?? []).length} of them`,
        );
      });
    });
  },
});
