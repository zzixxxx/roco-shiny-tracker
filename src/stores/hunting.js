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

  // 双池计数器
  // 家族池: { [petId]: { nightmareCount, catchCount } }
  // 属性池: { [element]: { nightmareCount, catchCount } }
  const familyCounters = ref(saved?.familyCounters || saved?.counters || {})
  const elementCounters = ref(saved?.elementCounters || {})

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

  // pool: 'family' | 'element'
  function setCatchCount(pool, value) {
    const v = Math.max(0, Math.floor(value || 0))
    if (pool === 'element') {
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
    if (pool === 'element') {
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
    if (pool === 'element') {
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

  // pool: 'family' | 'element'
  function recordNightmare(result, pool = 'family', note = '') {
    const id = currentTargetId.value
    if (!id) return

    let nmCount = 0
    let catches = 0
    if (pool === 'element') {
      const el = currentElementKey.value
      _ensureElement(el)
      catches = elementCounters.value[el].catchCount
      elementCounters.value[el].nightmareCount++
      elementCounters.value[el].catchCount = 0
      nmCount = elementCounters.value[el].nightmareCount
    } else {
      _ensureFamily(id)
      catches = familyCounters.value[id].catchCount
      familyCounters.value[id].nightmareCount++
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
      // 异色出现，清空对应卡池保底重新计算
      if (pool === 'element') {
        const el = currentElementKey.value
        if (el) elementCounters.value[el] = { nightmareCount: 0, catchCount: 0 }
      } else {
        familyCounters.value[id] = { nightmareCount: 0, catchCount: 0 }
      }
    }
  }

  function resetCounter(pool = 'family', key) {
    if (pool === 'element') {
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
      if (log.pool === 'element') {
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
    logs,
    collection,
    items,
    itemLogs,
    eggs,
    currentTarget,
    currentFamilyCounter,
    currentElementKey,
    currentElementCounter,
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
