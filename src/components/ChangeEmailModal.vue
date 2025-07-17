<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button @click="close" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" type="button">✕</button>

      <h2 class="text-2xl font-bold text-indigo-700 mb-6">修改邮箱</h2>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <!-- 邮箱输入 -->
        <div>
          <label class="block mb-1 font-semibold" for="email">新邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="请输入新邮箱"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
        </div>

        <!-- 验证码输入 -->
        <div class="flex items-end gap-3">
          <div class="flex-grow">
            <label class="block mb-1 font-semibold" for="code">验证码</label>
            <input
              id="code"
              v-model="form.code"
              type="text"
              placeholder="请输入验证码"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
              required
            />
          </div>
          <button
            type="button"
            class="h-[38px] mt-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
            :disabled="sendingCode || countdown > 0"
            @click="sendCode"
          >
            <span v-if="countdown === 0">发送验证码</span>
            <span v-else>{{ countdown }}秒</span>
          </button>
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            取消
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            :disabled="loading"
          >
            {{ loading ? '提交中...' : '确认修改' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import api from '../api'
import { useToast } from '../composables/useToast'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { show } = useToast()

const form = reactive({
  email: '',
  code: '',
})

const sendingCode = ref(false)
const loading = ref(false)
const countdown = ref(0)
let timer: number | undefined

watch(() => props.visible, (val) => {
  if (val) {
    form.email = ''
    form.code = ''
    countdown.value = 0
    loading.value = false
    sendingCode.value = false
    clearInterval(timer)
  }
})

function close() {
  emit('close')
}

function startCountdown() {
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function sendCode() {
  if (!form.email) {
    show('请输入新邮箱', 'error')
    return
  }
  sendingCode.value = true
  try {
    await api.post('/auth/send-change-email-code', { email: form.email })
    show('验证码已发送，请查收邮箱', 'success')
    startCountdown()
  } catch (err: any) {
    show(err.response?.data?.message || '验证码发送失败', 'error')
  } finally {
    sendingCode.value = false
  }
}

async function handleSubmit() {
  if (!form.email || !form.code) {
    show('请填写完整信息', 'error')
    return
  }

  loading.value = true
  try {
    await api.post('/auth/change-email', {
      new_email: form.email,
      code: form.code,
    })
    show('邮箱修改成功，请刷新页面', 'success')
    close()
  } catch (err: any) {
    show(err.response?.data?.message || '修改失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>
