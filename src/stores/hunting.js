import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { SHINY_PETS } from '../data/pets.js'
import { TRACKABLE_ITEMS } from '../data/items.js'

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

  // 噩梦枷锁计数器（按精灵家族）
  // { [petId]: { nightmareCount: number, catchCount: number } }
  const counters = ref(saved?.counters || {})

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

  const currentCounter = computed(() =>
    counters.value[currentTargetId.value] || { nightmareCount: 0, catchCount: 0 }
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

  // 动作
  function setTarget(petId) {
    currentTargetId.value = petId
    if (!counters.value[petId]) {
      counters.value[petId] = { nightmareCount: 0, catchCount: 0 }
    }
  }

  function incrementCatch() {
    const id = currentTargetId.value
    if (!id) return
    if (!counters.value[id]) {
      counters.value[id] = { nightmareCount: 0, catchCount: 0 }
    }
    counters.value[id].catchCount++
  }

  function decrementCatch() {
    const id = currentTargetId.value
    if (!id || !counters.value[id]) return
    if (counters.value[id].catchCount > 0) {
      counters.value[id].catchCount--
    }
  }

  function recordNightmare(result, note = '') {
    const id = currentTargetId.value
    if (!id) return
    if (!counters.value[id]) {
      counters.value[id] = { nightmareCount: 0, catchCount: 0 }
    }
    counters.value[id].nightmareCount++
    counters.value[id].catchCount = 0

    const log = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      petId: id,
      timestamp: new Date().toISOString(),
      nightmareCount: counters.value[id].nightmareCount,
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
    }
  }

  function resetCounter(petId) {
    const id = petId || currentTargetId.value
    if (!id) return
    counters.value[id] = { nightmareCount: 0, catchCount: 0 }
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

  function deleteLog(logId) {
    const idx = logs.value.findIndex(l => l.id === logId)
    if (idx !== -1) logs.value.splice(idx, 1)
  }

  function deleteEgg(eggId) {
    const idx = eggs.value.findIndex(e => e.id === eggId)
    if (idx !== -1) eggs.value.splice(idx, 1)
  }

  function exportData() {
    return JSON.stringify({
      currentTargetId: currentTargetId.value,
      counters: counters.value,
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
      if (data.counters) counters.value = data.counters
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
      counters: { ...counters.value },
      logs: [...logs.value],
      collection: { ...collection.value },
      items: { ...items.value },
      itemLogs: [...itemLogs.value],
      eggs: [...eggs.value],
    }),
    (state) => saveState(state),
    { deep: true }
  )

  return {
    currentTargetId,
    counters,
    logs,
    collection,
    items,
    itemLogs,
    eggs,
    currentTarget,
    currentCounter,
    collectedCount,
    totalShinyCount,
    shinyLogs,
    totalNightmares,
    shinyRate,
    getLogsForPet,
    setTarget,
    incrementCatch,
    decrementCatch,
    recordNightmare,
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
