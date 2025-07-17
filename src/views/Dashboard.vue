<template>
  <main class="p-10 bg-gray-50 min-h-[70vh] max-w-3xl mx-auto">
    <!-- 未登录提示 -->
    <div
      v-if="!isLoggedIn"
      class="text-center text-gray-400 text-lg py-32 select-none"
    >
      请先登录以查看您的个人信息
    </div>

    <!-- 登录后个人中心 -->
    <section
      v-else
      class="bg-white p-8 rounded-lg shadow-md space-y-8"
    >
      <!-- 个人中心标题 -->
      <h1 class="text-3xl font-extrabold text-blue-700 flex items-center gap-2">
        <svg
          class="w-7 h-7 text-blue-500"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
          <path d="M6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        </svg>
        个人中心
      </h1>

      <!-- 欢迎语 -->
      <p class="text-xl text-gray-800">
        欢迎回来，<span class="font-semibold text-blue-600">{{ user.username }}</span>！很高兴见到你 😊
      </p>

      <!-- 用户信息 -->
      <div class="space-y-3 text-gray-700 text-lg">
        <p><span class="font-semibold">用户名：</span> {{ user.username }}</p>
        <p><span class="font-semibold">邮箱：</span> {{ user.email }}</p>
        <p>
          <span class="font-semibold">用户等级：</span>
          <span
            :class="{
              'text-red-600 font-bold': user.role === 2,
              'text-gray-800': user.role !== 2
            }"
          >
            {{ roleText }}
          </span>
        </p>
      </div>

      <!-- 按钮区域 -->
      <div class="flex justify-end gap-4 flex-wrap">
        <button
          @click="onChangePassword"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          type="button"
        >
          修改密码
        </button>
        <button
          @click="onChangeEmail"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          type="button"
        >
          修改邮箱
        </button>
        <button
          @click="onSponsor"
          class="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
          type="button"
        >
          赞助入口
        </button>
      </div>
    </section>

    <!-- 弹窗组件挂载 -->
    <ChangePasswordModal :visible="showPasswordModal" @close="showPasswordModal = false" />
    <ChangeEmailModal :visible="showEmailModal" @close="showEmailModal = false" />
    <SponsorCodeModal :visible="showSponsorModal" @close="showSponsorModal = false" />

    <!-- Toast 组件挂载 -->
    <ToastContainer ref="toastRef" />
  </main>
</template>

<script setup lang="ts">
import { reactive, computed, ref, watch, onMounted } from 'vue'
import api from '../api/index'
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
import ChangeEmailModal from '../components/ChangeEmailModal.vue'
import SponsorCodeModal from '../components/SponsorCodeModal.vue'
import ToastContainer from '../components/ToastContainer.vue'
import { useToast, setToastRef } from '../composables/useToast'
import { useUser } from '../composables/useUser'

const { show } = useToast()
const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

const { isLoggedIn, token } = useUser()

const user = reactive({
  username: '',
  email: '',
  role: -1,
})

const showPasswordModal = ref(false)
const showEmailModal = ref(false)
const showSponsorModal = ref(false)

const roleText = computed(() => {
  switch (user.role) {
    case 0:
      return '管理员'
    case 1:
      return '普通用户'
    case 2:
      return '赞助用户'
    default:
      return '未知角色'
  }
})

async function fetchUserInfo() {
  if (!token.value) {
    resetUser()
    return
  }
  try {
    const res = await api.get('/auth/me')
    user.username = res.data.username
    user.email = res.data.email
    user.role = res.data.role
  } catch (err: any) {
    show('获取用户信息失败，请重新登录', 'error')
    resetUser()
  }
}

function resetUser() {
  user.username = ''
  user.email = ''
  user.role = -1
}

watch(isLoggedIn, (val) => {
  if (val) {
    fetchUserInfo()
  } else {
    resetUser()
  }
})

onMounted(() => {
  if (isLoggedIn.value) {
    fetchUserInfo()
  }
})

function onChangePassword() {
  showPasswordModal.value = true
}

function onChangeEmail() {
  showEmailModal.value = true
}

function onSponsor() {
  showSponsorModal.value = true
}
</script>

<style scoped>
@media (max-width: 640px) {
  main {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  section {
    padding: 1.5rem;
  }
  .flex.justify-end {
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .flex.justify-end > button {
    flex: 1 1 auto;
    min-width: 120px;
  }
}
</style>
