<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="flex max-h-[96vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-lg">
      <header class="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div>
          <h2 id="modal-title" class="text-lg font-semibold text-slate-900 sm:text-xl">{{ formTitle }}</h2>
          <p class="mt-0.5 text-xs text-slate-500">确认信息无误后保存即可</p>
        </div>
        <button
          @click="$emit('close')"
          type="button"
          aria-label="关闭弹窗"
          class="grid h-9 w-9 place-items-center rounded-full text-2xl leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          ×
        </button>
      </header>

      <div class="flex-1 overflow-auto px-4 py-5 sm:px-6">
        <form @submit.prevent="onSubmit" class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="stu_id">学生账号</label>
              <select
                id="stu_id"
                v-model="form.stu_id"
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                @change="onStudentChange(form.stu_id, true)"
                required
              >
                <option value="" disabled>请选择学生账号</option>
                <option v-for="stu in studentList" :key="stu.stuId" :value="stu.stuId">
                  {{ stu.stuId }}（{{ stu.name }}）
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="activity_id">签到活动</label>
              <select
                id="activity_id"
                v-model="form.activity_id"
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                :disabled="!form.stu_id || loadingActivities"
                required
              >
                <option value="" disabled>{{ loadingActivities ? '活动加载中...' : '请选择活动' }}</option>
                <option v-for="act in activityList" :key="act.id" :value="act.id">
                  {{ act.name }}
                </option>
              </select>
            </div>
          </div>

          <MapContainer :initial-location="initialLocation" @update="onMapUpdate" />

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="address">签到地址</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              readonly
              required
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="longitude">经度</label>
              <input
                id="longitude"
                v-model.number="form.longitude"
                type="number"
                class="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                readonly
                required
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="latitude">纬度</label>
              <input
                id="latitude"
                v-model.number="form.latitude"
                type="number"
                class="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                readonly
                required
              />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="sign_time">签到时间</label>
              <input
                id="sign_time"
                v-model="form.sign_time"
                type="time"
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700" for="max_retry">最大重试次数</label>
              <input
                id="max_retry"
                v-model.number="form.max_retry"
                type="number"
                min="3"
                max="5"
                class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                required
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700" for="notify_email">通知邮箱</label>
            <input
              id="notify_email"
              v-model="form.notify_email"
              type="email"
              placeholder="可选，用于接收签到结果"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div class="sticky bottom-0 -mx-4 border-t border-slate-200 bg-white px-4 py-4 sm:-mx-6 sm:px-6">
            <button
              type="submit"
              :disabled="loading"
              class="w-full rounded-md bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {{ loading ? '提交中...' : submitText }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { student } from '../api/student'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
import MapContainer from './MapContainer.vue'

interface EditableTask {
  ID: number
  StuID: string
  Name: string
  ActivityID: string
  ActivityName: string
  Address: string
  Longitude: number
  Latitude: number
  SignTime: string
  MaxRetry: number
  NotifyEmail?: string
}

const props = defineProps<{
  visible?: boolean
  editTask?: EditableTask | null
}>()

const emit = defineEmits(['close', 'task-added'])
const { token } = useUser()
const { show } = useToast()

const form = reactive({
  stu_id: props.editTask?.StuID || '',
  activity_id: props.editTask?.ActivityID || '',
  address: props.editTask?.Address || '',
  longitude: props.editTask?.Longitude || 0,
  latitude: props.editTask?.Latitude || 0,
  sign_time: formatTimeHHmm(props.editTask?.SignTime || ''),
  max_retry: props.editTask?.MaxRetry || 3,
  notify_email: props.editTask?.NotifyEmail || '',
})

const studentList = ref<{ stuId: string; name: string }[]>([])
const activityList = ref<{ id: number | string; name: string }[]>([])
const loading = ref(false)
const loadingActivities = ref(false)
const formTitle = computed(() => (props.editTask ? '修改签到任务' : '添加签到任务'))
const submitText = computed(() => (props.editTask ? '保存修改' : '提交任务'))
const initialLocation = computed(() => ({
  lng: form.longitude,
  lat: form.latitude,
  address: form.address,
}))

onMounted(async () => {
  await fetchStudentList()
  if (form.stu_id) {
    await onStudentChange(form.stu_id, false)
  }
})

async function fetchStudentList() {
  if (!token.value) return
  try {
    const res = await student.getBoundStudents()
    if (res.success) studentList.value = res.data || []
  } catch {
    show('获取绑定学生失败', 'error')
  }
}

async function onStudentChange(stu_id: string, resetActivity = false) {
  if (!token.value) return
  if (resetActivity) {
    form.activity_id = ''
  }
  loadingActivities.value = true
  try {
    const res = await student.getActivities(token.value, stu_id)
    if (res.success) {
      activityList.value = res.data || []
      if (props.editTask && form.activity_id && !activityList.value.some(a => String(a.id) === String(form.activity_id))) {
        activityList.value.unshift({ id: form.activity_id, name: props.editTask.ActivityName })
      }
    }
  } catch {
    show('获取活动失败', 'error')
  } finally {
    loadingActivities.value = false
  }
}

async function onSubmit() {
  if (!token.value) {
    show('请先登录', 'error')
    return
  }

  if (!form.stu_id || !form.activity_id || !form.address || !form.sign_time || form.longitude === 0 || form.latitude === 0) {
    show('请补全任务信息', 'error')
    return
  }

  if (form.notify_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.notify_email)) {
    show('请输入有效的邮箱地址', 'error')
    return
  }

  const selectedStudent = studentList.value.find(s => s.stuId === form.stu_id)
  const selectedActivity = activityList.value.find(a => String(a.id) === String(form.activity_id))
  const studentName = selectedStudent?.name || props.editTask?.Name || ''
  const activityName = selectedActivity?.name || props.editTask?.ActivityName || ''

  loading.value = true
  try {
    const payload = {
      ...form,
      activity_id: String(form.activity_id),
      name: studentName,
      activity_name: activityName,
    }

    const res = props.editTask
      ? await student.updateTask({ ...payload, task_id: props.editTask.ID })
      : await student.createTask(token.value, payload)

    if (res.success) {
      show(props.editTask ? '任务修改成功' : '任务添加成功', 'success')
      emit('task-added')
      emit('close')
    } else {
      show(res.message || '任务保存失败', 'error')
    }
  } catch (e: any) {
    show(e.message || '任务保存失败', 'error')
  } finally {
    loading.value = false
  }
}

function onMapUpdate(data: { lng: number; lat: number; address: string }) {
  form.longitude = data.lng
  form.latitude = data.lat
  form.address = data.address
}

function formatTimeHHmm(datetimeStr: string) {
  if (!datetimeStr) return ''
  const match = datetimeStr.match(/\d{2}:\d{2}/)
  return match ? match[0] : datetimeStr
}
</script>
