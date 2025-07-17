<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button @click="handleClose" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" type="button">✕</button>

      <h2 class="text-2xl font-bold text-indigo-700 mb-4">激活赞助码</h2>

      <!-- 区别说明 -->
      <p class="text-sm text-gray-600 mb-6 leading-relaxed border-l-4 border-indigo-500 pl-3 bg-indigo-50 py-2">
        <span class="font-semibold text-indigo-700">普通用户</span> 最多可绑定 <span class="font-semibold">2 个学生</span>。<br />
        <span class="font-semibold text-indigo-700">赞助用户</span> 可绑定最多 <span class="font-semibold">12 个学生</span>，感谢您的支持 ❤
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="code" class="block mb-1 font-semibold">请输入激活码</label>
          <input
            id="code"
            v-model="code"
            type="text"
            placeholder="激活码"
            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
            autocomplete="off"
          />
        </div>

        <div class="flex justify-between items-center pt-2">
          <button
            type="button"
            class="text-indigo-600 hover:underline text-sm"
            @click="openSponsorSite"
          >
            前往千寻寄售平台赞助
          </button>

          <div class="flex gap-3">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              :disabled="loading"
            >
              {{ loading ? '提交中...' : '确认激活' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, watch } from 'vue'
import api from '../api'
import { useToast } from '../composables/useToast'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { show } = useToast()

const code = ref('')
const loading = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    code.value = ''
  }
})

function handleClose() {
  emit('close')
}

function openSponsorSite() {
  window.open('https://68n.cn/F4CTT', '_blank')
}

async function handleSubmit() {
  if (!code.value.trim()) {
    show('请输入激活码', 'error')
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/sponsor-activate', { code: code.value.trim() })
    show(res.data?.message || '激活成功，请刷新当前页面！感谢您的赞助！', 'success')
    handleClose()
  } catch (err: any) {
    const msg = err.response?.data?.message || '激活失败'
    if (msg.includes('已是赞助用户')) {
      show('您已是赞助用户，无需重复激活。如仍想支持我们，欢迎通过打赏的方式再次赞助 ❤', 'info')
    } else {
      show(msg, 'error')
    }
  } finally {
    loading.value = false
  }
}
</script>
