<template>
  <div
    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="bind-dialog-title"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[85vh] overflow-auto"
    >
      <h2 id="bind-dialog-title" class="text-2xl font-semibold mb-4 border-b pb-2">绑定学生账号</h2>
      <button
        class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
        @click="$emit('close')"
        type="button"
        aria-label="关闭弹窗"
      >
        ×
      </button>

      <form @submit.prevent="bindStudent" class="space-y-4 mt-4 text-sm">
        <input
          v-model="stuId"
          type="text"
          placeholder="请输入学号"
          autocomplete="off"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div class="relative">
          <input
            v-model="stuPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入学生密码"
            autocomplete="new-password"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
            tabindex="-1"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9a9.953 9.953 0 011.125-4.35m5.25 1.15a3 3 0 104.5 4.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          :disabled="loading || isDisabled"
          class="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          <template v-if="loading">
            绑定中...
          </template>
          <template v-else-if="isDisabled">
            绑定失败，为避免触发风控，请稍后重试 ({{ retryCountdown }}s)
          </template>
          <template v-else>
            绑定
          </template>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
import { student } from '../api/student'

const emit = defineEmits(['close', 'bind-success'])
const { token } = useUser()
const toast = useToast()

const stuId = ref('')
const stuPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)

const isDisabled = ref(false)
const retryCountdown = ref(20)
let timer: number | null = null

const RETRY_KEY = 'bind-student-retry-end-time'

async function bindStudent() {
  if (!token.value) {
    toast.show('请先登录', 'error')
    return
  }
  loading.value = true
  try {
    await student.bindStudentApi(token.value, {
      stu_id: stuId.value,
      password: stuPassword.value,
    })
    toast.show('绑定成功', 'success')
    stuId.value = ''
    stuPassword.value = ''
    showPassword.value = false
    emit('bind-success')
    clearRetryCountdown()
  } catch (err: any) {
    toast.show(err.message || '绑定失败，20秒后可重试', 'error')
    startRetryCountdown()
  } finally {
    loading.value = false
  }
}

function startRetryCountdown() {
  isDisabled.value = true
  retryCountdown.value = 20
  const endTime = Date.now() + 20 * 1000
  localStorage.setItem(RETRY_KEY, endTime.toString())

  timer && clearInterval(timer)
  timer = setInterval(() => {
    const now = Date.now()
    const diff = Math.max(0, Math.floor((endTime - now) / 1000))
    retryCountdown.value = diff
    if (diff <= 0) {
      clearRetryCountdown()
    }
  }, 1000)
}

function clearRetryCountdown() {
  isDisabled.value = false
  retryCountdown.value = 20
  timer && clearInterval(timer)
  timer = null
  localStorage.removeItem(RETRY_KEY)
}

function checkRetryCountdownOnMounted() {
  const endTimeStr = localStorage.getItem(RETRY_KEY)
  if (endTimeStr) {
    const endTime = Number(endTimeStr)
    const now = Date.now()
    if (endTime > now) {
      isDisabled.value = true
      retryCountdown.value = Math.floor((endTime - now) / 1000)

      timer && clearInterval(timer)
      timer = setInterval(() => {
        const now = Date.now()
        const diff = Math.max(0, Math.floor((endTime - now) / 1000))
        retryCountdown.value = diff
        if (diff <= 0) {
          clearRetryCountdown()
        }
      }, 1000)
    } else {
      clearRetryCountdown()
    }
  }
}

onMounted(() => {
  checkRetryCountdownOnMounted()
})

onUnmounted(() => {
  timer && clearInterval(timer)
  timer = null
})
</script>

<style scoped>
input {
  outline: none;
}
</style>
