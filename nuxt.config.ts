// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
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
    projectId: process.env.SANITY_PROJECT_ID || "dummy_project_id",
    dataset: process.env.SANITY_DATASET || "production",
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
      sanityProjectId: process.env.SANITY_PROJECT_ID || "dummy_project_id",
      sanityDataset: process.env.SANITY_DATASET || "production",
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
    },
    prerender: {
      crawlLinks: true,
      routes: [
        "/",
        "/products",
        "/customize",
        "/quote",
        "/gallery",
        "/solutions",
        "/contact",
        "/about",
        "/sitemap.xml",
      ],
      ignore: ["/api/**"],
    },
  },

  routeRules: {
    // 301 Permanent Redirect for legacy about-contact path
    "/about-contact": {
      redirect: { to: "/about", statusCode: 301 },
    },
    // Prerender static pages at build time
    "/**": { prerender: true },
    // Ensure API endpoints remain runtime/dynamic functions
    "/api/**": { prerender: false },
  },
});
