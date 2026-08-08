// Silence deprecated Tailwind color warnings emitted during Nuxt UI initialization
import tailwindLog from "tailwindcss/lib/util/log";
const _logObj = (tailwindLog as any).default || tailwindLog;
if (_logObj && _logObj.warn) {
  const _origWarn = _logObj.warn;
  _logObj.warn = (key: any, messages?: any) => {
    if (typeof key === "string" && key.endsWith("-color-renamed")) return;
    _origWarn(key, messages);
  };
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    appManifest: false,
  },

  tailwindcss: {
    quiet: true,
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

  modules: ["@nuxt/ui", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt"],

  app: {
    head: {
      title:
        "Karmod International - Portable Cabins, Kiosks & Modular Buildings",
      meta: [
        {
          name: "description",
          content:
            "Karmod International Ltd manufactures premium modular buildings, portable cabins, retail kiosks, gatehouses, and ticket booths.",
        },
      ],
      link: [
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
      process.env.BUSINESS_EMAIL || "enquiries@karmod-international.com",
    public: {
      sanityProjectId: process.env.SANITY_PROJECT_ID || "dummy_project_id",
      sanityDataset: process.env.SANITY_DATASET || "production",
    },
  },

  // Static Site Generation (SSG) configuration
  ssr: true,

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "cloudflare-pages",
    prerender: {
      crawlLinks: true,
      routes: [
        "/",
        "/catalog",
        "/customize",
        "/quote",
        "/gallery",
        "/about-contact",
        "/contact",
        "/about",
      ],
      ignore: ["/api/quote"],
    },
  },

  routeRules: {
    // Prerender static pages at build time
    "/**": { prerender: true },
    // Ensure API endpoints remain runtime/dynamic functions
    "/api/**": { prerender: false },
  },
});
