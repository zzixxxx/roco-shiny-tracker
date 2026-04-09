<template>
  <div
    class="pet-card"
    :class="{ collected: isCollected, active: isActive }"
    @click="$emit('click', pet.id)"
  >
    <div class="pet-avatar" :style="{ background: pet.imgShiny ? 'transparent' : elementColor }">
      <img v-if="pet.imgShiny" :src="pet.imgShiny" class="pet-img" />
      <span v-else class="pet-initial">{{ pet.name[0] }}</span>
      <span v-if="isCollected" class="collected-badge">&#10003;</span>
    </div>
    <div class="pet-info">
      <div class="pet-name">{{ pet.name }}</div>
      <div class="pet-element">
        <template v-for="(el, i) in elementArr" :key="el">
          <img :src="ELEMENTS[el]?.icon" class="el-icon" :title="ELEMENTS[el]?.name" />
          <span :style="{ color: ELEMENTS[el]?.color }">{{ ELEMENTS[el]?.name }}</span>
          <span v-if="i < elementArr.length - 1" style="color:var(--text-muted);margin:0 1px">/</span>
        </template>
      </div>
    </div>
    <div v-if="showCategory" class="pet-category">
      <span class="tag" :class="categoryClass">{{ categoryLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ELEMENTS, CATEGORY_LABELS } from '../data/pets.js'

const props = defineProps({
  pet: { type: Object, required: true },
  isCollected: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  showCategory: { type: Boolean, default: false },
})

defineEmits(['click'])

// element 现在是数组
const elementArr = computed(() => {
  const el = props.pet.element
  return Array.isArray(el) ? el : [el]
})
const primaryElement = computed(() => elementArr.value[0])
const elementColor = computed(() => ELEMENTS[primaryElement.value]?.color || '#adb5bd')
const elementName = computed(() => {
  const el = props.pet.element
  const arr = Array.isArray(el) ? el : [el]
  return arr.map(e => ELEMENTS[e]?.name || e).join('/')
})
const categoryLabel = computed(() => CATEGORY_LABELS[props.pet.category] || '')
const categoryClass = computed(() => {
  if (props.pet.category === 'battlepass') return 'tag-nightmare'
  if (props.pet.category === 'collab') return 'tag-shiny'
  if (props.pet.category === 'season') return 'tag-shiny'
  return 'tag-normal'
})
</script>

<style scoped>
.pet-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.pet-card:active {
  transform: scale(0.98);
}

.pet-card.active {
  border-color: var(--color-accent);
  background: rgba(102, 126, 234, 0.06);
}

.pet-card.collected {
  border-color: rgba(212, 160, 23, 0.3);
  background: rgba(212, 160, 23, 0.04);
}

.pet-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  opacity: 0.85;
}

.collected .pet-avatar {
  opacity: 1;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.pet-initial {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.collected-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-shiny);
  color: #1a1a2e;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-secondary);
}

.pet-info {
  flex: 1;
  min-width: 0;
}

.pet-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.pet-element {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

/* pet-el-icon moved to global .el-icon */

.pet-category {
  flex-shrink: 0;
}
</style>
