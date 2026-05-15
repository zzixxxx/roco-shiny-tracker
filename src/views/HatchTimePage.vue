<template>
  <div class="page">
    <PageHeader title="孵蛋时间" subtitle="家园孵蛋耗时查询 · 支持加速叠加" />

    <!-- 搜索 -->
    <div class="card" style="padding:12px">
      <div class="search-wrapper">
        <input
          v-model="searchInput"
          @input="onSearchInput"
          @focus="onFocus"
          @blur="onBlur"
          @keydown="onKeyDown"
          class="input"
          placeholder="搜索精灵名（中文 / 拼音）"
          autocomplete="off"
        />
        <div v-if="showSug && suggestions.length" class="suggestions">
          <div
            v-for="(s, i) in suggestions"
            :key="s.id"
            class="sug-item"
            :class="{ active: i === sugIndex }"
            @mousedown.prevent="pickSug(s)"
          >
            <div class="sug-icon">
              <img v-if="s.hasImg" :src="petImg(s.py)" :alt="s.baseName" />
              <span v-else>{{ s.baseName[0] }}</span>
            </div>
            <div class="sug-text">
              <div class="sug-name">{{ s.name }}</div>
              <div class="sug-meta">
                <img v-if="ELEMENTS[s.element]?.icon" :src="ELEMENTS[s.element].icon" class="el-icon" :title="ELEMENTS[s.element].name" />
                <span :style="{ color: ELEMENTS[s.element]?.color }">{{ ELEMENTS[s.element]?.name || '-' }}</span>
                <span style="color:var(--text-muted);margin:0 4px">·</span>
                <span>原始 {{ formatOrig(s.hatch) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加速 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_BOLT" class="inline-icon" /> 加速方式（可叠加）</div>
      <div class="accel-row">
        <button
          class="accel-btn"
          :class="{ active: wind }"
          @click="wind = !wind"
        >
          <div class="accel-emoji">💨</div>
          <div class="accel-info">
            <div class="accel-title">风场加速</div>
            <div class="accel-desc">×6 倍速</div>
          </div>
        </button>
        <button
          class="accel-btn weekend"
          :class="{ active: weekend }"
          @click="weekend = !weekend"
        >
          <div class="accel-emoji">🎉</div>
          <div class="accel-info">
            <div class="accel-title">周末活动</div>
            <div class="accel-desc">×2 倍速</div>
          </div>
        </button>
      </div>
      <div class="multi-bar">
        <span class="multi-label">{{ multiplierLabel }}</span>
        <span class="multi-value">×{{ multiplier }}</span>
      </div>
    </div>

    <!-- 属性筛选 -->
    <div class="card" style="padding:12px 14px">
      <div class="chips-row">
        <button
          class="chip"
          :class="{ active: typeFilter === '' }"
          @click="typeFilter = ''"
        >全部</button>
        <button
          v-for="t in availableTypes"
          :key="t"
          class="chip"
          :class="{ active: typeFilter === t }"
          @click="typeFilter = t"
          :style="typeFilter === t ? { borderColor: ELEMENTS[t]?.color, color: ELEMENTS[t]?.color } : {}"
        >
          <img v-if="ELEMENTS[t]?.icon" :src="ELEMENTS[t].icon" class="el-icon" />
          <span>{{ ELEMENTS[t]?.name }}</span>
        </button>
      </div>
    </div>

    <!-- 档位筛选 -->
    <div class="card" style="padding:12px 14px">
      <div class="chips-row">
        <button
          class="chip"
          :class="{ active: tierFilter === 0 }"
          @click="tierFilter = 0"
        >全部档位</button>
        <button
          v-for="t in availableTiers"
          :key="t.sec"
          class="chip"
          :class="{ active: tierFilter === t.sec }"
          @click="tierFilter = t.sec"
        >{{ t.label }}</button>
      </div>
    </div>

    <!-- 列表 -->
    <div class="card" style="padding:8px">
      <div class="list-header">
        <span>共 {{ filtered.length }} 只</span>
        <span v-if="selected" class="reset-link" @click="resetSelection">清除选择</span>
      </div>
      <div v-if="!filtered.length" class="empty-state">
        <div class="icon">🔍</div>
        <p>没有匹配的精灵</p>
      </div>
      <div v-else class="pet-grid">
        <div
          v-for="p in filtered"
          :key="p.id"
          class="hatch-card"
        >
          <div class="hatch-avatar">
            <img v-if="p.hasImg" :src="petImg(p.py)" :alt="p.baseName" class="pet-img" />
            <span v-else class="placeholder">{{ p.baseName }}</span>
          </div>
          <div class="hatch-name">{{ p.name }}</div>
          <div class="hatch-element">
            <img v-if="ELEMENTS[p.element]?.icon" :src="ELEMENTS[p.element].icon" class="el-icon" :title="ELEMENTS[p.element].name" />
            <span :style="{ color: ELEMENTS[p.element]?.color }">{{ ELEMENTS[p.element]?.name || '-' }}</span>
          </div>
          <div class="hatch-time">
            <div class="orig">原始 {{ formatOrig(p.hatch) }}</div>
            <div class="accel">{{ formatTime(p.hatch / multiplier) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { ELEMENTS } from '../data/pets.js'
import { HATCH_PETS, HATCH_TIERS, ACCEL } from '../data/hatchPets.js'
import { ICON_BOLT } from '../data/icons.js'

const wind = ref(false)
const weekend = ref(false)
const searchInput = ref('')
const searchQuery = ref('')   // 实际过滤用（与 selected 区分）
const selected = ref(null)    // 通过下拉选中的具体精灵
const typeFilter = ref('')
const tierFilter = ref(0)
const showSug = ref(false)
const sugIndex = ref(-1)

const BASE = import.meta.env.BASE_URL || '/'
function petImg(py) {
  return `${BASE}hatch-pets/${py}.webp`
}

const multiplier = computed(() => {
  let m = 1
  if (wind.value) m *= ACCEL.WIND
  if (weekend.value) m *= ACCEL.WEEKEND
  return m
})

const multiplierLabel = computed(() => {
  const parts = []
  if (wind.value) parts.push('风场')
  if (weekend.value) parts.push('周末')
  return parts.length ? parts.join(' + ') : '无加速'
})

// 当前数据集中实际存在的属性、档位
const availableTypes = computed(() => {
  const order = ['normal','grass','fire','water','light','ground','ice','dragon','electric','poison','bug','fighting','flying','cute','ghost','evil','mechanical','psychic']
  const present = new Set(HATCH_PETS.map(p => p.element).filter(Boolean))
  return order.filter(k => present.has(k))
})

const availableTiers = computed(() => {
  const present = new Set(HATCH_PETS.map(p => p.hatch))
  return HATCH_TIERS.filter(t => present.has(t.sec))
})

// 模糊匹配
function matches(p, q) {
  if (!q) return true
  q = q.toLowerCase()
  return p.name.toLowerCase().includes(q)
      || p.baseName.toLowerCase().includes(q)
      || p.py.toLowerCase().includes(q)
}

// 搜索建议（最多 8 条）
const suggestions = computed(() => {
  if (!searchQuery.value) return []
  return HATCH_PETS.filter(p => matches(p, searchQuery.value)).slice(0, 8)
})

// 主列表（筛选 + 排序）
const filtered = computed(() => {
  if (selected.value) {
    const p = HATCH_PETS.find(x => x.id === selected.value)
    return p ? [p] : []
  }
  let list = HATCH_PETS
  if (searchQuery.value) {
    list = list.filter(p => matches(p, searchQuery.value))
  }
  if (typeFilter.value) {
    list = list.filter(p => p.element === typeFilter.value)
  }
  if (tierFilter.value) {
    list = list.filter(p => p.hatch === tierFilter.value)
  }
  // 按图鉴 id 升序
  return [...list].sort((a, b) => a.id - b.id)
})

function formatTime(s) {
  if (s < 1) return `${Math.round(s * 1000)} ms`
  if (s < 60) return `${s < 10 ? s.toFixed(1) : Math.round(s)} 秒`
  if (s < 3600) {
    const m = s / 60
    return `${m < 10 ? m.toFixed(1) : Math.round(m)} 分`
  }
  const h = s / 3600
  return `${h < 10 ? h.toFixed(2) : h.toFixed(1)} 小时`
}

function formatOrig(s) {
  if (s === 1) return '1 秒'
  if (s < 3600) return `${s / 60} 分钟`
  return `${s / 3600} 小时`
}

function onSearchInput() {
  searchQuery.value = searchInput.value.trim()
  selected.value = null
  sugIndex.value = -1
  showSug.value = !!searchQuery.value
}

function onFocus() {
  if (searchQuery.value) showSug.value = true
}

function onBlur() {
  // 延迟，让 mousedown 先触发
  setTimeout(() => { showSug.value = false }, 180)
}

function onKeyDown(e) {
  if (!showSug.value || !suggestions.value.length) {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    sugIndex.value = Math.min(sugIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    sugIndex.value = Math.max(sugIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (sugIndex.value >= 0) {
      pickSug(suggestions.value[sugIndex.value])
    }
  } else if (e.key === 'Escape') {
    showSug.value = false
    sugIndex.value = -1
  }
}

function pickSug(p) {
  selected.value = p.id
  searchInput.value = p.name
  searchQuery.value = p.name
  showSug.value = false
  sugIndex.value = -1
}

function resetSelection() {
  selected.value = null
  searchInput.value = ''
  searchQuery.value = ''
  typeFilter.value = ''
  tierFilter.value = 0
}
</script>

<style scoped>
.search-wrapper {
  position: relative;
}

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-height: 360px;
  overflow-y: auto;
  z-index: 20;
}

.sug-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.sug-item:last-child { border-bottom: none; }
.sug-item:hover, .sug-item.active {
  background: rgba(102, 126, 234, 0.08);
}

.sug-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--text-muted);
}
.sug-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.sug-text {
  flex: 1;
  min-width: 0;
}
.sug-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}
.sug-meta {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 1px;
}
.sug-meta .el-icon {
  width: 14px;
  height: 14px;
}

/* 加速按钮 */
.accel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.accel-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border-color);
  background: var(--bg-card);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.accel-btn:active { transform: scale(0.97); }

.accel-btn.active {
  background: rgba(102, 126, 234, 0.08);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-glow-purple);
}

