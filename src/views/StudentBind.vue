<template>
  <div class="p-10 min-h-[70vh] max-w-7xl mx-auto">
    <!-- 未登录提示 -->
    <div v-if="!token" class="text-center text-gray-400 text-lg py-24 select-none">
      请先登录以管理您的学生绑定信息
    </div>

    <!-- 登录后内容 -->
    <div v-else>
      <!-- 主卡片区域：标题 + 表格一体 -->
      <div class="bg-white/75 rounded-lg shadow-md border border-gray-200 overflow-hidden backdrop-blur-sm">
        <!-- 顶部操作栏（标题） -->
        <div class="flex justify-between items-center flex-wrap gap-4 px-6 py-4 border-b border-gray-200">
          <h2 class="text-2xl font-semibold text-gray-800 truncate">
            已绑定学生账号
          </h2>
          <button
            @click="openBindDialog()"
            class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-md transition duration-200"
          >
            添加绑定
          </button>
        </div>

        <!-- 表格/列表主体 -->
        <div class="p-6 overflow-x-auto">
          <template v-if="studentList.length > 0">
            <ul class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              <li
                v-for="(stu, index) in studentList"
                :key="stu.stuId"
                class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/10 px-4 py-4 rounded-md shadow-sm hover:bg-white/30 transition"
              >
                <!-- 左侧：序号 + 学生信息 + 密码 -->
                <div class="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-full font-semibold">
                    {{ index + 1 }}
                  </div>

                  <div class="flex-1 min-w-0 flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                    <div class="text-gray-800 font-medium truncate">
                      {{ stu.stuId }} <span class="text-gray-500">({{ stu.name }})</span>
                    </div>

                    <!-- 密码显示 -->
                    <div v-if="stu.cachedPassword !== undefined" class="flex items-center flex-shrink-0 space-x-2">
                      <input
                        type="text"
                        :value="stu.showPassword ? stu.cachedPassword : '******'"
                        readonly
                        class="truncate px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white/20 backdrop-blur-sm focus:outline-none min-w-0"
                      />
                      <button
                        @click="togglePassword(stu)"
                        class="text-blue-500 hover:text-blue-700 text-sm"
                        :title="stu.showPassword ? '隐藏密码' : '显示密码'"
                      >
                        {{ stu.showPassword ? '隐藏' : '显示' }}
                      </button>
                    </div>

                    <!-- 未获取密码 -->
                    <div v-else>
                      <button
                        @click="fetchPassword(stu)"
                        class="text-green-600 hover:text-green-700 text-sm"
                      >
                        查看保存的密码
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 右侧：操作按钮 -->
                <div class="flex space-x-3 mt-2 sm:mt-0 flex-shrink-0">
                  <button
                    @click="openBindDialog(stu.stuId)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    更新密码
                  </button>
                  <button
                    @click="unbindStudent(stu.stuId)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    解绑
                  </button>
                </div>
              </li>
            </ul>
          </template>

          <!-- 空状态 -->
          <div v-else class="text-center text-gray-400 py-16 select-none">
            <svg
              class="mx-auto mb-4 w-12 h-12 text-gray-300"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12M18 12H6" />
            </svg>
            <p>暂无绑定记录，点击添加绑定学生账号</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <BindStudentDialog
      v-if="showBindDialog"
      :modifyStuId="bindDialogModeStuId"
      @close="showBindDialog = false"
      @bind-success="onBindSuccess"
    />

    <ConfirmDialog ref="confirmDialogRef" />
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
  showPassword?: boolean
  cachedPassword?: string
}

const { token, isLoggedIn } = useUser()
const toast = useToast()

const studentList = ref<BoundStudent[]>([])
const showBindDialog = ref(false)
const bindDialogModeStuId = ref<string | undefined>(undefined)
const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)
const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

async function fetchStudentList() {
  if (!token.value) return
  try {
    const res = await student.getBoundStudents()
    studentList.value = res.data.map(s => ({
      ...s,
      showPassword: false,
      cachedPassword: undefined,
    }))
  } catch (err: any) {
    toast.show(err.message || '获取绑定信息失败', 'error')
  }
}

async function unbindStudent(id: string) {
  if (!token.value) return
  const confirmed = await confirmDialogRef.value?.open('确定解绑该学生账号吗？此操作不可撤销。')
  if (!confirmed) return

  try {
    await student.unbindStudentApi({ stu_id: id })
    toast.show('解绑成功', 'success')
    await fetchStudentList()
  } catch (err: any) {
    toast.show(err.message || '解绑失败', 'error')
  }
}

function togglePassword(stu: BoundStudent) { stu.showPassword = !stu.showPassword }

async function fetchPassword(stu: BoundStudent) {
  if (!token.value) return
  if (stu.cachedPassword !== undefined) { stu.showPassword = true; return }
  try {
    const res = await student.getStudentPassword(stu.stuId)
    if (res.success) {
      stu.cachedPassword = res.data.password
      stu.showPassword = true
    } else {
      toast.show(res.message || '获取密码失败', 'error')
    }
  } catch (err: any) {
    toast.show(err.message || '获取密码失败', 'error')
  }
}

function openBindDialog(stuId?: string) {
  bindDialogModeStuId.value = stuId
  showBindDialog.value = true
}

function onBindSuccess() {
  showBindDialog.value = false
  bindDialogModeStuId.value = undefined
  fetchStudentList()
}

watch(isLoggedIn, (val) => {
  if (val) fetchStudentList()
  else studentList.value = []
})

onMounted(() => { if (isLoggedIn.value) fetchStudentList() })
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
