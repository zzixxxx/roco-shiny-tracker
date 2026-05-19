<template>
  <div class="page">
    <!-- 顶部 tab bar：3 个工具 -->
    <div class="egg-tab-bar">
      <button
        class="egg-tab"
        :class="{ active: tab === 'group' }"
        @click="setTab('group')"
      >
        <img :src="ICON_SEARCH" class="tab-icon" />
        <span>蛋组查询</span>
      </button>
      <button
        class="egg-tab"
        :class="{ active: tab === 'hatch' }"
        @click="setTab('hatch')"
      >
        <img :src="EGG_LOGO" class="tab-icon" />
        <span>孵蛋时间</span>
      </button>
      <button
        class="egg-tab"
        :class="{ active: tab === 'plan' }"
        @click="setTab('plan')"
      >
        <img :src="ICON_HEART_GRAY" class="tab-icon" />
        <span>生蛋规划</span>
      </button>
    </div>

    <!-- 内容区：v-show 切换，保留各自状态 -->
    <div v-show="tab === 'group'">
      <BreedingPage />
    </div>
    <div v-show="tab === 'hatch'">
      <HatchTimePage />
    </div>
    <div v-show="tab === 'plan'">
      <div class="card">
        <div class="card-title" style="position:relative">
          <img :src="ICON_HEART_GRAY" class="inline-icon" /> 异色传递
          <div style="margin-left:auto; display:flex; gap:4px; position:relative">
            <button class="btn btn-ghost btn-sm" @click="addSeason">+ 添加传递</button>
            <button v-if="seasons.length" class="btn btn-ghost btn-sm" @click="toggleExportMenu">⬇ 导出</button>
            <button v-if="seasons.length" class="btn btn-ghost btn-sm" @click="importInputRef.click()">⬆ 导入</button>
            <input ref="importInputRef" type="file" accept="application/json" style="display:none" @change="importJSON" />
            <div v-if="exportMenuOpen" class="export-menu" v-click-outside="closeExportMenu">
              <button @click="exportJSON(); closeExportMenu()">📄 模板（JSON）</button>
              <button @click="exportSVG(); closeExportMenu()">🖼 图片（SVG，矢量）</button>
              <button @click="exportPNG(); closeExportMenu()">🖼 图片（PNG，位图）</button>
            </div>
          </div>
        </div>

        <!-- 赛季选择 - segmented tabs 风格 -->
        <div v-if="seasons.length" class="season-tabs">
          <button
            v-for="(s, i) in seasons"
            :key="i"
            class="season-tab"
            :class="{ active: selectedSeasonFilter === i }"
            @click="selectedSeasonFilter = i"
          >{{ s.title || `（未命名 ${i + 1}）` }}</button>
        </div>

        <!-- 总图(isAll)的赛季筛选:非当前赛季精灵 dim(灰度+透明),不改变布局位置 -->
        <div v-if="previewSeason?.isAll" class="season-view-filter">
          <span class="svf-label">按赛季查看：</span>
          <button
            v-for="f in SEASON_VIEW_FILTERS"
            :key="f.value"
            class="svf-chip"
            :class="{ active: viewSeasonFilter === f.value }"
            @click="viewSeasonFilter = f.value"
          >{{ f.label }}</button>
        </div>

        <div v-if="!seasons.length" class="empty-state" style="padding:20px">
          <p>还没有异色传递</p>
          <p style="font-size: 12px; margin-top: 6px; opacity: 0.7;">
            点右上角"+ 添加传递"开始
          </p>
        </div>

        <!-- 默认预览：SVG 交集图 + 右上角编辑/删除浮层 + 右下角放大 -->
        <div v-if="!editMode && previewSeason" class="preview-svg-wrap">
          <div class="preview-actions tr">
            <button class="preview-btn" @click="resetLayout" title="清除拖动布局，恢复自动排版">↺</button>
            <button class="preview-btn" :disabled="!dragHistory.length" @click="undoLastDrag" title="撤销上一次拖动 (Ctrl+Z)">↶</button>
            <button class="preview-btn" @click="editMode = true" title="编辑组员">✏</button>
            <button class="preview-btn danger" @click="removeSeason(selectedSeasonFilter)" title="删除当前传递">🗑</button>
          </div>
          <div class="preview-actions br">
            <button class="preview-btn" @click="previewModalOpen = true" title="点开大图">⛶</button>
          </div>
          <svg
            ref="previewSvgRef"
            :viewBox="`0 0 ${layoutData.svgW} ${layoutData.svgH}`"
            class="preview-svg"
          >
            <defs>
              <marker id="arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#888"/>
              </marker>
            </defs>
            <!-- 同名精灵副本间双向箭头连线（在底层） -->
            <g v-for="(l, i) in layoutData.links" :key="'lk-' + i">
              <line
                :x1="l.from.x" :y1="l.from.y" :x2="l.to.x" :y2="l.to.y"
                stroke="#888" stroke-width="1.5" stroke-dasharray="5 3"
                marker-start="url(#arrow-end)" marker-end="url(#arrow-end)"
                opacity="0.7"
              />
            </g>
            <!-- 蛋组色块 -->
            <g v-for="g in layoutData.groups" :key="'gc-' + g.id">
              <rect
                :x="g.x" :y="g.y" :width="g.w" :height="g.h"
                rx="14"
                :fill="GROUP_COLOR[g.id]"
                fill-opacity="0.22"
                :stroke="GROUP_COLOR[g.id]"
                stroke-opacity="0.55"
                stroke-width="1.5"
              />
            </g>
            <!-- 组名 label（色块外顶部）-->
            <g v-for="g in layoutData.groups" :key="'gl-' + g.id">
              <text
                :x="g.x + 10" :y="g.y - 6"
                text-anchor="start"
                font-size="13"
                font-weight="700"
                :fill="GROUP_COLOR[g.id]"
              >{{ g.name }}</text>
            </g>
            <!-- 精灵 instances（每只精灵在每个所属组里都画一次，可拖动）-->
            <!-- 加透明 rect 作为 hitbox，让 <g> 整体响应鼠标 -->
            <g
              v-for="(p, i) in layoutData.instances"
              :key="'pi-' + p.petName + '-' + p.groupId"
              class="pet-instance"
              :class="{ dim: p.dim }"
              :data-key="`${p.petName}|${p.groupId}`"
              :transform="dragOffsets[`${p.petName}|${p.groupId}`]
                ? `translate(${dragOffsets[`${p.petName}|${p.groupId}`].dx}, ${dragOffsets[`${p.petName}|${p.groupId}`].dy})` : ''"
            >
              <rect
                :x="p.x - 28" :y="p.y - 30"
                width="56" height="68"
                fill="transparent"
                class="pet-hitbox"
              />
              <image
                v-if="petShinyAvatarUrl(p.petName)"
                :x="p.x - 22" :y="p.y - 26"
                width="44" height="44"
                :href="petShinyAvatarUrl(p.petName)"
                preserveAspectRatio="xMidYMid meet"
                @error="(e) => onImgErrorFallback(e, p.petName)"
                pointer-events="none"
              />
              <text
                :x="p.x" :y="p.y + 26"
                text-anchor="middle"
                font-size="11"
                font-weight="600"
                stroke="#fff" stroke-width="3" paint-order="stroke"
                fill="#222"
                pointer-events="none"
              >{{ p.petName }}</text>
            </g>
          </svg>
          <p class="preview-foot">同色块内的精灵同组 · 副本之间的 ⇄ 虚线 = 同一只精灵跨组传递路径</p>
        </div>

        <!-- 编辑模式时的小工具栏（不在 SVG 内） -->
        <div v-if="editMode && previewSeason" class="edit-toolbar">
          <button class="btn btn-ghost btn-sm" @click="editMode = false">✓ 完成编辑</button>
          <button class="btn btn-ghost btn-sm danger" @click="removeSeason(selectedSeasonFilter)">🗑 删除</button>
        </div>

        <!-- 大图弹窗 -->
        <Teleport to="body">
          <Transition name="fade">
            <div v-if="previewModalOpen" class="big-preview-overlay" @click.self="previewModalOpen = false">
              <div class="big-preview-toolbar">
                <span class="big-preview-title">{{ previewSeason?.title || '异色传递' }}</span>
                <span class="zoom-pct">{{ Math.round(bigZoom * 100) }}%</span>
                <div class="big-zoom-controls">
                  <button :disabled="!dragHistory.length" @click="undoLastDrag" title="撤销上一次拖动">↶</button>
                  <button @click="zoomOut" title="缩小">−</button>
                  <button @click="zoomIn" title="放大">+</button>
                  <button @click="zoomFit" title="自适应屏幕大小">⤢</button>
                  <button @click="zoomReset" title="重置 100%">1:1</button>
                  <button class="big-preview-close" @click="previewModalOpen = false" title="关闭">×</button>
                </div>
              </div>
              <div ref="bigPreviewScrollRef" class="big-preview-scroll" @click.self="previewModalOpen = false">
                <svg
                  v-if="previewSeason"
                  ref="bigPreviewSvgRef"
                  :viewBox="`0 0 ${layoutData.svgW} ${layoutData.svgH}`"
                  class="big-preview-svg"
                  :style="{ transform: `scale(${bigZoom})`, transformOrigin: 'center top' }"
                >
                <defs>
                  <marker id="big-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#666"/>
                  </marker>
                </defs>
                <g v-for="(l, i) in layoutData.links" :key="'blk-' + i">
                  <line
                    :x1="l.from.x" :y1="l.from.y" :x2="l.to.x" :y2="l.to.y"
                    stroke="#666" stroke-width="2" stroke-dasharray="6 4"
                    marker-start="url(#big-arrow)" marker-end="url(#big-arrow)"
                    opacity="0.7"
                  />
                </g>
                <g v-for="g in layoutData.groups" :key="'bgc-' + g.id">
                  <rect
                    :x="g.x" :y="g.y" :width="g.w" :height="g.h"
                    rx="14"
                    :fill="GROUP_COLOR[g.id]"
                    fill-opacity="0.22"
                    :stroke="GROUP_COLOR[g.id]"
                    stroke-opacity="0.55"
                    stroke-width="1.5"
                  />
                </g>
                <g v-for="g in layoutData.groups" :key="'bgl-' + g.id">
                  <text
                    :x="g.x + 10" :y="g.y - 8"
                    text-anchor="start"
                    font-size="14" font-weight="700"
                    :fill="GROUP_COLOR[g.id]"
                  >{{ g.name }}</text>
                </g>
                <g
                  v-for="(p, i) in layoutData.instances"
                  :key="'bpi-' + p.petName + '-' + p.groupId"
                  class="pet-instance"
                  :class="{ dim: p.dim }"
                  :data-key="`${p.petName}|${p.groupId}`"
                  :transform="dragOffsets[`${p.petName}|${p.groupId}`]
                    ? `translate(${dragOffsets[`${p.petName}|${p.groupId}`].dx}, ${dragOffsets[`${p.petName}|${p.groupId}`].dy})` : ''"
                >
                  <rect
                    :x="p.x - 32" :y="p.y - 36"
                    width="64" height="76"
                    fill="transparent"
                    class="pet-hitbox"
                  />
                  <image
                    v-if="petShinyAvatarUrl(p.petName)"
                    :x="p.x - 28" :y="p.y - 32"
                    width="56" height="56"
                    :href="petShinyAvatarUrl(p.petName)"
                    preserveAspectRatio="xMidYMid meet"
                    @error="(e) => onImgErrorFallback(e, p.petName)"
                    pointer-events="none"
                  />
                  <text
                    :x="p.x" :y="p.y + 32"
                    text-anchor="middle"
                    font-size="12" font-weight="600"
                    stroke="#fff" stroke-width="3" paint-order="stroke"
                    fill="#222"
                    pointer-events="none"
                  >{{ p.petName }}</text>
                </g>
              </svg>
              </div>
            </div>
          </Transition>
        </Teleport>

        <div
          v-for="(s, idx) in seasons"
          v-show="editMode && selectedSeasonFilter === idx"
          :key="idx"
          class="season-card"
        >
          <div class="season-head">
            <input
              v-if="editMode"
              v-model="s.title"
              class="input season-title"
              placeholder="赛季名（如 S1·暗夜拾光）"
            />
            <div v-else class="season-title-view">{{ s.title || '（未命名赛季）' }}</div>
            <button v-if="editMode" class="btn btn-ghost btn-sm" @click="resetSeason(idx)" title="恢复默认">↺</button>
            <button v-if="editMode" class="icon-btn danger" @click="removeSeason(idx)" title="删除">&times;</button>
          </div>
          <!-- 全局添加精灵：不需要知道蛋组，输入精灵名/拼音 → 自动加到对应蛋组 -->
          <div class="ga-wrap">
            <div class="ga-input-row">
              <input
                v-model="globalAddInput"
                @focus="onGlobalAddFocus"
                @blur="onGlobalAddBlur"
                @keydown="onGlobalAddKey"
                class="input ga-input"
                placeholder="🔍 输入精灵名/拼音 → 自动加到对应蛋组"
              />
              <div v-if="showGlobalSug && globalSuggestions.length" class="ga-sug-list">
                <div
                  v-for="(s, i) in globalSuggestions"
                  :key="s.id"
                  class="ga-sug-item"
                  :class="{ active: i === globalSugIndex, dimmed: s.addedTo === s.eggGroup.length }"
                  @mousedown.prevent="pickGlobalSuggestion(s)"
                >
                  <div class="ga-sug-icon">
                    <img
                      v-if="petShinyAvatarUrl(s.displayName)"
                      :src="petShinyAvatarUrl(s.displayName)"
                      :alt="s.displayName"
                      @error="(e) => onImgErrorFallback(e, s.displayName)"
                    />
                  </div>
                  <div class="ga-sug-text">
                    <div class="ga-sug-name">{{ s.displayName }}</div>
                    <div class="ga-sug-meta">
                      <span v-for="(g, gi) in s.eggGroup" :key="g">
                        <span v-if="gi > 0" class="ga-sep">·</span>
                        <span :style="{ color: GROUP_COLOR[g] }">{{ EGG_GROUP_LABELS[g] }}</span>
                      </span>
                      <span v-if="s.addedTo > 0" class="ga-added">
                        {{ s.addedTo === s.eggGroup.length ? '已全部加入' : `已加 ${s.addedTo}/${s.eggGroup.length}` }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else-if="showGlobalSug && globalAddInput" class="ga-sug-list ga-empty">
                没有匹配的精灵
              </div>
            </div>
          </div>
          <!-- 蛋组分布网格 -->
          <div class="group-grid">
            <div
              v-for="(g, gIdx) in s.groups"
              :key="g.id"
              class="group-card"
              :class="`group-c-${g.id}`"
            >
              <input v-if="editMode" v-model="g.name" class="group-name-input" />
              <div v-else class="group-name-view">{{ g.name }}</div>
              <div class="group-pets">
                <div
                  v-for="(petName, pIdx) in g.pets"
                  :key="petName"
                  class="group-pet"
                  :class="{ 'is-bridge': isBridgePet(petName) }"
                  :title="isBridgePet(petName) ? `跨组传递桥：也属于 ${petBridgeGroups(petName, g.id).join(' / ')}` : petName"
                >
                  <div class="gp-avatar">
                    <img
                      v-if="petShinyAvatarUrl(petName)"
                      :src="petShinyAvatarUrl(petName)"
                      :alt="petName"
                      @error="(e) => onImgErrorFallback(e, petName)"
                    />
                  </div>
                  <span class="gp-name">{{ petName }}</span>
                  <span v-if="isBridgePet(petName)" class="gp-bridge" title="跨组传递桥">⇄</span>
                  <button v-if="editMode" class="gp-remove" @click="removePetFromGroup(idx, gIdx, pIdx)" title="移除">&times;</button>
                </div>
                <!-- 添加精灵 -->
                <template v-if="editMode">
                  <div v-if="addPetTarget?.seasonIdx === idx && addPetTarget?.groupIdx === gIdx" class="gp-add-row">
                    <input
                      v-model="addPetInput"
                      @keyup.enter="commitAddPet"
                      @blur="commitAddPet"
                      list="breeding-names"
                      class="input gp-add-input"
                      placeholder="精灵名"
                      autofocus
                    />
                  </div>
                  <button v-else class="gp-add" @click="startAddPet(idx, gIdx)">+ 精灵</button>
                </template>
              </div>
            </div>
          </div>
        </div>
        <p v-if="seasons.length" class="plan-foot">提示：拖动精灵到任意网格（自动吸附）· <kbd>Ctrl+Z</kbd> 撤销 · 右上 ↺ 清除全部 · ⬇/⬆ 导出/导入</p>
        <p v-if="seasons.length" class="plan-foot">数据保存在浏览器本地，换设备会丢</p>
      </div>

      <!-- 培育工坊 -->
      <div class="card">
        <div class="card-title">
          <span>&#129529;</span> 培育工坊
          <button class="btn btn-ghost btn-sm" style="margin-left:auto" @click="addRecord">+ 记录</button>
        </div>
        <div v-if="!records.length" class="empty-state" style="padding:20px">
          <p>还没有家园生蛋记录</p>
          <p style="font-size: 12px; margin-top: 6px; opacity: 0.7;">
            点"+ 记录"，填写父母 → 自动分析能否配对
          </p>
        </div>
        <div v-for="r in records" :key="r.id" class="record-card">
          <div class="record-row">
            <input v-model="r.date" type="date" class="input record-date" />
            <select v-model="r.result" class="input record-result">
              <option>普通</option>
              <option>炫彩</option>
              <option>异色</option>
              <option>失败</option>
            </select>
            <button class="icon-btn danger" @click="removeRecord(r.id)" title="删除">&times;</button>
          </div>
          <div class="record-parents">
            <input v-model="r.parent1" class="input" placeholder="父系（精灵名）" list="breeding-names" />
            <span class="x-sign">×</span>
            <input v-model="r.parent2" class="input" placeholder="母系（精灵名）" list="breeding-names" />
          </div>
          <div v-if="canBreed(r)" class="record-analysis" :class="canBreed(r).ok ? 'ok' : 'bad'">
            {{ canBreed(r).ok ? '✓ 可配对' : '✗ 不可配对' }} · {{ canBreed(r).reason }}
          </div>
          <input v-model="r.note" class="input record-note" placeholder="备注（个体值/性格/特长 等）" />
        </div>
        <datalist id="breeding-names">
          <option v-for="d in BREEDING_DISPLAY_LIST" :key="d.id" :value="d.displayName" />
        </datalist>
        <p v-if="records.length" class="plan-foot">数据保存在浏览器本地，换设备会丢</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HatchTimePage from './HatchTimePage.vue'
import BreedingPage from './BreedingPage.vue'
import { ICON_SEARCH, ICON_HEART_GRAY } from '../data/icons.js'

// 赛季异色传递规划：每赛季展示"异色精灵按蛋组分布"网格，可编辑
import { SHINY_PETS } from '../data/pets.js'
import { S1_DEFAULT_GROUPS, BREEDING_PETS, EGG_GROUP_LABELS } from '../data/breedingPets.js'
import { HATCH_PETS } from '../data/hatchPets.js'
const PLAN_KEY = 'roco-shiny-tracker-breeding-plan-v2'

// 动态生成"全部异色"分布:跨赛季所有 SHINY_PETS 按 BREEDING_PETS.eggGroup 分布(stage 1)
function buildAllDefaultGroups() {
  const groups = Object.keys(EGG_GROUP_LABELS).map(Number).sort((a, b) => a - b).map(gid => ({
    id: gid, name: EGG_GROUP_LABELS[gid], pets: [],
  }))
  const byGid = Object.fromEntries(groups.map(g => [g.id, g]))
  for (const sp of SHINY_PETS) {
    const stage1 = sp.evolutionLine?.[0] || sp.name
    const bp = BREEDING_PETS.find(p => p.name === stage1)
    if (!bp || !bp.eggGroup) continue  // S2 限定/战灵无解包数据 跳过
    for (const gid of bp.eggGroup) {
      if (byGid[gid] && !byGid[gid].pets.includes(stage1)) byGid[gid].pets.push(stage1)
    }
  }
  return groups
}

function defaultSeasons() {
  return [{
    title: '全部异色',
    isAll: true,  // 标记总图:UI 显示赛季筛选 chips
    groups: buildAllDefaultGroups(),
  }]
}
const seasons = ref(loadSeasons())
function loadSeasons() {
  let arr = null
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed[0]?.groups) arr = parsed
    }
  } catch {}
  if (!arr) return defaultSeasons()
  // 迁移:旧数据没有 isAll 总图 → 末尾自动追加一个,保留原有图
  if (!arr.some(s => s.isAll)) arr.push(defaultSeasons()[0])
  return arr
}
watch(seasons, (v) => {
  try { localStorage.setItem(PLAN_KEY, JSON.stringify(v)) } catch {}
}, { deep: true })

