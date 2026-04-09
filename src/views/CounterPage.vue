<template>
  <div class="page">
    <PageHeader title="刷取计数器" subtitle="噩梦枷锁 · 80次保底必出异色" />

    <!-- 未选择目标 -->
    <div v-if="!store.currentTarget" class="card">
      <div class="empty-state">
        <div class="icon">&#127919;</div>
        <p>请先选择刷取目标</p>
        <button class="btn btn-primary btn-sm mt-12" @click="showTargetPicker = true">选择精灵</button>
      </div>
    </div>

    <template v-else>
      <!-- 目标信息 -->
      <div class="target-bar" @click="showTargetPicker = true">
        <img v-if="store.currentTarget.imgShiny" :src="store.currentTarget.imgShiny" class="target-thumb" />
        <span class="target-name">{{ store.currentTarget.name }}</span>
        <span class="target-elements">
          <template v-for="(el, i) in targetElements" :key="el">
            <img :src="ELEMENTS[el]?.icon" class="el-icon" :title="ELEMENTS[el]?.name" />
            <span :style="{ color: ELEMENTS[el]?.color }" class="target-el-name">{{ ELEMENTS[el]?.name }}</span>
            <span v-if="i < targetElements.length - 1" style="color:var(--text-muted);font-size:10px">/</span>
          </template>
        </span>
        <span class="target-area">{{ store.currentTarget.area }}</span>
        <span class="change-btn">切换 &gt;</span>
      </div>

      <!-- 池子切换 -->
      <div class="pool-tabs">
        <button
          class="pool-tab"
          :class="{ active: activePool === 'family' }"
          @click="activePool = 'family'"
        >
          <img :src="ICON_FAMILY" class="inline-icon" /> 家族池
        </button>
        <button
          class="pool-tab"
          :class="{ active: activePool === 'element' }"
          @click="activePool = 'element'"
        >
          <img :src="ICON_ELEMENT_POOL" class="inline-icon" /> 属性池
        </button>
      </div>

      <!-- 池子说明 -->
      <div class="pool-desc">
        <template v-if="activePool === 'family'">
          持续捕捉<strong>同一进化链</strong>精灵触发 · 出该家族污染
        </template>
        <template v-else>
          持续捕捉<strong>同属性不同家族</strong>精灵触发 · 出赛季奇遇污染
        </template>
      </div>

      <!-- 噩梦枷锁进度（双池） -->
      <div class="card counter-card">
        <div class="card-title">
          <img :src="activePool === 'family' ? ICON_FAMILY : ICON_ELEMENT_POOL" class="inline-icon" />
          {{ activePool === 'family' ? '家族池' : '属性池' }}噩梦枷锁
          <span v-if="activePool === 'element'" class="pool-element-tag">
            <img :src="ELEMENTS[store.currentElementKey]?.icon" class="el-icon" :title="elementTagName" />
            <span :style="{ color: elementTagColor }">{{ elementTagName }}</span>
          </span>
        </div>
        <div class="ring-wrapper">
          <ProgressRing
            :value="activeCounter.nightmareCount"
            :max="80"
            :size="150"
            :stroke-width="10"
            :is-shiny="activeCounter.nightmareCount >= 60"
          >
            <div class="counter-number" :class="{ 'shimmer-text': activeCounter.nightmareCount >= 60 }">
              {{ activeCounter.nightmareCount }}
            </div>
            <div class="counter-max">/ 80</div>
          </ProgressRing>
        </div>
        <div class="counter-hint mt-8 text-center">
          <template v-if="activeCounter.nightmareCount >= 80">
            &#127881; 已达保底！下20次内必出异色！
          </template>
          <template v-else>
            距保底还需 <strong>{{ 80 - activeCounter.nightmareCount }}</strong> 次
          </template>
        </div>
      </div>

      <!-- 连续捕捉计数 - 可编辑 -->
      <div class="card">
        <div class="card-title"><img :src="ICON_CHAIN" class="inline-icon" /> 连续捕捉（{{ activePool === 'family' ? '家族池' : '属性池' }}）</div>
        <div class="catch-counter">
          <button class="btn btn-ghost btn-round" @click="store.decrementCatch(activePool)" :disabled="activeCounter.catchCount === 0">
            <span style="font-size: 20px">&minus;</span>
          </button>
          <input
            type="number"
            :value="activeCounter.catchCount"
            @change="e => store.setCatchCount(activePool, +e.target.value)"
            class="catch-input"
            min="0"
          />
          <button class="btn btn-primary btn-round" @click="store.incrementCatch(activePool)">
            <span style="font-size: 20px">+</span>
          </button>
        </div>
        <div class="catch-hint text-center mt-8">
          连续捕捉 20~35 只可触发噩梦枷锁
        </div>
      </div>

      <!-- 快速记录 - 点击直接记录 -->
      <div class="card">
        <div class="card-title">
          <img :src="ICON_FADE" class="inline-icon" /> 褪色结果
          <span class="title-hint">点击直接记录一条</span>
        </div>
        <div class="quick-result-row">
          <div
            v-for="opt in resultOptions"
            :key="opt.value"
            class="quick-btn"
            :class="[opt.cls, { 'just-tapped': justTapped === opt.value }]"
            @click="quickRecord(opt.value)"
          >
            <img :src="opt.img" class="quick-btn-icon" />
            <span class="quick-btn-label">{{ opt.label }}</span>
          </div>
        </div>
        <div v-if="lastRecordMsg" class="last-record-msg animate-float-in">
          {{ lastRecordMsg }}
        </div>
      </div>

      <!-- 批量补录 -->
      <div class="card">
        <div class="card-title">
          <img :src="ICON_BATCH" class="inline-icon" /> 批量补录
          <span class="title-hint">刷完一轮后统一填入</span>
        </div>
        <div class="batch-grid">
          <div v-for="opt in resultOptions" :key="opt.value" class="batch-item">
            <img :src="opt.img" class="batch-icon" />
            <span class="batch-label">{{ opt.label }}</span>
            <input
              v-model.number="batchCounts[opt.value]"
              type="number"
              min="0"
              class="input batch-input"
              placeholder="0"
              @keyup.enter="submitBatch"
            />
          </div>
        </div>
        <div class="batch-footer">
          <span class="batch-total">
            共 {{ batchTotal }} 次噩梦枷锁
          </span>
          <button
            class="btn btn-primary"
            :disabled="batchTotal === 0"
            @click="submitBatch"
          >
            一键记录
          </button>
        </div>
      </div>

      <!-- 道具消耗记录 -->
      <div class="card">
        <div class="card-title"><img :src="ICON_BAG" class="inline-icon" /> 道具消耗</div>
        <!-- 选择道具 - 图片网格 -->
        <div class="item-pick-grid">
          <div
            v-for="item in trackableItems"
            :key="item.key"
            class="item-pick"
            :class="{ active: newItemKey === item.key }"
            @click="newItemKey = item.key"
          >
            <img :src="item.img" class="item-pick-img" />
            <span class="item-pick-name">{{ item.name }}</span>
          </div>
        </div>
        <div v-if="newItemKey" class="item-add-row mt-8">
          <input
            v-model.number="newItemAmount"
            type="number"
            min="1"
            class="input"
            style="flex:1; text-align:center"
            placeholder="输入消耗数量"
            @keyup.enter="addItem"
          />
          <button class="btn btn-primary" :disabled="!newItemAmount" @click="addItem">
            添加
          </button>
        </div>

        <!-- 消耗汇总 -->
        <div class="card-title mt-12" style="margin-bottom:8px"><img :src="ICON_SUM" class="inline-icon" /> 消耗汇总</div>
        <div class="item-summary">
          <div v-for="item in trackableItems" :key="item.key" class="item-sum-row">
            <img :src="item.img" class="ball-img" />
            <span class="item-sum-name">{{ item.name }}</span>
            <span class="item-sum-count">{{ store.items[item.key] || 0 }}</span>
          </div>
        </div>

        <!-- 消耗记录列表 -->
        <div v-if="recentItemLogs.length > 0" class="item-logs mt-12">
          <div class="card-title" style="margin-bottom:8px"><img :src="ICON_SCROLL" class="inline-icon" /> 记录明细</div>
          <div v-for="log in recentItemLogs" :key="log.id" class="item-log-row">
            <img :src="getItemImg(log.key)" class="ball-img" />
            <div class="item-log-info">
              <span class="item-log-name">{{ getItemName(log.key) }}</span>
              <span class="item-log-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div v-if="editingLogId !== log.id" class="item-log-actions">
              <span class="item-log-amount">x{{ log.amount }}</span>
              <button class="icon-btn" @click="startEdit(log)" title="编辑">&#9998;</button>
              <button class="icon-btn danger" @click="deleteItemLog(log.id)" title="删除">&times;</button>
            </div>
            <div v-else class="item-log-edit">
              <input v-model.number="editAmount" type="number" min="1" class="input input-mini" @keyup.enter="saveEdit(log.id)" />
              <button class="btn btn-primary btn-sm" @click="saveEdit(log.id)">&#10003;</button>
              <button class="btn btn-ghost btn-sm" @click="editingLogId = ''">&#10005;</button>
            </div>
          </div>
          <div v-if="store.itemLogs.length > 5" class="text-center mt-8">
            <button class="btn btn-ghost btn-sm" @click="showAllLogs = !showAllLogs">
              {{ showAllLogs ? '收起' : `查看全部 ${store.itemLogs.length} 条` }}
            </button>
          </div>
        </div>
      </div>

      <!-- 重置计数 -->
      <div class="text-center mt-12">
        <button class="btn btn-ghost btn-sm" @click="confirmReset"><img :src="ICON_REFRESH" class="inline-icon" /> 重置当前计数</button>
      </div>
    </template>

    <!-- 目标选择弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTargetPicker" class="modal-overlay modal-center" @click.self="showTargetPicker = false">
          <div class="modal-content modal-center-content animate-float-in" @click.stop>
            <div class="modal-title">选择刷取目标</div>
            <div class="pet-list">
              <PetCard
                v-for="pet in allPets"
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
        </div>
      </Transition>
    </Teleport>

    <!-- 成功弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccess" class="modal-overlay modal-center" @click="showSuccess = false">
          <div class="success-popup animate-float-in" @click.stop>
            <img :src="ICON_SHINY" class="success-icon-img" />
            <div class="success-title shimmer-text">恭喜获得异色！</div>
            <div class="success-name">{{ store.currentTarget?.name }}</div>
            <div class="success-count">第 {{ lastShinyCount }} 次噩梦枷锁</div>
            <button class="btn btn-shiny mt-16" @click="showSuccess = false">太棒了！</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useHuntingStore } from '../stores/hunting.js'
