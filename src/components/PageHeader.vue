<template>
  <div class="page-header-wrap">
    <div class="page-title">{{ title }}</div>
    <div v-if="subtitle" class="page-subtitle-row">
      <span class="page-subtitle">{{ subtitle }}</span>
      <span class="uid-chip" @click="openUidModal">
        <span v-if="uid" class="uid-text">{{ uid }}</span>
        <span v-else class="uid-placeholder">绑定UID</span>
      </span>
    </div>
  </div>
</template>

<script setup>
import { inject } from 'vue'
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
const uid = inject('uid')
const openUidModal = inject('openUidModal')
</script>

<style scoped>
.page-header-wrap {
  padding: 10px 0 14px;
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
.page-subtitle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}
.page-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}
.uid-chip {
  cursor: pointer;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  font-size: 11px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.uid-chip:active { transform: scale(0.95); }
.uid-text { font-weight: 600; color: var(--color-accent); }
.uid-placeholder { color: var(--text-muted); }
</style>
