<template>
  <div class="p-10 bg-gray-50 min-h-[70vh] max-w-3xl mx-auto">
    <!-- 未登录提示 -->
    <div v-if="!isLoggedIn" class="text-center text-gray-400 text-lg py-32 select-none">
      请先登录以管理您的学生绑定信息
    </div>

    <!-- 登录后内容 -->
    <div v-else class="bg-white p-8 rounded-lg shadow-md space-y-8">
      <!-- 顶部标题与按钮 -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-semibold text-gray-800">已绑定学生账号</h2>
        <button
          @click="showBindDialog = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
        >
          添加绑定
        </button>
      </div>

      <!-- 学生列表 -->
      <div>
        <ul
          v-if="studentList.length > 0"
          class="space-y-3 max-h-[300px] overflow-y-auto pr-1"
        >
          <li
            v-for="stu in studentList"
            :key="stu.stuId"
            class="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-md shadow-sm hover:bg-gray-200 transition"
          >
            <div class="text-gray-800">
              <span class="font-mono">{{ stu.stuId }}</span>
              <span class="ml-2 text-sm text-gray-500">({{ stu.name }})</span>
            </div>
            <button
              @click="unbindStudent(stu.stuId)"
              class="text-red-600 text-sm font-medium hover:underline hover:text-red-700"
            >
              解绑
            </button>
          </li>
        </ul>

        <!-- 空状态 -->
        <div
          v-else
          class="text-center text-gray-400 py-20 flex flex-col items-center gap-2"
        >
          <svg
            class="w-10 h-10 text-gray-300 mb-1"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25M8.25 9V5.25m-2.485 1.486A9 9 0 1112 21a9 9 0 01-6.235-15.264z"
            />
          </svg>
          <p class="italic">暂无绑定记录</p>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <BindStudentDialog
      v-if="showBindDialog"
      @close="showBindDialog = false"
      @bind-success="onBindSuccess"
    />

    <ConfirmDialog ref="confirmDialogRef" />

    <!-- Toast 容器，一定要挂载且注册引用 -->
    <ToastContainer ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import { useToast, setToastRef } from '../composables/useToast'
import { student } from '../api/student'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import BindStudentDialog from '../components/BindStudentDialog.vue'
import ToastContainer from '../components/ToastContainer.vue'

interface BoundStudent {
  stuId: string
  name: string
}

const { token, isLoggedIn } = useUser()
const toast = useToast()

const studentList = ref<BoundStudent[]>([])
const showBindDialog = ref(false)
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

async function fetchStudentList() {
  if (!token.value) return
  try {
    const res = await student.getBoundStudents()  // ✅ 修正
    studentList.value = res.data || []
  } catch (err: any) {
    toast.show(err.message || '获取绑定信息失败', 'error')
  }
}

async function unbindStudent(id: string) {
  if (!token.value) return
  const confirmed = await confirmDialogRef.value?.open('确定解绑该学生账号吗？此操作不可撤销。')
  if (!confirmed) return

  try {
    await student.unbindStudentApi({ stu_id: id })  // ✅ 修正
    toast.show('解绑成功', 'success')
    await fetchStudentList()
  } catch (err: any) {
    toast.show(err.message || '解绑失败', 'error')
  }
}

function onBindSuccess() {
  showBindDialog.value = false
  fetchStudentList()
}

watch(isLoggedIn, (val) => {
  if (val) {
    fetchStudentList()
  } else {
    studentList.value = []
  }
})

onMounted(() => {
  if (isLoggedIn.value) {
    fetchStudentList()
  }
})
</script>

<style scoped>
ul::-webkit-scrollbar {
  width: 6px;
}
ul::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.3);
  border-radius: 3px;
}
</style>
