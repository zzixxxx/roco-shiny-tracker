<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <TabBar />
</template>

<script setup>
import TabBar from './components/TabBar.vue'
</script>
