<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">刷取计数器</div>
      <div class="page-subtitle">噩梦枷锁 · 80次保底必出异色</div>
    </div>

    <!-- 未选择目标 -->
    <div v-if="!store.currentTarget" class="card">
      <div class="empty-state">
        <div class="icon">&#127919;</div>
        <p>请先在首页选择刷取目标</p>
        <router-link to="/" class="btn btn-primary btn-sm mt-12">去选择</router-link>
      </div>
    </div>

    <template v-else>
      <!-- 目标信息 -->
      <div class="target-bar" @click="$router.push('/')">
        <img v-if="store.currentTarget.imgShiny" :src="store.currentTarget.imgShiny" class="target-thumb" />
        <span class="target-name">{{ store.currentTarget.name }}</span>
        <span class="target-area">{{ store.currentTarget.area }}</span>
        <span class="change-btn">切换 &gt;</span>
      </div>

      <!-- 噩梦枷锁进度 -->
      <div class="card counter-card">
        <div class="card-title"><span class="icon">&#128128;</span> 噩梦枷锁进度</div>
        <div class="ring-wrapper">
          <ProgressRing
            :value="store.currentCounter.nightmareCount"
            :max="80"
            :size="160"
            :stroke-width="10"
            :is-shiny="store.currentCounter.nightmareCount >= 60"
          >
            <div class="counter-number" :class="{ 'shimmer-text': store.currentCounter.nightmareCount >= 60 }">
              {{ store.currentCounter.nightmareCount }}
            </div>
            <div class="counter-max">/ 80</div>
          </ProgressRing>
        </div>
        <div class="counter-hint mt-8 text-center">
          <template v-if="store.currentCounter.nightmareCount >= 80">
            &#127881; 已达保底！下20次噩梦内必出异色！
          </template>
          <template v-else>
            距离保底还需 <strong>{{ 80 - store.currentCounter.nightmareCount }}</strong> 次噩梦枷锁
          </template>
        </div>
      </div>

      <!-- 连续捕捉计数 -->
      <div class="card">
        <div class="card-title"><span class="icon">&#128302;</span> 连续捕捉计数</div>
        <div class="catch-counter">
          <button class="btn btn-ghost btn-round" @click="store.decrementCatch()" :disabled="store.currentCounter.catchCount === 0">
            <span style="font-size: 20px">&minus;</span>
          </button>
          <div class="catch-number">{{ store.currentCounter.catchCount }}</div>
          <button class="btn btn-primary btn-round" @click="store.incrementCatch()">
            <span style="font-size: 20px">+</span>
          </button>
        </div>
        <div class="catch-hint text-center mt-8">
          连续捕捉 20~35 只可触发噩梦枷锁
        </div>
      </div>

      <!-- 记录结果 - 带选中动效 -->
      <div class="card">
        <div class="card-title"><span class="icon">&#128221;</span> 记录噩梦枷锁结果</div>
        <input v-model="resultNote" class="input mb-12" placeholder="备注（可选）" />
        <div class="result-options">
          <div
            v-for="opt in resultOptions"
            :key="opt.value"
            class="result-option"
            :class="{ selected: selectedResult === opt.value, [opt.cls]: true }"
            @click="selectResult(opt.value)"
          >
            <div class="result-icon-wrap">
              <img :src="opt.img" class="result-logo" />
            </div>
            <div class="result-label">{{ opt.label }}</div>
            <div v-if="selectedResult === opt.value" class="result-check">&#10003;</div>
          </div>
        </div>
        <button
          class="btn btn-block mt-12"
          :class="selectedResult === 'shiny' ? 'btn-shiny' : 'btn-primary'"
          :disabled="!selectedResult"
          @click="confirmResult"
        >
          确认记录
        </button>
      </div>

      <!-- 道具消耗记录 -->
      <div class="card">
        <div class="card-title"><span class="icon">&#127873;</span> 道具消耗</div>
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
          />
          <button class="btn btn-primary" :disabled="!newItemAmount" @click="addItem">
            添加
          </button>
        </div>

        <!-- 消耗汇总 -->
        <div class="item-summary mt-12">
          <div v-for="item in trackableItems" :key="item.key" class="item-sum-row">
            <img :src="item.img" class="ball-img" />
            <span class="item-sum-name">{{ item.name }}</span>
            <span class="item-sum-count">{{ store.items[item.key] || 0 }}</span>
          </div>
        </div>

        <!-- 消耗记录列表 -->
        <div v-if="recentItemLogs.length > 0" class="item-logs mt-12">
          <div class="card-title" style="margin-bottom:8px"><span class="icon">&#128203;</span> 记录明细</div>
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
              <input v-model.number="editAmount" type="number" min="1" class="input input-mini" />
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
        <button class="btn btn-ghost btn-sm" @click="confirmReset">&#128260; 重置当前计数</button>
      </div>
    </template>

    <!-- 成功弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSuccess" class="modal-overlay" @click="showSuccess = false">
          <div class="success-popup animate-float-in" @click.stop>
            <div class="success-icon">&#10024;</div>
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
import { ref, computed } from 'vue'
import { useHuntingStore } from '../stores/hunting.js'
import { TRACKABLE_ITEMS } from '../data/items.js'
import ProgressRing from '../components/ProgressRing.vue'

const store = useHuntingStore()
const trackableItems = TRACKABLE_ITEMS

// 噩梦结果选择
const selectedResult = ref('')
const resultNote = ref('')
const showSuccess = ref(false)
const lastShinyCount = ref(0)

const resultOptions = [
  { value: 'shiny',     label: '异色', cls: 'opt-shiny',     img: '/icon-shiny.svg' },
  { value: 'nightmare', label: '污染', cls: 'opt-nightmare', img: '/icon-polluted.svg' },
  { value: 'normal',    label: '普通', cls: 'opt-normal',    img: '/icon-shiny.svg' },
]

function selectResult(val) {
  selectedResult.value = selectedResult.value === val ? '' : val
}

function confirmResult() {
  if (!selectedResult.value || !store.currentTargetId) return
  store.recordNightmare(selectedResult.value, resultNote.value)

  if (selectedResult.value === 'shiny') {
    lastShinyCount.value = store.currentCounter.nightmareCount
    showSuccess.value = true
  }
  selectedResult.value = ''
  resultNote.value = ''
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

.catch-hint {
  font-size: 12px;
  color: var(--text-muted);
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

.success-icon {
  font-size: 48px;
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
