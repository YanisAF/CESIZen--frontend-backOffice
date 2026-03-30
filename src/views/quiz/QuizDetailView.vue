<template>
  <div style="max-width:720px; margin:0 auto; padding:2rem 1rem">
    <router-link :to="{ name: 'QuizList' }" class="back-link">← Retour aux quiz</router-link>

    <div v-if="quizStore.loading && !quizStore.selectedQuiz" class="text-muted mt-2">Chargement…</div>

    <!-- Résultat après soumission -->
    <div v-else-if="result" class="result-card card mt-2">
      <div class="result-icon">{{ riskIcon }}</div>
      <h2 class="result-title">Votre résultat</h2>
      <div class="result-score">{{ result.totalScore }} <span class="result-score-lbl">points</span></div>
      <span class="badge result-badge" :class="riskClass">{{ result.riskLevel }}</span>
      <p class="result-msg">{{ result.message }}</p>
      <div class="flex gap-2 mt-3" style="justify-content:center; flex-wrap:wrap">
        <button class="btn btn-secondary" @click="restart">Recommencer</button>
        <router-link :to="{ name: 'QuizList' }" class="btn btn-ghost">Voir les autres quiz</router-link>
      </div>
    </div>

    <!-- Quiz player -->
    <template v-else-if="quiz">
      <!-- En-tête quiz -->
      <div v-if="!started" class="card mt-2">
        <div class="quiz-intro-icon">🧠</div>
        <h1 class="quiz-intro-title">{{ quiz.title }}</h1>
        <p class="text-muted mt-1 mb-3">{{ quiz.description }}</p>
        <div class="flex gap-2 items-center mb-3">
          <span class="badge badge-user">{{ quiz.questionList?.length ?? 0 }} question(s)</span>
          <span class="badge badge-neutral">Oui / Non</span>
        </div>
        <button class="btn btn-primary btn-lg" @click="started = true">Commencer le quiz →</button>
      </div>

      <!-- Questions -->
      <div v-else>
        <!-- Barre de progression -->
        <div class="progress-wrap mt-2">
          <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="text-xs text-muted mt-1 mb-2">
          Question {{ currentIdx + 1 }} / {{ questions.length }}
        </div>

        <!-- Question courante -->
        <div class="card question-card" v-if="currentQ">
          <span class="q-num">Q{{ currentIdx + 1 }}</span>
          <p class="question-text">{{ currentQ.statement }}</p>
          <div v-if="currentQ.scoreValue" class="text-xs text-muted mb-3">Valeur : {{ currentQ.scoreValue }} pt(s)</div>
          <div class="answer-row">
            <button
              class="answer-btn"
              :class="{ 'answer-yes': answers[currentQ.id!] === true }"
              @click="setAnswer(currentQ.id!, true)"
            >✓ Oui</button>
            <button
              class="answer-btn"
              :class="{ 'answer-no': answers[currentQ.id!] === false }"
              @click="setAnswer(currentQ.id!, false)"
            >✗ Non</button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="nav-row mt-2">
          <button class="btn btn-secondary" @click="currentIdx--" :disabled="currentIdx === 0">← Précédent</button>
          <button v-if="!isLast" class="btn btn-primary" @click="currentIdx++" :disabled="!hasAnswer">Suivant →</button>
          <button v-else class="btn btn-primary" @click="submitQuiz" :disabled="!hasAnswer || quizStore.loading">
            {{ quizStore.loading ? 'Calcul…' : '🎯 Soumettre' }}
          </button>
        </div>

        <div v-if="quizStore.error" class="alert alert-error mt-2">{{ quizStore.error }}</div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import type { Question, ResultResponse } from '@/types'

export default defineComponent({
  name: 'QuizDetailView',
  setup() {
    const quizStore = useQuizStore()
    const route = useRoute()
    const quizId = Number(route.params.id)

    const started = ref(false)
    const currentIdx = ref(0)
    const answers = reactive<Record<number, boolean>>({})
    const result = ref<ResultResponse | null>(null)

    onMounted(() => quizStore.fetchById(quizId))

    const quiz = computed(() => quizStore.selectedQuiz)
    const questions = computed((): Question[] => quiz.value?.questionList ?? [])
    const currentQ = computed(() => questions.value[currentIdx.value])
    const isLast = computed(() => currentIdx.value === questions.value.length - 1)
    const hasAnswer = computed(() => currentQ.value ? answers[currentQ.value.id!] !== undefined : false)
    const progressPct = computed(() => questions.value.length ? ((currentIdx.value + 1) / questions.value.length) * 100 : 0)

    const riskIcon = computed(() => {
      const l = result.value?.riskLevel?.toLowerCase() ?? ''
      if (l.includes('faible') || l.includes('low')) return '🟢'
      if (l.includes('modéré') || l.includes('medium') || l.includes('moderate') || l.includes('moyen')) return '🟡'
      return '🔴'
    })
    const riskClass = computed(() => {
      const l = result.value?.riskLevel?.toLowerCase() ?? ''
      if (l.includes('faible') || l.includes('low')) return 'badge-admin'
      if (l.includes('modéré') || l.includes('medium') || l.includes('moyen')) return 'badge-warning'
      return 'badge-danger'
    })

    function setAnswer(id: number, val: boolean) { answers[id] = val }

    async function submitQuiz() {
      result.value = await quizStore.submit(quizId, { quizId, answers: { ...answers } }) ?? null
    }

    function restart() {
      result.value = null
      started.value = false
      currentIdx.value = 0
      Object.keys(answers).forEach(k => delete (answers as Record<string, unknown>)[k])
    }

    return { quizStore, quiz, questions, currentQ, currentIdx, isLast, hasAnswer, progressPct, started, answers, result, riskIcon, riskClass, setAnswer, submitQuiz, restart }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); }
.back-link:hover { color:var(--c-text); }

.progress-wrap { height:6px; background:var(--c-border); border-radius:999px; overflow:hidden; }
.progress-bar  { height:100%; background:var(--c-accent); border-radius:999px; transition:width .4s ease; }

.quiz-intro-icon  { font-size:2.5rem; margin-bottom:.5rem; }
.quiz-intro-title { font-family:var(--font-display); font-size:1.75rem; font-weight:600; }

.question-card { text-align:center; padding:2.5rem; }
.q-num { display:inline-block; background:var(--c-accent-lt); color:var(--c-accent); font-size:.75rem; font-weight:700; padding:.2rem .75rem; border-radius:999px; margin-bottom:1.25rem; }
.question-text { font-family:var(--font-display); font-size:1.35rem; font-weight:400; line-height:1.4; margin-bottom:2rem; }

.answer-row { display:flex; gap:1rem; justify-content:center; }
.answer-btn  {
  flex:1; max-width:160px; padding:1rem; border:2px solid var(--c-border-2);
  border-radius:var(--radius); background:var(--c-surface); font-size:.95rem; font-weight:500;
  cursor:pointer; transition:all var(--transition);
}
.answer-btn:hover { border-color:var(--c-accent-2); background:var(--c-surface-2); }
.answer-yes { border-color:var(--c-accent); background:var(--c-accent-lt); color:var(--c-accent); }
.answer-no  { border-color:var(--c-red); background:var(--c-red-lt); color:var(--c-red); }

.nav-row { display:flex; justify-content:space-between; }

.result-card { text-align:center; padding:3rem 2rem; }
.result-icon  { font-size:3.5rem; margin-bottom:1rem; }
.result-title { font-family:var(--font-display); font-size:1.5rem; font-weight:600; }
.result-score { font-family:var(--font-display); font-size:3.5rem; color:var(--c-accent); margin:.5rem 0; line-height:1; }
.result-score-lbl { font-size:1rem; color:var(--c-muted); }
.result-badge { font-size:.85rem; margin:.5rem 0; }
.result-msg   { color:var(--c-muted); max-width:480px; margin:1rem auto 0; line-height:1.7; }
</style>
