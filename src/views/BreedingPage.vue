<template>
  <div class="page">
    <PageHeader title="蛋组查询" subtitle="找出能一起生蛋的精灵" />

    <!-- 选目标精灵 -->
    <div class="card" style="padding:12px">
      <div class="search-wrapper">
        <input
          v-model="targetInput"
          @input="onTargetInput"
          @focus="showTargetSug = !!targetInput.trim()"
          @blur="onTargetBlur"
          class="input"
          placeholder="选一只目标精灵"
        />
        <div v-if="showTargetSug && targetSuggestions.length" class="suggestions">
          <div
            v-for="s in targetSuggestions"
            :key="s.id"
            class="sug-item"
            @mousedown.prevent="pickTarget(s)"
          >
            <div class="sug-avatar">
              <img v-if="s.py" :src="petImg(s.py)" :alt="s.name" />
            </div>
            <div class="sug-text">
              <div class="sug-name">{{ s.name }}</div>
              <div class="sug-meta">
                <template v-for="(el, i) in s.element" :key="el">
                  <img v-if="ELEMENTS[el]?.icon" :src="ELEMENTS[el].icon" class="el-icon" />
                  <span :style="{ color: ELEMENTS[el]?.color }">{{ ELEMENTS[el]?.name }}</span>
                  <span v-if="i < s.element.length - 1" style="color:var(--text-muted)"> / </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 配偶（选填，不依赖目标，但需要目标才有意义） -->
      <div class="search-wrapper mt-8">
        <input
          v-model="partnerInput"
          @input="onPartnerInput"
          @focus="showPartnerSug = !!partnerInput.trim()"
          @blur="onPartnerBlur"
          class="input"
          placeholder="（选填）输入配偶名，验证能否一起生蛋"
        />
        <div v-if="showPartnerSug && partnerSuggestions.length" class="suggestions">
          <div
            v-for="s in partnerSuggestions"
            :key="s.id"
            class="sug-item"
            @mousedown.prevent="pickPartner(s)"
          >
            <div class="sug-avatar">
              <img v-if="s.py" :src="petImg(s.py)" :alt="s.name" />
            </div>
            <div class="sug-text">
              <div class="sug-name">{{ s.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 只填配偶但没选目标 -->
    <div v-if="partner && !selected" class="card warn-card">
      <div class="warn-text">先在上面选一个目标精灵</div>
      <div class="warn-sub">输入并选中目标后，再来配对 {{ partner.name }}</div>
    </div>

    <!-- 配偶不能配对时的明显警告 -->
    <div v-if="partnerMismatch" class="card no-card">
      <div class="no-text">No！他们不能在一起</div>
      <div class="no-sub">{{ selected.name }}（蛋组 {{ selected.eggGroup.join('/') }}） × {{ partner.name }}（蛋组 {{ partner.eggGroup.join('/') }}）</div>
    </div>

    <!-- 已选目标 -->
    <template v-if="selected">
      <div class="card">
        <div class="card-title">已选目标</div>
        <div class="selected-row">
          <div class="selected-avatar">
            <img v-if="selected.py" :src="petImg(selected.py)" :alt="selected.name" />
          </div>
          <div class="selected-info">
            <div class="selected-name">{{ selected.name }}</div>
            <div class="selected-meta">
              <template v-for="(el, i) in selected.element" :key="el">
                <img v-if="ELEMENTS[el]?.icon" :src="ELEMENTS[el].icon" class="el-icon" />
                <span :style="{ color: ELEMENTS[el]?.color }">{{ ELEMENTS[el]?.name }}</span>
                <span v-if="i < selected.element.length - 1" style="color:var(--text-muted)"> / </span>
              </template>
            </div>
            <div class="selected-groups">
              <span v-for="g in selected.eggGroup" :key="g" class="group-chip">
                组 {{ g }} · {{ EGG_GROUP_LABELS[g] || '?' }}
              </span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" @click="resetAll">清除</button>
        </div>
      </div>

      <!-- 异色筛选 -->
      <div class="card" style="padding:12px 14px">
        <div class="chips-row">
          <button
            class="chip"
            :class="{ active: !shinyOnly }"
            @click="shinyOnly = false"
          >全部</button>
          <button
            class="chip chip-shiny"
            :class="{ active: shinyOnly }"
            @click="shinyOnly = true"
          >
            <img :src="`${BASE}icons/shiny.png`" class="shiny-icon" />
            仅看异色
          </button>
        </div>
      </div>

      <!-- 配对结果 -->
      <div class="card" style="padding:8px">
        <div class="list-header">
          能与 <strong>{{ selected.name }}</strong> 一起生蛋（{{ partners.length }} 只）
        </div>
        <div v-if="!partners.length" class="empty-state">
          <p>没有匹配的精灵</p>
        </div>
        <div v-else class="pet-grid">
          <div
            v-for="p in partners"
            :key="p.id"
            class="pet-card-mini clickable"
            @click="pickTarget(p)"
            title="点击切换为目标精灵，查看它的蛋组与配对列表"
          >
            <div class="pc-avatar">
              <img
                v-if="p.py && shinyOnly"
                :src="petShinyImg(p.py)"
                :alt="p.name"
                @error="(e) => onShinyError(e, p.py)"
              />
              <img v-else-if="p.py" :src="petImg(p.py)" :alt="p.name" />
            </div>
            <div class="pc-name">{{ p.name }}</div>
            <div class="pc-element">
              <template v-for="(el, i) in p.element" :key="el">
                <img v-if="ELEMENTS[el]?.icon" :src="ELEMENTS[el].icon" class="el-icon" />
                <span v-if="i < p.element.length - 1" style="color:var(--text-muted)"> / </span>
              </template>
            </div>
            <div class="pc-hint">点击切换为目标</div>
          </div>
        </div>
      </div>
    </template>

    <!-- 没选目标时的引导（不显示结果） -->
    <div v-else class="card empty-state-card">
      <div class="empty-state">
        <div class="icon">&#129516;</div>
        <p>在上方搜索框输入精灵名，开始蛋组查询</p>
        <p style="font-size: 12px; margin-top: 4px; opacity: 0.7;">
          共 {{ BREEDING_PETS.length }} 只可在家园生蛋的精灵
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import { ELEMENTS, SHINY_PETS } from '../data/pets.js'
import { BREEDING_PETS, EGG_GROUP_LABELS } from '../data/breedingPets.js'

const BASE = import.meta.env.BASE_URL || '/'

const targetInput = ref('')
const partnerInput = ref('')
const showTargetSug = ref(false)
const showPartnerSug = ref(false)
const selected = ref(null)
const partner = ref(null)
const shinyOnly = ref(false)

const shinyStage1Names = computed(() => {
  const s = new Set()
  for (const p of SHINY_PETS) {
    const stage1 = p.evolutionLine?.[0] || p.name
    if (stage1) s.add(stage1)
  }
  return s
})

function petImg(py) {
  return `${BASE}icons/friends/JL_${py}.webp`
}
const _shinyPyByPy = {}
for (const p of BREEDING_PETS) _shinyPyByPy[p.py] = p.shinyPy || p.py
function petShinyImg(py) {
  const shinyPy = _shinyPyByPy[py] || py
  return `${BASE}icons/friends/JL_${shinyPy}_yise.webp`
}
function onShinyError(e, py) {
  // 异色立绘缺失时 fallback 普通立绘
  e.target.src = petImg(py)
}

const targetSuggestions = computed(() => {
  const q = targetInput.value.trim()
  if (!q) return []
  return BREEDING_PETS.filter(p => p.name.includes(q)).slice(0, 10)
})

const partnerSuggestions = computed(() => {
  const q = partnerInput.value.trim()
  if (!q) return []
  return BREEDING_PETS.filter(p =>
    p.id !== selected.value?.id && p.name.includes(q)
  ).slice(0, 10)
})

const partners = computed(() => {
  if (!selected.value) return []
  const gs = new Set(selected.value.eggGroup)
  let list = BREEDING_PETS.filter(p =>
    p.id !== selected.value.id && p.eggGroup.some(g => gs.has(g))
  )
  if (shinyOnly.value) {
    list = list.filter(p => shinyStage1Names.value.has(p.name))
  }
  return list
})

const partnerMismatch = computed(() => {
  if (!selected.value || !partner.value) return false
  const gs = new Set(selected.value.eggGroup)
  return !partner.value.eggGroup.some(g => gs.has(g))
})

function onTargetInput() {
  showTargetSug.value = !!targetInput.value.trim()
  selected.value = null
}
function onPartnerInput() {
  showPartnerSug.value = !!partnerInput.value.trim()
  partner.value = null
}
function onTargetBlur() {
  setTimeout(() => { showTargetSug.value = false }, 180)
}
function onPartnerBlur() {
  setTimeout(() => { showPartnerSug.value = false }, 180)
}
function pickTarget(p) {
  selected.value = p
  targetInput.value = p.name
  showTargetSug.value = false
  // 切目标时，如果配偶跟新目标不能配，清掉配偶，避免显示错误警告
  if (partner.value && !partner.value.eggGroup.some(g => p.eggGroup.includes(g))) {
    partner.value = null
    partnerInput.value = ''
  }
  // 滚回页面顶部，让用户看到新目标的信息
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
}
function pickPartner(p) {
  partner.value = p
  partnerInput.value = p.name
  showPartnerSug.value = false
}
function resetAll() {
  selected.value = null
  partner.value = null
  targetInput.value = ''
  partnerInput.value = ''
}
</script>

<style scoped>
.search-wrapper { position: relative; }
.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
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
}
.sug-item:last-child { border-bottom: none; }
.sug-item:hover { background: rgba(102,126,234,0.08); }
.sug-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.sug-avatar img { width: 100%; height: 100%; object-fit: contain; }
.sug-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.sug-meta { font-size: 11px; color: var(--text-secondary); margin-top: 2px; display: flex; align-items: center; gap: 3px; flex-wrap: wrap; }
.sug-meta .el-icon { width: 14px; height: 14px; }

.mt-8 { margin-top: 8px; }

.no-card {
  background: linear-gradient(135deg, #ff6b6b, #c44569);
  color: #fff;
  text-align: center;
  padding: 20px;
}
.no-text { font-size: 22px; font-weight: 800; letter-spacing: 1px; }
.no-sub { font-size: 12px; opacity: 0.9; margin-top: 6px; }

.warn-card {
  background: linear-gradient(135deg, #f6d365, #fda085);
  color: #5a3a00;
  text-align: center;
  padding: 16px;
}
.warn-text { font-size: 15px; font-weight: 700; }
.warn-sub { font-size: 12px; opacity: 0.85; margin-top: 4px; }

.selected-row { display: flex; align-items: center; gap: 12px; }
.selected-avatar {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; flex-shrink: 0;
}
.selected-avatar img { width: 100%; height: 100%; object-fit: contain; }
.selected-info { flex: 1; min-width: 0; }
.selected-name { font-size: 18px; font-weight: 700; color: var(--color-accent); }
.selected-meta { font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.selected-meta .el-icon { width: 16px; height: 16px; }
.selected-groups { font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.group-chip {
  display: inline-block;
  padding: 2px 8px;
  margin-right: 6px;
  background: rgba(102,126,234,0.1);
  border-radius: var(--radius-full);
  color: var(--color-accent);
  font-weight: 500;
}

.chips-row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 5px 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}
.chip.active {
  background: rgba(102,126,234,0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 600;
}
.chip-shiny.active {
  background: rgba(212,160,23,0.12);
  border-color: var(--color-shiny);
  color: var(--color-shiny);
}
.shiny-icon { width: 16px; height: 16px; vertical-align: middle; margin-right: 2px; }

.list-header { padding: 4px 8px 8px; font-size: 12px; color: var(--text-secondary); }

.pet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 380px) {
  .pet-grid { grid-template-columns: repeat(3, 1fr); }
}

.pet-card-mini {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px 8px;
  background: var(--bg-card-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all 0.15s;
}
.pet-card-mini.clickable { cursor: pointer; }
.pet-card-mini.clickable:active { transform: scale(0.97); }
.pet-card-mini.peek {
  background: rgba(102,126,234,0.06);
  border-color: var(--color-accent);
}
.pc-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; margin-bottom: 4px;
}
.pc-avatar img { width: 100%; height: 100%; object-fit: contain; }
.pc-name { font-size: 13px; font-weight: 600; color: var(--text-primary); text-align: center; }
.pc-element {
  font-size: 11px; margin-top: 2px;
  display: flex; align-items: center; gap: 2px;
}
.pc-element .el-icon { width: 14px; height: 14px; }
.pc-hint {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 4px;
  opacity: 0.7;
}
.pc-groups {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
  text-align: center;
  line-height: 1.4;
}
.pc-groups .g-match {
  color: var(--color-accent);
  font-weight: 600;
}

.empty-state-card { padding: 32px 16px; }
</style>