import { TRACKABLE_ITEMS } from '../data/items.js'
import { ELEMENTS, SHINY_PETS } from '../data/pets.js'
import { ICON_SHINY, ICON_POLLUTED, ICON_NORMAL, ICON_FAMILY, ICON_ELEMENT_POOL, ICON_SKULL, ICON_CHAIN, ICON_FADE, ICON_BAG, ICON_SUM, ICON_SCROLL, ICON_BATCH, ICON_REFRESH } from '../data/icons.js'
import PageHeader from '../components/PageHeader.vue'
import ProgressRing from '../components/ProgressRing.vue'
import PetCard from '../components/PetCard.vue'

const store = useHuntingStore()
const trackableItems = TRACKABLE_ITEMS

// 目标选择
const showTargetPicker = ref(false)
const allPets = SHINY_PETS

function selectTarget(petId) {
  store.setTarget(petId)
  showTargetPicker.value = false
}

// 池子切换
const activePool = ref('family')

const activeCounter = computed(() =>
  activePool.value === 'element' ? store.currentElementCounter : store.currentFamilyCounter
)

const targetElements = computed(() => {
  const t = store.currentTarget
  if (!t) return []
  return Array.isArray(t.element) ? t.element : [t.element]
})

const elementTagColor = computed(() =>
  ELEMENTS[store.currentElementKey]?.color || '#adb5bd'
)
const elementTagName = computed(() =>
  ELEMENTS[store.currentElementKey]?.name || ''
)

