import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiClient from '@/api/client'
import { authApi } from '@/api/auth'
import type { LoginRequest, UserRequest, JwtResponse } from '@/types'

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

const mockLoginRequest: LoginRequest = {
  identifier: 'jean.dupont@example.com',
  password: 'S3cur3P@ss!',
}

const mockLoginByUsernameRequest: LoginRequest = {
  identifier: 'jean.dupont',
  password: 'S3cur3P@ss!',
}

const mockUserRequest: UserRequest = {
  user_name: 'jean.dupont',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  password: 'S3cur3P@ss!',
  role: 'ROLE_USER',
}

const mockAdminRequest: UserRequest = {
  user_name: 'admin.dupont',
  email: 'admin.dupont@example.com',
  phone: '+33612345679',
  password: 'Adm1nP@ss!',
  role: 'ROLE_ADMIN',
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

describe('authApi', () => {

  // ── POST /auth/login ───────────────────────────────────────────────────────

  describe('login(data)', () => {
    it('retourne un token JWT avec un email valide (200)', async () => {
      mock.onPost('/auth/login').reply(200, mockJwtResponse)

      const response = await authApi.login(mockLoginRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ token: expect.any(String) })
    })

    it('retourne un token JWT avec un username valide (200)', async () => {
      mock.onPost('/auth/login').reply(200, mockJwtResponse)

      const response = await authApi.login(mockLoginByUsernameRequest)

      expect(response.status).toBe(200)
      expect(response.data.token).toBeTruthy()
    })

    it('envoie le body avec identifier et password', async () => {
      let capturedBody: unknown = null
      mock.onPost('/auth/login').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockJwtResponse]
      })

      await authApi.login(mockLoginRequest)

      expect(capturedBody).toMatchObject({
        identifier: 'jean.dupont@example.com',
        password: 'S3cur3P@ss!',
      })
    })

    it('lève une erreur 401 si identifiants incorrects', async () => {
      mock.onPost('/auth/login').reply(401, { message: 'Bad credentials' })

      await expect(authApi.login({ identifier: 'wrong@x.com', password: 'wrong' })).rejects.toThrow()
    })

    it('lève une erreur 400 si le body est invalide', async () => {
      mock.onPost('/auth/login').reply(400, { message: 'Validation failed' })

      await expect(authApi.login({ identifier: '', password: '' })).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onPost('/auth/login').reply(500)

      await expect(authApi.login(mockLoginRequest)).rejects.toThrow()
    })
  })

  // ── POST /auth/register ────────────────────────────────────────────────────

  describe('register(data)', () => {
    it('crée un utilisateur et retourne un token JWT (201)', async () => {
      mock.onPost('/auth/register').reply(201, mockJwtResponse)

      const response = await authApi.register(mockUserRequest)

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ token: expect.any(String) })
    })

    it('envoie le body complet de la requête', async () => {
      let capturedBody: unknown = null
      mock.onPost('/auth/register').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [201, mockJwtResponse]
      })

      await authApi.register(mockUserRequest)

      expect(capturedBody).toMatchObject({
        user_name: 'jean.dupont',
        email: 'jean.dupont@example.com',
        password: 'S3cur3P@ss!',
      })
    })

    it('fonctionne sans phone ni role (champs optionnels)', async () => {
      const minimal: UserRequest = {
        user_name: 'minimal',
        email: 'minimal@example.com',
        password: 'P@ss!',
      }
      mock.onPost('/auth/register').reply(201, mockJwtResponse)

      const response = await authApi.register(minimal)

      expect(response.status).toBe(201)
    })

    it('lève une erreur 409 si email déjà utilisé', async () => {
      mock.onPost('/auth/register').reply(409, { message: 'Email already exists' })

      await expect(authApi.register(mockUserRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPost('/auth/register').reply(400, { message: 'Validation failed' })

      await expect(authApi.register({ ...mockUserRequest, email: 'not-an-email' })).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onPost('/auth/register').reply(500)

      await expect(authApi.register(mockUserRequest)).rejects.toThrow()
    })
  })

  // ── POST /auth/register-admin ──────────────────────────────────────────────

  describe('registerAdmin(data)', () => {
    it('crée un admin et retourne un token JWT (201)', async () => {
      mock.onPost('/auth/register-admin').reply(201, mockJwtResponse)

      const response = await authApi.registerAdmin(mockAdminRequest)

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ token: expect.any(String) })
    })

    it('envoie le body avec le rôle admin', async () => {
      let capturedBody: unknown = null
      mock.onPost('/auth/register-admin').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [201, mockJwtResponse]
      })

      await authApi.registerAdmin(mockAdminRequest)

      expect(capturedBody).toMatchObject({
        user_name: 'admin.dupont',
        email: 'admin.dupont@example.com',
        role: 'ROLE_ADMIN',
      })
    })

    it('lève une erreur 403 si non autorisé à créer un admin', async () => {
      mock.onPost('/auth/register-admin').reply(403)

      await expect(authApi.registerAdmin(mockAdminRequest)).rejects.toThrow()
    })

    it('lève une erreur 409 si email déjà utilisé', async () => {
      mock.onPost('/auth/register-admin').reply(409, { message: 'Email already exists' })

      await expect(authApi.registerAdmin(mockAdminRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPost('/auth/register-admin').reply(400, { message: 'Validation failed' })

      await expect(authApi.registerAdmin({ ...mockAdminRequest, email: 'not-an-email' })).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onPost('/auth/register-admin').reply(401)

      await expect(authApi.registerAdmin(mockAdminRequest)).rejects.toThrow()
    })
  })

  // ── GET /auth/backend-up ───────────────────────────────────────────────────

  describe('checkBackend()', () => {
    it('retourne 200 si le backend est disponible', async () => {
      mock.onGet('/auth/backend-up').reply(200)

      const response = await authApi.checkBackend()

      expect(response.status).toBe(200)
    })

    it('lève une erreur 503 si le backend est indisponible', async () => {
      mock.onGet('/auth/backend-up').reply(503)

      await expect(authApi.checkBackend()).rejects.toThrow()
    })

    it('lève une erreur réseau si le serveur ne répond pas', async () => {
      mock.onGet('/auth/backend-up').networkError()

      await expect(authApi.checkBackend()).rejects.toThrow()
    })
  })

})