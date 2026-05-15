import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { SHINY_PETS } from '../data/pets.js'
import { TRACKABLE_ITEMS } from '../data/items.js'
import { getUid, uploadToGist } from '../stores/gistSync.js'

function defaultItems() {
  const obj = {}
  TRACKABLE_ITEMS.forEach(i => { obj[i.key] = 0 })
  return obj
}

const STORAGE_KEY = 'roco-shiny-tracker'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const useHuntingStore = defineStore('hunting', () => {
  const saved = loadState()

  // 当前刷取目标精灵ID
  const currentTargetId = ref(saved?.currentTargetId || '')

  // 三池计数器
  // 家族池: { [petId]: { nightmareCount, catchCount } }
  // 系别池: { [element]: { nightmareCount, catchCount } }
  // 大世界池: { nightmareCount, catchCount }
  const familyCounters = ref(saved?.familyCounters || saved?.counters || {})
  const elementCounters = ref(saved?.elementCounters || {})
  const worldCounter = ref(saved?.worldCounter || { nightmareCount: 0, catchCount: 0 })

  // 刷取日志
  const logs = ref(saved?.logs || [])

  // 收集状态 { [petId]: { collected: boolean, collectedAt: string, method: string } }
  const collection = ref(saved?.collection || {})

  // 道具消耗统计（累计值，向后兼容）
  const items = ref(saved?.items || defaultItems())

  // 道具消耗记录（新增：每条可编辑）
  const itemLogs = ref(saved?.itemLogs || [])

  // 孵蛋记录
  const eggs = ref(saved?.eggs || [])

  // 计算属性
  const currentTarget = computed(() =>
    SHINY_PETS.find(p => p.id === currentTargetId.value)
  )

  // 当前目标的家族池计数
  const currentFamilyCounter = computed(() =>
    familyCounters.value[currentTargetId.value] || { nightmareCount: 0, catchCount: 0 }
  )

  // 当前目标的属性池计数（按主属性）
  const currentElementKey = computed(() => {
    const t = currentTarget.value
    if (!t) return ''
    const el = t.element
    return Array.isArray(el) ? el[0] : el
  })

  const currentElementCounter = computed(() =>
    elementCounters.value[currentElementKey.value] || { nightmareCount: 0, catchCount: 0 }
  )

  // 当前大世界池计数
  const currentWorldCounter = computed(() => worldCounter.value)

  const collectedCount = computed(() =>
    Object.values(collection.value).filter(c => c.collected).length
  )

  const totalShinyCount = computed(() => SHINY_PETS.length)

  const shinyLogs = computed(() =>
    logs.value.filter(l => l.result === 'shiny')
  )

  const totalNightmares = computed(() =>
    logs.value.length
  )

  const shinyRate = computed(() => {
    if (logs.value.length === 0) return 0
    return (shinyLogs.value.length / logs.value.length * 100).toFixed(1)
  })

  // 按精灵统计
  function getLogsForPet(petId) {
    return logs.value.filter(l => l.petId === petId)
  }

  function _ensureFamily(id) {
    if (!familyCounters.value[id]) familyCounters.value[id] = { nightmareCount: 0, catchCount: 0 }
  }
  function _ensureElement(el) {
    if (!el) return
    if (!elementCounters.value[el]) elementCounters.value[el] = { nightmareCount: 0, catchCount: 0 }
  }

  // 动作
  function setTarget(petId) {
    currentTargetId.value = petId
    _ensureFamily(petId)
    const pet = SHINY_PETS.find(p => p.id === petId)
    if (pet) {
      const el = Array.isArray(pet.element) ? pet.element[0] : pet.element
      _ensureElement(el)
    }
  }

  // pool: 'family' | 'element' | 'world'
  function setCatchCount(pool, value) {
    const v = Math.max(0, Math.floor(value || 0))
    if (pool === 'world') {
      worldCounter.value.catchCount = v
    } else if (pool === 'element') {
      const el = currentElementKey.value
      if (!el) return
      _ensureElement(el)
      elementCounters.value[el].catchCount = v
    } else {
      const id = currentTargetId.value
      if (!id) return
      _ensureFamily(id)
      familyCounters.value[id].catchCount = v
    }
  }

  function incrementCatch(pool = 'family') {
    if (pool === 'world') {
      worldCounter.value.catchCount++
    } else if (pool === 'element') {
      const el = currentElementKey.value
      if (!el) return
      _ensureElement(el)
      elementCounters.value[el].catchCount++
    } else {
      const id = currentTargetId.value
      if (!id) return
      _ensureFamily(id)
      familyCounters.value[id].catchCount++
    }
  }

  function decrementCatch(pool = 'family') {
    if (pool === 'world') {
      if (worldCounter.value.catchCount > 0) worldCounter.value.catchCount--
    } else if (pool === 'element') {
      const el = currentElementKey.value
      if (!el) return
      const c = elementCounters.value[el]
      if (c && c.catchCount > 0) c.catchCount--
    } else {
      const id = currentTargetId.value
      if (!id) return
      const c = familyCounters.value[id]
      if (c && c.catchCount > 0) c.catchCount--
    }
  }

  // 3 池并行 +1：一次捕捉同时给 family[currentTarget] + element[主属性] + world +1
  // 对齐服务端"每次捕捉给 EVO + SKILLDAM + CHAOS 同时累积"的真实机制
  function incrementAllCatches() {
    const id = currentTargetId.value
    if (id) {
      _ensureFamily(id)
      familyCounters.value[id].catchCount++
    }
    const el = currentElementKey.value
    if (el) {
      _ensureElement(el)
      elementCounters.value[el].catchCount++
    }
    worldCounter.value.catchCount++
  }

  function decrementAllCatches() {
    const id = currentTargetId.value
    if (id && familyCounters.value[id]?.catchCount > 0) familyCounters.value[id].catchCount--
    const el = currentElementKey.value
    if (el && elementCounters.value[el]?.catchCount > 0) elementCounters.value[el].catchCount--
    if (worldCounter.value.catchCount > 0) worldCounter.value.catchCount--
  }

  // pool: 'family' | 'element' | 'world'
  // 一次噩梦事件 = 3 池 nightmareCount 同步 +1（统一计数）；catchCount 仅清空被 activePool 选中的那一池
  // 异色清空规则待后续基于 BONUS_EVENT_ACCU_POOL_CONF 的 is_not_change / max_count 字段分析后重新设计
  function recordNightmare(result, pool = 'family', note = '') {
    const id = currentTargetId.value
    if (!id) return

    // 3 池 nightmareCount 都 +1
    _ensureFamily(id)
    familyCounters.value[id].nightmareCount++
    const el = currentElementKey.value
    if (el) {
      _ensureElement(el)
      elementCounters.value[el].nightmareCount++
    }
    worldCounter.value.nightmareCount++

    // 记录"触发池"的 catchCount 作为本次触发前的连续捕捉数，并清空该池 catchCount
    let nmCount = 0
    let catches = 0
    if (pool === 'world') {
      catches = worldCounter.value.catchCount
      worldCounter.value.catchCount = 0
      nmCount = worldCounter.value.nightmareCount
    } else if (pool === 'element') {
      catches = el ? elementCounters.value[el].catchCount : 0
      if (el) elementCounters.value[el].catchCount = 0
      nmCount = el ? elementCounters.value[el].nightmareCount : 0
    } else {
      catches = familyCounters.value[id].catchCount
      familyCounters.value[id].catchCount = 0
      nmCount = familyCounters.value[id].nightmareCount
    }

    const log = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      petId: id,
      pool,
      timestamp: new Date().toISOString(),
      nightmareCount: nmCount,
      catchesBeforeTrigger: catches,
      result,
      note,
    }
    logs.value.unshift(log)

    if (result === 'shiny') {
      collection.value[id] = {
        collected: true,
        collectedAt: log.timestamp,
        method: 'hunting',
      }
      // TODO 异色清空规则待重新设计：当前是只清 activePool，但需要基于解包数据
      // (BONUS_EVENT_ACCU_POOL_CONF 的 is_not_change / max_count 字段) 确认服务端行为
      // 可能需要：(a) 3 池都清空 / (b) 只清 activePool / (c) 按 max_count=2 限制单池触发次数
      if (pool === 'world') {
        worldCounter.value = { nightmareCount: 0, catchCount: 0 }
      } else if (pool === 'element') {
        const el = currentElementKey.value
        if (el) elementCounters.value[el] = { nightmareCount: 0, catchCount: 0 }
      } else {
        familyCounters.value[id] = { nightmareCount: 0, catchCount: 0 }
      }
    }
  }

  function resetCounter(pool = 'family', key) {
    if (pool === 'world') {
      worldCounter.value = { nightmareCount: 0, catchCount: 0 }
    } else if (pool === 'element') {
      const el = key || currentElementKey.value
      if (el) elementCounters.value[el] = { nightmareCount: 0, catchCount: 0 }
    } else {
      const id = key || currentTargetId.value
      if (id) familyCounters.value[id] = { nightmareCount: 0, catchCount: 0 }
    }
  }

  function toggleCollected(petId, method = 'hunting') {
    if (collection.value[petId]?.collected) {
      delete collection.value[petId]
    } else {
      collection.value[petId] = {
        collected: true,
        collectedAt: new Date().toISOString(),
        method,
      }
    }
  }

  function addItemUsage(type, amount, note = '') {
    if (items.value[type] === undefined) items.value[type] = 0
    items.value[type] = Math.max(0, items.value[type] + amount)
    // 同时写入日志
    if (amount > 0) {
      itemLogs.value.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        key: type,
        amount,
        note,
        timestamp: new Date().toISOString(),
      })
    }
  }

  function updateItemLog(logId, newAmount, newNote) {
    const log = itemLogs.value.find(l => l.id === logId)
    if (!log) return
    const diff = newAmount - log.amount
    if (items.value[log.key] !== undefined) {
      items.value[log.key] = Math.max(0, items.value[log.key] + diff)
    }
    log.amount = newAmount
    if (newNote !== undefined) log.note = newNote
  }

  function deleteItemLog(logId) {
    const idx = itemLogs.value.findIndex(l => l.id === logId)
    if (idx === -1) return
    const log = itemLogs.value[idx]
    if (items.value[log.key] !== undefined) {
      items.value[log.key] = Math.max(0, items.value[log.key] - log.amount)
    }
    itemLogs.value.splice(idx, 1)
  }

  function resetItemUsage() {
    items.value = defaultItems()
    itemLogs.value = []
  }

  function addEggRecord(parent1, parent2, result) {
    eggs.value.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      parent1,
      parent2,
      result,
      timestamp: new Date().toISOString(),
    })
  }

  function updateLog(logId, updates) {
    const log = logs.value.find(l => l.id === logId)
    if (!log) return
    if (updates.result !== undefined) log.result = updates.result
    if (updates.note !== undefined) log.note = updates.note
    if (updates.catchesBeforeTrigger !== undefined) log.catchesBeforeTrigger = updates.catchesBeforeTrigger
  }

  function deleteLog(logId) {
    const idx = logs.value.findIndex(l => l.id === logId)
    if (idx === -1) return
    const log = logs.value[idx]
    // 回滚计数器（仅最新一条有效回滚）
    if (idx === 0) {
      if (log.pool === 'world') {
        worldCounter.value.nightmareCount = Math.max(0, worldCounter.value.nightmareCount - 1)
      } else if (log.pool === 'element') {
        const pet = SHINY_PETS.find(p => p.id === log.petId)
        const el = pet ? (Array.isArray(pet.element) ? pet.element[0] : pet.element) : ''
        if (el && elementCounters.value[el]) {
          elementCounters.value[el].nightmareCount = Math.max(0, elementCounters.value[el].nightmareCount - 1)
        }
      } else {
        if (familyCounters.value[log.petId]) {
          familyCounters.value[log.petId].nightmareCount = Math.max(0, familyCounters.value[log.petId].nightmareCount - 1)
        }
      }
    }
    logs.value.splice(idx, 1)
  }

  function deleteEgg(eggId) {
    const idx = eggs.value.findIndex(e => e.id === eggId)
    if (idx !== -1) eggs.value.splice(idx, 1)
  }

  function exportData() {
    return JSON.stringify({
      currentTargetId: currentTargetId.value,
      familyCounters: familyCounters.value,
      elementCounters: elementCounters.value,
      worldCounter: worldCounter.value,
      logs: logs.value,
      collection: collection.value,
      items: items.value,
      itemLogs: itemLogs.value,
      eggs: eggs.value,
    }, null, 2)
  }

  function importData(json) {
    try {
      const data = JSON.parse(json)
      if (data.currentTargetId !== undefined) currentTargetId.value = data.currentTargetId
      if (data.familyCounters) familyCounters.value = data.familyCounters
      if (data.elementCounters) elementCounters.value = data.elementCounters
      if (data.worldCounter) worldCounter.value = data.worldCounter
      if (data.logs) logs.value = data.logs
      if (data.collection) collection.value = data.collection
      if (data.items) items.value = data.items
      if (data.itemLogs) itemLogs.value = data.itemLogs
      if (data.eggs) eggs.value = data.eggs
      return true
    } catch {
      return false
    }
  }

  // 自动保存
  watch(
    () => ({
      currentTargetId: currentTargetId.value,
      familyCounters: { ...familyCounters.value },
      elementCounters: { ...elementCounters.value },
      worldCounter: { ...worldCounter.value },
      logs: [...logs.value],
      collection: { ...collection.value },
      items: { ...items.value },
      itemLogs: [...itemLogs.value],
      eggs: [...eggs.value],
    }),
    (state) => {
      saveState(state)
      // 自动云同步（debounced）
      autoSync(state)
    },
    { deep: true }
  )

  let syncTimer = null
  function autoSync(state) {
    const uid = getUid()
    if (!uid) return
    clearTimeout(syncTimer)
    syncTimer = setTimeout(() => {
      uploadToGist(uid, state).catch(() => {})
    }, 3000)
  }

  return {
    currentTargetId,
    familyCounters,
    elementCounters,
    worldCounter,
    logs,
    collection,
    items,
    itemLogs,
    eggs,
    currentTarget,
    currentFamilyCounter,
    currentElementKey,
    currentElementCounter,
    currentWorldCounter,
    collectedCount,
    totalShinyCount,
    shinyLogs,
    totalNightmares,
    shinyRate,
    getLogsForPet,
    setTarget,
    setCatchCount,
    incrementCatch,
    decrementCatch,
    incrementAllCatches,
    decrementAllCatches,
    recordNightmare,
    updateLog,
    resetCounter,
    toggleCollected,
    addItemUsage,
    updateItemLog,
    deleteItemLog,
    resetItemUsage,
    addEggRecord,
    deleteLog,
    deleteEgg,
    exportData,
    importData,
  }
})