function addSeason() {
  // 默认名"自定义N",N 取未占用的最小正整数
  let n = 1
  while (seasons.value.some(s => s.title === `自定义${n}`)) n++
  seasons.value.push({
    title: `自定义${n}`,
    groups: Object.keys(EGG_GROUP_LABELS).map(Number).sort((a, b) => a - b).map(gid => ({
      id: gid, name: EGG_GROUP_LABELS[gid], pets: [],
    })),
  })
  selectedSeasonFilter.value = seasons.value.length - 1
}
function removeSeason(idx) {
  if (confirm('删除这个传递？')) {
    seasons.value.splice(idx, 1)
    if (selectedSeasonFilter.value >= seasons.value.length) {
      selectedSeasonFilter.value = Math.max(0, seasons.value.length - 1)
    }
  }
}
function resetSeason(idx) {
  const s = seasons.value[idx]
  if (s.isAll) {
    if (!confirm('恢复为「全部异色」默认分布？当前编辑会丢失')) return
    s.groups = buildAllDefaultGroups()
    s.overrides = {}
  } else {
    if (!confirm('清空所有精灵？')) return
    for (const g of s.groups) g.pets = []
    s.overrides = {}
  }
}
function resetLayout() {
  if (!previewSeason.value) return
  if (Object.keys(previewSeason.value.overrides || {}).length === 0) return
  if (confirm('清除拖动调整，恢复自动排版？')) {
    previewSeason.value.overrides = {}
  }
}

