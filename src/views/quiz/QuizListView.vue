<template>
  <div>
    <div class="page-header">
      <h1>Quiz disponibles</h1>
      <p>Questionnaires de diagnostic accessibles à tous</p>
    </div>

    <div v-if="quizStore.error" class="alert alert-error mb-2">{{ quizStore.error }}</div>
    <div v-if="quizStore.loading" class="text-muted">Chargement…</div>

    <div class="quiz-grid" v-else>
      <div v-if="!quizStore.quizList.length" class="text-muted">Aucun quiz disponible.</div>
      <div v-for="q in quizStore.quizList" :key="q.id" class="quiz-card card">
        <div class="quiz-card-top">
          <span class="quiz-icon">🧠</span>
          <span class="badge badge-user">{{ q.questionList?.length ?? 0 }} question(s)</span>
        </div>
        <h3 class="quiz-title">{{ q.title }}</h3>
        <p class="quiz-desc text-muted text-sm">{{ q.description }}</p>
        <router-link :to="{ name: 'QuizDetail', params: { id: q.id } }" class="btn btn-primary btn-sm mt-2">Voir le quiz →</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quiz'

export default defineComponent({
  name: 'QuizListView',
  setup() {
    const quizStore = useQuizStore()
    onMounted(() => quizStore.fetchAll())
    return { quizStore }
  }
})
</script>

<style scoped>
.quiz-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:1.25rem; }
.quiz-card { display:flex; flex-direction:column; gap:.5rem; transition:box-shadow .2s; }
.quiz-card:hover { box-shadow:var(--shadow); }
.quiz-card-top { display:flex; justify-content:space-between; align-items:center; }
.quiz-icon  { font-size:1.75rem; }
.quiz-title { font-family:var(--font-display); font-size:1.1rem; font-weight:600; }
.quiz-desc  { flex:1; }
.mt-2 { margin-top:.5rem; }
</style>
