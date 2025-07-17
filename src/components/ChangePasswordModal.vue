<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button @click="close" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" type="button">✕</button>

      <h2 class="text-2xl font-bold text-indigo-700 mb-6">修改密码</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <input
          v-model="form.old"
          type="password"
          placeholder="当前密码"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
          required
        />
        <input
          v-model="form.new"
          type="password"
          placeholder="新密码"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
          required
        />
        <input
          v-model="form.confirm"
          type="password"
          placeholder="确认新密码"
          class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
          required
        />

        <div class="flex justify-end gap-3 pt-4">
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
          >
            确认修改
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import api from '../api'
import { useToast } from '../composables/useToast'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const { show } = useToast()
const form = reactive({
  old: '',
  new: '',
  confirm: '',
})

function close() {
  emit('close')
}

async function handleSubmit() {
  if (form.new !== form.confirm) {
    show('两次密码输入不一致', 'error')
    return
  }

  try {
    await api.post('/auth/change-password', {
      old_password: form.old,
      new_password: form.new,
    })

    show('密码修改成功，页面即将刷新', 'success')

    // 清除本地 token（如 localStorage）
    localStorage.removeItem('token')

    // 关闭弹窗
    close()

    // 刷新当前页面
    window.location.reload()
  } catch (err: any) {
    show(err.response?.data?.message || '密码修改失败', 'error')
  }
}
</script>
