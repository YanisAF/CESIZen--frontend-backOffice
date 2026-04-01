import { defineStore } from 'pinia'
import { usersApi } from '@/api/users'
import type { UserRequest, UserResponse, PaginationState } from '@/types'

// Spring HATEOAS EntityModel.of(user) sérialise UserDtoResponse à plat :
// les champs id, user_name, email, phone, role, last_activity_at sont à la racine,
// avec _links en supplément. Pas de champ "content" wrapper.
function unwrapUser(item: Record<string, unknown>): UserResponse {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _links, ...user } = item
  return user as unknown as UserResponse
}

interface UsersState {
  users: UserResponse[]
  selectedUser: UserResponse | null
  loading: boolean
  error: string | null
  pagination: PaginationState
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
    pagination: { currentPage: 1, perPage: 10 }
  }),
  
  getters: {
    paginatedUsers(state): UserResponse[] {
      const start = (state.pagination.currentPage - 1) * state.pagination.perPage
      return state.users.slice(start, start + state.pagination.perPage)
    },
    
    totalPages(state): number {
      return Math.ceil(state.users.length / state.pagination.perPage)
    }
  },
  
  actions: {
    async fetchAll() {
      this.loading = true; this.error = null
      try {
        const { data } = await usersApi.getAll()
        this.users = (data as unknown as Record<string, unknown>[]).map(unwrapUser)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erreur chargement utilisateurs'
      } finally { this.loading = false }
    },
    
    async fetchById(id: number) {
      this.loading = true; this.error = null
      try {
        const { data } = await usersApi.getById(id)
        this.selectedUser = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Utilisateur introuvable'
      } finally { this.loading = false }
    },
    
    async create(payload: UserRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await usersApi.create(payload)
        this.users.unshift(data)
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erreur création utilisateur'
        throw err
      } finally { this.loading = false }
    },
    
    // PATCH — champs partiels
    async patchUser(id: number, payload: Record<string, string>) {
      this.loading = true
      try {
        const { data } = await usersApi.patchByAdmin(id, payload)
        if (this.selectedUser?.id === id) this.selectedUser = data
      } finally {
        this.loading = false
      }
    },
    
    // PUT — tous les champs
    async updateUser(id: number, payload: { user_name: string; email: string; phone: string }) {
      this.loading = true
      try {
        const { data } = await usersApi.update(id, payload)
        if (this.selectedUser?.id === id) this.selectedUser = data
      } finally {
        this.loading = false
      }
    },
    
    async deleteById(id: number) {
      this.loading = true; this.error = null
      try {
        await usersApi.deleteById(id)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erreur suppression'
        throw err
      } finally { this.loading = false }
    },
    
    setPage(page: number) {
      this.pagination.currentPage = page
    },
    
    setPerPage(n: 10 | 20 | 50) {
      this.pagination.perPage = n
      this.pagination.currentPage = 1
    }
  }
})
