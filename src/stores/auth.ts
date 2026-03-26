import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import type { LoginRequest, UserRequest, Role } from '@/types'

interface AuthState {
  token: string | null
  loading: boolean
  error: string | null
}

function decodePayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('cesizen_token'),
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,

    currentRole: (state): Role | null => {
      if (!state.token) return null
      const p = decodePayload(state.token)
      // Spring Security met le rôle dans "role" ou "authorities"
      const raw = (p.role ?? p.authorities?.[0] ?? null) as string | null
      return raw as Role | null
    },

    isAdmin(): boolean {
      return this.currentRole === 'ROLE_ADMIN'
    },

    isUser(): boolean {
      return this.currentRole === 'ROLE_USER'
    },

    // ⚠️ Le JWT Spring ne contient PAS d'userId — sub = username/email, role = liste
    // L'ID est résolu côté ProfileView via la liste des utilisateurs
    currentUserId: (_state): number | null => null,

    currentUsername: (state): string => {
      if (!state.token) return ''
      const p = decodePayload(state.token)
      // sub = username ou email selon ce que Spring Security utilise comme identifier
      return (p.sub ?? p.username ?? '') as string
    },

    // Le "sub" du JWT = l'identifier Spring Security (email ou userName selon CustomUserDetailsService)
    currentSub: (state): string => {
      if (!state.token) return ''
      const p = decodePayload(state.token)
      return (p.sub ?? '') as string
    },

    // role est stocké en liste dans le JWT : ["ROLE_ADMIN"] ou ["ROLE_USER"]
    currentRole: (state): Role | null => {
      if (!state.token) return null
      const p = decodePayload(state.token)
      // Spring Security génère claims.role = ["ROLE_ADMIN"]
      const roles = p.role as string[] | string | null
      if (Array.isArray(roles)) return (roles[0] ?? null) as Role | null
      return (roles ?? null) as Role | null
    }
  },

  actions: {
    async login(credentials: LoginRequest) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authApi.login(credentials)
        this.token = data.token
        localStorage.setItem('cesizen_token', data.token)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Identifiants invalides'
        throw err
      } finally {
        this.loading = false
      }
    },

    async register(payload: UserRequest) {
      this.loading = true
      this.error = null
      try {
        const { data } = await authApi.register(payload)
        this.token = data.token
        localStorage.setItem('cesizen_token', data.token)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur inscription'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      localStorage.removeItem('cesizen_token')
    }
  }
})
