export default defineEventHandler((event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string) || "https://www.karmodint.co.uk";
  const now = new Date().toISOString().split("T")[0];

  const routes = [
    {
      loc: "/",
      lastmod: now,
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: "/catalog",
      lastmod: now,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: "/about",
      lastmod: now,
      changefreq: "monthly",
      priority: "0.8",
    },
    {
      loc: "/gallery",
      lastmod: now,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      loc: "/contact",
      lastmod: now,
      changefreq: "monthly",
      priority: "0.8",
    },
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${siteUrl.replace(/\/$/, "")}${r.loc}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return sitemapXml;
});
