import apiClient from './client'
import type { PageRequest, PageResponse, CategoryResponse } from '@/types'

export const pagesApi = {
  // GET /api/v1/page/get-all-pages (public) — retourne EntityModel<PageDtoResponse>[]
  getAll() {
    return apiClient.get<Record<string, unknown>[]>('/page/get-all-pages')
  },

  // GET /api/v1/page/get-page?id= (public)
  getById(id: number) {
    return apiClient.get<PageResponse>('/page/get-page', { params: { id } })
  },

  // POST /api/v1/page/create-page (multipart/form-data, public dans SecurityConfig)
  create(data: PageRequest, image?: File) {
    const form = new FormData()
    form.append('page', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (image) form.append('image', image)
    return apiClient.post<void>('/page/create-page', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // PUT /api/v1/page/update-page (défini dans Routes mais pas encore dans controller)
  // On l'inclut pour usage futur
  update(id: number, data: PageRequest, image?: File) {
    const form = new FormData()
    form.append('page', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (image) form.append('image', image)
    return apiClient.put<PageResponse>('/page/update-page', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { id }
    })
  },

  // DELETE /api/v1/page/delete-page?id= (défini dans Routes)
  deleteById(id: number) {
    return apiClient.delete<void>('/page/delete-page', { params: { id } })
  },

  // GET /api/v1/categories (public)
  getCategories() {
    return apiClient.get<CategoryResponse[]>('/categories/list')
  }
}
