import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '这里指向你的后端地址！（自定义）'

const instance = axios.create({
  baseURL: API_BASE,
})

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('dormcheck_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance
