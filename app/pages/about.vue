<template>
  <main class="w-full min-h-screen bg-white flex flex-col items-center">
    <!-- Hero Overview Section -->
    <AboutHeroSection />

    <!-- Legacy of Engineering Timeline -->
    <AboutTimelineSection />

    <!-- Mission & Vision Cards -->
    <AboutMissionVisionSection />

    <!-- Projects & Works Bento Grid -->
    <AboutProjectsBentoSection />
  </main>
</template>

<script setup lang="ts">
import { useAppSeo } from "~/composables/useAppSeo";
import { STATIC_PAGES } from "~~/shared/utils/sitePages";
import { PAGE_SEO } from "~/constants/pageSeo";

const { setPageSeo, getOrganizationSchema, getBreadcrumbSchema } = useAppSeo();

setPageSeo({
  ...PAGE_SEO.about,
  canonicalPath: STATIC_PAGES.about.path,
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about/" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Karmod International",
      description:
        "Overview of Karmod International's modular construction heritage, engineering standards, and worldwide delivery.",
      mainEntity: getOrganizationSchema(),
    },
  ],
});
</script>
