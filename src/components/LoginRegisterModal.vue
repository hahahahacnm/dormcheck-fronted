<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-96 p-6 relative">
      <button @click="close" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700" type="button">✕</button>

      <!-- Tab 切换 -->
      <div class="flex mb-4 border-b">
        <button
          type="button"
          :class="['flex-1 py-2 text-center', activeTab === 'login' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500']"
          @click="activeTab = 'login'"
        >登录</button>
        <button
          type="button"
          :class="['flex-1 py-2 text-center', activeTab === 'register' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500']"
          @click="activeTab = 'register'"
        >注册</button>
        <button
          type="button"
          :class="['flex-1 py-2 text-center', activeTab === 'forgot' ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-500']"
          @click="activeTab = 'forgot'"
        >忘记密码</button>
      </div>

      <!-- 登录表单 -->
      <form v-if="activeTab === 'login'" @submit.prevent="onLogin">
        <div class="mb-4">
          <label class="block mb-1">用户名/邮箱</label>
          <input v-model="loginForm.username" type="text" required class="w-full border rounded px-3 py-2" />
        </div>
        <div class="mb-4 relative">
          <label class="block mb-1">密码</label>
          <input
            :type="loginPasswordVisible ? 'text' : 'password'"
            v-model="loginForm.password"
            required
            class="w-full border rounded px-3 py-2 pr-10"
          />
          <button
            type="button"
            @click="loginPasswordVisible = !loginPasswordVisible"
            class="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
            tabindex="-1"
          >{{ loginPasswordVisible ? '🙈' : '👁️' }}</button>
        </div>
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          :disabled="loading"
        >登录</button>
      </form>

      <!-- 注册表单 -->
      <form v-else-if="activeTab === 'register'" @submit.prevent="onRegister">
        <div class="mb-4">
          <label class="block mb-1">用户名</label>
          <input v-model="registerForm.username" type="text" required class="w-full border rounded px-3 py-2" />
        </div>

        <div class="mb-4 relative">
          <label class="block mb-1">密码</label>
          <input
            :type="registerPasswordVisible ? 'text' : 'password'"
            v-model="registerForm.password"
            required
            class="w-full border rounded px-3 py-2 pr-10"
          />
          <button
            type="button"
            @click="registerPasswordVisible = !registerPasswordVisible"
            class="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
            tabindex="-1"
          >{{ registerPasswordVisible ? '🙈' : '👁️' }}</button>
        </div>

        <div class="mb-4 relative">
          <label class="block mb-1">确认密码</label>
          <input
            :type="confirmPasswordVisible ? 'text' : 'password'"
            v-model="registerForm.confirmPassword"
            required
            class="w-full border rounded px-3 py-2 pr-10"
          />
          <button
            type="button"
            @click="confirmPasswordVisible = !confirmPasswordVisible"
            class="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
            tabindex="-1"
          >{{ confirmPasswordVisible ? '🙈' : '👁️' }}</button>
        </div>

        <div class="mb-4">
          <label class="block mb-1">邮箱</label>
          <input v-model="registerForm.email" type="email" required class="w-full border rounded px-3 py-2" />
        </div>

        <div class="mb-4">
          <label class="block mb-1">验证码</label>
          <div class="flex gap-2">
            <input v-model="registerForm.code" type="text" required class="flex-1 border rounded px-3 py-2" />
            <button
              type="button"
              @click="sendCode"
              :class="[
                'px-3 py-2 rounded transition',
                codeCooldown > 0 || !isRegisterEmailValid
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
              :disabled="codeCooldown > 0 || !isRegisterEmailValid"
            >
              {{ codeCooldown > 0 ? `重发(${codeCooldown})` : '获取验证码' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          :disabled="loading"
        >注册</button>
      </form>

      <!-- 忘记密码表单 -->
      <form v-else @submit.prevent="onResetPassword">
        <div class="mb-4">
          <label class="block mb-1">邮箱</label>
          <input v-model="forgotForm.email" type="email" required class="w-full border rounded px-3 py-2" />
        </div>

        <div class="mb-4">
          <label class="block mb-1">验证码</label>
          <div class="flex gap-2">
            <input v-model="forgotForm.code" type="text" required class="flex-1 border rounded px-3 py-2" />
            <button
              type="button"
              @click="sendCode"
              :class="[
                'px-3 py-2 rounded transition',
                codeCooldown > 0 || !isForgotEmailValid
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
              :disabled="codeCooldown > 0 || !isForgotEmailValid"
            >
              {{ codeCooldown > 0 ? `重发(${codeCooldown})` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div class="mb-4 relative">
          <label class="block mb-1">新密码</label>
          <input
            :type="forgotPasswordVisible ? 'text' : 'password'"
            v-model="forgotForm.newPassword"
            required
            class="w-full border rounded px-3 py-2 pr-10"
          />
          <button
            type="button"
            @click="forgotPasswordVisible = !forgotPasswordVisible"
            class="absolute right-2 top-8 text-gray-500 hover:text-gray-700"
            tabindex="-1"
          >{{ forgotPasswordVisible ? '🙈' : '👁️' }}</button>
        </div>

        <button
          type="submit"
          class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          :disabled="loading"
        >重置密码</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineExpose, computed } from 'vue'
import { login, type LoginRequest, register, type RegisterRequest } from '../api/auth'
import api from '../api'
import { useToast } from '../composables/useToast'

const { show } = useToast()
const emits = defineEmits<{
  (e: 'loginSuccess', username: string, token: string): void
  (e: 'registerSuccess', username: string): void
  (e: 'close'): void
}>()

const visible = ref(false)
const activeTab = ref<'login' | 'register' | 'forgot'>('login')
const loading = ref(false)

const loginPasswordVisible = ref(false)
const registerPasswordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const forgotPasswordVisible = ref(false)

const codeCooldown = ref(0)
let timer: any = null

const loginForm = ref<LoginRequest>({
  username: '',
  password: '',
})

const registerForm = ref<RegisterRequest & {
  confirmPassword?: string
  email?: string
  code?: string
}>({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  code: '',
})

const forgotForm = ref({
  email: '',
  code: '',
  newPassword: '',
})

// 邮箱格式验证函数
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// 计算邮箱是否有效（注册和忘记密码分别单独判断）
const isRegisterEmailValid = computed(() => isValidEmail(registerForm.value.email || ''))
const isForgotEmailValid = computed(() => isValidEmail(forgotForm.value.email || ''))

function open(tab: 'login' | 'register' | 'forgot' = 'login') {
  activeTab.value = tab
  visible.value = true
  loading.value = false

  loginForm.value = { username: '', password: '' }
  registerForm.value = { username: '', password: '', confirmPassword: '', email: '', code: '' }
  forgotForm.value = { email: '', code: '', newPassword: '' }

  loginPasswordVisible.value = false
  registerPasswordVisible.value = false
  confirmPasswordVisible.value = false
  forgotPasswordVisible.value = false
}

function close() {
  visible.value = false
  emits('close')
}

function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

async function onLogin() {
  loading.value = true
  try {
    const encodedPwd = base64Encode(loginForm.value.password)
    const resp = await login({
      username: loginForm.value.username,
      password: encodedPwd,
    })

    show('登录成功', 'success')
    emits('loginSuccess', loginForm.value.username, resp.token)
    close()
  } catch (err: any) {
    show(err?.message || '登录失败', 'error')
  } finally {
    loading.value = false
  }
}

async function onRegister() {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    show('两次输入的密码不一致', 'error')
    return
  }

  loading.value = true
  try {
    const encodedPwd = base64Encode(registerForm.value.password)

    await register({
      username: registerForm.value.username,
      password: encodedPwd,
      email: registerForm.value.email!,
      code: registerForm.value.code!,
    })
    show('注册成功，请登录', 'success')
    activeTab.value = 'login'
  } catch (err: any) {
    show(err?.message || '注册失败', 'error')
  } finally {
    loading.value = false
  }
}

async function sendCode() {
  let email = ''
  let purpose = ''
  if (activeTab.value === 'register') {
    email = registerForm.value.email || ''
    purpose = 'register'
  } else if (activeTab.value === 'forgot') {
    email = forgotForm.value.email || ''
    purpose = 'reset'
  } else {
    return
  }

  if (!email) {
    show('请填写邮箱', 'error')
    return
  }

  try {
    await api.post('/auth/send-code', {
      email,
      purpose,
    })
    show('验证码已发送，请查收邮箱', 'success')
    startCooldown()
  } catch (err: any) {
    show(err?.response?.data?.error || '发送失败', 'error')
  }
}

function startCooldown() {
  codeCooldown.value = 60
  timer = setInterval(() => {
    if (codeCooldown.value > 0) {
      codeCooldown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

async function onResetPassword() {
  loading.value = true
  try {
    if (!forgotForm.value.email || !forgotForm.value.code || !forgotForm.value.newPassword) {
      show('请完整填写表单', 'error')
      loading.value = false
      return
    }
    const encodedPwd = base64Encode(forgotForm.value.newPassword)
    await api.post('/auth/reset-password', {
      email: forgotForm.value.email,
      code: forgotForm.value.code,
      new_password: encodedPwd,
    })
    show('密码重置成功，请使用新密码登录', 'success')
    activeTab.value = 'login'
  } catch (err: any) {
    show(err?.response?.data?.error || '密码重置失败', 'error')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
