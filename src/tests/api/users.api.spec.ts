import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiClient from '@/api/client'
import { usersApi } from '@/api/users'
import type { UserRequest, UserResponse } from '@/types'

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

const mockUser: UserResponse = {
  id: 1,
  user_name: 'jean.dupont',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  role: 'ROLE_USER',
  last_activity_at: '2026-03-30 19:53:52.402'
}

const mockUserRequest: UserRequest = {
  user_name: 'jean.dupont',
  email: 'jean.dupont@example.com',
  phone: '+33612345678',
  password: 'S3cur3P@ss!',
  role: 'ROLE_USER',
}

const mockUserList: Record<string, unknown>[] = [
  { id: 1, user_name: 'jean.dupont', email: 'jean.dupont@example.com', _links: {} },
  { id: 2, user_name: 'marie.martin', email: 'marie.martin@example.com', _links: {} },
]

// ─── Setup ───────────────────────────────────────────────────────────────────

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(apiClient)
})

afterEach(() => {
  mock.reset()
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('usersApi', () => {

  // ── GET /users/users-list ──────────────────────────────────────────────────

  describe('getAll()', () => {
    it('retourne la liste complète des utilisateurs (200)', async () => {
      mock.onGet('/users/users-list').reply(200, mockUserList)

      const response = await usersApi.getAll()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(2)
      expect(response.data[0]).toMatchObject({ id: 1, user_name: 'jean.dupont' })
    })

    it('retourne un tableau vide si aucun utilisateur (200)', async () => {
      mock.onGet('/users/users-list').reply(200, [])

      const response = await usersApi.getAll()

      expect(response.status).toBe(200)
      expect(response.data).toEqual([])
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onGet('/users/users-list').reply(401)

      await expect(usersApi.getAll()).rejects.toThrow()
    })

    it('lève une erreur 403 si droits insuffisants', async () => {
      mock.onGet('/users/users-list').reply(403)

      await expect(usersApi.getAll()).rejects.toThrow()
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onGet('/users/users-list').reply(500)

      await expect(usersApi.getAll()).rejects.toThrow()
    })
  })

  // ── GET /users/filter-users-list ──────────────────────────────────────────

  describe('getAllUserRole()', () => {
    it('retourne uniquement les utilisateurs avec ROLE_USER (200)', async () => {
      const roleUserList = [mockUserList[0]]
      mock.onGet('/users/filter-users-list').reply(200, roleUserList)

      const response = await usersApi.getAllUserRole()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(1)
    })

    it('retourne un tableau vide si aucun ROLE_USER (200)', async () => {
      mock.onGet('/users/filter-users-list').reply(200, [])

      const response = await usersApi.getAllUserRole()

      expect(response.data).toEqual([])
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onGet('/users/filter-users-list').reply(401)

      await expect(usersApi.getAllUserRole()).rejects.toThrow()
    })

    it('lève une erreur 403 si droits insuffisants', async () => {
      mock.onGet('/users/filter-users-list').reply(403)

      await expect(usersApi.getAllUserRole()).rejects.toThrow()
    })
  })

  // ── GET /users/profil?id= ─────────────────────────────────────────────────

  describe('getById(id)', () => {
    it('retourne le profil utilisateur pour un id valide (200)', async () => {
      mock.onGet('/users/profil', { params: { id: 1 } }).reply(200, mockUser)

      const response = await usersApi.getById(1)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, user_name: 'jean.dupont' })
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onGet('/users/profil').reply((config) => {
        capturedParams = config.params
        return [200, mockUser]
      })

      await usersApi.getById(42)

      expect(capturedParams).toEqual({ id: 42 })
    })

    it('lève une erreur 404 si utilisateur introuvable', async () => {
      mock.onGet('/users/profil', { params: { id: 9999 } }).reply(404)

      await expect(usersApi.getById(9999)).rejects.toThrow()
    })

    it('lève une erreur 400 si id invalide (0 ou négatif)', async () => {
      mock.onGet('/users/profil', { params: { id: -1 } }).reply(400)

      await expect(usersApi.getById(-1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onGet('/users/profil').reply(401)

      await expect(usersApi.getById(1)).rejects.toThrow()
    })
  })

  // ── POST /users/create-user ───────────────────────────────────────────────

  describe('create(data)', () => {
    it('crée un utilisateur et retourne la réponse (201)', async () => {
      mock.onPost('/users/create-user').reply(201, mockUser)

      const response = await usersApi.create(mockUserRequest)

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ user_name: 'jean.dupont' })
    })

    it('envoie le body complet de la requête', async () => {
      let capturedBody: unknown = null
      mock.onPost('/users/create-user').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [201, mockUser]
      })

      await usersApi.create(mockUserRequest)

      expect(capturedBody).toMatchObject({
        user_name: 'jean.dupont',
        email: 'jean.dupont@example.com',
      })
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPost('/users/create-user').reply(400, {
        message: 'Validation failed',
        errors: { email: 'Email invalide' },
      })

      await expect(usersApi.create({ ...mockUserRequest, email: 'not-an-email' })).rejects.toThrow()
    })

    it('lève une erreur 409 si email déjà existant', async () => {
      mock.onPost('/users/create-user').reply(409, { message: 'Email already exists' })

      await expect(usersApi.create(mockUserRequest)).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé à créer', async () => {
      mock.onPost('/users/create-user').reply(403)

      await expect(usersApi.create(mockUserRequest)).rejects.toThrow()
    })
  })

  // ── DELETE /users/delete?id= ──────────────────────────────────────────────

  describe('deleteById(id)', () => {
    it('supprime un utilisateur et retourne 204', async () => {
      mock.onDelete('/users/delete', { params: { id: 1 } }).reply(204)

      const response = await usersApi.deleteById(1)

      expect(response.status).toBe(204)
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onDelete('/users/delete').reply((config) => {
        capturedParams = config.params
        return [204]
      })

      await usersApi.deleteById(7)

      expect(capturedParams).toEqual({ id: 7 })
    })

    it('lève une erreur 404 si utilisateur introuvable', async () => {
      mock.onDelete('/users/delete', { params: { id: 9999 } }).reply(404)

      await expect(usersApi.deleteById(9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé à supprimer', async () => {
      mock.onDelete('/users/delete').reply(403)

      await expect(usersApi.deleteById(1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onDelete('/users/delete').reply(401)

      await expect(usersApi.deleteById(1)).rejects.toThrow()
    })
  })

  // ── PATCH /users/admin?id= ────────────────────────────────────────────────

  describe('patchByAdmin(id, data)', () => {
    it('met à jour partiellement un utilisateur (200)', async () => {
      const patch = { email: 'nouveau@example.com' }
      const updated = { ...mockUser, email: 'nouveau@example.com' }
      mock.onPatch('/users/admin', patch).reply(200, updated)

      const response = await usersApi.patchByAdmin(1, patch)

      expect(response.status).toBe(200)
      expect(response.data.email).toBe('nouveau@example.com')
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPatch('/users/admin').reply((config) => {
        capturedParams = config.params
        return [200, mockUser]
      })

      await usersApi.patchByAdmin(5, { user_name: 'newname' })

      expect(capturedParams).toEqual({ id: 5 })
    })

    it('met à jour uniquement user_name', async () => {
      let capturedBody: unknown = null
      mock.onPatch('/users/admin').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, { ...mockUser, user_name: 'nouveau_nom' }]
      })

      await usersApi.patchByAdmin(1, { user_name: 'nouveau_nom' })

      expect(capturedBody).toEqual({ user_name: 'nouveau_nom' })
    })

    it('met à jour uniquement phone', async () => {
      let capturedBody: unknown = null
      mock.onPatch('/users/admin').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, { ...mockUser, phone: '+33699000000' }]
      })

      await usersApi.patchByAdmin(1, { phone: '+33699000000' })

      expect(capturedBody).toEqual({ phone: '+33699000000' })
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPatch('/users/admin').reply(403)

      await expect(usersApi.patchByAdmin(1, { email: 'x@x.com' })).rejects.toThrow()
    })

    it('lève une erreur 404 si utilisateur introuvable', async () => {
      mock.onPatch('/users/admin').reply(404)

      await expect(usersApi.patchByAdmin(9999, { email: 'x@x.com' })).rejects.toThrow()
    })

    it('lève une erreur 400 si données invalides', async () => {
      mock.onPatch('/users/admin').reply(400, { message: 'Invalid email format' })

      await expect(usersApi.patchByAdmin(1, { email: 'not-valid' })).rejects.toThrow()
    })
  })

  // ── PUT /users ────────────────────────────────────────────────────────────

  describe('update(id, data)', () => {
    const fullUpdate: Pick<UserResponse, 'user_name' | 'email' | 'phone'> = {
      user_name: 'jean.modifie',
      email: 'jean.modifie@example.com',
      phone: '+33611111111',
    }

    it('remplace complètement un utilisateur (200)', async () => {
      const updated = { ...mockUser, ...fullUpdate }
      mock.onPut('/users').reply(200, updated)

      const response = await usersApi.update(1, fullUpdate)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject(fullUpdate)
    })

    it('envoie les trois champs obligatoires dans le body', async () => {
      let capturedBody: unknown = null
      mock.onPut('/users').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, { ...mockUser, ...fullUpdate }]
      })

      await usersApi.update(1, fullUpdate)

      expect(capturedBody).toMatchObject({
        user_name: 'jean.modifie',
        email: 'jean.modifie@example.com',
        phone: '+33611111111',
      })
    })

    it('lève une erreur 400 si un champ est manquant', async () => {
      mock.onPut('/users').reply(400, { message: 'All fields are required' })

      // @ts-expect-error test volontaire de payload incomplet
      await expect(usersApi.update(1, { user_name: 'only-name' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé', async () => {
      mock.onPut('/users').reply(403)

      await expect(usersApi.update(1, fullUpdate)).rejects.toThrow()
    })

    it('lève une erreur 404 si utilisateur introuvable', async () => {
      mock.onPut('/users').reply(404)

      await expect(usersApi.update(9999, fullUpdate)).rejects.toThrow()
    })

    it('lève une erreur 409 si email déjà utilisé par un autre compte', async () => {
      mock.onPut('/users').reply(409, { message: 'Email conflict' })

      await expect(usersApi.update(1, { ...fullUpdate, email: 'taken@example.com' })).rejects.toThrow()
    })
  })

})