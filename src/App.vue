<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <TabBar />

  <!-- UID 弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showUidModal" class="modal-overlay" @click.self="showUidModal = false">
        <div class="modal-content animate-float-in" style="max-width:360px">
          <div class="modal-title">{{ uid ? '当前UID' : '绑定UID' }}</div>
          <p style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;text-align:center">
            绑定后数据自动云端同步，换设备输入同一UID即可恢复
          </p>
          <input
            v-model="uidInput"
            class="input"
            placeholder="输入UID（如游戏昵称）"
            @keyup.enter="bindUid"
          />
          <div v-if="bindMsg" class="bind-msg mt-8" :class="{ 'bind-error': bindError }">
            {{ bindMsg }}
          </div>
          <div class="flex gap-8 mt-12">
            <button class="btn btn-primary btn-block" @click="bindUid" :disabled="binding">
              {{ binding ? '同步中...' : (uid ? '切换UID' : '绑定') }}
            </button>
            <button v-if="uid" class="btn btn-ghost btn-block" @click="unbindUid">
              解绑
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, provide } from 'vue'
import TabBar from './components/TabBar.vue'
import { getUid, setUid, downloadFromGist } from './stores/gistSync.js'
import { useHuntingStore } from './stores/hunting.js'

const store = useHuntingStore()

const showUidModal = ref(false)
const uid = ref(getUid())
const uidInput = ref(uid.value)
const binding = ref(false)
const bindMsg = ref('')
const bindError = ref(false)

function openUidModal() {
  uidInput.value = uid.value
  bindMsg.value = ''
  bindError.value = false
  showUidModal.value = true
}

async function bindUid() {
  const v = uidInput.value.trim()
  if (!v) return
  binding.value = true
  bindMsg.value = ''
  bindError.value = false

  // 保存 UID
  uid.value = v
  setUid(v)

  // 尝试从云端拉取数据
  try {
    const data = await downloadFromGist(v)
    store.importData(JSON.stringify(data))
    bindMsg.value = `绑定成功，已从云端恢复数据`
  } catch {
    // 云端无数据（首次使用），正常
    bindMsg.value = `绑定成功，云端暂无数据（记录后自动同步）`
  }

  binding.value = false
  setTimeout(() => { showUidModal.value = false }, 1200)
}

function unbindUid() {
  uid.value = ''
  uidInput.value = ''
  setUid('')
  bindMsg.value = ''
  showUidModal.value = false
}

provide('uid', uid)
provide('openUidModal', openUidModal)
</script>

<style scoped>
.bind-msg {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  background: rgba(39, 174, 96, 0.06);
  color: var(--color-success);
  text-align: center;
}
.bind-msg.bind-error {
  background: rgba(231, 76, 60, 0.06);
  color: var(--color-danger);
}
</style>
