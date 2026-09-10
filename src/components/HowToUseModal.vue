<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 space-y-6">
          <!-- 标题 -->
          <div class="flex justify-between items-center mb-4">
            <h2 id="modal-title" class="text-2xl font-bold text-gray-800">
              使用指南（更新时间：2025年9月）
            </h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>

          <div class="space-y-6 text-gray-700 leading-relaxed text-[15px]">
            <!-- 1. 使用平台步骤 -->
            <div>
              <h3 class="font-semibold text-lg mb-1">1. 如何使用本平台？</h3>
              <p>
                请先在本平台注册并登录。登录后，需要绑定学生账号，然后在任务管理页面添加签到任务。确保地址与时间设置正确，提交成功后，系统将每天定时执行任务，无需手动操作。
              </p>
            </div>

            <!-- 2. 使用限制 -->
            <div>
              <h3 class="font-semibold text-lg mb-1">2. 使用平台有什么限制？</h3>
              <p>
                平台为公益性项目，注册用户默认为“普通用户”，可绑定最多 <strong>2 名学生</strong> 并管理任务。若需绑定更多学生，可通过赞助获取赞助码升级为“赞助用户”，最高可绑定 <strong>12 名学生</strong>。
              </p>
              <p class="mt-2 text-sm text-gray-500">
                （限制原因：防止滥用资源，保障服务器、验证码识别、邮件等服务的可持续性与公平性。）
              </p>
            </div>

            <!-- 3. 学生账号绑定 -->
            <div>
              <h3 class="font-semibold text-lg mb-1">3. 如何绑定学生账号？</h3>
              <p>
                平台已对接微学工系统。近期为保证账号安全，微学工平台已重置所有学生密码。
              </p>
              <p>
                <span class="font-semibold text-red-600">新的初始密码：</span>
                <span class="font-bold text-indigo-700">身份证号后六位@swmu.cn</span>
              </p>
              <p>
                ⚠️ 若使用该初始密码直接向微学工平台发起请求，会提示“密码过于简单”，登录等同失败。
              </p>
              <p class="mt-2">
                正确操作顺序：
                <ol class="list-decimal list-inside ml-4 space-y-1 mt-1">
                  <li>先在
                    <a
                      href="http://plat.swmu.edu.cn/Authentication/?returnUrl=http://me.swmu.edu.cn/"
                      class="text-blue-600 font-semibold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      学工一体化平台
                    </a>
                    使用初始密码登录并按平台提示修改为自己合格的新密码
                  </li>
                  <li>回到
                    <a
                      href="https://dc.kikirepository.cn/student-bind/"
                      class="text-blue-600 font-semibold hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      DormCheck
                    </a>
                    使用合格的新密码发起学号绑定</li>
                </ol>
              </p>
              <p class="text-gray-500 text-xs mt-1">
                建议使用电脑端或手机浏览器桌面模式操作
              </p>
            </div>

            <!-- 4. 修改任务 -->
            <div>
              <h3 class="font-semibold text-lg mb-1">4. 如何修改已有任务？</h3>
              <p>
                无需删除旧任务，直接重新提交即可。系统会自动覆盖同一学生同一活动的旧设置，确保操作简洁高效。
              </p>
            </div>

            <!-- 5. 数据安全 -->
            <div>
              <h3 class="font-semibold text-lg mb-1">5. 我的数据安全吗？</h3>
              <p>
                用户登录密码采用 Hash 加密存储，开发者无法获取原始密码，确保账户安全。绑定微学工账号密码需明文存储，用于兼容 RSA 加密流程，仅在提供服务时处理。不同意此操作，请勿绑定学生账号。
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
