<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import LoginRegisterModal from '../components/LoginRegisterModal.vue'
import FloatingDashboard from '../components/FloatingDashboard.vue'
import { getCurrentUser } from '../api/auth'
import { useToast } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const toast = useToast()
const {
  token,
  isLoggedIn,
  userName,
  userEmail,
  setUser,
  clearUser
} = useUser()

const loginModal = ref<InstanceType<typeof LoginRegisterModal> | null>(null)

const menuItems = [
  { name: '个人中心', path: '/' },
  { name: '学生绑定', path: '/student-bind' },
  { name: '任务管理', path: '/tasks' },
  { name: '项目简介', path: '/about' }
]

const showDashboard = ref(false)
const uptime = ref('加载中...')
const taskCount = ref(8)
const successCount = ref(5)
const startTime = new Date('2025-07-15T08:43:00Z')

function toggleDashboard() {
  showDashboard.value = !showDashboard.value
}

function updateUptime() {
  const now = new Date()
  const diff = now.getTime() - startTime.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  uptime.value = `${days} 天 ${hours} 小时 ${minutes} 分`
}

function showLogin() {
  loginModal.value?.open('login')
}

async function fetchUserInfo(t: string) {
  try {
    const userInfo = await getCurrentUser(t)
    setUser(t, userInfo.username, userInfo.email)
  } catch (err) {
    clearUser()
    toast.show('登录状态失效，请重新登录', 'error')
  }
}

function onLoginSuccess(name: string, t = '') {
  // 邮箱会由 fetchUserInfo 填充
  setUser(t, name)
  fetchUserInfo(t)
}

async function logout() {
  clearUser()
  toast.show('已成功登出', 'success')
}

onMounted(() => {
  if (token.value) {
    fetchUserInfo(token.value)
  }
  updateUptime()
  setInterval(updateUptime, 60000)
})
</script>

<template>
  <div class="flex h-screen bg-gray-100 text-gray-800">
    <!-- 侧边栏 -->
    <aside class="w-64 bg-white shadow-md flex flex-col border-r border-gray-200">
      <div class="h-16 flex items-center justify-center gap-2 text-xl font-bold border-b px-4 text-indigo-700">
        <img src="/logo.svg" alt="Logo" class="w-8 h-8" />
        <span>DormCheck</span>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="block px-3 py-2 rounded-md transition hover:bg-indigo-100 text-gray-700"
          active-class="bg-indigo-200 font-semibold"
          exact-active-class="bg-indigo-200 font-semibold"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col">
      <!-- 顶栏 -->
      <header class="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
        <div class="text-base sm:text-lg font-semibold truncate">
          欢迎使用 <span class="text-blue-600 font-bold">DormCheck</span>，
          当前用户：
          <span class="text-indigo-600 font-bold">{{ userName }}</span>
          <span v-if="userEmail" class="text-gray-500 text-sm ml-2 truncate">({{ userEmail }})</span>
        </div>

        <div>
          <button
            v-if="!isLoggedIn"
            @click="showLogin"
            class="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition
                  whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis"
          >
            登录 / 注册
          </button>
          <button
            v-else
            @click="logout"
            class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md transition
                  whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis"
          >
            登出
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 p-6 overflow-auto bg-gray-50">
        <router-view />
      </main>
    </div>

    <!-- 登录注册弹窗 -->
    <LoginRegisterModal
      ref="loginModal"
      @loginSuccess="onLoginSuccess"
      @registerSuccess="username => onLoginSuccess(username, '')"
    />

    <!-- 仪表盘按钮 -->
    <button
      @click="toggleDashboard"
      class="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg z-50 transition transform hover:scale-105"
      title="查看仪表盘"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    </button>

    <!-- 仪表盘悬浮卡片 -->
    <FloatingDashboard
      :visible="showDashboard"
      :uptime="uptime"
      :taskCount="taskCount"
      :successCount="successCount"
      @close="showDashboard = false"
    />
  </div>
</template>
