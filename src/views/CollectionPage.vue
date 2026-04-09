<template>
  <div class="page">
    <div class="page-header">
      <div class="page-title">异色图鉴</div>
      <div class="page-subtitle">S1赛季 · 共 {{ totalCount }} 种异色精灵</div>
    </div>

    <!-- 进度条 -->
    <div class="card">
      <div class="flex justify-between items-center mb-8">
        <span class="stat-label">收集进度</span>
        <span class="stat-value">
          <span class="shiny-color">{{ store.collectedCount }}</span> / {{ totalCount }}
        </span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-bar-fill shiny"
          :style="{ width: (store.collectedCount / totalCount * 100) + '%' }"
        ></div>
      </div>
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

    <!-- 精灵列表 -->
    <div class="pet-grid">
      <div
        v-for="pet in filteredPets"
        :key="pet.id"
        class="collection-card"
        :class="{ collected: isCollected(pet.id) }"
        @click="togglePet(pet)"
      >
        <div class="cc-avatar" :style="{ background: pet.imgShiny ? '#f5f6fa' : getElementColor(pet.element) }">
          <img v-if="pet.imgShiny" :src="pet.imgShiny" class="pet-img" />
          <span v-else class="cc-initial">{{ pet.name[0] }}</span>
          <span v-if="isCollected(pet.id)" class="cc-check">&#10003;</span>
        </div>
        <div class="cc-name">{{ pet.name }}</div>
        <div class="cc-element" :style="{ color: getElementColor(pet.element) }">
          {{ getElementName(pet.element) }}
        </div>
      </div>
    </div>

    <!-- 详情弹窗 -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedPet" class="modal-overlay" @click.self="selectedPet = null">
          <Transition name="slide-up">
            <div v-if="selectedPet" class="modal-content">
              <div class="detail-header">
                <div class="detail-name">{{ selectedPet.name }}</div>
                <div class="detail-element" :style="{ color: getElementColor(selectedPet.element) }">
                  {{ getElementName(selectedPet.element) }}
                </div>
              </div>

              <!-- 普通 & 异色 双形态对比 -->
              <div v-if="selectedPet.img || selectedPet.imgShiny" class="detail-forms">
                <div class="form-card">
                  <div class="form-img-wrap">
                    <img v-if="selectedPet.img" :src="selectedPet.img" class="form-img" />
                    <div v-else class="form-placeholder" :style="{ background: getElementColor(selectedPet.element) }">
                      {{ selectedPet.name[0] }}
                    </div>
                  </div>
                  <div class="form-label">普通形态</div>
                </div>
                <div class="form-arrow">&rarr;</div>
                <div class="form-card form-card-shiny">
                  <div class="form-img-wrap shiny-glow">
                    <img v-if="selectedPet.imgShiny" :src="selectedPet.imgShiny" class="form-img" />
                    <div v-else class="form-placeholder" style="background: var(--color-shiny)">&#10024;</div>
                  </div>
                  <div class="form-label shiny-label">&#10024; 异色形态</div>
                </div>
              </div>
              <div v-else class="detail-avatar-fallback" :style="{ background: getElementColor(selectedPet.element) }">
                <span class="detail-initial">{{ selectedPet.name[0] }}</span>
              </div>

              <div class="detail-section">
                <div class="detail-label">进化链</div>
                <div class="evo-chain">
                  <span v-for="(evo, i) in selectedPet.evolutionLine" :key="i" class="evo-item">
                    <span v-if="i > 0" class="evo-arrow">&rarr;</span>
                    {{ evo }}
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-label">出没区域</div>
                <div>{{ selectedPet.area }}</div>
              </div>

              <div class="detail-section">
                <div class="detail-label">类别</div>
                <span class="tag" :class="categoryClass(selectedPet)">
                  {{ categoryLabel(selectedPet) }}
                </span>
              </div>

              <div v-if="selectedPet.huntTip" class="detail-section">
                <div class="detail-label">刷取提示</div>
                <div style="font-size: 13px; color: var(--color-shiny)">{{ selectedPet.huntTip }}</div>
              </div>

              <div v-if="isCollected(selectedPet.id)" class="detail-section">
                <div class="detail-label">获取信息</div>
                <div class="collected-info">
                  <span class="tag tag-shiny">已收集</span>
                  <span class="collected-time">
                    {{ formatTime(store.collection[selectedPet.id].collectedAt) }}
                  </span>
                </div>
              </div>

              <div class="detail-section">
                <div class="detail-label">刷取记录</div>
                <div v-if="petLogs.length > 0">
                  <div class="stat-row mb-8">
                    <span>总污染次数</span>
                    <strong>{{ petLogs.length }}</strong>
                  </div>
                  <div class="stat-row">
                    <span>异色次数</span>
                    <strong class="shiny-color">{{ petShinyCount }}</strong>
                  </div>
                </div>
                <div v-else class="text-muted">暂无记录</div>
              </div>

              <div class="detail-actions">
                <button
                  class="btn btn-block"
                  :class="isCollected(selectedPet.id) ? 'btn-ghost' : 'btn-shiny'"
                  @click="toggleCollect"
                >
                  {{ isCollected(selectedPet.id) ? '取消收集' : '&#10024; 标记已收集' }}
                </button>
                <button
                  class="btn btn-primary btn-block mt-8"
                  @click="setAsTarget"
                >
                  &#127919; 设为刷取目标
                </button>
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
import { SHINY_PETS, ELEMENTS, CATEGORY_LABELS } from '../data/pets.js'
import { useRouter } from 'vue-router'

