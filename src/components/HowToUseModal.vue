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
          <div class="flex justify-between items-center mb-4">
            <h2 id="modal-title" class="text-2xl font-bold text-gray-800">
              使用指南
            </h2>
            <button @click="close" class="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
          </div>

          <div class="space-y-6 text-gray-700 leading-relaxed text-[15px]">
            <div>
              <h3 class="font-semibold text-lg mb-1">1. 如何使用本平台？</h3>
              <p>
                请先在本平台注册并登录。登录后，您需要绑定学生账号，然后在任务管理页面添加签到任务。请确保地址与时间设置正确，提交成功后，系统将每天定时执行任务，您无需手动操作，任务将自动托管运行。
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-1">2. 使用平台有什么限制？</h3>
              <p>
                本平台具有一定的公益性。注册用户默认为“普通用户”，可绑定最多 <strong>2 名学生</strong> 并管理其任务。若需绑定更多学生，可通过赞助获取赞助码并激活升级为“赞助用户”，最高支持绑定 <strong>12 名学生</strong>。
              </p>
              <p class="mt-2 text-sm text-gray-500">
                （为什么不无限开放：为了防止有人恶意滥用平台资源进行商业牟利，同时服务器、验证码识别、邮件等服务均需实际成本，我们希望维护平台公平性与可持续性。）
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-1">3. 如何绑定学生？</h3>
              <p>
                平台已对接微学工系统。一般情况下，学生账号为学号，初始密码为 <code>学号@swmu.cn</code>。如密码已修改，请登录
                <a
                  href="http://plat.swmu.edu.cn/Authentication/?returnUrl=http://me.swmu.edu.cn/"
                  class="text-indigo-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  微学工平台
                </a>
                获取或重设密码。
              </p>
              <p class="mt-2 text-sm text-gray-500">
                （提醒：若微学工密码更改，需在本平台解绑该学生并重新绑定，否则任务将无法正常执行。）
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-1">4. 如何修改已有任务？</h3>
              <p>
                无需删除旧任务，直接重新提交即可。对于同一学生同一活动，系统会自动覆盖旧设置，确保操作简洁高效。
              </p>
            </div>

            <div>
              <h3 class="font-semibold text-lg mb-1">5. 我的数据安全吗？</h3>
              <p>
                用户登录密码采用 Hash 加密存储，开发者无法获取原始密码，确保账户安全。但绑定微学工账号所用密码需以明文存储，用于与其平台兼容的 RSA 加密流程。我们承诺仅在为用户提供服务的前提下处理这类信息，敬请知悉。如不同意此项操作，建议勿绑定学生账号。
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
