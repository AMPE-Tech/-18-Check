import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.18check.online/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't retry refresh or login/register requests
    const url = error.config?.url || ''
    if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const token = localStorage.getItem('token')
      if (!token) {
        return Promise.reject(error)
      }
      try {
        const { data: res } = await api.post('/auth/refresh')
        const payload = res.data || res
        localStorage.setItem('token', payload.token)
        error.config.headers.Authorization = `Bearer ${payload.token}`
        return api(error.config)
      } catch {
        localStorage.removeItem('token')
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
