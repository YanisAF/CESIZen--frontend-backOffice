import apiClient from './client'
import type { LoginRequest, UserRequest, JwtResponse } from '@/types'

export const authApi = {
  // POST /api/v1/auth/login — body: { identifier, password }
  login(data: LoginRequest) {
    return apiClient.post<JwtResponse>('/auth/login', data)
  },

  // POST /api/v1/auth/register
  register(data: UserRequest) {
    return apiClient.post<JwtResponse>('/auth/register', data)
  },

  // POST /api/v1/auth/register-admin
  registerAdmin(data: UserRequest) {
    return apiClient.post<JwtResponse>('/auth/register-admin', data)
  },

  // GET /api/v1/auth/backend-up
  checkBackend() {
    return apiClient.get('/auth/backend-up')
  }
}