// 快速记录
const showSuccess = ref(false)
const lastShinyCount = ref(0)
const justTapped = ref('')
const lastRecordMsg = ref('')
let tapTimer = null
let msgTimer = null

const resultOptions = [
  { value: 'shiny',     label: '异色', cls: 'opt-shiny',     img: ICON_SHINY },
  { value: 'nightmare', label: '污染', cls: 'opt-nightmare', img: ICON_POLLUTED },
  { value: 'normal',    label: '普通', cls: 'opt-normal',    img: ICON_NORMAL },
]

function quickRecord(type) {
  if (!store.currentTargetId) return
  store.recordNightmare(type, activePool.value)

  // 点击反馈动画
  justTapped.value = type
  clearTimeout(tapTimer)
  tapTimer = setTimeout(() => { justTapped.value = '' }, 400)

  // 提示文字
  const label = resultOptions.find(o => o.value === type)?.label || type
  lastRecordMsg.value = `已记录：${label}（${activePool.value === 'family' ? '家族池' : '属性池'} 第 ${activeCounter.value.nightmareCount} 次）`
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { lastRecordMsg.value = '' }, 2500)

  if (type === 'shiny') {
    lastShinyCount.value = store.currentCounter.nightmareCount
    showSuccess.value = true
  }
}

// 批量补录
const batchCounts = reactive({ shiny: null, nightmare: null, normal: null })
const batchTotal = computed(() =>
  (batchCounts.shiny || 0) + (batchCounts.nightmare || 0) + (batchCounts.normal || 0)
)

