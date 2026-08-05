<template>
  <div></div>
</template>

<script setup lang="ts">
const route = useRoute()
navigateTo(`/about${route.hash || ''}`, { replace: true })
</script>
