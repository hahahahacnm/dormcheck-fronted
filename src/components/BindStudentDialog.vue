<template>
  <!-- 绑定/修改密码窗口 -->
  <div
    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="bind-dialog-title"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
      <h2 id="bind-dialog-title" class="text-2xl font-semibold mb-6">
        {{ isModifyMode ? '更新学生密码' : '绑定学生账号' }}
      </h2>

      <!-- 右上角按钮组 -->
      <div class="absolute top-3 right-3 flex items-center space-x-2">
        <button type="button" class="text-gray-400 hover:text-gray-700" @click="showHelpDialog = true" aria-label="操作说明">?</button>
        <button class="text-gray-500 hover:text-black text-xl" @click="$emit('close')" type="button" aria-label="关闭弹窗">×</button>
      </div>

      <!-- 绑定表单 -->
      <form @submit.prevent="bindStudent" class="space-y-4 text-sm">
        <input v-model="stuId" type="text" placeholder="请输入学号" autocomplete="off"
               class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               :readonly="isModifyMode" required />
        <div class="relative">
          <input v-model="stuPassword" :type="showPassword ? 'text' : 'password'" placeholder="请输入学生密码" autocomplete="new-password"
                 class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" required />
          <button type="button" @click="showPassword = !showPassword"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'" tabindex="-1">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-9a9.953 9.953 0 011.125-4.35m5.25 1.15a3 3 0 104.5 4.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        <button type="submit" :disabled="loading || isDisabled"
                class="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
          <template v-if="loading">{{ isModifyMode ? '修改中...' : '绑定中...' }}</template>
          <template v-else-if="isDisabled">{{ isModifyMode ? '校验失败，为避免触发风控，请稍后重试' : '绑定失败，为避免触发风控，请稍后重试' }} ({{ retryCountdown }}s)</template>
          <template v-else>{{ isModifyMode ? '确认更改' : '绑定' }}</template>
        </button>
      </form>
    </div>
  </div>

  <!-- 帮助弹窗 -->
  <div v-if="showHelpDialog" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="showHelpDialog=false">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-auto relative border-l-4 border-blue-500">
      <button @click="showHelpDialog=false"
              class="absolute top-3 right-3 text-gray-500 hover:text-black text-xl rounded-full w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
              aria-label="关闭说明">×</button>
      <div class="flex items-center mb-4">
        <div class="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">i</div>
        <h3 class="text-lg font-semibold">微学工交互绑定操作 · 注意事项</h3>
      </div>
      <ol class="list-decimal list-inside space-y-3 text-sm mb-4">
        <li>初始密码为 <span class="font-semibold text-blue-600">身份证号后六位 + "@swmu.cn"</span></li>
        <li class="flex items-start"><span class="font-semibold text-red-600 mr-1">注意</span>直接使用初始密码登录平台会提示“密码过于简单”，登录等同失败，无法完成绑定。</li>
        <li>正确流程：先前往
          <a :href="helpPlatformUrl" target="_blank" class="text-blue-600 underline font-medium">学工一体化平台</a>
          使用初始密码登录并按提示修改为合格密码
        </li>
        <li>修改完成后，再用新密码在此工具中进行绑定</li>
        <li>对于已绑定学生，无需解绑，可直接点击“更新密码”完成信息修改！</li>
      </ol>
      <p class="text-red-600 font-semibold text-xs mt-2 flex items-center">⚠️ 使用电脑端或手机浏览器桌面模式操作</p>
    </div>
  </div>

  <!-- 密码过于简单提示弹窗 -->
  <div v-if="showTipDialog" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border-l-4 border-red-500">
      <h3 class="text-lg font-semibold mb-4 flex items-center">⚠️ 绑定失败：学生密码过于简单</h3>
      <p class="text-sm mb-2">由于初始密码未修改，微学工强制要求修改密码。</p>
      <p class="text-sm mb-4">你可以立即点击“前往修改密码”修改密码。</p>
      <div class="flex justify-end gap-2">
        <button @click="goToModifyPassword" class="bg-blue-500 text-white px-4 py-2 rounded">前往修改密码</button>
        <button :disabled="!canCloseTip" @click="closeTipDialog"
                :class="['px-4 py-2 rounded', canCloseTip ? 'bg-green-500 text-white' : 'bg-gray-300 text-black']">
          {{ canCloseTip ? '完成并继续录入' : `请等待 ${tipCountdown}s` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
import { student } from '../api/student'

const emit = defineEmits(['close', 'bind-success'])
const { token } = useUser()
const toast = useToast()

const props = defineProps<{ modifyStuId?: string }>()

const stuId = ref(props.modifyStuId || '')
const stuPassword = ref('')
const showPassword = ref(false)
const showHelpDialog = ref(false)
const showTipDialog = ref(false)
const loading = ref(false)

const tipGValue = ref<string | null>(null)
const tipCountdown = ref(3)
let tipTimer: number | null = null
const canCloseTip = ref(false)

const isDisabled = ref(false)
const retryCountdown = ref(20)
let timer: number | null = null
const RETRY_KEY = 'bind-student-retry-end-time'

const isModifyMode = computed(() => !!props.modifyStuId)
const helpPlatformUrl = computed(() =>
  `http://plat.swmu.edu.cn/Authentication/`
)

// 关闭提示弹窗
function closeTipDialog() {
  if (!canCloseTip.value) return
  showTipDialog.value = false
  tipTimer && clearInterval(tipTimer)
  tipTimer = null
}

// 前往修改密码页面（统一新标签页）
function goToModifyPassword() {
  if (!tipGValue.value) return
  const url = `http://plat.swmu.edu.cn/Authentication/CHW?g=${tipGValue.value}`
  window.open(url, '_blank')
}

// 处理密码过于简单
function handlePasswordTooSimple(gValue: string) {
  tipGValue.value = gValue
  showTipDialog.value = true
  canCloseTip.value = false
  tipCountdown.value = 3
  tipTimer && clearInterval(tipTimer)
  tipTimer = setInterval(() => {
    tipCountdown.value--
    if (tipCountdown.value <= 0) {
      canCloseTip.value = true
      clearInterval(tipTimer!)
      tipTimer = null
    }
  }, 1000)
}

// 绑定/修改逻辑
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
    toast.show(isModifyMode.value ? '密码修改成功' : '绑定成功', 'success')
    if (!isModifyMode.value) stuId.value = ''
    stuPassword.value = ''
    showPassword.value = false
    emit('bind-success')
    clearRetryCountdown()
  } catch (err: any) {
    const gValue = err.data?.g || err.g
    if (gValue) {
      handlePasswordTooSimple(gValue)
    } else {
      toast.show(err.message || '绑定失败，20秒后可重试', 'error')
      startRetryCountdown()
    }
  } finally {
    loading.value = false
  }
}

// 重试倒计时逻辑
function startRetryCountdown() {
  isDisabled.value = true
  retryCountdown.value = 20
  const endTime = Date.now() + 20 * 1000
  localStorage.setItem(RETRY_KEY, endTime.toString())

  timer && clearInterval(timer)
  timer = setInterval(() => {
    const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
    retryCountdown.value = diff
    if (diff <= 0) clearRetryCountdown()
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
        const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
        retryCountdown.value = diff
        if (diff <= 0) clearRetryCountdown()
      }, 1000)
    } else {
      clearRetryCountdown()
    }
  }
}

onMounted(() => checkRetryCountdownOnMounted())
onUnmounted(() => { timer && clearInterval(timer); timer = null; tipTimer && clearInterval(tipTimer); tipTimer = null })
</script>

<style scoped>
input { outline: none; }
</style>
