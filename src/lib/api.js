import axios from 'axios'

console.log('VITE_API_URL=', import.meta.env.VITE_API_URL)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sg_token')
      localStorage.removeItem('sg_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
