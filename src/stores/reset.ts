import { defineStore } from 'pinia'
import { resetApi } from '@/api/reset'
import type { ResetRequest, VerifyPinRequest, ResetPasswordRequest } from '@/types'

interface ResetState {
  // Données conservées entre les 3 étapes
  identifier: string
  channel: 'email' | 'sms' | ''
  resetJwt: string   // JWT renvoyé par verify-pin, utilisé pour reset-password
  loading: boolean
  error: string | null
  step: 1 | 2 | 3   // 1=choix canal, 2=vérif PIN, 3=nouveau mdp
}

export const useResetStore = defineStore('reset', {
  state: (): ResetState => ({
    identifier: '',
    channel: '',
    resetJwt: '',
    loading: false,
    error: null,
    step: 1
  }),

  actions: {
    // Étape 1 — POST /api/v1/request-password
    async requestReset(data: ResetRequest) {
      this.loading = true; this.error = null
      try {
        await resetApi.requestReset(data)
        this.identifier = data.identifier
        this.channel = data.channel
        this.step = 2
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur lors de la demande'
        throw err
      } finally { this.loading = false }
    },

    // Étape 2 — POST /api/v1/verify-pin → reçoit { token }
    async verifyPin(data: VerifyPinRequest) {
      this.loading = true; this.error = null
      try {
        const { data: response } = await resetApi.verifyPin(data)
        this.resetJwt = response.token
        this.step = 3
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Code PIN invalide'
        throw err
      } finally { this.loading = false }
    },

    // Étape 3 — POST /api/v1/reset-password
    async resetPassword(newPassword: string) {
      this.loading = true; this.error = null
      try {
        const payload: ResetPasswordRequest = {
          jwt: this.resetJwt,
          newPassword,
          channel: this.channel as 'email' | 'sms'
        }
        await resetApi.resetPassword(payload)
        this.$reset()
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur lors du reset'
        throw err
      } finally { this.loading = false }
    },

    clearError() { this.error = null }
  }
})
