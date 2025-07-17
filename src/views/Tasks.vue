<template>
  <div class="p-10 bg-gray-50 min-h-[70vh] max-w-7xl mx-auto">
    <div v-if="!token" class="text-center text-gray-400 text-lg py-24 select-none">
      请先登录后再查看签到任务
    </div>

    <div v-else>
      <!-- 顶部操作栏 -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-gray-800">签到任务列表</h2>
        <button
          class="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-md transition duration-200 shadow-md"
          @click="showAddTask = true"
        >
          添加任务
        </button>
      </div>

      <!-- 主卡片区域 -->
      <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6 overflow-x-auto">
        <template v-if="taskList.length > 0">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100 text-sm text-gray-700">
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">学生姓名</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">活动名称</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">签到地址</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">经纬度</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">签到时间</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">状态</th>
                <th class="px-5 py-3 text-left font-medium whitespace-nowrap">近期报错</th>
                <th class="px-5 py-3 text-center font-medium whitespace-nowrap">最大重试</th>
                <th class="px-5 py-3 text-center font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody class="text-sm text-gray-700">
              <tr
                v-for="task in taskList"
                :key="task.ID"
                class="odd:bg-white even:bg-gray-50 border-t"
              >
                <td
                  class="px-5 py-3 max-w-[200px] truncate"
                  :title="`学号：${task.StuID}${task.NotifyEmail ? '，已接入邮箱通知：' + task.NotifyEmail : '，未接入邮箱通知'}`"
                >
                  {{ task.Name }}
                </td>
                <td class="px-5 py-3 max-w-[200px] truncate" :title="task.ActivityName">{{ task.ActivityName }}</td>
                <td class="px-5 py-3 max-w-[300px] truncate" :title="task.Address">{{ task.Address }}</td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <div class="flex flex-col leading-tight">
                    <span>经度: {{ task.Longitude }}</span>
                    <span>纬度: {{ task.Latitude }}</span>
                  </div>
                </td>
                <td class="px-5 py-3 whitespace-nowrap">{{ formatTimeHHmm(task.SignTime) }}</td>
                <td class="px-5 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-block px-3 py-1 rounded-full text-white text-xs font-medium',
                      task.ExecStatus === 'pending'
                        ? 'bg-yellow-400'
                        : task.ExecStatus === 'success'
                        ? 'bg-green-500'
                        : 'bg-red-500',
                    ]"
                  >
                    {{
                      task.ExecStatus === 'pending'
                        ? '今日待执行'
                        : task.ExecStatus === 'success'
                        ? '成功'
                        : '失败'
                    }}
                  </span>
                </td>
                <td class="px-5 py-3 max-w-[300px] break-words text-gray-600" :title="task.LastError || ''">
                  {{ task.LastError || '—' }}
                </td>
                <td class="px-5 py-3 text-center font-mono">{{ task.MaxRetry }}</td>
                <td class="px-5 py-3 text-center">
                  <button
                    @click="onDeleteTask(task.ID)"
                    class="text-red-600 hover:underline hover:text-red-800 transition"
                  >
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
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
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 14v.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9-3v3l2 1"
            />
          </svg>
          暂无签到任务，请点击右上角按钮添加
        </div>
      </div>
    </div>

    <!-- 弹窗和提示 -->
    <AddTaskForm v-if="showAddTask" :visible="showAddTask" @close="showAddTask = false" @task-added="fetchTaskList" />
    <ToastContainer ref="toastRef" />
    <ConfirmDialog ref="confirmRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { student } from '../api/student'
import { useUser } from '../composables/useUser'
import ToastContainer from '../components/ToastContainer.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import AddTaskForm from '../components/AddTaskForm.vue'
import { useToast, setToastRef } from '../composables/useToast'

interface Task {
  ID: number
  UserID: number
  StuID: string
  Name: string
  ActivityID: string
  ActivityName: string
  Address: string
  Longitude: number
  Latitude: number
  SignTime: string
  Enabled: boolean
  ExecStatus: string
  RetryCount: number
  MaxRetry: number
  LastError: string
  ExecutedAt: string
  NotifyEmail: string
}

interface BoundStudent {
  id: number
  userId: number
  stuId: string
  name: string
}

interface Activity {
  id: number | string
  name: string
}

const { token } = useUser()
const { show } = useToast()

const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

const confirmRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

const taskList = ref<Task[]>([])
const loadingTaskList = ref(false)
const showAddTask = ref(false)

function sanitizeMessage(msg: string) {
  if (!msg) return ''
  return msg.includes('<path') ? '请求失败，未知错误' : msg
}

async function fetchTaskList() {
  if (!token.value) return
  loadingTaskList.value = true
  try {
    const boundStudentsResp = await student.getBoundStudents()
    if (!boundStudentsResp.success) {
      show(boundStudentsResp.message || '获取绑定学生列表失败', 'error')
      loadingTaskList.value = false
      return
    }
    const boundStudents = boundStudentsResp.data

    const taskResp = await student.getTasks()
    if (!taskResp.success) {
      show(taskResp.message || '获取任务列表失败', 'error')
      loadingTaskList.value = false
      return
    }

    const boundStuMap = new Map<string, BoundStudent>()
    boundStudents.forEach((stu) => boundStuMap.set(stu.stuId, stu))

    const uniqueStuIds = [...new Set(taskResp.data.map((t) => t.StuID))]
    const activitiesMap = new Map<string, Activity>()
    for (const stuId of uniqueStuIds) {
      try {
        const actResp = await student.getActivities(token.value, stuId)
        if (actResp.success) {
          actResp.data.forEach((act) => {
            activitiesMap.set(`${stuId}_${act.id}`, act)
          })
        }
      } catch {}
    }

    taskList.value = taskResp.data.map((task) => {
      const stu = boundStuMap.get(task.StuID)
      const act = activitiesMap.get(`${task.StuID}_${task.ActivityID}`)
      return {
        ...task,
        Name: stu ? stu.name : task.StuID,
        ActivityName: act ? act.name : task.ActivityID,
        NotifyEmail: task.NotifyEmail ?? '',
      }
    })
  } catch (err: any) {
    show(sanitizeMessage(err.message) || '获取任务列表失败', 'error')
  } finally {
    loadingTaskList.value = false
  }
}

async function onDeleteTask(taskID: number) {
  if (!token.value) return
  const confirmed = await confirmRef.value?.open('确定要删除该任务吗？')
  if (!confirmed) return

  try {
    const res = await student.deleteTask(taskID)
    if (res.success) {
      show('任务已删除', 'success')
      fetchTaskList()
    } else {
      show(sanitizeMessage(res.message) || '删除失败', 'error')
    }
  } catch (err: any) {
    show(sanitizeMessage(err.message) || '删除失败', 'error')
  }
}

function formatTimeHHmm(datetimeStr: string) {
  if (!datetimeStr) return ''
  const match = datetimeStr.match(/\d{2}:\d{2}/)
  return match ? match[0] : datetimeStr
}

onMounted(() => {
  if (token.value) {
    fetchTaskList()
  }
})
</script>

<style scoped>
table {
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}
</style>
