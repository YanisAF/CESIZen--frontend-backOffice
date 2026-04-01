import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import apiClient from '@/api/client'
import { quizApi } from '@/api/quiz'
import type {
  QuizRequest, QuizResponse,
  QuestionRequest, QuestionResponse,
  QuizSubmission, ResultResponse,
  ResultMessageRequest, ResultMessageResponse
} from '@/types'

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

const mockQuestion: QuestionResponse = {
  id: 1,
  statement: 'Vous sentez-vous souvent fatigué ?',
  scoreValue: 2,
}

const mockQuizResponse: QuizResponse = {
  id: 1,
  title: 'Test de stress',
  description: 'Évaluez votre niveau de stress',
  questionList: [
    { id: 1, statement: 'Vous sentez-vous souvent fatigué ?', scoreValue: 2 },
    { id: 2, statement: 'Avez-vous des difficultés à dormir ?', scoreValue: 3 },
  ],
}

const mockQuizRequest: QuizRequest = {
  title: 'Test de stress',
  description: 'Évaluez votre niveau de stress',
  questionList: [
    { statement: 'Vous sentez-vous souvent fatigué ?', scoreValue: 2 },
  ],
}

const mockQuestionRequest: QuestionRequest = {
  statement: 'Avez-vous des maux de tête fréquents ?',
  scoreValue: 2,
}

const mockSubmission: QuizSubmission = {
  quizId: 1,
  answers: { 1: true, 2: false },
}

const mockResultResponse: ResultResponse = {
  id: 1,
  totalScore: 5,
  message: 'Votre niveau de stress est modéré.',
  riskLevel: 'MODERATE',
  quizId: 1,
  userId: 42,
}

const mockResultMessageRequest: ResultMessageRequest = {
  quizId: 1,
  minScore: 0,
  maxScore: 5,
  riskLevel: 'LOW',
  message: 'Votre niveau de stress est faible.',
}

