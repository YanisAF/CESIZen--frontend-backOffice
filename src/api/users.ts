import apiClient from './client'
import type { UserRequest, UserResponse } from '@/types'

export const usersApi = {
  // GET /api/v1/users/users-list — retourne EntityModel<UserDtoResponse>[]
  getAll() {
    return apiClient.get<Record<string, unknown>[]>('/users/users-list')
  },
  
  // GET /api/v1/users/filter-users-list — uniquement ROLE_USER
  getAllUserRole() {
    return apiClient.get<Record<string, unknown>[]>('/users/filter-users-list')
  },
  
  // GET /api/v1/users/profil?id=
  getById(id: number) {
    return apiClient.get<UserResponse>('/users/profil', { params: { id } })
  },
  
  // POST /api/v1/users/create-user
  create(data: UserRequest) {
    return apiClient.post<UserResponse>('/users/create-user', data)
  },
  
  // DELETE /api/v1/users/delete?id=
  deleteById(id: number) {
    return apiClient.delete<void>('/users/delete', { params: { id } })
  },
  
  // PATCH /api/v1/users/admin — modification par un admin sur n'importe quel user
  patchByAdmin(id: number, data: Partial<Pick<UserResponse, 'user_name' | 'email' | 'phone'>>) {
    return apiClient.patch<UserResponse>('/users/admin', data, { params: { id } })
  },
  
  // PUT /api/v1/users/{id} — remplacement complet (tous les champs)
  update(id: number, data: Pick<UserResponse, 'user_name' | 'email' | 'phone'>) {
    return apiClient.put<UserResponse>(`/users`, data)
  }
}
