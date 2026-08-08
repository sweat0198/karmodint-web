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
useHead({
  title: "About Us | Karmod International - Modular Construction Pioneers",
  meta: [
    {
      name: "description",
      content:
        "Learn about Karmod UK's legacy of engineering excellence in modular buildings, our mission, vision, and high-performance projects across the UK and internationally.",
    },
  ],
});
</script>
