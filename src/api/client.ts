import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' }
})

// Attache le token JWT à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cesizen_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirige vers /login sur 401
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cesizen_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
