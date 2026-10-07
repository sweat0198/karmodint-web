import { hasSanityProject } from "../../shared/utils/sanityProject";
import { readSitemapDocuments, renderSitemapXml, sitemapEntries } from "../utils/sitemap";

/** Prerendered at build time (`nuxt.config.ts`), so the Sanity read happens once per deploy. */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string) || "https://www.karmodint.co.uk";
  const projectId = config.public.sanityProjectId as string | undefined;
  const today = new Date().toISOString().split("T")[0]!;

  const documents = hasSanityProject(projectId)
    ? await readSitemapDocuments(projectId, config.public.sanityDataset as string)
    : { solutionSlugs: [], productLinePaths: [] };

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return renderSitemapXml(siteUrl, sitemapEntries(documents), today);
});
