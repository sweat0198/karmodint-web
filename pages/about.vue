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

    <!-- Contact & Inquiry Section -->
    <div id="contact" class="w-full scroll-mt-20">
      <ContactSection />
    </div>
  </main>
</template>

<script setup lang="ts">
import AboutHeroSection from '~/components/about/HeroSection.vue'
import AboutTimelineSection from '~/components/about/TimelineSection.vue'
import AboutMissionVisionSection from '~/components/about/MissionVisionSection.vue'
import AboutProjectsBentoSection from '~/components/about/ProjectsBentoSection.vue'

useHead({
  title: 'About Us | Karmod International - Modular Construction Pioneers',
  meta: [
    { 
      name: 'description', 
      content: 'Learn about Karmod UK\'s legacy of engineering excellence in modular buildings, our mission, vision, and high-performance projects across the UK and internationally.' 
    }
  ]
})
</script>
