<template>
  <div class="progress-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        class="ring-bg"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
      />
      <circle
        class="ring-fill"
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        :class="{ 'is-shiny': isShiny }"
      />
    </svg>
    <div class="ring-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 80 },
  size: { type: Number, default: 160 },
  strokeWidth: { type: Number, default: 8 },
  isShiny: { type: Boolean, default: false },
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const progress = computed(() => Math.min(props.value / props.max, 1))
const dashOffset = computed(() => circumference.value * (1 - progress.value))
</script>

<style scoped>
.progress-ring {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.progress-ring svg {
  transform: rotate(-90deg);
  position: absolute;
}

.ring-bg {
  stroke: #eef0f4;
}

.ring-fill {
  stroke: url(#purpleGradient);
  stroke: #764ba2;
  transition: stroke-dashoffset 0.5s ease;
}

.ring-fill.is-shiny {
  stroke: #ffd700;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.4));
}

.ring-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
