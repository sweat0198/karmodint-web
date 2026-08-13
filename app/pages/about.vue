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

const { setPageSeo, getOrganizationSchema, getBreadcrumbSchema } = useAppSeo();

setPageSeo({
  title: "About Us | Karmod International - Modular Construction Pioneers",
  description:
    "Learn about Karmod's legacy of engineering excellence in modular buildings, our mission, vision, and high-performance prefabricated projects across the UK and internationally.",
  canonicalPath: "/about",
  jsonLd: [
    getBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
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
