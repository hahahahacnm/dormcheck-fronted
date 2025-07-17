<template>
  <div
    class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-0 relative max-h-[85vh] flex flex-col"
      style="font-size: 0.85rem;"
    >
      <!-- 标题栏 -->
      <header
        id="modal-title"
        class="text-2xl font-semibold border-b border-gray-300 p-6 sticky top-0 bg-white z-20 flex justify-between items-center"
      >
        添加签到任务
        <button
          @click="$emit('close')"
          type="button"
          aria-label="关闭弹窗"
          class="close-btn text-gray-500 hover:text-black text-2xl font-bold leading-none select-none focus:outline-none"
        >
          ×
        </button>
      </header>

      <!-- 内容区域 -->
      <div class="overflow-auto p-6 flex-1">
        <form @submit.prevent="onSubmit" class="space-y-5">
          <!-- 学生选择 -->
          <div>
            <label class="block mb-1 font-medium" for="stu_id">学生账号</label>
            <select
              id="stu_id"
              v-model="form.stu_id"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
              @change="onStudentChange(form.stu_id)"
              required
            >
              <option value="" disabled>请选择学生账号</option>
              <option v-for="stu in studentList" :key="stu.stuId" :value="stu.stuId">
                {{ stu.stuId }}（{{ stu.name }}）
              </option>
            </select>
          </div>

          <!-- 活动选择 -->
          <div>
            <label class="block mb-1 font-medium" for="activity_id">活动</label>
            <select
              id="activity_id"
              v-model="form.activity_id"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
              :disabled="!form.stu_id || loadingActivities"
              required
            >
              <option value="" disabled>请选择活动</option>
              <option v-for="act in activityList" :key="act.id" :value="act.id">
                {{ act.name }}
              </option>
            </select>
          </div>

          <!-- 地图选择 -->
          <div>
            <label class="block mb-1 font-medium">搜索签到地点</label>
            <MapContainer @update="onMapUpdate" />
          </div>

          <!-- 地址信息 -->
          <div>
            <label class="block mb-1 font-medium" for="address">签到地址</label>
            <input
              id="address"
              v-model="form.address"
              type="text"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
              readonly
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium" for="longitude">经度</label>
              <input
                id="longitude"
                v-model.number="form.longitude"
                type="number"
                class="w-full px-3 py-1.5 border rounded-md text-sm"
                readonly
                required
              />
            </div>
            <div>
              <label class="block mb-1 font-medium" for="latitude">纬度</label>
              <input
                id="latitude"
                v-model.number="form.latitude"
                type="number"
                class="w-full px-3 py-1.5 border rounded-md text-sm"
                readonly
                required
              />
            </div>
          </div>

          <!-- 签到时间与重试次数 -->
          <div>
            <label class="block mb-1 font-medium" for="sign_time">签到时间 (HH:mm)</label>
            <input
              id="sign_time"
              v-model="form.sign_time"
              type="time"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
              required
            />
          </div>

          <div>
            <label class="block mb-1 font-medium" for="max_retry">最大重试次数</label>
            <input
              id="max_retry"
              v-model.number="form.max_retry"
              type="number"
              min="1"
              max="5"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
              required
            />
          </div>

          <!-- ✅ 通知邮箱 -->
          <div>
            <label class="block mb-1 font-medium" for="notify_email">通知邮箱（可选）</label>
            <input
              id="notify_email"
              v-model="form.notify_email"
              type="email"
              placeholder="填写后将每日发送签到结果通知"
              class="w-full px-3 py-1.5 border rounded-md text-sm"
            />
          </div>

          <!-- 提交按钮 -->
          <div class="text-right">
            <button
              type="submit"
              :disabled="loading"
              class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition duration-150"
            >
              {{ loading ? '提交中...' : '提交任务' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { student } from '../api/student'
import { useUser } from '../composables/useUser'
import { useToast } from '../composables/useToast'
import MapContainer from './MapContainer.vue'

const emit = defineEmits(['close', 'task-added'])
const { token } = useUser()
const { show } = useToast()

const form = reactive({
  stu_id: '',
  activity_id: '',
  address: '',
  longitude: 0,
  latitude: 0,
  sign_time: '',
  max_retry: 1,
  notify_email: '', // ✅ 新增字段
})

const studentList = ref<{ stuId: string; name: string }[]>([])
const activityList = ref<{ id: number | string; name: string }[]>([])
const loading = ref(false)
const loadingActivities = ref(false)

onMounted(() => {
  fetchStudentList()
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

async function onStudentChange(stu_id: string) {
  if (!token.value) return
  loadingActivities.value = true
  try {
    const res = await student.getActivities(token.value, stu_id)
    if (res.success) activityList.value = res.data || []
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

  if (
    !form.stu_id ||
    !form.activity_id ||
    !form.address ||
    !form.sign_time ||
    form.longitude === 0 ||
    form.latitude === 0
  ) {
    show('请填写完整信息并选择地图上的签到地址', 'error')
    return
  }

  // ✅ 可选邮箱校验
  if (form.notify_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.notify_email)) {
    show('请输入有效的邮箱地址', 'error')
    return
  }

  // 获取学生姓名和活动名称
  const selectedStudent = studentList.value.find(s => s.stuId === form.stu_id)
  const selectedActivity = activityList.value.find(a => String(a.id) === String(form.activity_id))
  const studentName = selectedStudent?.name || ''
  const activityName = selectedActivity?.name || ''

  loading.value = true
  try {
    const res = await student.createTask(token.value, {
      ...form,
      activity_id: String(form.activity_id),
      name: studentName,
      activity_name: activityName,
    })
    if (res.success) {
      show('任务添加成功', 'success')
      emit('task-added')
      emit('close')
    } else {
      show(res.message || '任务添加失败', 'error')
    }
  } catch (e: any) {
    show(e.message || '任务添加失败', 'error')
  } finally {
    loading.value = false
  }
}

function onMapUpdate(data: { lng: number; lat: number; address: string }) {
  form.longitude = data.lng
  form.latitude = data.lat
  form.address = data.address
}
</script>

<style scoped>
.close-btn {
  cursor: pointer;
  background: transparent;
  border: none;
  line-height: 1;
  transition: color 0.2s ease-in-out;
  user-select: none;
}
.close-btn:hover {
  color: #111827;
}
</style>
