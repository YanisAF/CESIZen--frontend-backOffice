import apiClient from './client'
import type {
  QuizRequest, QuizResponse,
  QuestionRequest, QuestionResponse,
  QuizSubmission, ResultResponse,
  ResultMessageRequest, ResultMessageResponse
} from '@/types'

export const quizApi = {
  // GET /api/v1/quiz-list (public)
  getAll() {
    return apiClient.get<QuizResponse[]>('/quiz-list')
  },

  // GET /api/v1/get-quiz-by-id?id= (public)
  getById(id: number) {
    return apiClient.get<QuizResponse>('/get-quiz-by-id', { params: { id } })
  },

  // GET /api/v1/get-all-questions?quizId=
  getAllQuestions(quizId: number) {
    return apiClient.get<QuestionResponse[]>('/get-all-questions', { params: { quizId } })
  },

  // POST /api/v1/create-quiz (admin)
  create(data: QuizRequest) {
    return apiClient.post<QuizResponse>('/create-quiz', data)
  },

  // PUT /api/v1/update-quiz?id= (admin)
  update(id: number, data: QuizRequest) {
    return apiClient.put<QuizResponse>('/update-quiz', data, { params: { id } })
  },

  // DELETE /api/v1/delete-quiz?id= (admin)
  deleteById(id: number) {
    return apiClient.delete<void>('/delete-quiz', { params: { id } })
  },

  // POST /api/v1/add-question?quizId= (admin)
  addQuestion(quizId: number, data: QuestionRequest) {
    return apiClient.post<QuizResponse>('/add-question', data, { params: { quizId } })
  },

  // DELETE /api/v1/delete-question-quiz?quizId=&id= (admin)
  deleteQuestion(quizId: number, id: number) {
    return apiClient.delete<void>('/delete-question-quiz', { params: { quizId, id } })
  },

  // POST /api/v1/submit?quizId= (public)
  submit(quizId: number, submission: QuizSubmission) {
    return apiClient.post<ResultResponse>('/submit', submission, { params: { quizId } })
  },

  // ─── Result Message Config (admin, public dans SecurityConfig) ────────────

  // GET /api/v1/admin/result-message-config/get-all
  getResultMessages() {
    return apiClient.get<ResultMessageResponse[]>('/admin/result-message-config/get-all')
  },

  // POST /api/v1/admin/result-message-config/create
  createResultMessage(data: ResultMessageRequest) {
    return apiClient.post<ResultMessageResponse>('/admin/result-message-config/create', data)
  },

  // PUT /api/v1/admin/result-message-config/update?id=
  updateResultMessage(id: number, data: ResultMessageRequest) {
    return apiClient.put<ResultMessageResponse>('/admin/result-message-config/update', data, { params: { id } })
  },

  // DELETE /api/v1/admin/result-message-config/delete?id=
  deleteResultMessage(id: number) {
    return apiClient.delete<void>('/admin/result-message-config/delete', { params: { id } })
  }
}
