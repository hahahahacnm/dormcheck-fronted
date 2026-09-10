<template>
  <div class="mx-auto min-h-[70vh] w-full max-w-7xl">
    <div v-if="!token" class="rounded-lg bg-white/90 px-4 py-20 text-center text-gray-500 shadow-sm backdrop-blur-md">
      请先登录后再查看签到任务
    </div>

    <div v-else class="overflow-hidden rounded-lg border border-white/70 bg-white/90 shadow-lg backdrop-blur-md">
      <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 class="text-xl font-semibold text-slate-900 sm:text-2xl">签到任务列表</h2>
          <p class="mt-1 text-sm text-slate-500">共 {{ taskList.length }} 个任务</p>
        </div>
        <button
          class="w-full rounded-md bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-700 active:bg-teal-800 sm:w-auto"
          @click="openAddTask"
        >
          添加任务
        </button>
      </div>

      <div class="p-4">
        <div v-if="loadingTaskList" class="py-12 text-center text-sm text-slate-500">
          任务加载中...
        </div>

        <template v-else-if="taskList.length > 0">
          <div class="hidden overflow-x-auto md:block">
            <table class="min-w-[1180px] table-fixed border-collapse xl:min-w-full">
              <thead>
                <tr class="bg-slate-100 text-sm text-slate-700">
                  <th class="w-[120px] px-3 py-3 text-left font-medium">学生</th>
                  <th class="w-[250px] px-3 py-3 text-left font-medium">活动</th>
                  <th class="w-[390px] px-3 py-3 text-left font-medium">签到地点</th>
                  <th class="w-[150px] px-3 py-3 text-left font-medium">经纬度</th>
                  <th class="w-[90px] px-3 py-3 text-left font-medium">时间</th>
                  <th class="w-[100px] px-3 py-3 text-left font-medium">状态</th>
                  <th class="w-[70px] px-3 py-3 text-center font-medium">重试</th>
                  <th class="w-[170px] px-3 py-3 text-center font-medium">操作</th>
                </tr>
              </thead>
              <tbody class="text-sm text-slate-700">
                <tr v-for="task in taskList" :key="task.ID" class="border-t border-slate-100 odd:bg-white even:bg-slate-50/70">
                  <td class="px-3 py-3 align-top">
                    <HoverOrClickTooltip class="block truncate" :text="task.Name" :fullText="studentTip(task)" />
                  </td>
                  <td class="px-3 py-3 align-top">
                    <HoverOrClickTooltip class="block truncate" :text="task.ActivityName" :fullText="task.ActivityName" />
                  </td>
                  <td class="px-3 py-3 align-top">
                    <HoverOrClickTooltip class="block truncate" :text="formatAddress(task.Address)" :fullText="task.Address" />
                  </td>
                  <td class="px-3 py-3 align-top font-mono text-xs leading-5 text-slate-600">
                    <div>{{ task.Longitude }}</div>
                    <div>{{ task.Latitude }}</div>
                  </td>
                  <td class="px-3 py-3 align-top font-mono">{{ formatTimeHHmm(task.SignTime) }}</td>
                  <td class="px-3 py-3 align-top">
                    <span :class="statusClass(task)" class="inline-flex rounded-full px-2 py-1 text-xs font-medium">
                      {{ statusText(task) }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-center align-top font-mono">{{ task.MaxRetry }}</td>
                  <td class="px-3 py-3 align-top">
                    <div class="flex items-center justify-center gap-3 whitespace-nowrap">
                      <button class="px-0 py-0 text-sm text-emerald-600 transition hover:text-emerald-800 hover:underline" @click="openEditTask(task)">修改</button>
                      <button class="px-0 py-0 text-sm text-sky-700 transition hover:text-sky-900 hover:underline" @click="onConfirmToggle(task)">
                        {{ task.Enabled ? '暂停' : '启用' }}
                      </button>
                      <button class="px-0 py-0 text-sm text-red-600 transition hover:text-red-800 hover:underline" @click="onConfirmDelete(task.ID)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <article v-for="task in taskList" :key="task.ID" class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-slate-900">{{ task.ActivityName }}</h3>
                  <p class="mt-1 text-sm text-slate-500">{{ task.Name }} · {{ formatTimeHHmm(task.SignTime) }}</p>
                </div>
                <span :class="statusClass(task)" class="shrink-0 rounded-full px-2 py-1 text-xs font-medium">
                  {{ statusText(task) }}
                </span>
              </div>

              <div class="mt-4 space-y-3 text-sm">
                <div>
                  <div class="text-xs font-medium text-slate-400">签到地点</div>
                  <div class="mt-1 break-words text-slate-700">{{ task.Address }}</div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div class="rounded bg-slate-50 px-2 py-1.5">经度 {{ task.Longitude }}</div>
                  <div class="rounded bg-slate-50 px-2 py-1.5">纬度 {{ task.Latitude }}</div>
                  <div class="rounded bg-slate-50 px-2 py-1.5">重试 {{ task.MaxRetry }} 次</div>
                  <div class="rounded bg-slate-50 px-2 py-1.5">{{ task.NotifyEmail ? '已设通知' : '未设通知' }}</div>
                </div>
                <div v-if="task.LastError" class="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {{ task.LastError }}
                </div>
              </div>

              <div class="mt-4 grid grid-cols-3 gap-2">
                <button class="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700" @click="openEditTask(task)">修改</button>
                <button class="rounded-md bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700" @click="onConfirmToggle(task)">
                  {{ task.Enabled ? '暂停' : '启用' }}
                </button>
                <button class="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700" @click="onConfirmDelete(task.ID)">删除</button>
              </div>
            </article>
          </div>
        </template>

        <div v-else class="py-16 text-center text-slate-400">
          <svg class="mx-auto mb-4 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 14v.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9zm-9-3v3l2 1" />
          </svg>
          暂无签到任务，请点击添加任务
        </div>
      </div>
    </div>

    <AddTaskForm
      v-if="showAddTask"
      :visible="showAddTask"
      :edit-task="editingTask"
      @close="closeTaskForm"
      @task-added="fetchTaskList"
    />
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
import HoverOrClickTooltip from '../components/HoverOrClickTooltip.vue'

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

const { token } = useUser()
const { show } = useToast()

const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

const confirmRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)
const taskList = ref<Task[]>([])
const loadingTaskList = ref(false)
const showAddTask = ref(false)
const editingTask = ref<Task | null>(null)

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
      return
    }

    const taskResp = await student.getTasks()
    if (!taskResp.success) {
      show(taskResp.message || '获取任务列表失败', 'error')
      return
    }

    const boundStuMap = new Map<string, BoundStudent>()
    boundStudentsResp.data.forEach(stu => boundStuMap.set(stu.stuId, stu))

    taskList.value = taskResp.data.map(task => {
      const stu = boundStuMap.get(task.StuID)
      return {
        ...task,
        Name: stu ? stu.name : task.StuID,
        ActivityName: task.ActivityName,
        NotifyEmail: task.NotifyEmail ?? '',
      }
    })
  } catch (err: any) {
    show(sanitizeMessage(err.message) || '获取任务列表失败', 'error')
  } finally {
    loadingTaskList.value = false
  }
}

