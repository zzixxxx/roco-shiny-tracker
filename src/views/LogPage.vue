<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">刷取日志</div>
      <div class="page-subtitle">记录每次噩梦枷锁结果</div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: currentFilter === f.value }"
        @click="currentFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- 日志列表 -->
    <div v-if="filteredLogs.length > 0" class="log-list">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="log-item"
        :class="'log-' + log.result"
      >
        <div class="log-indicator">
          <span class="log-dot" :class="'dot-' + log.result"></span>
          <span class="log-line"></span>
        </div>
        <div class="log-content">
          <div class="log-header">
            <span class="log-pet-name">{{ getPetName(log.petId) }}</span>
            <span class="tag" :class="'tag-' + log.result">
              {{ getResultLabel(log.result) }}
            </span>
          </div>
          <div class="log-meta">
            <span>第 {{ log.nightmareCount }} 次噩梦枷锁</span>
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          </div>
          <div v-if="log.note" class="log-note">{{ log.note }}</div>
        </div>
        <button class="log-delete" @click="deleteLog(log.id)" title="删除">
          &times;
        </button>
      </div>
    </div>

    <div v-else class="card">
      <div class="empty-state">
        <div class="icon">&#128203;</div>
        <p>暂无刷取记录</p>
        <p style="margin-top: 4px; font-size: 12px;">在计数器页面记录噩梦枷锁结果后将在这里显示</p>
      </div>
    </div>

    <!-- 孵蛋记录 -->
    <div class="section-header mt-16">
      <span>&#129370; 孵蛋记录</span>
      <button class="btn btn-ghost btn-sm" @click="showEggForm = true">+ 添加</button>
    </div>

    <div v-if="store.eggs.length > 0" class="log-list">
      <div v-for="egg in store.eggs" :key="egg.id" class="egg-item">
        <div class="egg-icon">&#129370;</div>
        <div class="egg-content">
          <div class="egg-parents">
            {{ getPetName(egg.parent1) }} + {{ getPetName(egg.parent2) }}
          </div>
          <div class="egg-meta">
            <span class="tag" :class="eggResultClass(egg.result)">{{ eggResultLabel(egg.result) }}</span>
            <span class="egg-time">{{ formatTime(egg.timestamp) }}</span>
          </div>
        </div>
        <button class="log-delete" @click="store.deleteEgg(egg.id)">&times;</button>
      </div>
    </div>

    <div v-else class="card" style="margin-top: 8px">
      <div class="empty-state" style="padding: 20px">
        <p style="color: var(--text-muted)">暂无孵蛋记录</p>
      </div>
    </div>

    <!-- 添加孵蛋弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEggForm" class="modal-overlay" @click.self="showEggForm = false">
          <Transition name="slide-up">
            <div v-if="showEggForm" class="modal-content">
              <div class="modal-title">添加孵蛋记录</div>
              <div class="form-group">
                <label class="form-label">亲代1</label>
                <select v-model="eggForm.parent1" class="input">
                  <option value="">选择精灵</option>
                  <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">亲代2</label>
                <select v-model="eggForm.parent2" class="input">
                  <option value="">选择精灵</option>
                  <option v-for="pet in pets" :key="pet.id" :value="pet.id">{{ pet.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">孵蛋结果</label>
                <select v-model="eggForm.result" class="input">
                  <option value="normal">普通</option>
                  <option value="shiny">异色</option>
                  <option value="colorful">炫彩</option>
                  <option value="shiny_colorful">异色炫彩</option>
                </select>
              </div>
              <button
                class="btn btn-primary btn-block mt-12"
                :disabled="!eggForm.parent1 || !eggForm.parent2"
                @click="submitEgg"
              >
                确认添加
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHuntingStore } from '../stores/hunting.js'
import { SHINY_PETS, RESULT_TYPES } from '../data/pets.js'

const store = useHuntingStore()
const pets = SHINY_PETS
const currentFilter = ref('all')
const showEggForm = ref(false)

const eggForm = reactive({
  parent1: '',
  parent2: '',
  result: 'normal',
})

const filters = [
  { label: '全部', value: 'all' },
  { label: '&#10024; 异色', value: 'shiny' },
  { label: '&#128126; 污染', value: 'nightmare' },
  { label: '&#9675; 普通', value: 'normal' },
]

const filteredLogs = computed(() => {
  if (currentFilter.value === 'all') return store.logs
  return store.logs.filter(l => l.result === currentFilter.value)
})

function getPetName(petId) {
  return SHINY_PETS.find(p => p.id === petId)?.name || petId
}

function getResultLabel(result) {
  return RESULT_TYPES[result]?.name || result
}

function formatTime(ts) {
  const d = new Date(ts)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${h}:${m}`
}

function deleteLog(logId) {
  if (confirm('确定删除这条记录吗？')) {
    store.deleteLog(logId)
  }
}

function eggResultClass(result) {
  if (result === 'shiny' || result === 'shiny_colorful') return 'tag-shiny'
  if (result === 'colorful') return 'tag-nightmare'
  return 'tag-normal'
}

function eggResultLabel(result) {
  const labels = {
    normal: '普通',
    shiny: '异色',
    colorful: '炫彩',
    shiny_colorful: '异色炫彩',
  }
  return labels[result] || result
}

function submitEgg() {
  store.addEggRecord(eggForm.parent1, eggForm.parent2, eggForm.result)
  eggForm.parent1 = ''
  eggForm.parent2 = ''
  eggForm.result = 'normal'
  showEggForm.value = false
}
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-btn {
  flex: 1;
  padding: 8px 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--gradient-purple);
  border-color: transparent;
  color: #fff;
}

.log-list {
  display: flex;
  flex-direction: column;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  position: relative;
}

.log-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
  padding-top: 6px;
}

.log-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

.dot-shiny {
  background: var(--color-shiny);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.dot-nightmare {
  background: var(--color-nightmare);
}

.dot-normal {
  background: #555;
}

.log-line {
  flex: 1;
  width: 2px;
  background: #f0f0f3;
  margin-top: 4px;
}

.log-content {
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-bottom: 8px;
}

.log-shiny .log-content {
  border: 1px solid rgba(255, 215, 0, 0.15);
  background: rgba(255, 215, 0, 0.05);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-pet-name {
  font-weight: 600;
  font-size: 14px;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
}

.log-note {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
  padding: 6px 8px;
  background: #f5f5f8;
  border-radius: var(--radius-sm);
}

.log-delete {
  position: absolute;
  top: 8px;
  right: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.log-delete:active {
  opacity: 1;
  color: var(--color-danger);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 15px;
}

.egg-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  position: relative;
}

.egg-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.egg-content {
  flex: 1;
}

.egg-parents {
  font-size: 14px;
  font-weight: 600;
}

.egg-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.egg-time {
  font-size: 11px;
  color: var(--text-muted);
}

.form-group {
  margin-bottom: 12px;
}

.form-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
</style>
