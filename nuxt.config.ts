// https://nuxt.com/docs/api/configuration/nuxt-config
import { createClient } from "@sanity/client";
import { PRODUCT_LINE_URLS } from "./shared/migration/keptUrls";
import { REDIRECTS } from "./shared/migration/redirects";
import { productLinePrerenderRoutes } from "./shared/utils/productLineRoutes";
import { hasSanityProject, PLACEHOLDER_SANITY_PROJECT_ID } from "./shared/utils/sanityProject";
import { STATIC_PAGE_PATHS } from "./shared/utils/sitePages";
import { isSitePath } from "./shared/utils/sitePath";

const sanityProjectId = process.env.SANITY_PROJECT_ID || PLACEHOLDER_SANITY_PROJECT_ID;
const sanityDataset = process.env.SANITY_DATASET || "production";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
    // ADR-003: every public URL ends in `/`. Source paths are written in that form already; this makes
    // any `<NuxtLink>` that slips through (or builds its `to` from a route object) render the `/` form too.
    defaults: {
      nuxtLink: {
        trailingSlash: "append",
      },
    },
  },

  components: [
    {
      path: "~/components/customization",
      pathPrefix: false,
    },
    {
      path: "~/components",
      pathPrefix: true,
    },
  ],

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@nuxtjs/sanity",
  ],

  icon: {
    clientBundle: {
      scan: true,
      icons: [
        "heroicons:shopping-bag",
        "heroicons:cube",
        "heroicons:trash",
        "heroicons:arrow-path",
        "heroicons:map-pin",
        "heroicons:truck",
        "heroicons:clock",
        "heroicons:check",
        "tabler:location",
      ],
    },
  },

  sanity: {
    projectId: sanityProjectId,
    dataset: sanityDataset,
  },

  app: {
    head: {
      htmlAttrs: {
        lang: "en-GB",
      },
      title:
        "Karmod International - Portable Cabins, Kiosks & Modular Buildings",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Karmod International Ltd manufactures premium modular buildings, portable cabins, retail kiosks, gatehouses, and ticket booths across the UK and worldwide.",
        },
        { property: "og:site_name", content: "Karmod International" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "theme-color", content: "#121C2A" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
        },
      ],
      script: [
        // Cloudflare Web Analytics
        {
          src: "https://static.cloudflareinsights.com/beacon.min.js",
          defer: true,
          "data-cf-beacon": '{"token": "cf_analytics_token_placeholder"}',
        },
      ],
    },
  },

  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || "",
    businessEmail:
      process.env.BUSINESS_EMAIL || "info@karmodint.co.uk",
    fromEmail:
      process.env.RESEND_FROM_EMAIL ||
      "Karmod International <info@karmodint.co.uk>",
    sanityApiToken: process.env.SANITY_API_TOKEN || "",
    public: {
      siteUrl:
        process.env.NUXT_PUBLIC_SITE_URL || "https://www.karmodint.co.uk",
      sanityProjectId: sanityProjectId,
      sanityDataset: sanityDataset,
      googleMapsApiKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    },
  },

  // Static Site Generation (SSG) configuration
  ssr: true,

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "cloudflare-pages",
    cloudflare: {
      nodeCompat: true,
      // `_routes.json`: only the runtime API (ADR-002) runs in the worker. Everything else is static, Sanity Studio
      // (built into dist/studio after Nuxt) included. Nitro's default (`/*` minus built files, capped at 100 rules)
      // sent every unbuilt path, Legacy redirect sources too, to the worker, and Pages skips `_redirects` and
      // `_headers` there. modules/legacy-redirects fails the build if a redirect source reaches the worker again.
      pages: {
        defaultRoutes: false,
        routes: {
          version: 1,
          include: ["/api/*"],
          exclude: [],
        },
      },
    },
    prerender: {
      crawlLinks: true,
      routes: [
        // Every static page, noindex ones included (shared/utils/sitePages.ts: the sitemap reads the same list).
        ...STATIC_PAGE_PATHS,
        "/sitemap.xml",
        // With no worker fallback, Pages answers unknown paths with the top-level 404.html and a 404 status
        // (without one it serves `/` with a 200). `nuxi generate` adds it on its own; `nuxi build` doesn't.
        "/404.html",
      ],
      ignore: [
        "/api/**",
        // Nuxt queues every static page in its slashless form (`/products`) alongside the crawled
        // `/products/`; both write `products/index.html`. Build only the `/`-ending address (ADR-003).
        (path: string) => !isSitePath(path),
      ],
    },
  },

  routeRules: {
    // No redirects here: `_redirects` is generated from shared/migration/redirects.ts (modules/legacy-redirects).
    // Prerender static pages at build time
    "/**": { prerender: true },
    // Ensure API endpoints remain runtime/dynamic functions
    "/api/**": { prerender: false },
  },

  hooks: {
    // Product Line pages (ADR-004) live at Kept URLs read from Sanity, so they are added to the
    // prerender list by path instead of relying on the crawler finding a link to each one.
    async "prerender:routes"(ctx) {
      // A checkout with no Sanity project configured (tests, a fresh clone) has no paths to read.
      if (!hasSanityProject(sanityProjectId)) return;

      const client = createClient({
        projectId: sanityProjectId,
        dataset: sanityDataset,
        apiVersion: "2025-02-19",
        useCdn: false,
      });
      const routes = await productLinePrerenderRoutes((query) => client.fetch(query), {
        required: PRODUCT_LINE_URLS,
        redirectSources: REDIRECTS.map((redirect) => redirect.from),
      });
      for (const route of routes) {
        ctx.routes.add(route);
      }
    },
  },
});
