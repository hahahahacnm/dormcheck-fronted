<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-20 right-6 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-5 w-[320px] z-50 text-sm text-gray-700 border border-gray-200 ring-1 ring-indigo-100"
    >
      <!-- 标题栏 -->
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-2 text-indigo-600 font-semibold text-base">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          仪表盘
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition text-base leading-none"
        >
          ✕
        </button>
      </div>

      <!-- 内容区 -->
      <ul class="space-y-6">
        <!-- 稳定运行时间 -->
        <li class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">本站已稳定运行</span>
          <span class="text-indigo-700 font-semibold text-sm">{{ uptime }}</span>
        </li>

        <!-- 冷知识 -->
        <li class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">开发冷知识</span>
          <span class="text-green-600 font-medium text-sm">{{ funFact }}</span>
        </li>

        <!-- 使用注意事项 -->
        <li class="flex flex-col gap-1">
          <span class="text-xs text-gray-500">使用注意事项</span>
          <ul class="list-disc pl-4 space-y-1 text-gray-800 text-sm">
            <li>微学工平台修改密码后需重新绑定。</li>
            <li>同一学生的同一任务再次添加将自动覆盖。</li>
          </ul>
        </li>
      </ul>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineProps<{
  visible: boolean
  uptime: string
}>()

defineEmits(['close'])

const funFact = ref('')

// 冷知识池
const facts = [
  'Fiber 是 Go 写的高性能 Web 框架 🦫',
  'Tailwind 的优先级靠类名顺序控制 🧩',
  'JWT 是一种无状态认证机制 🔐',
  'Vue3 支持 Composition API 🌿，灵活又简洁',
  '前端地图推荐用高德 SDK，性能优秀 📍',
  'Vue 的响应式原理是基于 Proxy 实现的 🔍',
  'SQLite 是一个嵌入式数据库，整个数据库就是一个文件 📄',
  'Tailwind 是 utility-first 的 CSS 框架，命名即样式 🎨',
  '浏览器的本地存储 localStorage 只能存字符串 🗂️',
  'Go 的协程 goroutine 非常轻量，适合并发任务 💨',
  'Fiber 的底层依赖 Fasthttp，比 net/http 更快 🚀',
  'HTML 中的 <button> 默认类型是 submit，要小心表单行为 🧷',
  'Node.js 是单线程的，但 I/O 是异步非阻塞的 🌐',
  'Vite 利用了原生 ES Module 和浏览器缓存，极快 ⚡',
  'JWT Token 可以被前端解析，请勿存放敏感信息 🔑',
  'Tailwind 的 JIT 编译可以显著减少最终 CSS 大小 🧬',
  '一个 Vue 组件的生命周期包括 setup、mounted、updated 等 ⏳',
  '使用 composition API 的好处是逻辑更可组合 🔧',
  'base64 编码的数据比原始数据大约多 33% 🧠',
  '前端跨域问题可用 CORS 解决，记得带上 credentials 🎫',
]

function getRandom(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

onMounted(() => {
  funFact.value = getRandom(facts)
  setInterval(() => {
    funFact.value = getRandom(facts)
  }, 15000) // 每 15 秒更新
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