function openAddTask() {
  editingTask.value = null
  showAddTask.value = true
}

function openEditTask(task: Task) {
  editingTask.value = { ...task }
  showAddTask.value = true
}

function closeTaskForm() {
  showAddTask.value = false
  editingTask.value = null
}

async function onToggleTask(task: Task) {
  if (!token.value) return
  try {
    const res = await student.toggleTask(task.ID, !task.Enabled)
    if (res.success) {
      show(task.Enabled ? '任务已暂停' : '任务已启用', 'success')
      fetchTaskList()
    } else {
      show(sanitizeMessage(res.message) || '操作失败', 'error')
    }
  } catch (err: any) {
    show(sanitizeMessage(err.message) || '操作失败', 'error')
  }
}

async function onDeleteTask(taskID: number) {
  if (!token.value) return
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

async function onConfirmToggle(task: Task) {
  if (!confirmRef.value) return
  const confirmed = await confirmRef.value.open(task.Enabled ? '确定要暂停该任务吗？' : '确定要启用该任务吗？')
  if (confirmed) onToggleTask(task)
}

async function onConfirmDelete(taskID: number) {
  if (!confirmRef.value) return
  const confirmed = await confirmRef.value.open('确定要删除该任务吗？')
  if (confirmed) onDeleteTask(taskID)
}

function formatTimeHHmm(datetimeStr: string) {
  if (!datetimeStr) return ''
  const match = datetimeStr.match(/\d{2}:\d{2}/)
  return match ? match[0] : datetimeStr
}

function formatAddress(address: string) {
  return address.replace(/^四川省泸州市/, '')
}

function statusText(task: Task) {
  if (!task.Enabled) return '已暂停'
  if (task.ExecStatus === 'success') return '成功'
  if (task.ExecStatus === 'failed') return '失败'
  return '待执行'
}

function statusClass(task: Task) {
  if (!task.Enabled) return 'bg-slate-200 text-slate-700'
  if (task.ExecStatus === 'success') return 'bg-emerald-100 text-emerald-700'
  if (task.ExecStatus === 'failed') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

function studentTip(task: Task) {
  return `学号：${task.StuID}${task.NotifyEmail ? `，通知邮箱：${task.NotifyEmail}` : '，未设置通知邮箱'}`
}

onMounted(() => {
  if (token.value) fetchTaskList()
})
</script>
