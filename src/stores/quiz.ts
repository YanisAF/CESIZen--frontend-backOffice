import { defineStore } from 'pinia'
import { quizApi } from '@/api/quiz'
import type {
  QuizRequest, QuizResponse,
  QuestionRequest,
  QuizSubmission, ResultResponse,
  ResultMessageRequest, ResultMessageResponse
} from '@/types'

interface QuizState {
  quizList: QuizResponse[]
  selectedQuiz: QuizResponse | null
  resultMessages: ResultMessageResponse[]
  lastResult: ResultResponse | null
  loading: boolean
  error: string | null
}

export const useQuizStore = defineStore('quiz', {
  state: (): QuizState => ({
    quizList: [],
    selectedQuiz: null,
    resultMessages: [],
    lastResult: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.getAll()
        this.quizList = data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur chargement quiz'
      } finally { this.loading = false }
    },

    async fetchById(id: number) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.getById(id)
        this.selectedQuiz = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Quiz introuvable'
      } finally { this.loading = false }
    },

    async create(payload: QuizRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.create(payload)
        this.quizList.unshift(data)
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur création quiz'
        throw err
      } finally { this.loading = false }
    },

    async update(id: number, payload: QuizRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.update(id, payload)
        const idx = this.quizList.findIndex(q => q.id === id)
        if (idx !== -1) this.quizList[idx] = data
        this.selectedQuiz = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur mise à jour quiz'
        throw err
      } finally { this.loading = false }
    },

    async deleteById(id: number) {
      this.loading = true; this.error = null
      try {
        await quizApi.deleteById(id)
        this.quizList = this.quizList.filter(q => q.id !== id)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur suppression quiz'
        throw err
      } finally { this.loading = false }
    },

    async addQuestion(quizId: number, payload: QuestionRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.addQuestion(quizId, payload)
        this.selectedQuiz = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur ajout question'
        throw err
      } finally { this.loading = false }
    },

    async deleteQuestion(quizId: number, questionId: number) {
      this.loading = true; this.error = null
      try {
        await quizApi.deleteQuestion(quizId, questionId)
        if (this.selectedQuiz?.questionList) {
          this.selectedQuiz.questionList = this.selectedQuiz.questionList
            .filter(q => q.id !== questionId)
        }
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur suppression question'
        throw err
      } finally { this.loading = false }
    },

    async submit(quizId: number, submission: QuizSubmission) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.submit(quizId, submission)
        this.lastResult = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur soumission quiz'
        throw err
      } finally { this.loading = false }
    },

    // ─── Result Message Config ─────────────────────────────────────────────
    async fetchResultMessages() {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.getResultMessages()
        this.resultMessages = data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur chargement messages'
      } finally { this.loading = false }
    },

    async createResultMessage(payload: ResultMessageRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.createResultMessage(payload)
        this.resultMessages.push(data)
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur création message'
        throw err
      } finally { this.loading = false }
    },

    async updateResultMessage(id: number, payload: ResultMessageRequest) {
      this.loading = true; this.error = null
      try {
        const { data } = await quizApi.updateResultMessage(id, payload)
        const idx = this.resultMessages.findIndex(m => m.id === id)
        if (idx !== -1) this.resultMessages[idx] = data
        return data
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur mise à jour message'
        throw err
      } finally { this.loading = false }
    },

    async deleteResultMessage(id: number) {
      this.loading = true; this.error = null
      try {
        await quizApi.deleteResultMessage(id)
        this.resultMessages = this.resultMessages.filter(m => m.id !== id)
      } catch (err: unknown) {
        this.error = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur suppression message'
        throw err
      } finally { this.loading = false }
    }
  }
})
