import { defineStore } from 'pinia'
import { pagesApi } from '@/api/pages'
import type { PageRequest, PageResponse, CategoryResponse } from '@/types'

// Spring HATEOAS EntityModel.of(page) sérialise les champs de PageDtoResponse
// DIRECTEMENT à la racine du JSON — il n'y a PAS de champ "content" wrapper.
// Le seul ajout est "_links" à la racine.
// Structure réelle reçue :
// {
//   "id": 1,
//   "title": "...",
//   "content": [...],   ← c'est le contenu de la PAGE, pas un wrapper HATEOAS
//   "imageUrl": "...",
//   "category": {...},
//   "_links": { ... }
// }
function unwrapPage(item: Record<string, unknown>): PageResponse {
  // On retire juste _links et on retourne le reste tel quel
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _links, ...page } = item
  return page as unknown as PageResponse
}

interface PagesState {
  pages: PageResponse[]
  selectedPage: PageResponse | null
  categories: CategoryResponse[]
  loading: boolean
  error: string | null
}

export const usePagesStore = defineStore('pages', {
  state: (): PagesState => ({
    pages: [],
    selectedPage: null,
    categories: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true; this.error = null
      try {
        const { data } = await pagesApi.getAll()
        // data est un tableau d'objets avec _links à la racine
        this.pages = (data as unknown as Record<string, unknown>[]).map(unwrapPage)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur chargement pages'
      } finally { this.loading = false }
    },

    async fetchById(id: number) {
      this.loading = true; this.error = null
      try {
        const { data } = await pagesApi.getById(id)
        this.selectedPage = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Page introuvable'
      } finally { this.loading = false }
    },

    async create(payload: PageRequest, image?: File) {
      this.loading = true; this.error = null
      try {
        await pagesApi.create(payload, image)
        await this.fetchAll()
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur création page'
        throw err
      } finally { this.loading = false }
    },

    async update(id: number, payload: PageRequest, image?: File) {
      this.loading = true; this.error = null
      try {
        const { data } = await pagesApi.update(id, payload, image)
        const idx = this.pages.findIndex(p => p.id === id)
        if (idx !== -1) this.pages[idx] = data
        this.selectedPage = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur mise à jour page'
        throw err
      } finally { this.loading = false }
    },

    async deleteById(id: number) {
      this.loading = true; this.error = null
      try {
        await pagesApi.deleteById(id)
        this.pages = this.pages.filter(p => p.id !== id)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur suppression page'
        throw err
      } finally { this.loading = false }
    },

    async fetchCategories() {
      try {
        const { data } = await pagesApi.getCategories()
        this.categories = data
      } catch { this.categories = [] }
    }
  }
})