.accel-btn.weekend.active {
  background: rgba(212, 160, 23, 0.08);
  border-color: var(--color-shiny);
  box-shadow: var(--shadow-glow-gold);
}

.accel-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.accel-info {
  flex: 1;
}

.accel-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.accel-desc {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 1px;
}

.multi-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}

.multi-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.multi-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-accent);
}

/* 筛选 chips */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.chip:active { transform: scale(0.95); }
.chip.active {
  background: rgba(102, 126, 234, 0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}
.chip .el-icon {
  width: 14px;
  height: 14px;
}

/* 列表头部 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px 8px;
  font-size: 12px;
  color: var(--text-secondary);
}
.reset-link {
  color: var(--color-accent);
  cursor: pointer;
  font-weight: 600;
}
.reset-link:active { opacity: 0.7; }

/* 精灵网格卡片 */
.pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.hatch-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.15s;
}
.hatch-card:active { transform: scale(0.98); }

.hatch-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 6px;
}
.hatch-avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.hatch-avatar .placeholder {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  padding: 4px;
  line-height: 1.2;
}

.hatch-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.3;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.hatch-element {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  margin-top: 2px;
  margin-bottom: 8px;
}
.hatch-element .el-icon {
  width: 14px;
  height: 14px;
}

.hatch-time {
  text-align: center;
}
.hatch-time .orig {
  font-size: 11px;
  color: var(--text-muted);
}
.hatch-time .accel {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-shiny);
  margin-top: 1px;
}

@media (min-width: 380px) {
  .pet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
