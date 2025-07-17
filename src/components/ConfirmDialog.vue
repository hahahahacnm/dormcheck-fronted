<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg space-y-4">
      <h3 class="text-lg font-semibold">确认操作</h3>
      <p class="text-gray-700">{{ message }}</p>
      <div class="flex justify-end space-x-3 pt-2">
        <button
          @click="cancel"
          class="px-4 py-1.5 border rounded hover:bg-gray-100"
        >
          取消
        </button>
        <button
          @click="confirm"
          class="px-4 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
        >
          确认
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('确认继续操作？')

let resolveFn: ((confirmed: boolean) => void) | null = null

function open(msg: string): Promise<boolean> {
  message.value = msg
  visible.value = true
  return new Promise((resolve) => {
    resolveFn = resolve
  })
}

function cancel() {
  visible.value = false
  resolveFn?.(false)
  resolveFn = null
}

function confirm() {
  visible.value = false
  resolveFn?.(true)
  resolveFn = null
}

defineExpose({ open })
</script>

<style scoped>
/* 可按需扩展更多样式 */
</style>
