import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiClient from '@/api/client'
import { resetApi } from '@/api/reset'
import type { ResetRequest, VerifyPinRequest, ResetPasswordRequest, JwtResponse } from '@/types'

// ─── Mock APIs navigateur (localStorage + window.location) ───────────────────

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
}

Object.defineProperty(globalThis, 'window', {
  value: { location: { href: '' } },
  writable: true,
})

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockResetByEmail: ResetRequest = {
  identifier: 'jean.dupont@example.com',
  channel: 'email',
}

const mockResetBySms: ResetRequest = {
  identifier: '+33612345678',
  channel: 'sms',
}

const mockVerifyPinRequest: VerifyPinRequest = {
  identifier: 'jean.dupont@example.com',
  pin: '123456',
}

const mockResetPasswordByEmail: ResetPasswordRequest = {
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
  newPassword: 'N0uv3auP@ss!',
  channel: 'email',
}

const mockResetPasswordBySms: ResetPasswordRequest = {
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
  newPassword: 'N0uv3auP@ss!',
  channel: 'sms',
}

const mockJwtResponse: JwtResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock',
}

// ─── Setup ───────────────────────────────────────────────────────────────────

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(apiClient)
})

afterEach(() => {
  mock.reset()
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('resetApi', () => {

  // ── POST /request-password ─────────────────────────────────────────────────

  describe('requestReset(data)', () => {
    it('envoie une demande de reset par email (200)', async () => {
      mock.onPost('/request-password').reply(200)

      const response = await resetApi.requestReset(mockResetByEmail)

      expect(response.status).toBe(200)
    })

    it('envoie une demande de reset par sms (200)', async () => {
      mock.onPost('/request-password').reply(200)

      const response = await resetApi.requestReset(mockResetBySms)

      expect(response.status).toBe(200)
    })

    it('envoie le body avec identifier et channel email', async () => {
      let capturedBody: unknown = null
      mock.onPost('/request-password').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200]
      })

      await resetApi.requestReset(mockResetByEmail)

      expect(capturedBody).toMatchObject({
        identifier: 'jean.dupont@example.com',
        channel: 'email',
      })
    })

    it('envoie le body avec identifier et channel sms', async () => {
      let capturedBody: unknown = null
      mock.onPost('/request-password').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200]
      })

      await resetApi.requestReset(mockResetBySms)

      expect(capturedBody).toMatchObject({
        identifier: '+33612345678',
        channel: 'sms',
      })
    })

    it('lève une erreur 404 si identifiant introuvable', async () => {
      mock.onPost('/request-password').reply(404, { message: 'User not found' })

      await expect(resetApi.requestReset({ identifier: 'inconnu@x.com', channel: 'email' })).rejects.toThrow()
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPost('/request-password').reply(400, { message: 'Validation failed' })

      await expect(resetApi.requestReset({ identifier: '', channel: 'email' })).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onPost('/request-password').reply(500)

      await expect(resetApi.requestReset(mockResetByEmail)).rejects.toThrow()
    })

    it('lève une erreur réseau si le serveur ne répond pas', async () => {
      mock.onPost('/request-password').networkError()

      await expect(resetApi.requestReset(mockResetByEmail)).rejects.toThrow()
    })
  })

  // ── POST /verify-pin ───────────────────────────────────────────────────────

  describe('verifyPin(data)', () => {
    it('vérifie le pin et retourne un token JWT (200)', async () => {
      mock.onPost('/verify-pin').reply(200, mockJwtResponse)

      const response = await resetApi.verifyPin(mockVerifyPinRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ token: expect.any(String) })
    })

    it('envoie le body avec identifier et pin', async () => {
      let capturedBody: unknown = null
      mock.onPost('/verify-pin').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockJwtResponse]
      })

      await resetApi.verifyPin(mockVerifyPinRequest)

      expect(capturedBody).toMatchObject({
        identifier: 'jean.dupont@example.com',
        pin: '123456',
      })
    })

    it('retourne un token non vide', async () => {
      mock.onPost('/verify-pin').reply(200, mockJwtResponse)

      const response = await resetApi.verifyPin(mockVerifyPinRequest)

      expect(response.data.token).toBeTruthy()
    })

    it('lève une erreur 400 si le pin est invalide ou expiré', async () => {
      mock.onPost('/verify-pin').reply(400, { message: 'Invalid or expired pin' })

      await expect(resetApi.verifyPin({ identifier: 'jean.dupont@example.com', pin: '000000' })).rejects.toThrow()
    })

    it('lève une erreur 404 si identifiant introuvable', async () => {
      mock.onPost('/verify-pin').reply(404, { message: 'User not found' })

      await expect(resetApi.verifyPin({ identifier: 'inconnu@x.com', pin: '123456' })).rejects.toThrow()
    })

    it('lève une erreur 429 si trop de tentatives', async () => {
      mock.onPost('/verify-pin').reply(429, { message: 'Too many attempts' })

      await expect(resetApi.verifyPin(mockVerifyPinRequest)).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onPost('/verify-pin').reply(500)

      await expect(resetApi.verifyPin(mockVerifyPinRequest)).rejects.toThrow()
    })
  })

  // ── POST /reset-password ───────────────────────────────────────────────────

  describe('resetPassword(data)', () => {
    it('réinitialise le mot de passe par email (200)', async () => {
      mock.onPost('/reset-password').reply(200)

      const response = await resetApi.resetPassword(mockResetPasswordByEmail)

      expect(response.status).toBe(200)
    })

    it('réinitialise le mot de passe par sms (200)', async () => {
      mock.onPost('/reset-password').reply(200)

      const response = await resetApi.resetPassword(mockResetPasswordBySms)

      expect(response.status).toBe(200)
    })

    it('envoie le body avec jwt, newPassword et channel email', async () => {
      let capturedBody: unknown = null
      mock.onPost('/reset-password').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200]
      })

      await resetApi.resetPassword(mockResetPasswordByEmail)

      expect(capturedBody).toMatchObject({
        jwt: mockResetPasswordByEmail.jwt,
        newPassword: 'N0uv3auP@ss!',
        channel: 'email',
      })
    })

    it('envoie le body avec channel sms', async () => {
      let capturedBody: unknown = null
      mock.onPost('/reset-password').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200]
      })

      await resetApi.resetPassword(mockResetPasswordBySms)

      expect(capturedBody).toMatchObject({ channel: 'sms' })
    })

    it('lève une erreur 400 si le jwt est invalide ou expiré', async () => {
      mock.onPost('/reset-password').reply(400, { message: 'Invalid or expired token' })

      await expect(resetApi.resetPassword({ ...mockResetPasswordByEmail, jwt: 'invalid' })).rejects.toThrow()
    })

    it('lève une erreur 400 si le mot de passe ne respecte pas les règles', async () => {
      mock.onPost('/reset-password').reply(400, { message: 'Password too weak' })

      await expect(resetApi.resetPassword({ ...mockResetPasswordByEmail, newPassword: '123' })).rejects.toThrow()
    })

    it('lève une erreur 401 si le token est refusé', async () => {
      mock.onPost('/reset-password').reply(401, { message: 'Unauthorized' })

      await expect(resetApi.resetPassword(mockResetPasswordByEmail)).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onPost('/reset-password').reply(500)

      await expect(resetApi.resetPassword(mockResetPasswordByEmail)).rejects.toThrow()
    })
  })

})