// 导出 - 模板（JSON）
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function exportJSON() {
  if (!previewSeason.value) return
  const data = {
    appVersion: 'roco-shiny-tracker-breeding-plan-v2',
    exportedAt: new Date().toISOString(),
    season: JSON.parse(JSON.stringify(previewSeason.value)),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const safeName = (previewSeason.value.title || 'season').replace(/[\\/:*?"<>|]/g, '_')
  downloadBlob(blob, `异色传递_${safeName}.json`)
}
function importJSON(evt) {
  const file = evt.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      const s = data.season || data  // 兼容只导出 season 对象的情况
      if (!s.groups || !Array.isArray(s.groups)) throw new Error('数据格式不对')
      if (confirm(`导入 "${s.title || '未命名'}" 作为新传递？`)) {
        seasons.value.push(s)
        selectedSeasonFilter.value = seasons.value.length - 1
      }
    } catch (e) {
      alert('导入失败：' + e.message)
    }
    evt.target.value = ''  // 允许同一文件再次选
  }
  reader.readAsText(file)
}

// 把 SVG 内所有 <image> 引用的图片 fetch 后转 base64 data URI 内嵌
// 否则导出的 SVG 文件脱离原 server 时图片无法加载；PNG 转 canvas 时也会丢图
async function inlineSvgImages(svgEl) {
  const images = svgEl.querySelectorAll('image')
  const tasks = []
  for (const img of images) {
    const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href')
    if (!href || href.startsWith('data:')) continue
    tasks.push((async () => {
      try {
        const res = await fetch(href)
        if (!res.ok) throw new Error(res.status)
        const blob = await res.blob()
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        img.setAttribute('href', dataUrl)
      } catch (e) {
        // 加载失败的图就保留原 href，让 SVG 在原 server 仍能显示
        console.warn('inline failed:', href, e)
      }
    })())
  }
  await Promise.all(tasks)
}

// 导出 - SVG 图片（精灵图 inline 为 data URI，脱离 server 也能看）
async function exportSVG() {
  const svgEl = previewSvgRef.value
  if (!svgEl) return
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', svgEl.viewBox.baseVal.width)
  clone.setAttribute('height', svgEl.viewBox.baseVal.height)
  await inlineSvgImages(clone)
  const xml = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`], { type: 'image/svg+xml' })
  const safeName = (previewSeason.value?.title || 'season').replace(/[\\/:*?"<>|]/g, '_')
  downloadBlob(blob, `异色传递_${safeName}.svg`)
}

// 导出 - PNG 图片
async function exportPNG() {
  const svgEl = previewSvgRef.value
  if (!svgEl) return
  const vb = svgEl.viewBox.baseVal
  const scale = 2
  const w = vb.width * scale
  const h = vb.height * scale
  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)
  // 关键：把精灵图 inline 为 data URI，canvas 才能 draw 出来（避免污染 canvas）
  await inlineSvgImages(clone)
  const xml = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    canvas.toBlob((b) => {
      if (!b) { alert('PNG 转换失败'); return }
      const safeName = (previewSeason.value?.title || 'season').replace(/[\\/:*?"<>|]/g, '_')
      downloadBlob(b, `异色传递_${safeName}.png`)
    }, 'image/png')
  } catch (e) {
    alert('PNG 导出失败：' + e.message)
  } finally {
    URL.revokeObjectURL(url)
  }
}

// 导出菜单显示 + 外部点击关闭
const exportMenuOpen = ref(false)
function toggleExportMenu() { exportMenuOpen.value = !exportMenuOpen.value }
function closeExportMenu() { exportMenuOpen.value = false }
const importInputRef = ref(null)

// v-click-outside 简易自定义指令
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value(e)
    }
    setTimeout(() => document.addEventListener('click', el._clickOutside), 0)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  },
}
function removePetFromGroup(seasonIdx, groupIdx, petIdx) {
  seasons.value[seasonIdx].groups[groupIdx].pets.splice(petIdx, 1)
}
const addPetTarget = ref(null)  // { seasonIdx, groupIdx } 当前要加精灵的位置
const addPetInput = ref('')
function startAddPet(seasonIdx, groupIdx) {
  addPetTarget.value = { seasonIdx, groupIdx }
  addPetInput.value = ''
}
function commitAddPet() {
  if (!addPetTarget.value || !addPetInput.value.trim()) {
    addPetTarget.value = null
    return
  }
  const { seasonIdx, groupIdx } = addPetTarget.value
  const name = addPetInput.value.trim()
  const list = seasons.value[seasonIdx].groups[groupIdx].pets
  if (!list.includes(name)) list.push(name)
  addPetTarget.value = null
  addPetInput.value = ''
}

// 全局添加精灵:输入精灵名/拼音 → 自动加到 BREEDING_PETS.eggGroup 对应的所有组
const globalAddInput = ref('')
const showGlobalSug = ref(false)
const globalSugIndex = ref(-1)
const globalSuggestions = computed(() => {
  const q = globalAddInput.value.trim().toLowerCase()
  if (!q) return []
  const season = seasons.value[selectedSeasonFilter.value]
  return BREEDING_DISPLAY_LIST
    .filter(d => d.displayName.toLowerCase().includes(q) || (d.py || '').toLowerCase().includes(q))
    .slice(0, 10)
    .map(d => {
      let addedTo = 0
      if (season) for (const gid of d.eggGroup) {
        const g = season.groups.find(x => x.id === gid)
        if (g?.pets.includes(d.displayName)) addedTo++
      }
      return { ...d, addedTo }
    })
})
function onGlobalAddFocus() { if (globalAddInput.value.trim()) showGlobalSug.value = true }
function onGlobalAddBlur() { setTimeout(() => { showGlobalSug.value = false }, 180) }
function onGlobalAddKey(e) {
  showGlobalSug.value = !!globalAddInput.value.trim()
  if (!showGlobalSug.value) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    globalSugIndex.value = Math.min(globalSugIndex.value + 1, globalSuggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    globalSugIndex.value = Math.max(globalSugIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const pick = globalSugIndex.value >= 0
      ? globalSuggestions.value[globalSugIndex.value]
      : globalSuggestions.value[0]
    if (pick) pickGlobalSuggestion(pick)
  } else if (e.key === 'Escape') {
    showGlobalSug.value = false
  } else {
    globalSugIndex.value = -1
  }
}
function pickGlobalSuggestion(s) {
  const season = seasons.value[selectedSeasonFilter.value]
  if (!season) return
  for (const gid of s.eggGroup) {
    const g = season.groups.find(x => x.id === gid)
    if (g && !g.pets.includes(s.displayName)) g.pets.push(s.displayName)
  }
  globalAddInput.value = ''
  showGlobalSug.value = false
  globalSugIndex.value = -1
}

// 编辑模式：默认 false 显示 SVG 交集图；true 显示网格编辑面板
const editMode = ref(false)

// 赛季筛选：seasons 数组下标，默认选第一个
const selectedSeasonFilter = ref(0)

// 总图(isAll)的赛季筛选:S1/S2/全部 → 不属于当前赛季的精灵 dim(灰度+透明)而非移除,保留布局位置
const SEASON_VIEW_FILTERS = [
  { label: '全部', value: 'all' },
  { label: 'S1', value: 'S1' },
  { label: 'S2', value: 'S2' },
]
const viewSeasonFilter = ref('all')
// 切换图时如果不是总图,把筛选重置为全部(避免遗留)
watch(selectedSeasonFilter, () => { viewSeasonFilter.value = 'all' })
// 当前赛季 dim 集合:isAll + filter !== 'all' 时,标记非当前赛季精灵
const dimmedPetSet = computed(() => {
  const s = new Set()
  if (!viewSeasonFilter.value || viewSeasonFilter.value === 'all') return s
  for (const sp of SHINY_PETS) {
    const seasonTag = sp.season || 'S1'
    if (seasonTag !== viewSeasonFilter.value) {
      s.add(sp.evolutionLine?.[0] || sp.name)
    }
  }
  return s
})

// SVG 预览图：14 个有效蛋组在椭圆上均匀分布
// 取当前筛选下要展示的赛季（默认第 0 个）
import { computed } from 'vue'
const previewSeason = computed(() => {
  if (!seasons.value.length) return null
  return seasons.value[selectedSeasonFilter.value] || seasons.value[0]
})

// SVG 布局参数 - 行列网格
const ROW_H = 110
const COL_W = 95
const START_X = 70
const START_Y = 60
const BOX_PAD = 36

// 弹窗：点开大图
const previewModalOpen = ref(false)

// 按"共享精灵数"贪心排序，让强关联的组在椭圆上挨近
function arrangeByAffinity(groups) {
  if (!groups.length) return []
  const share = (a, b) => {
    const sb = new Set(b.pets)
    return a.pets.filter(p => sb.has(p)).length
  }
  const remaining = [...groups].sort((a, b) => b.pets.length - a.pets.length)
  const arranged = [remaining.shift()]
  while (remaining.length) {
    const last = arranged[arranged.length - 1]
    remaining.sort((a, b) => share(b, last) - share(a, last) || b.pets.length - a.pets.length)
    arranged.push(remaining.shift())
  }
  return arranged
}

// 算法：每只精灵在它所属的每个组里都画一份"副本"，副本之间用 ⇄ 箭头连接
// 这样色块只包围该组成员（每个 instance），不会误框别的精灵
const layoutData = computed(() => {
  if (!previewSeason.value) return { instances: [], groups: [], links: [], svgW: 800, svgH: 540 }

  // 1. 收集每组的精灵列表；过滤规则：
  //    - 精灵数 >= 2：保留
  //    - 精灵数 = 1：如果这只精灵已在其他保留组里出现过，跳过；否则保留（确保该精灵至少能显示一次）
  //    - 精灵数 = 0：跳过
  const allGroupPets = {}
  for (const g of previewSeason.value.groups) {
    if (g.id === 1) continue
    const unique = [...new Set(g.pets)]
    if (unique.length > 0) allGroupPets[g.id] = unique
  }
  const groupPets = {}
  const displayedPets = new Set()
  // 先保留 >= 2 只精灵的组
  for (const [gid, pets] of Object.entries(allGroupPets)) {
    if (pets.length >= 2) {
      groupPets[gid] = [...pets].sort()
      for (const p of pets) displayedPets.add(p)
    }
  }
  // 再处理只有 1 只精灵的组：只有当该精灵尚未被任何已保留组显示时，才保留这个组
  for (const [gid, pets] of Object.entries(allGroupPets)) {
    if (pets.length !== 1) continue
    const onlyPet = pets[0]
    if (!displayedPets.has(onlyPet)) {
      groupPets[gid] = [onlyPet]
      displayedPets.add(onlyPet)
    }
  }
  const gids = Object.keys(groupPets).map(Number)
  if (!gids.length) return { instances: [], groups: [], links: [], svgW: 800, svgH: 540 }

  // 2. 每只精灵出现在哪些组（用于决定要画几份副本 + 连线）
  const petGroups = {}
  for (const [gid, pets] of Object.entries(groupPets)) {
    for (const p of pets) {
      petGroups[p] = petGroups[p] || []
      petGroups[p].push(Number(gid))
    }
  }

  // 3. 组间连接强度（共享精灵数）
  const connect = {}
  for (const [, gs] of Object.entries(petGroups)) {
    if (gs.length < 2) continue
    for (let i = 0; i < gs.length; i++) for (let j = i + 1; j < gs.length; j++) {
      const key = `${Math.min(gs[i], gs[j])}-${Math.max(gs[i], gs[j])}`
      connect[key] = (connect[key] || 0) + 1
    }
  }
  const adjacency = {}
  gids.forEach(g => adjacency[g] = new Set())
  for (const k in connect) {
    const [a, b] = k.split('-').map(Number)
    adjacency[a].add(b)
    adjacency[b].add(a)
  }

  // 4. 区分 connected / isolated 组
  const isolatedGids = gids.filter(g => adjacency[g].size === 0)
  const connectedGids = gids.filter(g => adjacency[g].size > 0)

  // 5. 十字交叉布局：中心组（跨组精灵最多的组）的成员沿中心 col 垂直排，
  //    其他组通过跟中心组共享的精灵作"桥梁"，沿该桥的 row 横向展开剩余成员
  //    每只精灵唯一一个 (row, col)，所有副本共用 → 色块在该精灵位置自然重叠
  function bridgeCount(gid) {
    return groupPets[gid].filter(n => petGroups[n].length > 1).length
  }
  const centerGid = connectedGids.length
    ? connectedGids.reduce((a, b) => bridgeCount(b) > bridgeCount(a) ? b : a)
    : null

  const petPlacement = {}  // name -> { row, col }
  const CENTER_COL = 5

  if (centerGid) {
    // 中心组排序:把"目的地相同"的桥成员相邻成簇,目的地组之间按扩展宽度升序(小目的地的桥放上面占少行,大目的地的桥放下面腾行)
    // 扩展宽度 = 目的地组成员数 - 与中心组共享桥数;同扩展宽度优先桥多的(连接更紧密)
    const _otherForSort = connectedGids.filter(g => g !== centerGid)
    const _destInfo = {}
    for (const gid of _otherForSort) {
      const k = `${Math.min(centerGid, gid)}-${Math.max(centerGid, gid)}`
      const shares = connect[k] || 0
      _destInfo[gid] = { expansion: groupPets[gid].length - shares, bridges: shares }
    }
    const _destSort = _otherForSort.slice().sort((a, b) =>
      _destInfo[a].expansion - _destInfo[b].expansion
      || _destInfo[b].bridges - _destInfo[a].bridges
      || a - b
    )
    const _destIdx = new Map()
    _destSort.forEach((g, i) => _destIdx.set(g, i))
    const _primaryDest = (name) => {
      const dests = petGroups[name].filter(g => g !== centerGid)
      if (!dests.length) return Infinity  // 单桥成员(只在中心组出现)放最后
      return Math.min(...dests.map(g => _destIdx.get(g) ?? Infinity))
    }
    const centerMembers = [...groupPets[centerGid]].sort((a, b) => {
      const ia = _primaryDest(a), ib = _primaryDest(b)
      return (ia === ib ? 0 : ia - ib) || a.localeCompare(b, 'zh-Hans-CN')
    })
    centerMembers.forEach((name, rowIdx) => {
      petPlacement[name] = { row: rowIdx, col: CENTER_COL }
    })

    // 其他 connected 组按"跟中心组共享精灵数"降序处理
    const otherGids = connectedGids.filter(g => g !== centerGid).sort((a, b) => {
      const ka = `${Math.min(centerGid, a)}-${Math.max(centerGid, a)}`
      const kb = `${Math.min(centerGid, b)}-${Math.max(centerGid, b)}`
      return (connect[kb] || 0) - (connect[ka] || 0)
    })

    function isOccupied(row, col) {
      for (const p in petPlacement) {
        if (petPlacement[p].row === row && petPlacement[p].col === col) return true
      }
      return false
    }
    // 非桥成员同行一步内被占时:在该组所有已放成员附近做 ring 搜索,选离该组最近的空格;同距偏好下方+右侧
    function findCompactSlot(placedList) {
      const cR = placedList.reduce((s, p) => s + p.row, 0) / placedList.length
      const cC = placedList.reduce((s, p) => s + p.col, 0) / placedList.length
      for (let d = 1; d <= 10; d++) {
        const ring = []
        const seen = new Set()
        for (const anchor of placedList) {
          for (let dr = -d; dr <= d; dr++) {
            for (let dc = -d; dc <= d; dc++) {
              if (Math.max(Math.abs(dr), Math.abs(dc)) !== d) continue
              const r = anchor.row + dr, c = anchor.col + dc
              if (r < 0 || c < 0) continue
              const key = `${r},${c}`
              if (seen.has(key)) continue
              seen.add(key)
              if (isOccupied(r, c)) continue
              let minDist = Infinity
              for (const a of placedList) {
                const ad = Math.hypot(r - a.row, c - a.col)
                if (ad < minDist) minDist = ad
              }
              ring.push({ r, c, minDist, centroidDist: Math.hypot(r - cR, c - cC) })
            }
          }
        }
        if (ring.length) {
          ring.sort((a, b) =>
            a.minDist - b.minDist
            || a.centroidDist - b.centroidDist
            || (b.r - a.r)  // 同距偏向下方
            || (b.c - a.c)  // 同距偏向右侧
          )
          return { row: ring[0].r, col: ring[0].c }
        }
      }
      return null
    }

    // 多轮处理(间接相连的组在第 2/3 轮才能找到桥)
    for (let pass = 0; pass < 4; pass++) {
      for (const gid of otherGids) {
        const members = groupPets[gid]
        if (members.every(p => petPlacement[p])) continue
        const bridges = members.filter(p => petPlacement[p])
        if (!bridges.length) continue
        const base = petPlacement[bridges[0]]
        const others = members.filter(p => !petPlacement[p])
        let leftPtr = base.col, rightPtr = base.col
        for (let idx = 0; idx < others.length; idx++) {
          const p = others[idx]
          const goLeft = (idx % 2 === 0)
          const cand = goLeft ? leftPtr - 1 : rightPtr + 1
          if (cand >= 0 && !isOccupied(base.row, cand)) {
            if (goLeft) leftPtr = cand
            else rightPtr = cand
            petPlacement[p] = { row: base.row, col: cand }
          } else {
            // 同行一步内被占,做 ring 搜索就近放置(leftPtr/rightPtr 不前进,后续成员仍可尝试同行)
            const placedNow = members.map(m => petPlacement[m]).filter(Boolean)
            const slot = findCompactSlot(placedNow)
            if (slot) petPlacement[p] = slot
          }
        }
      }
    }
  }

  // 6. isolated 组：填主区空隙（8 邻居占用最少 + 离中心最近）；不再甩到右下角
  const _isOcc = (r, c) => {
    for (const p in petPlacement) {
      if (petPlacement[p].row === r && petPlacement[p].col === c) return true
    }
    return false
  }
  const _adj = (r, c) => {
    let n = 0
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      if (_isOcc(r + dr, c + dc)) n++
    }
    return n
  }
  const placedVals = Object.values(petPlacement)
  let nextRow = (placedVals.length ? Math.max(...placedVals.map(p => p.row)) : -1) + 1
  if (placedVals.length && isolatedGids.length) {
    const minR = Math.min(...placedVals.map(p => p.row))
    const maxR = Math.max(...placedVals.map(p => p.row))
    const minC = Math.min(...placedVals.map(p => p.col))
    const maxC = Math.max(...placedVals.map(p => p.col))
    const cR = (minR + maxR) / 2
    const cC = (minC + maxC) / 2
    // 在主区 + 紧邻下方一行内找 N 个同行连续空格,按 (邻居总占用, 离中心距离) 字典序排
    const pickSlots = (n) => {
      const cands = []
      for (let r = minR; r <= maxR + 1; r++) {
        for (let cs = minC; cs <= maxC - n + 1; cs++) {
          let ok = true
          for (let k = 0; k < n; k++) if (_isOcc(r, cs + k)) { ok = false; break }
          if (!ok) continue
          let adj = 0
          for (let k = 0; k < n; k++) adj += _adj(r, cs + k)
          const dist = Math.hypot(r - cR, cs + (n - 1) / 2 - cC)
          cands.push({ r, cs, adj, dist })
        }
      }
      if (!cands.length) {
        return Array.from({ length: n }, (_, k) => ({ row: maxR + 1, col: minC + k }))
      }
      cands.sort((a, b) => a.adj - b.adj || a.dist - b.dist)
      return Array.from({ length: n }, (_, k) => ({ row: cands[0].r, col: cands[0].cs + k }))
    }
    for (const gid of isolatedGids) {
      const need = groupPets[gid].filter(p => !petPlacement[p])
      if (!need.length) continue
      const slots = pickSlots(need.length)
      need.forEach((name, i) => { petPlacement[name] = slots[i] })
      const lastRow = Math.max(...slots.map(s => s.row))
      if (lastRow >= nextRow) nextRow = lastRow + 1
    }
  } else {
    // 退化:完全无 connected 组,isolated 组按行堆叠
    for (const gid of isolatedGids) {
      const need = groupPets[gid].filter(p => !petPlacement[p])
      need.forEach((name, i) => { petPlacement[name] = { row: nextRow, col: i } })
      if (need.length) nextRow++
    }
  }
  // 兜底:漏掉的精灵
  for (const name in petGroups) {
    if (!petPlacement[name]) petPlacement[name] = { row: nextRow++, col: 0 }
  }

  // 8. instances: 每只精灵在它所属的每个组都有一个副本，**所有副本用同一 (row, col)**
  //    → 副本完全重叠，色块物理重叠形成交集区，跟玩家社区图视觉一致
  //    overrides 仍然按 `${petName}|${groupId}` 单独覆盖（用户可单独拖某个副本到不同位置）
  const overrides = previewSeason.value.overrides || {}
  function posFor(name, gid) {
    const key = `${name}|${gid}`
    const ov = overrides[key]
    const place = petPlacement[name] || { row: 0, col: 0 }
    const row = ov?.row ?? place.row
    const col = ov?.col ?? place.col
    return {
      x: START_X + col * COL_W + COL_W / 2,
      y: START_Y + row * ROW_H + ROW_H / 2,
    }
  }
  const isAllView = !!previewSeason.value.isAll
  const dimSet = isAllView ? dimmedPetSet.value : null
  const instances = []
  for (const gid of Object.keys(groupPets).map(Number)) {
    for (const name of groupPets[gid]) {
      instances.push({
        petName: name,
        groupId: gid,
        dim: !!dimSet && dimSet.has(name),
        ...posFor(name, gid),
      })
    }
  }

  // 7. 每组色块 = 包围该组所有 instances（只算自己组的成员，不会框住别组）
  const groups = []
  for (const gid of gids) {
    const insts = instances.filter(i => i.groupId === gid)
    if (!insts.length) continue
    const xs = insts.map(i => i.x)
    const ys = insts.map(i => i.y)
    const seasonG = previewSeason.value.groups.find(g => g.id === gid)
    groups.push({
      id: gid,
      name: seasonG?.name || EGG_GROUP_LABELS[gid] || `组${gid}`,
      x: Math.min(...xs) - BOX_PAD,
      y: Math.min(...ys) - BOX_PAD,
      w: (Math.max(...xs) - Math.min(...xs)) + BOX_PAD * 2,
      h: (Math.max(...ys) - Math.min(...ys)) + BOX_PAD * 2,
    })
  }

  // 8. 跨组精灵副本之间的双向连接线（同名 instance 之间两两连）
  const links = []
  for (const [name, gs] of Object.entries(petGroups)) {
    if (gs.length < 2) continue
    const insts = instances.filter(i => i.petName === name)
    // 链式连接相邻的两个副本（避免画 N×N 条线）
    for (let i = 0; i < insts.length - 1; i++) {
      links.push({ from: insts[i], to: insts[i + 1], name })
    }
  }

  // 9. SVG 尺寸
  const allX = instances.map(i => i.x)
  const allY = instances.map(i => i.y)
  const svgW = Math.max(600, Math.max(...allX) + COL_W)
  const svgH = Math.max(400, Math.max(...allY) + ROW_H)

  return { instances, groups, links, svgW, svgH }
})

// 精灵图标位置：在其所属所有组圆心的几何中心，加 jitter 避免重叠
function _hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return h }
// 兼容别处引用：svgGroups / svgPets 改成基于 layoutData 的派生
const svgGroups = computed(() => layoutData.value.groups)
const svgPets = computed(() => layoutData.value.pets)

// 拖动精灵（interact.js）—— SVG 内精灵可直接拖到任意网格位置
// season.overrides[`${petName}|${groupId}`] = { row, col }
import interact from 'interactjs'
import { onMounted, onUnmounted, nextTick } from 'vue'
const previewSvgRef = ref(null)
const dragOffsets = ref({})  // 'name|gid' -> { dx, dy }（SVG viewBox 坐标系下的累积位移）
let interactInstance = null

// 拖动撤销历史（Ctrl+Z）：每次拖动结束记一条 {key, prevOverride}，prevOverride=undefined 表示之前没自定义
const dragHistory = ref([])
const MAX_HISTORY = 50
function undoLastDrag() {
  const last = dragHistory.value.pop()
  if (!last || !previewSeason.value) return
  const ov = ensureOverrides(previewSeason.value)
  if (last.prevOverride === undefined) {
    delete ov[last.key]
  } else {
    ov[last.key] = last.prevOverride
  }
}
function onGlobalKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
    // 只在生蛋规划 tab + 不是在 input/textarea 里时响应
    const tag = (e.target?.tagName || '').toUpperCase()
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (typeof tab !== 'undefined' && tab.value !== 'plan') return
    if (!dragHistory.value.length) return
    e.preventDefault()
    undoLastDrag()
  }
}

function ensureOverrides(season) {
  if (!season.overrides) season.overrides = {}
  return season.overrides
}

// 用 element 的 ownerSVGElement 算缩放（考虑 viewBox / clientRect / 父级 transform）
function getElementScale(svgEl) {
  if (!svgEl) return 1
  const rect = svgEl.getBoundingClientRect()
  const vb = svgEl.viewBox?.baseVal
  if (!vb?.width || !rect.width) return 1
  return rect.width / vb.width
}

function setupInteract() {
  if (interactInstance) {
    interactInstance.unset()
    interactInstance = null
  }
  // 不限 context，同时给缩略图 + 大图弹窗里的 .pet-instance 绑定拖动
  interactInstance = interact('.pet-instance').draggable({
    inertia: false,
    listeners: {
      move(event) {
        const key = event.target.getAttribute('data-key')
        if (!key) return
        const svgEl = event.target.ownerSVGElement
        const scale = getElementScale(svgEl)
        const cur = dragOffsets.value[key] || { dx: 0, dy: 0 }
        dragOffsets.value = {
          ...dragOffsets.value,
          [key]: { dx: cur.dx + event.dx / scale, dy: cur.dy + event.dy / scale },
        }
      },
      end(event) {
        const key = event.target.getAttribute('data-key')
        if (!key) return
        const off = dragOffsets.value[key]
        if (!off) return
        const [petName, gidStr] = key.split('|')
        const gid = Number(gidStr)
        const inst = layoutData.value.instances.find(i => i.petName === petName && i.groupId === gid)
        if (inst && previewSeason.value) {
          const finalX = inst.x + off.dx
          const finalY = inst.y + off.dy
          const col = Math.max(0, Math.round((finalX - START_X - COL_W / 2) / COL_W))
          const row = Math.max(0, Math.round((finalY - START_Y - ROW_H / 2) / ROW_H))
          const ov = ensureOverrides(previewSeason.value)
          // 记录撤销历史：保留 prevOverride（undefined = 之前没自定义）
          dragHistory.value.push({ key, prevOverride: ov[key] ? { ...ov[key] } : undefined })
          if (dragHistory.value.length > MAX_HISTORY) dragHistory.value.shift()
          ov[key] = { row, col }
        }
        // 清掉临时偏移（用户拖动结果已存到 overrides）
        const next = { ...dragOffsets.value }
        delete next[key]
        dragOffsets.value = next
      },
    },
  })
}

onMounted(() => {
  nextTick(setupInteract)
  document.addEventListener('keydown', onGlobalKeyDown)
})
// 切赛季时重绑（新出现的 .pet-instance 元素需要被 interact.js 识别）+ 清空撤销栈
watch(previewSeason, () => {
  nextTick(setupInteract)
  dragHistory.value = []
})
onUnmounted(() => {
  if (interactInstance) interactInstance.unset()
  document.removeEventListener('keydown', onGlobalKeyDown)
})

// 大图弹窗缩放
const bigZoom = ref(1)
const bigPreviewSvgRef = ref(null)
const bigPreviewScrollRef = ref(null)
function zoomIn() { bigZoom.value = Math.min(3, bigZoom.value + 0.25) }
function zoomOut() { bigZoom.value = Math.max(0.3, bigZoom.value - 0.25) }
function zoomReset() { bigZoom.value = 1 }
// 自适应屏幕大小:测量 SVG 未 scale 时的真实渲染尺寸跟 scroll 容器可视区比例,取较小者
function zoomFit() {
  const svgEl = bigPreviewSvgRef.value
  const scrollEl = bigPreviewScrollRef.value
  if (!svgEl || !scrollEl) return
  const prev = svgEl.style.transform
  svgEl.style.transform = 'none'  // 临时去 scale 测真实大小
  const rect = svgEl.getBoundingClientRect()
  svgEl.style.transform = prev
  if (!rect.width || !rect.height) return
  const pad = 40
  const scaleW = (scrollEl.clientWidth - pad) / rect.width
  const scaleH = (scrollEl.clientHeight - pad) / rect.height
  bigZoom.value = Math.max(0.3, Math.min(scaleW, scaleH, 3))
}
watch(previewModalOpen, (open) => {
  if (open) {
    bigZoom.value = 1
    nextTick(() => {
      setupInteract()  // modal 里的 .pet-instance 元素新挂载,重绑 interact
      // 等下一帧 SVG/scroll 容器 layout 完成再算自适应,否则 boundingRect 还是 0
      requestAnimationFrame(zoomFit)
    })
  }
})

// 重名精灵带括号区分(如鸭吉吉的多个形态)。优先用 HATCH_PETS 已有的「名字（形态）」格式;无对应则 fallback 到「名字（py）」
const _hpById = {}
for (const hp of HATCH_PETS) _hpById[hp.id] = hp
const _byBare = {}
for (const p of BREEDING_PETS) (_byBare[p.name] ||= []).push(p)
const PET_DISPLAY_BY_ID = {}
for (const [bare, arr] of Object.entries(_byBare)) {
  if (arr.length === 1) PET_DISPLAY_BY_ID[arr[0].id] = bare
  else for (const p of arr) PET_DISPLAY_BY_ID[p.id] = _hpById[p.id]?.name || `${bare}（${p.py}）`
}
// displayName -> BREEDING_PETS entry。bareName 也映射到首个 variant,保证 legacy 数据(如旧 season 里的"鸭吉吉")也能查到
const PET_BY_DISPLAY = new Map()
for (const p of BREEDING_PETS) {
  PET_BY_DISPLAY.set(PET_DISPLAY_BY_ID[p.id], p)
  if (!PET_BY_DISPLAY.has(p.name)) PET_BY_DISPLAY.set(p.name, p)
}
const petByDisplay = (name) => PET_BY_DISPLAY.get(name)
// datalist / 全局添加用的全量精灵显示列表(自动去重 + 带括号)
const BREEDING_DISPLAY_LIST = BREEDING_PETS.map(p => ({
  id: p.id,
  displayName: PET_DISPLAY_BY_ID[p.id],
  py: p.py,
  eggGroup: p.eggGroup,
}))

// SHINY_PETS by stage-1 name -> imgShiny(Wiki 链接)。覆盖 19 只异色 + 机械方方/绒绒/犀角鸟 等无本地 _yise 文件的
const SHINY_BY_BARENAME = {}
for (const sp of SHINY_PETS) {
  const stage1 = sp.evolutionLine?.[0] || sp.name
  if (sp.imgShiny) SHINY_BY_BARENAME[stage1] = sp
}

// 跨组关系
function petAllGroups(name) {
  return petByDisplay(name)?.eggGroup || []
}
function isBridgePet(name) {
  return petAllGroups(name).length > 1
}
function petBridgeGroups(name, currentGroupId) {
  return petAllGroups(name).filter(g => g !== currentGroupId).map(g => EGG_GROUP_LABELS[g] || '?')
}

// 各蛋组的色值（用于精灵卡片渐变背景 + dot 标记）
const GROUP_COLOR = {
  1: '#95a5a6', 2: '#9b59b6', 3: '#2ecc71', 4: '#f1c40f', 5: '#74b9ff',
  6: '#e67e22', 7: '#daa5e8', 8: '#43e97b', 9: '#ffb8b8', 10: '#bbdefb',
  11: '#d2a779', 12: '#d4a017', 13: '#4dabf7', 14: '#f06395', 15: '#6c757d',
}
function petGradientStyle(name, currentGroupId) {
  const gs = petAllGroups(name)
  if (gs.length <= 1) return {}
  // 多组精灵：用所有所属组的颜色生成渐变背景
  const stops = gs.map((g, i) => {
    const pct = (i / (gs.length - 1)) * 100
    return `${GROUP_COLOR[g] || '#ccc'}30 ${pct}%`
  }).join(', ')
  return { background: `linear-gradient(135deg, ${stops})` }
}

const BASE_URL = import.meta.env.BASE_URL || '/'
function petAvatarUrl(name) {
  const p = petByDisplay(name)
  return p?.py ? `${BASE_URL}icons/friends/JL_${p.py}.webp` : ''
}
// 异色立绘三段:SHINY_PETS.imgShiny(Wiki) → 本地 _yise(仅 BREEDING_PETS 有 shinyPy 时;否则跳过避免 SVG <image> 404 不可靠的 error 事件 → 裂图) → 普通立绘
function petShinyAvatarUrl(name) {
  const p = petByDisplay(name)
  if (!p) return ''
  const sp = SHINY_BY_BARENAME[p.name]
  if (sp?.imgShiny) return sp.imgShiny
  if (p.shinyPy) return `${BASE_URL}icons/friends/JL_${p.shinyPy}_yise.webp`
  return p.py ? `${BASE_URL}icons/friends/JL_${p.py}.webp` : ''
}
// SVG <image> / 普通 <img> 加载失败时回退普通立绘
function onImgErrorFallback(e, name) {
  const url = petAvatarUrl(name)
  if (!url) return
  // SVG image 用 href；普通 img 用 src
  if (e.target.tagName === 'image' || e.target.namespaceURI?.includes('svg')) {
    e.target.setAttribute('href', url)
  } else {
    e.target.src = url
  }
}

// 培育工坊（每日生蛋记录，localStorage 持久化）
const WORKSHOP_KEY = 'roco-shiny-tracker-workshop'
const records = ref(loadRecords())
function loadRecords() {
  try {
    const raw = localStorage.getItem(WORKSHOP_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
watch(records, (v) => {
  try { localStorage.setItem(WORKSHOP_KEY, JSON.stringify(v)) } catch {}
}, { deep: true })

function addRecord() {
  const d = new Date()
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  records.value.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date,
    parent1: '',
    parent2: '',
    result: '普通',
    note: '',
  })
}
function removeRecord(id) {
  const idx = records.value.findIndex(r => r.id === id)
  if (idx !== -1 && confirm('删除这条记录？')) records.value.splice(idx, 1)
}

// 简易"是否能生蛋"分析：根据 BREEDING_PETS 查父母蛋组交集（BREEDING_PETS 已在顶部 import）
function canBreed(rec) {
  if (!rec.parent1 || !rec.parent2) return null
  const p1 = petByDisplay(rec.parent1)
  const p2 = petByDisplay(rec.parent2)
  if (!p1 || !p2) return { ok: false, reason: '找不到精灵（可能不在 stage 1 或无法在家园生蛋）' }
  const common = p1.eggGroup.filter(g => p2.eggGroup.includes(g))
  if (common.length === 0) return { ok: false, reason: '蛋组无交集，不能配对' }
  return { ok: true, reason: `共同蛋组：${common.join(' / ')}` }
}

const BASE = import.meta.env.BASE_URL || '/'
const EGG_LOGO = `${BASE}icons/egg.png`

const route = useRoute()
const router = useRouter()

// 默认进入蛋组查询；URL ?tab=hatch|plan 切到其他
const validTabs = ['group', 'hatch', 'plan']
const tab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'group')

watch(() => route.query.tab, (v) => {
  if (validTabs.includes(v)) tab.value = v
})

function setTab(t) {
  tab.value = t
  router.replace({ query: { ...route.query, tab: t } })
}
</script>

<style scoped>
.egg-tab-bar {
  display: flex;
  gap: 6px;
  margin: 10px 0 14px;
}
.egg-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.egg-tab:active { transform: scale(0.97); }
.egg-tab.active {
  background: rgba(102,126,234,0.12);
  border-color: var(--color-accent);
  color: var(--color-accent);
}
.tab-icon { width: 22px; height: 22px; object-fit: contain; }

.season-card {
  margin-top: 12px;
  padding: 10px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}
.season-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.season-title { flex: 1; font-weight: 600; }

.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  margin-top: 10px;
}
/* 精灵多的组允许横跨更多列 - 但容器宽度自适应，单格 minmax 控制 */
.group-card {
  min-width: 0;
  overflow: hidden;
}
.group-card {
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}
/* 15 个蛋组各自的色块（参考玩家社区图） */
.group-c-1 { background: rgba(149,165,166,0.18); }   /* 无法孵蛋 - 灰 */
.group-c-2 { background: rgba(155,89,182,0.15); }    /* 巨灵 */
.group-c-3 { background: rgba(46,204,113,0.15); }    /* 两栖 */
.group-c-4 { background: rgba(241,196,15,0.15); }    /* 昆虫 */
.group-c-5 { background: rgba(116,185,255,0.15); }   /* 天空 */
.group-c-6 { background: rgba(230,126,34,0.15); }    /* 动物 */
.group-c-7 { background: rgba(218,165,232,0.15); }   /* 妖精 */
.group-c-8 { background: rgba(67,233,123,0.12); }    /* 植物 */
.group-c-9 { background: rgba(255,184,184,0.18); }   /* 拟人 */
.group-c-10 { background: rgba(187,222,251,0.18); }  /* 软体 */
.group-c-11 { background: rgba(210,167,121,0.18); }  /* 大地 */
.group-c-12 { background: rgba(212,160,23,0.15); }   /* 魔力 */
.group-c-13 { background: rgba(77,171,247,0.15); }   /* 海洋 */
.group-c-14 { background: rgba(240,99,149,0.15); }   /* 龙 */
.group-c-15 { background: rgba(108,117,125,0.18); }  /* 机械 */

.group-name-input {
  width: 100%;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  background: transparent;
  border: none;
  border-bottom: 1px dashed transparent;
  color: var(--text-primary);
  text-align: center;
}
.group-name-input:focus {
  border-bottom-color: var(--color-accent);
  background: rgba(255,255,255,0.4);
}
.group-pets {
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.group-pet {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: rgba(255,255,255,0.6);
  border-radius: var(--radius-md);
  font-size: 11px;
}
.gp-avatar {
  width: 24px; height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--bg-input);
}
.gp-avatar img { width: 100%; height: 100%; object-fit: contain; }
.gp-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gp-remove {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.gp-remove:hover { color: #e74c3c; }
.gp-add {
  padding: 3px 8px;
  margin-top: 2px;
  font-size: 11px;
  background: transparent;
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
}
.gp-add:hover { color: var(--color-accent); border-color: var(--color-accent); }
.gp-add-input { font-size: 11px; padding: 4px 8px; }

.plan-modeswitch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  margin-top: 10px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}
.season-tabs {
  display: flex;
  gap: 0;
  margin-top: 12px;
  overflow-x: auto;
  border-bottom: 1px solid var(--border-color);
}
.season-tabs::-webkit-scrollbar { height: 4px; }
.season-tab {
  flex-shrink: 0;
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.season-tab:hover { color: var(--text-primary); }
.season-tab.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 50;
  min-width: 180px;
  padding: 4px;
}
.export-menu button {
  display: block;
  width: 100%;
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}
.export-menu button:hover {
  background: rgba(102,126,234,0.08);
}

.preview-svg-wrap { position: relative; }

/* 精灵可拖动 - 鼠标在精灵上变成"抓"形（缩略图 + 大图弹窗都生效） */
.preview-svg :deep(.pet-instance),
:deep(.big-preview-svg .pet-instance) {
  cursor: grab;
  touch-action: none;
}
.preview-svg :deep(.pet-instance:active),
:deep(.big-preview-svg .pet-instance:active) {
  cursor: grabbing;
}
.preview-svg :deep(.pet-hitbox),
:deep(.big-preview-svg .pet-hitbox) {
  fill: transparent;
}
.preview-actions {
  position: absolute;
  display: flex;
  gap: 4px;
  z-index: 2;
}
.preview-actions.tr { top: 8px; right: 8px; }
.preview-actions.br { bottom: 36px; right: 8px; }
.preview-btn {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.15s;
}
.preview-btn:hover { background: #fff; transform: translateY(-1px); }
.preview-btn.danger:hover { color: #e74c3c; }

.edit-toolbar {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}
.btn.danger:hover { color: #e74c3c; }

.big-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 0;
}
.big-preview-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  flex-shrink: 0;
}
.big-preview-title { font-size: 16px; font-weight: 700; flex: 1; }
.zoom-pct {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  margin-right: 10px;
  min-width: 42px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.big-zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
.big-zoom-controls button {
  min-width: 36px; height: 32px;
  padding: 0 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}
.big-zoom-controls button:hover { background: rgba(255,255,255,0.2); }
.big-preview-close {
  font-size: 20px;
  margin-left: 6px;
}
.big-preview-scroll {
  flex: 1;
  overflow: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  cursor: zoom-out;
}
.big-preview-svg {
  width: 100%;
  height: auto;
  max-width: 1400px;
  background: #fff;
  border-radius: var(--radius-md);
  transition: transform 0.15s;
  cursor: default;
}

.preview-svg-wrap {
  margin-top: 10px;
  background: #fafafa;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.preview-svg {
  width: 100%;
  height: auto;
  display: block;
}
.preview-foot {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  padding: 6px 0 10px;
}
.mode-hint { font-size: 12px; color: var(--text-secondary); }
.season-title-view {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  padding: 6px 4px;
}
.group-name-view {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  color: var(--text-primary);
}
/* 跨组桥梁精灵 - 金色描边 */
.group-pet.is-bridge {
  background: rgba(255,215,0,0.18);
  border: 1px dashed rgba(212,160,23,0.6);
}
.gp-bridge {
  color: var(--color-shiny);
  font-size: 14px;
  margin-left: 2px;
  font-weight: 700;
}
.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  width: 28px; height: 28px;
  cursor: pointer;
  border-radius: 50%;
}
.icon-btn.danger:hover { color: #e74c3c; background: rgba(231,76,60,0.1); }
.plan-foot {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 10px;
  text-align: center;
}

.record-card {
  margin-top: 12px;
  padding: 10px;
  background: var(--bg-input);
  border-radius: var(--radius-md);
}
.record-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.record-date { flex: 1; }
.record-result { width: 90px; }
.record-parents {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.record-parents input { flex: 1; }
.x-sign {
  color: var(--text-muted);
  font-size: 16px;
  font-weight: 700;
}
.record-analysis {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
}
.record-analysis.ok {
  background: rgba(67,233,123,0.12);
  color: #2d8a4a;
}
.record-analysis.bad {
  background: rgba(231,76,60,0.12);
  color: #c0392b;
}
.record-note { margin-top: 8px; }
.inline-icon { width: 18px; height: 18px; vertical-align: middle; margin-right: 4px; }
.plan-placeholder { padding: 40px 16px; }

/* 撤销按钮:dragHistory 为空时变灰 */
.preview-btn:disabled,
.big-zoom-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

/* 全局添加精灵搜索框 */
.ga-wrap {
  margin: 10px 0 8px;
}
.ga-input-row {
  position: relative;
}
.ga-input {
  width: 100%;
  font-size: 13px;
  padding: 8px 12px;
}
.ga-sug-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 30;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  max-height: 320px;
  overflow-y: auto;
}
.ga-sug-list.ga-empty {
  padding: 10px 14px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}
.ga-sug-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s;
}
.ga-sug-item:last-child { border-bottom: none; }
.ga-sug-item:hover,
.ga-sug-item.active {
  background: rgba(102,126,234,0.08);
}
.ga-sug-item.dimmed { opacity: 0.55; }
.ga-sug-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-input);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}
.ga-sug-icon img { width: 100%; height: 100%; object-fit: contain; }
.ga-sug-text { flex: 1; min-width: 0; }
.ga-sug-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ga-sug-meta {
  font-size: 11px;
  margin-top: 1px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0 4px;
  font-weight: 500;
}
.ga-sep { color: var(--text-muted); margin: 0 2px; }
.ga-added {
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 600;
  color: #2d8a4a;
  background: rgba(67,233,123,0.18);
  border-radius: var(--radius-full);
}

/* 总图赛季筛选 chips */
.season-view-filter {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin: 10px 0 4px;
}
.svf-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
.svf-chip {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.svf-chip:active { transform: scale(0.95); }
.svf-chip.active {
  background: rgba(102,126,234,0.1);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* dim 状态:总图按赛季筛选时,非当前赛季精灵灰度+半透明(保留位置) */
.preview-svg :deep(.pet-instance.dim),
:deep(.big-preview-svg .pet-instance.dim) {
  opacity: 0.28;
  filter: grayscale(1);
  transition: opacity 0.2s, filter 0.2s;
}
</style>
