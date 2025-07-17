<template>
  <div class="fixed top-5 right-5 z-[9999] max-w-sm w-full pointer-events-none pr-5 space-y-3">
    <transition-group name="toast-fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto px-4 py-3 rounded-xl shadow-md flex items-start gap-3 transition-all duration-300 bg-white border-l-4"
        :class="{
          'border-green-500 text-green-800 bg-green-50': toast.type === 'success',
          'border-red-500 text-red-800 bg-red-50': toast.type === 'error',
          'border-blue-500 text-blue-800 bg-blue-50': toast.type === 'info'
        }"
      >
        <div class="text-xl">
          {{ toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️' }}
        </div>
        <div class="flex-1 text-sm leading-snug break-words">
          {{ toast.message }}
        </div>
        <button
          class="ml-2 text-xl font-bold text-gray-400 hover:text-gray-600"
          @click="removeToast(toast.id)"
          aria-label="关闭提示"
        >
          ×
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const toasts = reactive<Toast[]>([])
let nextId = 1

function addToast(message: string, type: ToastType = 'info', duration = 3000) {
  const id = nextId++

  if (toasts.length >= 3) {
    toasts.shift()
  }

  toasts.push({ id, message, type })

  setTimeout(() => removeToast(id), duration)
}

function removeToast(id: number) {
  const index = toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.splice(index, 1)
  }
}

defineExpose({ addToast })
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
