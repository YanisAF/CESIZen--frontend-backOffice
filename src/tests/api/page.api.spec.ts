import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiClient from '@/api/client'
import { pagesApi } from '@/api/pages'
import type { PageRequest, PageResponse, CategoryResponse } from '@/types'

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

const mockCategory: CategoryResponse = {
  id: 1,
  name: 'Bien-être',
}

const mockPageRequest: PageRequest = {
  title: 'Ma page de test',
  content: [
    { name: 'Section 1', description: 'Description 1', itemUrl: 'https://example.com/1' },
    { name: 'Section 2', description: 'Description 2', itemUrl: 'https://example.com/2' },
  ],
  category: 1,
}

const mockPageResponse: PageResponse = {
  id: 1,
  title: 'Ma page de test',
  content: [
    { name: 'Section 1', description: 'Description 1', itemUrl: 'https://example.com/1' },
    { name: 'Section 2', description: 'Description 2', itemUrl: 'https://example.com/2' },
  ],
  imageUrl: 'https://example.com/image.jpg',
  category: mockCategory,
}

const mockPageList: Record<string, unknown>[] = [
  { id: 1, title: 'Ma page de test', category: mockCategory, _links: {} },
  { id: 2, title: 'Une autre page', category: mockCategory, _links: {} },
]

