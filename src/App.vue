<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <TabBar />

  <!-- UID 弹窗（全局） -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showUidModal" class="modal-overlay" @click.self="showUidModal = false">
        <div class="modal-content animate-float-in" style="max-width:360px">
          <div class="modal-title">{{ uid ? '当前UID' : '绑定UID' }}</div>
          <input
            v-model="uidInput"
            class="input"
            placeholder="输入UID（如游戏昵称）"
            @keyup.enter="saveUid"
          />
          <div class="flex gap-8 mt-12">
            <button class="btn btn-primary btn-block" @click="saveUid">
              {{ uid ? '更新' : '绑定' }}
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
import { getUid, setUid } from './stores/gistSync.js'

const showUidModal = ref(false)
const uid = ref(getUid())
const uidInput = ref(uid.value)

function openUidModal() {
  uidInput.value = uid.value
  showUidModal.value = true
}

function saveUid() {
  const v = uidInput.value.trim()
  if (!v) return
  uid.value = v
  setUid(v)
  showUidModal.value = false
}

function unbindUid() {
  uid.value = ''
  uidInput.value = ''
  setUid('')
  showUidModal.value = false
}

// 提供给子组件
provide('uid', uid)
provide('openUidModal', openUidModal)
</script>
