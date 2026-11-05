import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sg_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // No hacer logout automático aquí - dejaremos que la aplicación
      // maneje el session_expired gracefully mediante permisosStore
      // console.error('Auth 401 - letting app handle it:', err.response?.data || err.message);
    }

    return Promise.reject(err)
  }
)

export default api