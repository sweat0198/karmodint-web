<template>
  <main class="w-full min-h-screen bg-slate-50 flex flex-col items-center">
    <ContactSection />
  </main>
</template>

<script setup lang="ts">
import ContactSection from '~/components/ContactSection.vue'

useHead({
  title: 'Contact Us | Karmod International',
  meta: [
    { 
      name: 'description', 
      content: 'Get in touch with Karmod UK engineering experts for project consultation, bespoke modular building solutions, and sales enquiries.' 
    }
  ]
})
</script>