function submitBatch() {
  if (!store.currentTargetId || batchTotal.value === 0) return
  let shinyHit = false
  for (const type of ['normal', 'nightmare', 'shiny']) {
    const count = batchCounts[type] || 0
    for (let i = 0; i < count; i++) {
      store.recordNightmare(type, activePool.value)
      if (type === 'shiny') shinyHit = true
    }
  }
  lastRecordMsg.value = `已批量记录 ${batchTotal.value} 条`
  clearTimeout(msgTimer)
  msgTimer = setTimeout(() => { lastRecordMsg.value = '' }, 2500)

  batchCounts.shiny = null
  batchCounts.nightmare = null
  batchCounts.normal = null

  if (shinyHit) {
    lastShinyCount.value = store.currentCounter.nightmareCount
    showSuccess.value = true
  }
}

// 道具消耗
const newItemKey = ref('')
const newItemAmount = ref(null)
const editingLogId = ref('')
const editAmount = ref(1)
const showAllLogs = ref(false)

const recentItemLogs = computed(() =>
  showAllLogs.value ? store.itemLogs : store.itemLogs.slice(0, 5)
)

function addItem() {
  if (!newItemKey.value || !newItemAmount.value || newItemAmount.value < 1) return
  store.addItemUsage(newItemKey.value, newItemAmount.value)
  newItemAmount.value = null
}

function getItemImg(key) {
  return TRACKABLE_ITEMS.find(i => i.key === key)?.img || ''
}

function getItemName(key) {
  return TRACKABLE_ITEMS.find(i => i.key === key)?.name || key
}

function startEdit(log) {
  editingLogId.value = log.id
  editAmount.value = log.amount
}

function saveEdit(logId) {
  if (editAmount.value >= 1) {
    store.updateItemLog(logId, editAmount.value)
  }
  editingLogId.value = ''
}

function deleteItemLog(logId) {
  if (confirm('确定删除这条记录？')) {
    store.deleteItemLog(logId)
  }
}