const mockResultMessageResponse: ResultMessageResponse = {
  id: 1,
  quizId: 1,
  minScore: 0,
  maxScore: 5,
  riskLevel: 'LOW',
  message: 'Votre niveau de stress est faible.',
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

describe('quizApi', () => {

  // ── GET /quiz-list ─────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('retourne la liste complète des quiz (200)', async () => {
      mock.onGet('/quiz-list').reply(200, [mockQuizResponse])

      const response = await quizApi.getAll()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(1)
      expect(response.data[0]).toMatchObject({ id: 1, title: 'Test de stress' })
    })

    it('retourne un tableau vide si aucun quiz (200)', async () => {
      mock.onGet('/quiz-list').reply(200, [])

      const response = await quizApi.getAll()

      expect(response.data).toEqual([])
    })

    it('lève une erreur 500 en cas de problème serveur', async () => {
      mock.onGet('/quiz-list').reply(500)

      await expect(quizApi.getAll()).rejects.toThrow()
    })

    it('lève une erreur réseau si le serveur ne répond pas', async () => {
      mock.onGet('/quiz-list').networkError()

      await expect(quizApi.getAll()).rejects.toThrow()
    })
  })

  // ── GET /get-quiz-by-id?id= ────────────────────────────────────────────────

  describe('getById(id)', () => {
    it('retourne un quiz pour un id valide (200)', async () => {
      mock.onGet('/get-quiz-by-id', { params: { id: 1 } }).reply(200, mockQuizResponse)

      const response = await quizApi.getById(1)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, title: 'Test de stress' })
    })

    it('retourne la liste des questions associées', async () => {
      mock.onGet('/get-quiz-by-id', { params: { id: 1 } }).reply(200, mockQuizResponse)

      const response = await quizApi.getById(1)

      expect(response.data.questionList).toHaveLength(2)
      expect(response.data.questionList[0]).toMatchObject({ scoreValue: 2 })
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onGet('/get-quiz-by-id').reply((config) => {
        capturedParams = config.params
        return [200, mockQuizResponse]
      })

      await quizApi.getById(99)

      expect(capturedParams).toEqual({ id: 99 })
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onGet('/get-quiz-by-id', { params: { id: 9999 } }).reply(404)

      await expect(quizApi.getById(9999)).rejects.toThrow()
    })

    it('lève une erreur 400 si id invalide', async () => {
      mock.onGet('/get-quiz-by-id', { params: { id: -1 } }).reply(400)

      await expect(quizApi.getById(-1)).rejects.toThrow()
    })
  })

  // ── GET /get-all-questions?quizId= ─────────────────────────────────────────

  describe('getAllQuestions(quizId)', () => {
    it('retourne la liste des questions pour un quiz (200)', async () => {
      mock.onGet('/get-all-questions', { params: { quizId: 1 } }).reply(200, [mockQuestion])

      const response = await quizApi.getAllQuestions(1)

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(1)
      expect(response.data[0]).toMatchObject({ id: 1, statement: 'Vous sentez-vous souvent fatigué ?' })
    })

    it('retourne un tableau vide si aucune question (200)', async () => {
      mock.onGet('/get-all-questions', { params: { quizId: 1 } }).reply(200, [])

      const response = await quizApi.getAllQuestions(1)

      expect(response.data).toEqual([])
    })

    it('envoie le bon paramètre de query quizId', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onGet('/get-all-questions').reply((config) => {
        capturedParams = config.params
        return [200, [mockQuestion]]
      })

      await quizApi.getAllQuestions(7)

      expect(capturedParams).toEqual({ quizId: 7 })
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onGet('/get-all-questions', { params: { quizId: 9999 } }).reply(404)

      await expect(quizApi.getAllQuestions(9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non autorisé', async () => {
      mock.onGet('/get-all-questions').reply(403)

      await expect(quizApi.getAllQuestions(1)).rejects.toThrow()
    })
  })

  // ── POST /create-quiz ──────────────────────────────────────────────────────

  describe('create(data)', () => {
    it('crée un quiz et retourne la réponse (201)', async () => {
      mock.onPost('/create-quiz').reply(201, mockQuizResponse)

      const response = await quizApi.create(mockQuizRequest)

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ id: 1, title: 'Test de stress' })
    })

    it('envoie le body complet avec title, description et questionList', async () => {
      let capturedBody: unknown = null
      mock.onPost('/create-quiz').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [201, mockQuizResponse]
      })

      await quizApi.create(mockQuizRequest)

      expect(capturedBody).toMatchObject({
        title: 'Test de stress',
        description: 'Évaluez votre niveau de stress',
      })
    })

    it('crée un quiz sans questionList (champ optionnel)', async () => {
      const minimal: QuizRequest = { title: 'Quiz vide', description: 'Sans questions' }
      mock.onPost('/create-quiz').reply(201, { ...mockQuizResponse, questionList: [] })

      const response = await quizApi.create(minimal)

      expect(response.status).toBe(201)
    })

    it('lève une erreur 400 si title ou description invalide', async () => {
      mock.onPost('/create-quiz').reply(400, { message: 'Validation failed' })

      await expect(quizApi.create({ ...mockQuizRequest, title: 'ab' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPost('/create-quiz').reply(403)

      await expect(quizApi.create(mockQuizRequest)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onPost('/create-quiz').reply(401)

      await expect(quizApi.create(mockQuizRequest)).rejects.toThrow()
    })
  })

  // ── PUT /update-quiz?id= ───────────────────────────────────────────────────

  describe('update(id, data)', () => {
    it('met à jour un quiz et retourne la réponse (200)', async () => {
      mock.onPut('/update-quiz').reply(200, mockQuizResponse)

      const response = await quizApi.update(1, mockQuizRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, title: 'Test de stress' })
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPut('/update-quiz').reply((config) => {
        capturedParams = config.params
        return [200, mockQuizResponse]
      })

      await quizApi.update(3, mockQuizRequest)

      expect(capturedParams).toEqual({ id: 3 })
    })

    it('envoie le body avec les données mises à jour', async () => {
      let capturedBody: unknown = null
      mock.onPut('/update-quiz').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockQuizResponse]
      })

      await quizApi.update(1, { ...mockQuizRequest, title: 'Titre modifié' })

      expect(capturedBody).toMatchObject({ title: 'Titre modifié' })
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onPut('/update-quiz').reply(404)

      await expect(quizApi.update(9999, mockQuizRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si données invalides', async () => {
      mock.onPut('/update-quiz').reply(400, { message: 'Validation failed' })

      await expect(quizApi.update(1, { ...mockQuizRequest, title: 'ab' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPut('/update-quiz').reply(403)

      await expect(quizApi.update(1, mockQuizRequest)).rejects.toThrow()
    })
  })

  // ── DELETE /delete-quiz?id= ────────────────────────────────────────────────

  describe('deleteById(id)', () => {
    it('supprime un quiz et retourne 204', async () => {
      mock.onDelete('/delete-quiz', { params: { id: 1 } }).reply(204)

      const response = await quizApi.deleteById(1)

      expect(response.status).toBe(204)
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onDelete('/delete-quiz').reply((config) => {
        capturedParams = config.params
        return [204]
      })

      await quizApi.deleteById(4)

      expect(capturedParams).toEqual({ id: 4 })
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onDelete('/delete-quiz', { params: { id: 9999 } }).reply(404)

      await expect(quizApi.deleteById(9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onDelete('/delete-quiz').reply(403)

      await expect(quizApi.deleteById(1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onDelete('/delete-quiz').reply(401)

      await expect(quizApi.deleteById(1)).rejects.toThrow()
    })
  })

  // ── POST /add-question?quizId= ─────────────────────────────────────────────

  describe('addQuestion(quizId, data)', () => {
    it('ajoute une question et retourne le quiz mis à jour (200)', async () => {
      mock.onPost('/add-question').reply(200, mockQuizResponse)

      const response = await quizApi.addQuestion(1, mockQuestionRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1 })
    })

    it('envoie le bon paramètre de query quizId', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPost('/add-question').reply((config) => {
        capturedParams = config.params
        return [200, mockQuizResponse]
      })

      await quizApi.addQuestion(5, mockQuestionRequest)

      expect(capturedParams).toEqual({ quizId: 5 })
    })

    it('envoie le body avec statement et scoreValue', async () => {
      let capturedBody: unknown = null
      mock.onPost('/add-question').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockQuizResponse]
      })

      await quizApi.addQuestion(1, mockQuestionRequest)

      expect(capturedBody).toMatchObject({
        statement: 'Avez-vous des maux de tête fréquents ?',
        scoreValue: 2,
      })
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onPost('/add-question').reply(404)

      await expect(quizApi.addQuestion(9999, mockQuestionRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si données invalides', async () => {
      mock.onPost('/add-question').reply(400, { message: 'Validation failed' })

      await expect(quizApi.addQuestion(1, { ...mockQuestionRequest, statement: '' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPost('/add-question').reply(403)

      await expect(quizApi.addQuestion(1, mockQuestionRequest)).rejects.toThrow()
    })
  })

  // ── DELETE /delete-question-quiz?quizId=&id= ───────────────────────────────

  describe('deleteQuestion(quizId, id)', () => {
    it('supprime une question et retourne 204', async () => {
      mock.onDelete('/delete-question-quiz', { params: { quizId: 1, id: 1 } }).reply(204)

      const response = await quizApi.deleteQuestion(1, 1)

      expect(response.status).toBe(204)
    })

    it('envoie les bons paramètres quizId et id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onDelete('/delete-question-quiz').reply((config) => {
        capturedParams = config.params
        return [204]
      })

      await quizApi.deleteQuestion(3, 7)

      expect(capturedParams).toEqual({ quizId: 3, id: 7 })
    })

    it('lève une erreur 404 si question ou quiz introuvable', async () => {
      mock.onDelete('/delete-question-quiz').reply(404)

      await expect(quizApi.deleteQuestion(9999, 9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onDelete('/delete-question-quiz').reply(403)

      await expect(quizApi.deleteQuestion(1, 1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onDelete('/delete-question-quiz').reply(401)

      await expect(quizApi.deleteQuestion(1, 1)).rejects.toThrow()
    })
  })

  // ── POST /submit?quizId= ───────────────────────────────────────────────────

  describe('submit(quizId, submission)', () => {
    it('soumet un quiz et retourne le résultat (200)', async () => {
      mock.onPost('/submit').reply(200, mockResultResponse)

      const response = await quizApi.submit(1, mockSubmission)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        totalScore: 5,
        riskLevel: 'MODERATE',
      })
    })

    it('envoie le bon paramètre de query quizId', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPost('/submit').reply((config) => {
        capturedParams = config.params
        return [200, mockResultResponse]
      })

      await quizApi.submit(2, mockSubmission)

      expect(capturedParams).toEqual({ quizId: 2 })
    })

    it('envoie le body avec quizId et answers', async () => {
      let capturedBody: unknown = null
      mock.onPost('/submit').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockResultResponse]
      })

      await quizApi.submit(1, mockSubmission)

      expect(capturedBody).toMatchObject({
        quizId: 1,
        answers: { 1: true, 2: false },
      })
    })

    it('retourne un message et un riskLevel dans la réponse', async () => {
      mock.onPost('/submit').reply(200, mockResultResponse)

      const response = await quizApi.submit(1, mockSubmission)

      expect(response.data.message).toBeTruthy()
      expect(response.data.riskLevel).toBeTruthy()
    })

    it('lève une erreur 404 si quiz introuvable', async () => {
      mock.onPost('/submit').reply(404)

      await expect(quizApi.submit(9999, mockSubmission)).rejects.toThrow()
    })

    it('lève une erreur 400 si answers est vide ou invalide', async () => {
      mock.onPost('/submit').reply(400, { message: 'Answers required' })

      await expect(quizApi.submit(1, { quizId: 1, answers: {} })).rejects.toThrow()
    })
  })

  // ── GET /admin/result-message-config/get-all ───────────────────────────────

  describe('getResultMessages()', () => {
    it('retourne la liste des messages de résultat (200)', async () => {
      mock.onGet('/admin/result-message-config/get-all').reply(200, [mockResultMessageResponse])

      const response = await quizApi.getResultMessages()

      expect(response.status).toBe(200)
      expect(response.data).toHaveLength(1)
      expect(response.data[0]).toMatchObject({ riskLevel: 'LOW', minScore: 0, maxScore: 5 })
    })

    it('retourne un tableau vide si aucun message configuré (200)', async () => {
      mock.onGet('/admin/result-message-config/get-all').reply(200, [])

      const response = await quizApi.getResultMessages()

      expect(response.data).toEqual([])
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onGet('/admin/result-message-config/get-all').reply(403)

      await expect(quizApi.getResultMessages()).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onGet('/admin/result-message-config/get-all').reply(401)

      await expect(quizApi.getResultMessages()).rejects.toThrow()
    })
  })

  // ── POST /admin/result-message-config/create ───────────────────────────────

  describe('createResultMessage(data)', () => {
    it('crée un message de résultat et retourne la réponse (201)', async () => {
      mock.onPost('/admin/result-message-config/create').reply(201, mockResultMessageResponse)

      const response = await quizApi.createResultMessage(mockResultMessageRequest)

      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({ id: 1, riskLevel: 'LOW' })
    })

    it('envoie le body complet avec tous les champs', async () => {
      let capturedBody: unknown = null
      mock.onPost('/admin/result-message-config/create').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [201, mockResultMessageResponse]
      })

      await quizApi.createResultMessage(mockResultMessageRequest)

      expect(capturedBody).toMatchObject({
        quizId: 1,
        minScore: 0,
        maxScore: 5,
        riskLevel: 'LOW',
        message: 'Votre niveau de stress est faible.',
      })
    })

    it('lève une erreur 400 si données invalides', async () => {
      mock.onPost('/admin/result-message-config/create').reply(400, { message: 'Validation failed' })

      await expect(quizApi.createResultMessage({ ...mockResultMessageRequest, message: '' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPost('/admin/result-message-config/create').reply(403)

      await expect(quizApi.createResultMessage(mockResultMessageRequest)).rejects.toThrow()
    })

    it('lève une erreur 409 si configuration en conflit', async () => {
      mock.onPost('/admin/result-message-config/create').reply(409, { message: 'Score range conflict' })

      await expect(quizApi.createResultMessage(mockResultMessageRequest)).rejects.toThrow()
    })
  })

  // ── PUT /admin/result-message-config/update?id= ────────────────────────────

  describe('updateResultMessage(id, data)', () => {
    it('met à jour un message de résultat et retourne la réponse (200)', async () => {
      mock.onPut('/admin/result-message-config/update').reply(200, mockResultMessageResponse)

      const response = await quizApi.updateResultMessage(1, mockResultMessageRequest)

      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({ id: 1, riskLevel: 'LOW' })
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onPut('/admin/result-message-config/update').reply((config) => {
        capturedParams = config.params
        return [200, mockResultMessageResponse]
      })

      await quizApi.updateResultMessage(8, mockResultMessageRequest)

      expect(capturedParams).toEqual({ id: 8 })
    })

    it('envoie le body avec les données mises à jour', async () => {
      let capturedBody: unknown = null
      mock.onPut('/admin/result-message-config/update').reply((config) => {
        capturedBody = JSON.parse(config.data)
        return [200, mockResultMessageResponse]
      })

      await quizApi.updateResultMessage(1, { ...mockResultMessageRequest, riskLevel: 'HIGH' })

      expect(capturedBody).toMatchObject({ riskLevel: 'HIGH' })
    })

    it('lève une erreur 404 si message introuvable', async () => {
      mock.onPut('/admin/result-message-config/update').reply(404)

      await expect(quizApi.updateResultMessage(9999, mockResultMessageRequest)).rejects.toThrow()
    })

    it('lève une erreur 400 si données invalides', async () => {
      mock.onPut('/admin/result-message-config/update').reply(400, { message: 'Validation failed' })

      await expect(quizApi.updateResultMessage(1, { ...mockResultMessageRequest, message: '' })).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onPut('/admin/result-message-config/update').reply(403)

      await expect(quizApi.updateResultMessage(1, mockResultMessageRequest)).rejects.toThrow()
    })
  })

  // ── DELETE /admin/result-message-config/delete?id= ────────────────────────

  describe('deleteResultMessage(id)', () => {
    it('supprime un message de résultat et retourne 204', async () => {
      mock.onDelete('/admin/result-message-config/delete', { params: { id: 1 } }).reply(204)

      const response = await quizApi.deleteResultMessage(1)

      expect(response.status).toBe(204)
    })

    it('envoie le bon paramètre de query id', async () => {
      let capturedParams: Record<string, unknown> = {}
      mock.onDelete('/admin/result-message-config/delete').reply((config) => {
        capturedParams = config.params
        return [204]
      })

      await quizApi.deleteResultMessage(6)

      expect(capturedParams).toEqual({ id: 6 })
    })

    it('lève une erreur 404 si message introuvable', async () => {
      mock.onDelete('/admin/result-message-config/delete', { params: { id: 9999 } }).reply(404)

      await expect(quizApi.deleteResultMessage(9999)).rejects.toThrow()
    })

    it('lève une erreur 403 si non admin', async () => {
      mock.onDelete('/admin/result-message-config/delete').reply(403)

      await expect(quizApi.deleteResultMessage(1)).rejects.toThrow()
    })

    it('lève une erreur 401 si non authentifié', async () => {
      mock.onDelete('/admin/result-message-config/delete').reply(401)

      await expect(quizApi.deleteResultMessage(1)).rejects.toThrow()
    })
  })

})