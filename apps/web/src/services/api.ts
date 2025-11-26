import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Calculator API
export const calculatorApi = {
  calculate: (items: unknown[]) => api.post('/calculator/calculate', { items }),
  getTemplates: () => api.get('/calculator/templates'),
  saveEstimate: (estimate: unknown) => api.post('/calculator/estimates', estimate),
}

// Projects API
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (project: unknown) => api.post('/projects', project),
  update: (id: string, project: unknown) => api.put(`/projects/${id}`, project),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// Clients API
export const clientsApi = {
  getAll: () => api.get('/clients'),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (client: unknown) => api.post('/clients', client),
  update: (id: string, client: unknown) => api.put(`/clients/${id}`, client),
  delete: (id: string) => api.delete(`/clients/${id}`),
}

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/'
  },
}