const mockCategoryList: CategoryResponse[] = [
  { id: 1, name: 'Bien-être' },
  { id: 2, name: 'Nutrition' },
  { id: 3, name: 'Sport' },
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

describe('pagesApi', () => {

  // ── GET /page/get-all-pages ────────────────────────────────────────────────

  describe('getAll()', () => {
    it('retourne la liste complète des pages (200)', async () => {
      mock.onGet('/page/get-all-pages').reply(200, mockPageList)

      const response = await pagesApi.getAll()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(2)
      expect(response.data[0]).toMatchObject({ id: 1, title: 'Ma page de test' })
    })

    it('retourne un tableau vide si aucune page (200)', async () => {
      mock.onGet('/page/get-all-pages').reply(200, [])

      const response = await pagesApi.getAll()

      expect(response.status).toBe(200)
      expect(response.data).toEqual([])
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onGet('/page/get-all-pages').reply(500)

      await expect(pagesApi.getAll()).rejects.toThrow()
    })

    it('lève une erreur réseau si le serveur ne répond pas', async () => {
      mock.onGet('/page/get-all-pages').networkError()

      await expect(pagesApi.getAll()).rejects.toThrow()
    })
  })

  // ── GET /page/get-page?id= ─────────────────────────────────────────────────

  describe('getById(id)', () => {
    it('retourne une page pour un id valide (200)', async () => {
      mock.onGet('/page/get-page', { params: { id: 1 } }).reply(200, mockPageResponse)

      const response = await pagesApi.getById(1)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, title: 'Ma page de test' })
    })

    it('retourne le contenu et la catégorie associés', async () => {
      mock.onGet('/page/get-page', { params: { id: 1 } }).reply(200, mockPageResponse)

      const response = await pagesApi.getById(1)

      expect(response.data.content).toHaveLength(2)
      expect(response.data.category).toMatchObject({ id: 1, name: 'Bien-être' })
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onGet('/page/get-page').reply((config) => {
        capturedParams = config.params
        return [200, mockPageResponse]
      })

      await pagesApi.getById(42)

      expect(capturedParams).toEqual({ id: 42 })
    })

    it('retourne imageUrl null si pas d\'image', async () => {
      const pageWithoutImage = { ...mockPageResponse, imageUrl: null }
      mock.onGet('/page/get-page', { params: { id: 2 } }).reply(200, pageWithoutImage)

      const response = await pagesApi.getById(2)

      expect(response.data.imageUrl).toBeNull()
    })

    it('lève une erreur 404 si page introuvable', async () => {
      mock.onGet('/page/get-page', { params: { id: 9999 } }).reply(404)

      await expect(pagesApi.getById(9999)).rejects.toThrow()
    })

    it('lève une erreur 400 si id invalide', async () => {
      mock.onGet('/page/get-page', { params: { id: -1 } }).reply(400)

      await expect(pagesApi.getById(-1)).rejects.toThrow()
    })
  })

  // ── POST /page/create-page ─────────────────────────────────────────────────

  describe('create(data, image?)', () => {
    it('crée une page sans image et retourne 201', async () => {
      mock.onPost('/page/create-page').reply(201)

      const response = await pagesApi.create(mockPageRequest)

      expect(response.status).toBe(201)
    })

    it('crée une page avec une image et retourne 201', async () => {
      const fakeImage = new File(['image-content'], 'photo.jpg', { type: 'image/jpeg' })
      mock.onPost('/page/create-page').reply(201)

      const response = await pagesApi.create(mockPageRequest, fakeImage)

      expect(response.status).toBe(201)
    })

    it('envoie un FormData avec le champ page en JSON', async () => {
      let capturedData: unknown = null
      mock.onPost('/page/create-page').reply((config) => {
        capturedData = config.data
        return [201]
      })

      await pagesApi.create(mockPageRequest)

      expect(capturedData).toBeInstanceOf(FormData)
      expect((capturedData as FormData).has('page')).toBe(true)
    })

    it('envoie un FormData avec le champ image si fournie', async () => {
      const fakeImage = new File(['image-content'], 'photo.jpg', { type: 'image/jpeg' })
      let capturedData: unknown = null
      mock.onPost('/page/create-page').reply((config) => {
        capturedData = config.data
        return [201]
      })

      await pagesApi.create(mockPageRequest, fakeImage)

      expect((capturedData as FormData).has('image')).toBe(true)
    })

    it('n\'envoie pas le champ image si non fournie', async () => {
      let capturedData: unknown = null
      mock.onPost('/page/create-page').reply((config) => {
        capturedData = config.data
        return [201]
      })

      await pagesApi.create(mockPageRequest)

      expect((capturedData as FormData).has('image')).toBe(false)
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPost('/page/create-page').reply(400, { message: 'Validation failed' })

      await expect(pagesApi.create({ ...mockPageRequest, title: '' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé', async () => {
      mock.onPost('/page/create-page').reply(403)

      await expect(pagesApi.create(mockPageRequest)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onPost('/page/create-page').reply(401)

      await expect(pagesApi.create(mockPageRequest)).rejects.toThrow()
    })
  })

  // ── PUT /page/update-page?id= ──────────────────────────────────────────────

  describe('update(id, data, image?)', () => {
    it('met à jour une page sans image et retourne 200', async () => {
      mock.onPut('/page/update-page').reply(200, mockPageResponse)

      const response = await pagesApi.update(1, mockPageRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, title: 'Ma page de test' })
    })

    it('met à jour une page avec une image et retourne 200', async () => {
      const fakeImage = new File(['image-content'], 'photo.jpg', { type: 'image/jpeg' })
      mock.onPut('/page/update-page').reply(200, mockPageResponse)

      const response = await pagesApi.update(1, mockPageRequest, fakeImage)

      expect(response.status).toBe(200)
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPut('/page/update-page').reply((config) => {
        capturedParams = config.params
        return [200, mockPageResponse]
      })

      await pagesApi.update(7, mockPageRequest)

      expect(capturedParams).toEqual({ id: 7 })
    })

    it('envoie un FormData avec le champ page en JSON', async () => {
      let capturedData: unknown = null
      mock.onPut('/page/update-page').reply((config) => {
        capturedData = config.data
        return [200, mockPageResponse]
      })

      await pagesApi.update(1, mockPageRequest)

      expect(capturedData).toBeInstanceOf(FormData)
      expect((capturedData as FormData).has('page')).toBe(true)
    })

    it('lève une erreur 404 si page introuvable', async () => {
      mock.onPut('/page/update-page').reply(404)

      await expect(pagesApi.update(9999, mockPageRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si les données sont invalides', async () => {
      mock.onPut('/page/update-page').reply(400, { message: 'Validation failed' })

      await expect(pagesApi.update(1, { ...mockPageRequest, title: '' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé', async () => {
      mock.onPut('/page/update-page').reply(403)

      await expect(pagesApi.update(1, mockPageRequest)).rejects.toThrow()
    })
  })

  // ── DELETE /page/delete-page?id= ───────────────────────────────────────────

  describe('deleteById(id)', () => {
    it('supprime une page et retourne 204', async () => {
      mock.onDelete('/page/delete-page', { params: { id: 1 } }).reply(204)

      const response = await pagesApi.deleteById(1)

      expect(response.status).toBe(204)
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onDelete('/page/delete-page').reply((config) => {
        capturedParams = config.params
        return [204]
      })

      await pagesApi.deleteById(5)

      expect(capturedParams).toEqual({ id: 5 })
    })

    it('lève une erreur 404 si page introuvable', async () => {
      mock.onDelete('/page/delete-page', { params: { id: 9999 } }).reply(404)

      await expect(pagesApi.deleteById(9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé', async () => {
      mock.onDelete('/page/delete-page').reply(403)

      await expect(pagesApi.deleteById(1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onDelete('/page/delete-page').reply(401)

      await expect(pagesApi.deleteById(1)).rejects.toThrow()
    })
  })

  // ── GET /categories ────────────────────────────────────────────────────────

  describe('getCategories()', () => {
    it('retourne la liste des catégories (200)', async () => {
      mock.onGet('/categories').reply(200, mockCategoryList)

      const response = await pagesApi.getCategories()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(3)
      expect(response.data[0]).toMatchObject({ id: 1, name: 'Bien-être' })
    })

    it('retourne un tableau vide si aucune catégorie (200)', async () => {
      mock.onGet('/categories').reply(200, [])

      const response = await pagesApi.getCategories()

      expect(response.data).toEqual([])
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onGet('/categories').reply(500)

      await expect(pagesApi.getCategories()).rejects.toThrow()
    })

    it('lève une erreur réseau si le serveur ne répond pas', async () => {
      mock.onGet('/categories').networkError()

      await expect(pagesApi.getCategories()).rejects.toThrow()
    })
  })

})