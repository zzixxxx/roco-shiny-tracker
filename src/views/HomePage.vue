<template>
  <div class="page">
    <PageHeader title="异色追踪器" subtitle="洛克王国世界 S1赛季" />

    <!-- 收集进度总览 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_SHINY" class="inline-icon" /> 异色收集进度</div>
      <div class="collection-overview">
        <ProgressRing
          :value="store.collectedCount"
          :max="store.totalShinyCount"
          :size="120"
          :stroke-width="8"
          :is-shiny="store.collectedCount === store.totalShinyCount"
        >
          <div class="ring-number">{{ store.collectedCount }}</div>
          <div class="ring-label">/ {{ store.totalShinyCount }}</div>
        </ProgressRing>
        <div class="collection-stats">
          <div class="stat-row">
            <span class="stat-label">已收集</span>
            <span class="stat-value shiny-color">{{ store.collectedCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">未收集</span>
            <span class="stat-value">{{ store.totalShinyCount - store.collectedCount }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">完成度</span>
            <span class="stat-value">{{ completionRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 当前刷取目标 -->
    <div class="card" @click="showTargetPicker = true">
      <div class="card-title"><img :src="ICON_TARGET" class="inline-icon" /> 当前目标</div>
      <div v-if="store.currentTarget" class="target-display">
        <div class="target-name-row">
          <img v-if="store.currentTarget.imgShiny" :src="store.currentTarget.imgShiny" class="target-avatar" />
          <span class="target-name">{{ store.currentTarget.name }}</span>
        </div>
        <div class="target-meta">
          <span class="element-tag">
            <template v-for="(el, i) in targetElementArr" :key="el">
              <img :src="ELEMENTS[el]?.icon" class="el-icon" :title="ELEMENTS[el]?.name" />
              <span :style="{ color: ELEMENTS[el]?.color }">{{ ELEMENTS[el]?.name }}</span>
              <span v-if="i < targetElementArr.length - 1" style="color:var(--text-muted)">/</span>
            </template>
          </span>
          <span class="divider">|</span>
          <span>{{ store.currentTarget.area }}</span>
        </div>
        <div class="target-progress mt-8">
          <div class="flex justify-between mb-8">
            <span class="stat-label">噩梦枷锁</span>
            <span class="stat-value">{{ store.currentFamilyCounter.nightmareCount }} / 80</span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-bar-fill"
              :class="{ shiny: store.currentFamilyCounter.nightmareCount >= 80 }"
              :style="{ width: Math.min(store.currentFamilyCounter.nightmareCount / 80 * 100, 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <div v-else class="empty-target">
        <span style="opacity: 0.5">&#128073;</span> 点击选择刷取目标
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_BOLT" class="inline-icon" /> 快捷操作</div>
      <div class="quick-actions">
        <router-link to="/counter" class="action-btn">
          <img :src="ICON_TARGET" class="action-icon-img" />
          <span>开始计数</span>
        </router-link>
        <router-link to="/collection" class="action-btn">
          <img :src="ICON_BOOK" class="action-icon-img" />
          <span>异色图鉴</span>
        </router-link>
        <router-link to="/log" class="action-btn">
          <img :src="ICON_SCROLL" class="action-icon-img" />
          <span>刷取日志</span>
        </router-link>
        <router-link to="/stats" class="action-btn">
          <img :src="ICON_CHART" class="action-icon-img" />
          <span>数据统计</span>
        </router-link>
      </div>
    </div>

    <!-- 最近异色 -->
    <div v-if="recentShiny.length > 0" class="card">
      <div class="card-title"><img :src="ICON_SHINY" class="inline-icon" /> 最近获得的异色</div>
      <div v-for="log in recentShiny" :key="log.id" class="recent-shiny-item">
        <div class="shiny-dot"></div>
        <div class="recent-info">
          <span class="recent-name">{{ getPetName(log.petId) }}</span>
          <span class="recent-time">{{ formatTime(log.timestamp) }}</span>
        </div>
        <span class="tag tag-shiny">第{{ log.nightmareCount }}次</span>
      </div>
    </div>

    <!-- 选择目标弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTargetPicker" class="modal-overlay" @click.self="showTargetPicker = false">
          <Transition name="slide-up">
            <div v-if="showTargetPicker" class="modal-content">
              <div class="modal-title">选择刷取目标</div>
              <div class="pet-list">
                <PetCard
                  v-for="pet in pets"
                  :key="pet.id"
                  :pet="pet"
                  :is-collected="!!store.collection[pet.id]?.collected"
                  :is-active="store.currentTargetId === pet.id"
                  :show-category="true"
                  @click="selectTarget(pet.id)"
                  style="margin-bottom: 8px;"
                />
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHuntingStore } from '../stores/hunting.js'
import { SHINY_PETS, ELEMENTS } from '../data/pets.js'
import { ICON_SHINY, ICON_TARGET, ICON_BOLT, ICON_BOOK, ICON_SCROLL, ICON_CHART } from '../data/icons.js'
import PageHeader from '../components/PageHeader.vue'
import ProgressRing from '../components/ProgressRing.vue'
import PetCard from '../components/PetCard.vue'

const store = useHuntingStore()
const pets = SHINY_PETS
const showTargetPicker = ref(false)

const completionRate = computed(() => {
  if (store.totalShinyCount === 0) return 0
  return (store.collectedCount / store.totalShinyCount * 100).toFixed(1)
})

const targetElementArr = computed(() => {
  if (!store.currentTarget) return []
  const el = store.currentTarget.element
  return Array.isArray(el) ? el : [el]
})

const targetElementColor = computed(() => {
  if (!store.currentTarget) return ''
  const el = store.currentTarget.element
  const primary = Array.isArray(el) ? el[0] : el
  return ELEMENTS[primary]?.color || '#adb5bd'
})
const targetElementName = computed(() => {
  if (!store.currentTarget) return ''
  const el = store.currentTarget.element
  const arr = Array.isArray(el) ? el : [el]
  return arr.map(e => ELEMENTS[e]?.name || e).join('/')
})

const recentShiny = computed(() => store.shinyLogs.slice(0, 3))

function getPetName(petId) {
  return SHINY_PETS.find(p => p.id === petId)?.name || petId
}

function formatTime(ts) {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

function selectTarget(petId) {
  store.setTarget(petId)
  showTargetPicker.value = false
}
</script>

<style scoped>
.collection-overview {
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: center;
}

.ring-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-shiny);
}

.ring-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: -4px;
}

.collection-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
}

.shiny-color {
  color: var(--color-shiny);
}

.target-display {
  text-align: center;
}

.target-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.target-avatar {
  width: 36px;
  height: 36px;
  object-fit: contain;
  border-radius: 8px;
}

.target-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-shiny);
}

.target-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.element-tag {
  font-weight: 600;
}

.divider {
  opacity: 0.3;
}

.empty-target {
  text-align: center;
  padding: 16px;
  color: var(--text-muted);
  font-size: 15px;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  text-decoration: none;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:active {
  transform: scale(0.95);
  background: var(--bg-card-hover);
}

.action-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.recent-shiny-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--bg-input);
}

.recent-shiny-item:last-child {
  border-bottom: none;
}

.shiny-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-shiny);
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.5);
  flex-shrink: 0;
}

.recent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recent-name {
  font-size: 14px;
  font-weight: 600;
}

.recent-time {
  font-size: 11px;
  color: var(--text-muted);
}

.pet-list {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}
</style>
