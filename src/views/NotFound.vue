<!-- src/views/NotFound.vue -->
<template>
  <main class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white text-gray-700 px-4">
    <h1 class="text-7xl font-extrabold text-indigo-600 mb-4">404</h1>
    <p class="text-2xl font-semibold mb-2">页面未找到</p>
    <p class="text-gray-500 mb-6">您访问的页面不存在或已被删除。</p>
    <RouterLink
      to="/"
      class="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
    >
      返回首页
    </RouterLink>
  </main>
</template>
