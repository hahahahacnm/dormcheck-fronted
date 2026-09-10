<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import LoginRegisterModal from '../components/LoginRegisterModal.vue'
import FloatingDashboard from '../components/FloatingDashboard.vue'
import { logoutApi, getCurrentUser } from '../api/auth'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const toast = useToast()
const { token, isLoggedIn, userName, userEmail, setUser, clearUser } = useUser()

const loginModal = ref<InstanceType<typeof LoginRegisterModal> | null>(null)
const showDashboard = ref(false)
const uptime = ref('加载中...')
const taskCount = ref(8)
const successCount = ref(5)
const startTime = new Date('2025-07-15T08:43:00Z')
let uptimeTimer: number | undefined

const menuItems = [
  { name: '个人中心', path: '/' },
  { name: '学生绑定', path: '/student-bind' },
  { name: '任务管理', path: '/tasks' },
  { name: '项目简介', path: '/about' },
]

function toggleDashboard() {
  showDashboard.value = !showDashboard.value
}

function updateUptime() {
  const now = new Date()
  const diff = now.getTime() - startTime.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  uptime.value = `${days} 天 ${hours} 小时 ${minutes} 分钟`
}

function showLogin() {
  loginModal.value?.open('login')
}

async function fetchUserInfo(t: string) {
  try {
    const userInfo = await getCurrentUser(t)
    setUser(t, userInfo.username, userInfo.email)
  } catch {
    clearUser()
    toast.show('登录状态失效，请重新登录', 'error')
  }
}

function onLoginSuccess(name: string, t = '') {
  setUser(t, name)
  fetchUserInfo(t)
}

async function logout() {
  if (!token.value) {
    toast.show('当前未登录，请先登录', 'error')
    return
  }

  try {
    await logoutApi(token.value)
    clearUser()
    toast.show('已成功登出', 'success')
  } catch (err: unknown) {
    toast.show(err instanceof Error ? err.message || '登出失败' : '登出失败', 'error')
  }
}

onMounted(() => {
  if (token.value) fetchUserInfo(token.value)
  updateUptime()
  uptimeTimer = window.setInterval(updateUptime, 60000)
})

onUnmounted(() => {
  if (uptimeTimer) window.clearInterval(uptimeTimer)
})
</script>

<template>
  <div class="app-shell min-h-screen overflow-hidden relative text-slate-900">

    <div class="min-h-screen lg:flex">
      <aside class="hidden lg:flex w-64 bg-white/90 shadow-[0_18px_55px_rgba(71,85,105,0.13)] flex-col border-r border-white/80 backdrop-blur-xl">
        <div class="h-16 flex items-center justify-center gap-2 text-xl font-bold border-b border-white/70 px-4 text-teal-700">
          <img src="/logo.svg" alt="Logo" class="w-8 h-8" />
          <span>DormCheck</span>
        </div>
        <nav class="flex-1 px-4 py-6 space-y-2 overflow-auto">
          <RouterLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 rounded-md transition hover:bg-white/80 text-slate-700"
            active-class="bg-teal-50 text-teal-800 font-semibold shadow-sm"
            exact-active-class="bg-teal-50 text-teal-800 font-semibold shadow-sm"
          >
            {{ item.name }}
          </RouterLink>
        </nav>
      </aside>

      <div class="flex min-h-screen flex-1 flex-col">
        <header class="sticky top-0 z-30 bg-white/90 shadow-sm border-b border-white/80 backdrop-blur-xl">
          <div class="h-16 flex items-center justify-between gap-3 px-4 sm:px-6">
            <RouterLink to="/" class="lg:hidden flex items-center gap-2 min-w-0">
              <img src="/logo.svg" alt="Logo" class="w-8 h-8 flex-none" />
              <span class="font-bold text-teal-700 truncate">DormCheck</span>
            </RouterLink>

            <div class="hidden lg:flex items-center space-x-2 text-base sm:text-lg font-semibold truncate">
              <span>欢迎使用 <span class="text-teal-700 font-bold">DormCheck</span></span>
              <span class="text-sky-700 font-bold truncate">{{ userName }}</span>
              <span v-if="userEmail" class="text-gray-500 text-sm ml-2 truncate">({{ userEmail }})</span>
            </div>

            <div class="flex min-w-0 flex-1 justify-center lg:hidden">
              <span class="truncate text-sm font-medium text-gray-700">
                {{ isLoggedIn ? userName || '已登录' : '未登录' }}
              </span>
            </div>

            <button
              v-if="!isLoggedIn"
              @click="showLogin"
              class="bg-teal-600 text-white px-3 sm:px-4 py-1.5 rounded-md hover:bg-teal-700 transition whitespace-nowrap text-sm shadow-sm"
            >
              登录 / 注册
            </button>
            <button
              v-else
              @click="logout"
              class="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-1.5 rounded-md transition whitespace-nowrap text-sm"
            >
              登出
            </button>
          </div>
        </header>

        <main class="flex-1 overflow-auto px-3 py-4 pb-24 sm:px-6 sm:py-6 lg:pb-6">
          <router-view />
        </main>
      </div>
    </div>

    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/80 bg-white/90 backdrop-blur-xl shadow-[0_-8px_30px_rgba(71,85,105,0.14)]">
      <div class="grid grid-cols-4 px-1 py-1.5">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="min-w-0 rounded-md px-1 py-2 text-center text-xs font-medium text-gray-600"
          active-class="bg-teal-50 text-teal-800"
          exact-active-class="bg-teal-50 text-teal-800"
        >
          <span class="block truncate">{{ item.name }}</span>
        </RouterLink>
      </div>
    </nav>

    <LoginRegisterModal ref="loginModal" @loginSuccess="onLoginSuccess" @registerSuccess="username => onLoginSuccess(username, '')" />

    <button
      @click="toggleDashboard"
      class="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 shadow-lg z-50 transition transform hover:scale-105"
      title="查看仪表盘"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    </button>

    <FloatingDashboard
      :visible="showDashboard"
      :uptime="uptime"
      :taskCount="taskCount"
      :successCount="successCount"
      @close="showDashboard = false"
    />
  </div>
</template>

<style scoped>
.app-shell {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 34%),
    linear-gradient(115deg, #edf5f2 0%, #f4f7fb 42%, #e8eef7 100%);
}

.app-shell::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(15, 118, 110, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.04) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.68), rgba(0, 0, 0, 0.18));
}

@media (max-width: 1023px) {
  .app-shell {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, rgba(255, 255, 255, 0) 40%),
      linear-gradient(145deg, #eef7f4 0%, #f7f9fc 54%, #e8eef6 100%);
  }
}
</style>
