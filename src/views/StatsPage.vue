<template>
  <div class="page">
    <PageHeader title="数据统计" subtitle="刷取数据全览" />

    <!-- 核心数据 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number shiny-color">{{ store.shinyLogs.length }}</div>
        <div class="stat-desc">异色获得</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ store.totalNightmares }}</div>
        <div class="stat-desc">噩梦枷锁</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ store.shinyRate }}%</div>
        <div class="stat-desc">异色出现率</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ store.collectedCount }}/{{ store.totalShinyCount }}</div>
        <div class="stat-desc">图鉴收集</div>
      </div>
    </div>

    <!-- 结果分布 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_CHART" class="inline-icon" /> 噩梦枷锁结果分布</div>
      <div v-if="store.logs.length > 0" class="distribution">
        <div class="dist-bar-wrapper">
          <div class="dist-bar">
            <div
              class="dist-segment shiny-seg"
              :style="{ width: shinyPercent + '%' }"
              :title="'异色: ' + shinyCount"
            ></div>
            <div
              class="dist-segment nightmare-seg"
              :style="{ width: nightmarePercent + '%' }"
              :title="'污染: ' + nightmareCount"
            ></div>
            <div
              class="dist-segment normal-seg"
              :style="{ width: normalPercent + '%' }"
              :title="'普通: ' + normalCount"
            ></div>
          </div>
        </div>
        <div class="dist-legend">
          <div class="legend-item">
            <span class="legend-dot" style="background: var(--color-shiny)"></span>
            <span>异色 {{ shinyCount }} ({{ shinyPercent }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: var(--color-nightmare)"></span>
            <span>污染 {{ nightmareCount }} ({{ nightmarePercent }}%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background: #555"></span>
            <span>普通 {{ normalCount }} ({{ normalPercent }}%)</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state" style="padding: 20px">
        <p>暂无数据</p>
      </div>
    </div>

    <!-- 各精灵刷取统计 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_CHART" class="inline-icon" /> 各精灵刷取统计</div>
      <div v-if="petStats.length > 0">
        <div v-for="stat in petStats" :key="stat.id" class="pet-stat-row">
          <div class="pet-stat-info">
            <span class="pet-stat-name">{{ stat.name }}</span>
            <span class="pet-stat-counts">
              {{ stat.total }}次 ·
              <span class="shiny-color">{{ stat.shiny }}异色</span>
            </span>
          </div>
          <div class="pet-stat-bar">
            <div class="progress-bar" style="height: 6px">
              <div
                class="progress-bar-fill"
                :class="{ shiny: stat.shiny > 0 }"
                :style="{ width: (stat.total / maxPetTotal * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state" style="padding: 20px">
        <p>暂无数据</p>
      </div>
    </div>

    <!-- 道具消耗 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_BAG" class="inline-icon" /> 道具消耗统计</div>
      <div class="item-stats">
        <div class="item-stat-row" v-for="item in trackableItems" :key="item.key">
          <img :src="item.img" style="width:24px;height:24px;object-fit:contain" />
          <span>{{ item.name }}</span>
          <span class="item-stat-value">{{ store.items[item.key] || 0 }}</span>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-block mt-12" @click="confirmResetItems">
        重置道具统计
      </button>
    </div>

    <!-- 孵蛋统计 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_EGG" class="inline-icon" /> 孵蛋统计</div>
      <div class="stats-grid" style="margin: 0">
        <div class="stat-card mini">
          <div class="stat-number">{{ store.eggs.length }}</div>
          <div class="stat-desc">总孵蛋</div>
        </div>
        <div class="stat-card mini">
          <div class="stat-number shiny-color">{{ eggShinyCount }}</div>
          <div class="stat-desc">异色蛋</div>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_GEAR" class="inline-icon" /> 数据管理</div>
      <div class="flex gap-8">
        <button class="btn btn-primary btn-sm" style="flex:1" @click="doExport">导出数据</button>
        <button class="btn btn-ghost btn-sm" style="flex:1" @click="triggerImport">导入数据</button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        style="display: none"
        @change="doImport"
      />
    </div>

    <!-- 云端同步 -->
    <div class="card">
      <div class="card-title"><img :src="ICON_CLOUD" class="inline-icon" /> 云端同步 (GitHub Gist)</div>
      <div class="form-group">
        <label class="form-label">
          GitHub Token
          <a href="https://github.com/settings/tokens/new?scopes=gist&description=roco-shiny-tracker" target="_blank" style="color:var(--color-accent);font-size:11px;margin-left:4px">去创建(勾选gist)</a>
        </label>
        <input
          :value="gistToken"
          @input="e => setGistToken(e.target.value)"
          type="password"
          class="input"
          placeholder="ghp_xxxx"
        />
      </div>
      <div class="form-group">
        <label class="form-label">UID（你的唯一标识，如游戏昵称）</label>
        <input
          :value="gistUid"
          @input="e => setGistUid(e.target.value)"
          class="input"
          placeholder="输入你的UID"
        />
      </div>
      <div v-if="gistToken && gistUid" class="flex gap-8 mt-8">
        <button class="btn btn-primary btn-sm" style="flex:1" @click="doUpload" :disabled="syncing">
          {{ syncing ? '同步中...' : '&#9650; 上传到云端' }}
        </button>
        <button class="btn btn-ghost btn-sm" style="flex:1" @click="doDownload" :disabled="syncing">
          {{ syncing ? '同步中...' : '&#9660; 从云端恢复' }}
        </button>
      </div>
      <div v-if="!gistToken || !gistUid" class="sync-hint mt-8">
        填写 Token 和 UID 后即可使用云端同步
      </div>
      <div v-if="syncMsg" class="sync-msg mt-8" :class="{ 'sync-error': syncError }">
        {{ syncMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onActivated } from 'vue'
import { useHuntingStore } from '../stores/hunting.js'
import { SHINY_PETS } from '../data/pets.js'
import PageHeader from '../components/PageHeader.vue'
import { ICON_CHART, ICON_BAG, ICON_EGG, ICON_GEAR, ICON_CLOUD } from '../data/icons.js'
import { TRACKABLE_ITEMS } from '../data/items.js'
import { getToken, setToken, getUid, setUid, uploadToGist, downloadFromGist } from '../stores/gistSync.js'

const store = useHuntingStore()
const fileInput = ref(null)
const trackableItems = TRACKABLE_ITEMS

// 云端同步
const gistToken = ref(getToken())
const gistUid = ref(getUid())
// 每次打开页面刷新UID（可能从App顶栏改了）
onActivated(() => { gistUid.value = getUid() })

const syncing = ref(false)
const syncMsg = ref('')
const syncError = ref(false)

function setGistToken(val) {
  gistToken.value = val
  setToken(val)
}

function setGistUid(val) {
  gistUid.value = val
  setUid(val)
}

async function doUpload() {
  syncing.value = true
  syncMsg.value = ''
  syncError.value = false
  try {
    const data = JSON.parse(store.exportData())
    await uploadToGist(gistUid.value, data)
    syncMsg.value = `上传成功！(UID: ${gistUid.value})`
  } catch (e) {
    syncMsg.value = '上传失败：' + e.message
    syncError.value = true
  }
  syncing.value = false
}

async function doDownload() {
  if (!confirm(`从云端恢复 UID "${gistUid.value}" 的数据，将覆盖本地，确定？`)) return
  syncing.value = true
  syncMsg.value = ''
  syncError.value = false
  try {
    const data = await downloadFromGist(gistUid.value)
    store.importData(JSON.stringify(data))
    syncMsg.value = `恢复成功！(UID: ${gistUid.value})`
  } catch (e) {
    syncMsg.value = '恢复失败：' + e.message
    syncError.value = true
  }
  syncing.value = false
}

const shinyCount = computed(() => store.logs.filter(l => l.result === 'shiny').length)
const nightmareCount = computed(() => store.logs.filter(l => l.result === 'nightmare').length)
const normalCount = computed(() => store.logs.filter(l => l.result === 'normal').length)
const total = computed(() => store.logs.length)

const shinyPercent = computed(() => total.value ? (shinyCount.value / total.value * 100).toFixed(1) : 0)
const nightmarePercent = computed(() => total.value ? (nightmareCount.value / total.value * 100).toFixed(1) : 0)
const normalPercent = computed(() => total.value ? (normalCount.value / total.value * 100).toFixed(1) : 0)

const eggShinyCount = computed(() =>
  store.eggs.filter(e => e.result === 'shiny' || e.result === 'shiny_colorful').length
)

const petStats = computed(() => {
  const map = {}
  store.logs.forEach(log => {
    if (!map[log.petId]) {
      map[log.petId] = { id: log.petId, name: getPetName(log.petId), total: 0, shiny: 0 }
    }
    map[log.petId].total++
    if (log.result === 'shiny') map[log.petId].shiny++
  })
  return Object.values(map).sort((a, b) => b.total - a.total)
})

const maxPetTotal = computed(() =>
  petStats.value.length > 0 ? Math.max(...petStats.value.map(s => s.total)) : 1
)

function getPetName(petId) {
  return SHINY_PETS.find(p => p.id === petId)?.name || petId
}

function confirmResetItems() {
  if (confirm('确定重置道具消耗统计？')) {
    store.resetItemUsage()
  }
}

function doExport() {
  const data = store.exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `roco-shiny-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

function doImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const ok = store.importData(reader.result)
    if (ok) {
      alert('数据导入成功！')
    } else {
      alert('导入失败，请检查文件格式。')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.stat-card.mini {
  padding: 12px;
}

.stat-number {
  font-size: 24px;
  font-weight: 800;
}

.stat-card.mini .stat-number {
  font-size: 20px;
}

.stat-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.shiny-color {
  color: var(--color-shiny);
}

.distribution {
  padding: 4px 0;
}

.dist-bar-wrapper {
  margin-bottom: 12px;
}

.dist-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #eef0f4;
}

.dist-segment {
  transition: width 0.5s ease;
  min-width: 2px;
}

.shiny-seg {
  background: var(--gradient-shiny);
}

.nightmare-seg {
  background: var(--color-nightmare);
}

.normal-seg {
  background: #555;
}

.dist-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pet-stat-row {
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.pet-stat-row:last-child {
  border-bottom: none;
}

.pet-stat-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.pet-stat-name {
  font-weight: 600;
  font-size: 14px;
}

.pet-stat-counts {
  font-size: 12px;
  color: var(--text-secondary);
}

.item-stats {
  display: flex;
  flex-direction: column;
}

.item-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

.item-stat-row:last-child {
  border-bottom: none;
}

.item-stat-value {
  font-weight: 700;
  font-size: 16px;
}

.form-group {
  margin-bottom: 8px;
}

.form-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.sync-msg {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: rgba(39, 174, 96, 0.06);
  color: var(--color-success);
}

.sync-hint {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

.sync-msg.sync-error {
  background: rgba(231, 76, 60, 0.06);
  color: var(--color-danger);
}
</style>
