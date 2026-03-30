import apiClient from './client'
import type { ResetRequest, VerifyPinRequest, ResetPasswordRequest, JwtResponse } from '@/types'

export const resetApi = {
  // POST /api/v1/request-password — body: { identifier, channel }
  requestReset(data: ResetRequest) {
    return apiClient.post<void>('/request-password', data)
  },

  // POST /api/v1/verify-pin — body: { identifier, pin } → retourne { token }
  verifyPin(data: VerifyPinRequest) {
    return apiClient.post<JwtResponse>('/verify-pin', data)
  },

  // POST /api/v1/reset-password — body: { jwt, newPassword, channel }
  resetPassword(data: ResetPasswordRequest) {
    return apiClient.post<void>('/reset-password', data)
  }
}
