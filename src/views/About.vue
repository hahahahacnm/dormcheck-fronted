<template>
  <main class="p-10 bg-gradient-to-b from-blue-50 to-white min-h-[80vh] max-w-3xl mx-auto">
    <section class="bg-white p-10 rounded-2xl shadow-xl space-y-12 border border-blue-100">
      <!-- 标题 -->
      <h1 class="text-4xl font-extrabold text-blue-700 border-b-4 border-blue-400 pb-3 inline-block">
        DormCheck 项目介绍
      </h1>

      <!-- 关于项目 -->
      <section class="space-y-4 text-gray-800 leading-relaxed">
        <p>
          DormCheck 是一款专为健忘学生打造的自动化系统，旨在简化繁琐的日常打卡流程，帮助学生专注真正重要的事情。
        </p>
        <p>
          它以轻量、高效、可拓展为设计理念，持续优化用户体验与运行稳定性。我们希望通过这个工具，为校园生活带来一点点便捷与轻松。
        </p>
        <p>
          感谢所有提出建议、反馈 bug 或默默使用的你，是你们让这个项目持续前行 ❤️。
        </p>

        <!-- 使用说明按钮 -->
        <div class="text-center mt-6">
          <button
            @click="showModal = true"
            class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow font-medium transition"
          >
            📖 查看平台使用说明
          </button>
        </div>
      </section>

      <!-- 关于作者 -->
      <section class="flex items-center gap-6">
        <img
          src="https://q1.qlogo.cn/g?b=qq&nk=2219911811&s=640"
          alt="作者头像"
          class="w-24 h-24 rounded-full shadow-md border-4 border-blue-300"
        />
        <div>
          <h2 class="text-3xl font-semibold text-blue-600 mb-2">关于作者</h2>
          <p class="text-gray-700 leading-relaxed max-w-lg">
            我是一名临床医学生，业余热爱开发，是个不务正业的全栈小工程师 🧪💻。
            喜欢用技术解决身边的小问题，也乐于将实用工具开放出来与大家共享。
          </p>
        </div>
      </section>

      <!-- 赞助说明 -->
      <section>
        <h2 class="text-3xl font-semibold text-blue-600 mb-4">关于赞助</h2>
        <div class="space-y-4 text-gray-700 leading-relaxed">
          <p>
            本站坚持 <span class="font-bold text-blue-700">开源、自由、无广告</span> 原则。你可以自由获取源代码，修改后部署，免费使用，无任何强制限制。
          </p>
          <p>
            默认注册为 <strong>普通用户</strong>（支持 <strong>2 名学生</strong> 绑定）。若使用 <strong>赞助码</strong> 成为
            <span class="text-red-600 font-semibold">赞助用户</span>，可绑定 <strong>12 名学生</strong>，一次赞助，终生使用！
          </p>
          <p>
            项目服务器运行、邮件接口、高德SDK、带宽等都有一定成本。如果你愿意支持我一杯咖啡 ☕，这将成为我继续维护优化项目的动力！
          </p>
          <p class="text-sm text-gray-600 italic">
            如果你暂时不愿或无法赞助，也完全没关系，免费功能一样能满足基础使用需求。
            希望 DormCheck 是你顺手的好帮手。
          </p>
        </div>

        <!-- 打赏二维码 -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
          <div>
            <p class="text-gray-700 mb-2">❤️ 微信赞赏码</p>
            <img :src="wechatQr" alt="微信赞赏码" class="w-40 h-40 mx-auto rounded border shadow" />
          </div>
          <div>
            <p class="text-gray-700 mb-2">💙 支付宝赞赏码</p>
            <img :src="alipayQr" alt="支付宝赞赏码" class="w-40 h-40 mx-auto rounded border shadow" />
          </div>
        </div>
      </section>

      <!-- 联系方式 -->
      <section>
        <h2 class="text-3xl font-semibold text-blue-600 mb-6">联系作者</h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
          <li>
            <a href="https://afdian.com/a/kiki_666" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 bg-blue-100 hover:bg-blue-200 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white" v-html="icons.aifadian"></span>
              <span class="font-medium text-blue-800">爱发电</span>
            </a>
          </li>
          <li>
            <a href="https://v.douyin.com/YjXYVEGxbvQ/" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 bg-pink-100 hover:bg-pink-200 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white" v-html="icons.douyin"></span>
              <span class="font-medium text-pink-700">抖音</span>
            </a>
          </li>
          <li>
            <a href="mailto:2219911811@qq.com"
              class="flex items-center gap-4 bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-700 text-white" v-html="icons.email"></span>
              <span class="font-medium">个人邮箱</span>
            </a>
          </li>
          <li>
            <a href="https://github.com/hahahahacnm" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 bg-gray-800 hover:bg-gray-900 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black" v-html="icons.github"></span>
              <span class="font-medium text-white">GitHub</span>
            </a>
          </li>
          <li>
            <a href="https://qm.qq.com/q/peTIxwBd0k" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 bg-blue-200 hover:bg-blue-300 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white" v-html="icons.qqgroup"></span>
              <span class="font-medium text-blue-900">QQ群</span>
            </a>
          </li>
          <li>
            <a href="https://68n.cn/F4CTT" target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 bg-green-100 hover:bg-green-200 rounded-lg px-4 py-3 transition shadow">
              <span class="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white" v-html="icons.qianxun"></span>
              <span class="font-medium text-green-800">千寻寄售平台</span>
            </a>
          </li>
        </ul>
      </section>
    </section>

    <!-- 使用说明弹窗组件 -->
    <HowToUseModal :visible="showModal" @close="showModal = false" />

    <!-- Toast 弹窗容器 -->
    <ToastContainer ref="toastRef" />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToastContainer from '../components/ToastContainer.vue'
import HowToUseModal from '../components/HowToUseModal.vue'
import { setToastRef } from '../composables/useToast'

// 控制弹窗
const showModal = ref(false)
const toastRef = ref<InstanceType<typeof ToastContainer> | null>(null)
setToastRef(toastRef)

// 二维码图片地址（请放置于 public/images 目录）
const wechatQr = '/wechat-qrcode.png'
const alipayQr = '/alipay-qrcode.jpg'

// 联系方式图标
const icons = {
  aifadian: `<svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6"><path d="M12 2L15 8H9L12 2zM5 8h14l-7 14-7-14z"/></svg>`,
  douyin: `<svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6"><path d="M12 2v16a6 6 0 1 0 0-12z"/></svg>`,
  email: `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" class="w-6 h-6"><path d="M4 4h16v16H4z"/><polyline points="4,4 12,13 20,4"/></svg>`,
  github: `<svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6"><path d="M12 2C6.5 2 2 6.5 2 12a10 10 0 006.8 9.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.3-3.4-1.3-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.3 1.8 1.3 1 .1 1.5.7 1.7 1.1a1.3 1.3 0 0 0 .9 0c.2-.4.7-1 1.7-1.1 0 0 .6-1.2 1.8-1.3 0 0 1.1 0 .1.7 0 0-.8.4-1.3 1.7 0 0-.6 1.9-3.4 1.3v2c0 .3.2.6.7.5A10 10 0 0 0 22 12c0-5.5-4.5-10-10-10z"/></svg>`,
  qqgroup: `<svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Q</text></svg>`,
  qianxun: `<svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14.5h-2v-2h2v2zm0-4h-2V7h2v5.5z"/></svg>`,
}
</script>