const store = useHuntingStore()
const router = useRouter()
const currentFilter = ref('all')
const selectedPet = ref(null)
const totalCount = SHINY_PETS.length

const filters = [
  { label: '全部', value: 'all' },
  { label: '已收集', value: 'collected' },
  { label: '未收集', value: 'uncollected' },
  { label: '赛季限定', value: 'season' },
  { label: '常驻', value: 'permanent' },
]

const filteredPets = computed(() => {
  if (currentFilter.value === 'collected') {
    return SHINY_PETS.filter(p => store.collection[p.id]?.collected)
  }
  if (currentFilter.value === 'uncollected') {
    return SHINY_PETS.filter(p => !store.collection[p.id]?.collected)
  }
  if (currentFilter.value === 'season') {
    return SHINY_PETS.filter(p => p.category === 'season')
  }
  if (currentFilter.value === 'permanent') {
    return SHINY_PETS.filter(p => p.category === 'permanent')
  }
  return SHINY_PETS
})

const petLogs = computed(() =>
  selectedPet.value ? store.getLogsForPet(selectedPet.value.id) : []
)

const petShinyCount = computed(() =>
  petLogs.value.filter(l => l.result === 'shiny').length
)

function isCollected(id) {
  return !!store.collection[id]?.collected
}

function getElementColor(el) {
  const primary = Array.isArray(el) ? el[0] : el
  return ELEMENTS[primary]?.color || '#adb5bd'
}

function getElementName(el) {
  const arr = Array.isArray(el) ? el : [el]
  return arr.map(e => ELEMENTS[e]?.name || e).join('/')
}

function categoryClass(pet) {
  if (pet.category === 'battlepass') return 'tag-nightmare'
  if (pet.category === 'collab') return 'tag-shiny'
  if (pet.category === 'season') return 'tag-shiny'
  return 'tag-normal'
}

function categoryLabel(pet) {
  return CATEGORY_LABELS[pet.category] || ''
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function togglePet(pet) {
  selectedPet.value = pet
}

function toggleCollect() {
  if (!selectedPet.value) return
  store.toggleCollected(selectedPet.value.id)
}

function setAsTarget() {
  if (!selectedPet.value) return
  store.setTarget(selectedPet.value.id)
  selectedPet.value = null
  router.push('/counter')
}
</script>

<style scoped>
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

.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-btn {
  flex: 1;
  padding: 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: var(--gradient-purple);
  border-color: transparent;
  color: #fff;
}

.pet-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.collection-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 8px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.collection-card:active {
  transform: scale(0.95);
}

.collection-card.collected {
  border-color: rgba(212, 160, 23, 0.3);
  background: rgba(212, 160, 23, 0.04);
}

.cc-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.collected .cc-avatar {
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3);
}

.cc-initial {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.cc-check {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-shiny);
  color: #1a1a2e;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border: 2px solid rgba(26, 26, 62, 0.8);
}

.cc-name {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.cc-element {
  font-size: 11px;
  font-weight: 500;
}

/* 详情弹窗 */
.detail-header {
  text-align: center;
  margin-bottom: 20px;
}

.detail-name {
  font-size: 22px;
  font-weight: 700;
}

.detail-element {
  font-size: 14px;
  font-weight: 600;
  margin-top: 4px;
}

/* 双形态对比 */
.detail-forms {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.form-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.form-img-wrap {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid var(--border-color);
  transition: all 0.3s;
}

.form-img-wrap.shiny-glow {
  border-color: rgba(212, 160, 23, 0.4);
  box-shadow: 0 0 16px rgba(212, 160, 23, 0.15);
}

.form-img {
  width: 90%;
  height: 90%;
  object-fit: contain;
}

.form-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
}

.form-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.shiny-label {
  color: var(--color-shiny);
  font-weight: 600;
}

.form-arrow {
  font-size: 20px;
  color: var(--text-muted);
  margin-top: -20px;
}

.detail-avatar-fallback {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 12px auto;
}

.detail-avatar-fallback .detail-initial {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.detail-section {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.evo-chain {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.evo-arrow {
  color: var(--text-muted);
  margin: 0 2px;
}

.collected-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collected-time {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.text-muted {
  color: var(--text-muted);
  font-size: 13px;
}

.detail-actions {
  margin-top: 20px;
}
</style>
