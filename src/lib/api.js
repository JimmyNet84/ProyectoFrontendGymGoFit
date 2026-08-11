import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://proyectobackendgymgofit.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('fitgo-auth')
  if (auth) {
    const parsed = JSON.parse(auth)
    if (parsed?.token) {
      config.headers.Authorization = `Bearer ${parsed.token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      localStorage.removeItem('fitgo-auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
