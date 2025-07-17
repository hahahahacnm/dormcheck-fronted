import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// 页面组件
const Dashboard = () => import('../views/Dashboard.vue')
const StudentBind = () => import('../views/StudentBind.vue')
const Tasks = () => import('../views/Tasks.vue')
const About = () => import('../views/About.vue')
const NotFound = () => import('../views/NotFound.vue') // 👉 新增 404 页面

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: Dashboard },           // 首页仪表盘
      { path: 'student-bind', component: StudentBind },
      { path: 'tasks', component: Tasks },
      { path: 'about', component: About },
      { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }, // 👈 捕获所有未匹配路由
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
