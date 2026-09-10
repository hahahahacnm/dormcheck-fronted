// composables/useUser.ts
import { ref, computed } from 'vue'

const token = ref<string | null>(localStorage.getItem('dormcheck_token'))
const userName = ref<string>('未登录的用户：游客')
const userEmail = ref<string>('') // 👈 新增 email 状态

const isLoggedIn = computed(() => !!token.value)

function setUser(newToken: string, newUserName: string, newUserEmail: string = '') {
  token.value = newToken
  userName.value = newUserName
  userEmail.value = newUserEmail
  localStorage.setItem('dormcheck_token', newToken)
}


function clearUser() {
  token.value = null
  userName.value = '未登录的用户：游客'
  userEmail.value = ''
  localStorage.removeItem('dormcheck_token')
}

export function useUser() {
  return { token, userName, userEmail, isLoggedIn, setUser, clearUser }
  
}
