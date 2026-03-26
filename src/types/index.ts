// ─── Auth ─────────────────────────────────────────────────────────────────────
// LoginDtoRequest: identifier + password
export interface LoginRequest {
  identifier: string  // email OU username
  password: string
}

export interface JwtResponse {
  token: string
}

// ─── User ─────────────────────────────────────────────────────────────────────
export type Role = 'ROLE_ADMIN' | 'ROLE_USER'

// UserDtoRequest: user_name, email, phone, password, role
export interface UserRequest {
  user_name: string
  email: string
  phone?: string
  password: string
  role?: Role
}

// UserDtoResponse: id, user_name, email, phone, role, last_activity_at
export interface UserResponse {
  id: number
  user_name: string
  email: string
  phone?: string | null
  role: Role
  last_activity_at: string
}

// HATEOAS EntityModel wrapping
export interface HateoasModel<T> {
  content?: T        // objet réel
  _links?: Record<string, { href: string }>
  [key: string]: unknown
}

// ─── Reset password ───────────────────────────────────────────────────────────
// ResetDtoRequest: identifier + channel ('email' | 'sms')
export interface ResetRequest {
  identifier: string
  channel: 'email' | 'sms'
}

// VerifyPinRequestDto: identifier + pin
export interface VerifyPinRequest {
  identifier: string
  pin: string
}

// ResetPasswordRequestDto: jwt + newPassword + channel
export interface ResetPasswordRequest {
  jwt: string
  newPassword: string
  channel: 'email' | 'sms'
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────
// Question model (utilisé dans QuizDtoRequest et QuizDtoResponse)
export interface Question {
  id?: number
  statement: string
  scoreValue: number
  correctAnswer?: boolean
}

// QuizDtoRequest: title (3-32), description (3-32), questionList?
export interface QuizRequest {
  title: string
  description: string
  questionList?: Question[]
}

// QuizDtoResponse: id, title, description, questionList
export interface QuizResponse {
  id: number
  title: string
  description: string
  questionList: Question[]
}

// QuestionDtoRequest: statement + scoreValue
export interface QuestionRequest {
  statement: string
  scoreValue: number
}

// QuestionDtoResponse: id, statement, scoreValue
export interface QuestionResponse {
  id: number
  statement: string
  scoreValue: number
}

// QuizSubmissionDto: quizId, answers: Map<Integer, Boolean>
export interface QuizSubmission {
  quizId: number
  answers: Record<number, boolean>
}

// ─── Result ───────────────────────────────────────────────────────────────────
// ResultDtoResponse: id, totalScore, message, riskLevel, quizId, userId
export interface ResultResponse {
  id: number
  totalScore: number
  message: string
  riskLevel: string
  quizId: number
  userId: number
}

// ResultMessageDtoRequest: quizId, minScore, maxScore, riskLevel, message
export interface ResultMessageRequest {
  quizId: number
  minScore: number
  maxScore: number
  riskLevel: string
  message: string
}

// ResultMessageDtoResponse: id, quizId, minScore, maxScore, riskLevel, message
export interface ResultMessageResponse {
  id: number
  quizId: number
  minScore: number
  maxScore: number
  riskLevel: string
  message: string
}

// ─── Page ─────────────────────────────────────────────────────────────────────
// ContentPageDto: name, description, itemUrl
export interface ContentPageDto {
  name: string
  description: string
  itemUrl: string
}

// CategoryDtoResponse: id, name
export interface CategoryResponse {
  id: number
  name: string
}

// PageDtoRequest: title, content: ContentPageDto[], category: Integer
export interface PageRequest {
  title: string
  content: ContentPageDto[]
  category: number
}

// PageDtoResponse: id, title, content, imageUrl, category
export interface PageResponse {
  id: number
  title: string
  content: ContentPageDto[]
  imageUrl?: string | null
  category: CategoryResponse
}

// ─── Pagination (front-end only) ──────────────────────────────────────────────
export interface PaginationState {
  currentPage: number
  perPage: 10 | 20 | 50
}