function formatTime(ts) {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${h}:${min}`
}

function confirmReset() {
  if (confirm('确定要重置当前目标的所有计数吗？此操作不可撤销。')) {
    store.resetCounter()
  }
}
</script>

<style scoped>
/* === 池子切换 === */
.pool-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.pool-tab {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-color);
  background: #fff;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.pool-tab.active {
  border-color: var(--color-accent);
  background: rgba(102, 126, 234, 0.06);
  color: var(--color-accent);
}

.pool-tab:active {
  transform: scale(0.97);
}

.pool-desc {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
  padding: 0 8px;
}

.pool-desc strong {
  color: var(--color-accent);
}

.pool-element-tag {
  font-weight: 700;
  font-size: 12px;
  margin-left: auto;
}

.target-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #fff;
  border-radius: var(--radius-full);
  margin-bottom: 10px;
  cursor: pointer;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
}

.target-thumb {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 8px;
}

.target-name {
  font-weight: 700;
  color: var(--color-shiny);
}

.target-elements {
  display: flex;
  align-items: center;
  gap: 2px;
}

.target-el-name {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: 2px;
}

.target-area {
  font-size: 12px;
  color: var(--text-secondary);
  flex: 1;
}

.change-btn {
  font-size: 12px;
  color: var(--text-muted);
}

.counter-card {
  text-align: center;
}

.ring-wrapper {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.counter-number {
  font-size: 38px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.counter-max {
  font-size: 15px;
  color: var(--text-muted);
  margin-top: 2px;
}

.counter-hint {
  font-size: 13px;
  color: var(--text-secondary);
}

.counter-hint strong {
  color: var(--color-shiny);
}

.catch-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.catch-number {
  font-size: 36px;
  font-weight: 700;
  min-width: 80px;
  text-align: center;
}

.btn-round {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
}

.catch-input {
  width: 80px;
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  border: none;
  background: transparent;
  color: var(--text-primary);
  outline: none;
  border-bottom: 2px solid var(--border-color);
  padding: 4px 0;
  -moz-appearance: textfield;
}
.catch-input::-webkit-inner-spin-button,
.catch-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}
.catch-input:focus {
  border-bottom-color: var(--color-accent);
}

.catch-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.pet-list {
  max-height: 50vh;
  overflow-y: auto;
}

/* === 噩梦结果选择卡片 === */
.result-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.result-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-input);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.result-option:active {
  transform: scale(0.95);
}

.result-option.selected {
  animation: bounce-select 0.35s ease;
}

.result-option.selected.opt-shiny {
  border-color: var(--color-shiny);
  background: rgba(212, 160, 23, 0.08);
  box-shadow: 0 0 16px rgba(212, 160, 23, 0.2);
}

.result-option.selected.opt-nightmare {
  border-color: var(--color-nightmare);
  background: rgba(155, 89, 182, 0.08);
  box-shadow: 0 0 16px rgba(155, 89, 182, 0.2);
}

.result-option.selected.opt-normal {
  border-color: #999;
  background: rgba(153, 153, 153, 0.06);
}

.result-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.result-emoji {
  font-size: 28px;
}

.result-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.result-check {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 14px;
  font-weight: 700;
  animation: check-pop 0.3s ease;
}

.opt-shiny .result-check { color: var(--color-shiny); }
.opt-nightmare .result-check { color: var(--color-nightmare); }
.opt-normal .result-check { color: #999; }

/* === 道具消耗 === */
.item-add-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.item-sum-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}

.item-sum-name {
  font-size: 11px;
  color: var(--text-secondary);
}

.item-sum-count {
  font-size: 18px;
  font-weight: 700;
}

.item-logs {
  border-top: 1px solid var(--border-color);
  padding-top: 8px;
}

.item-log-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f3;
}

.item-log-row:last-child {
  border-bottom: none;
}

.item-log-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-log-name {
  font-size: 13px;
  font-weight: 500;
}

.item-log-time {
  font-size: 11px;
  color: var(--text-muted);
}

.item-log-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-log-amount {
  font-weight: 700;
  font-size: 14px;
  min-width: 32px;
  text-align: right;
}

.item-log-edit {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-mini {
  width: 56px !important;
  padding: 6px 8px;
  text-align: center;
  font-size: 13px;
}

.icon-btn {
  width: 26px;
  height: 26px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  color: var(--text-muted);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.icon-btn:active {
  background: var(--bg-input);
}

.icon-btn.danger:active {
  color: var(--color-danger);
}

/* === 成功弹窗 === */
.success-popup {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  text-align: center;
  border: 2px solid rgba(212, 160, 23, 0.3);
  box-shadow: var(--shadow-glow-gold);
  min-width: 260px;
}

.success-icon-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  margin-bottom: 8px;
}

.success-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 8px;
}

.success-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-shiny);
}

.success-count {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* === 快速记录 === */
.title-hint {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: auto;
}

.quick-result-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-input);
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.quick-btn:active {
  transform: scale(0.92);
}

.quick-btn.just-tapped {
  animation: bounce-select 0.35s ease;
}

.quick-btn.just-tapped.opt-shiny {
  border-color: var(--color-shiny);
  background: rgba(212, 160, 23, 0.1);
  box-shadow: 0 0 20px rgba(212, 160, 23, 0.25);
}

.quick-btn.just-tapped.opt-nightmare {
  border-color: var(--color-nightmare);
  background: rgba(155, 89, 182, 0.1);
  box-shadow: 0 0 20px rgba(155, 89, 182, 0.25);
}

.quick-btn.just-tapped.opt-normal {
  border-color: #aaa;
  background: rgba(153, 153, 153, 0.08);
}

.quick-btn-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.quick-btn-label {
  font-size: 13px;
  font-weight: 600;
}

.last-record-msg {
  text-align: center;
  font-size: 13px;
  color: var(--color-success);
  font-weight: 500;
  margin-top: 10px;
  padding: 6px;
  background: rgba(39, 174, 96, 0.06);
  border-radius: var(--radius-md);
}

/* === 批量补录 === */
.batch-grid {
  display: flex;
  gap: 10px;
}

.batch-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.batch-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.batch-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.batch-input {
  text-align: center;
  padding: 8px 4px;
  font-size: 18px;
  font-weight: 700;
}

.batch-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.batch-total {
  font-size: 13px;
  color: var(--text-secondary);
}

/* 普通结果 icon 灰度 */
.opt-normal .result-logo {
  filter: grayscale(1) opacity(0.4);
}

.opt-normal.selected .result-logo {
  filter: grayscale(0.5) opacity(0.7);
}

/* 道具图片选择网格 */
.item-pick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.item-pick {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  background: var(--bg-input);
  cursor: pointer;
  transition: all 0.2s;
}

.item-pick:active {
  transform: scale(0.95);
}

.item-pick.active {
  border-color: var(--color-accent);
  background: rgba(102, 126, 234, 0.06);
  animation: bounce-select 0.3s ease;
}

.item-pick-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.item-pick-name {
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
  font-weight: 500;
}

.item-pick.active .item-pick-name {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
