<template>
  <div>
    <div class="page-header">
      <h1>Tableau de bord</h1>
      <p>Bienvenue sur le back-office CESIZen</p>
    </div>

    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-icon">🧠</div>
        <div class="stat-val">{{ quizStore.quizList.length }}</div>
        <div class="stat-lbl">Quiz</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">📄</div>
        <div class="stat-val">{{ pagesStore.pages.length }}</div>
        <div class="stat-lbl">Pages</div>
      </div>
      <div class="stat-card card" v-if="authStore.isAdmin">
        <div class="stat-icon">👥</div>
        <div class="stat-val">{{ usersStore.users.length }}</div>
        <div class="stat-lbl">Utilisateurs</div>
      </div>
      <div class="stat-card card" v-if="authStore.isAdmin">
        <div class="stat-icon">⚙️</div>
        <div class="stat-val">{{ quizStore.resultMessages.length }}</div>
        <div class="stat-lbl">Configs résultats</div>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Derniers quiz -->
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <h2 class="section-h">Derniers quiz</h2>
          <router-link :to="{ name: 'QuizList' }" class="btn btn-ghost btn-sm">Voir tout</router-link>
        </div>
        <div v-if="quizStore.loading" class="text-muted text-sm">Chargement…</div>
        <div v-else-if="!quizStore.quizList.length" class="text-muted text-sm">Aucun quiz.</div>
        <div v-else>
          <div v-for="q in quizStore.quizList.slice(0,5)" :key="q.id" class="list-row">
            <div>
              <div class="fw-500 text-sm">{{ q.title }}</div>
              <div class="text-xs text-muted">{{ q.questionList?.length ?? 0 }} question(s)</div>
            </div>
            <router-link :to="{ name: 'QuizDetail', params: { id: q.id } }" class="btn btn-ghost btn-sm">→</router-link>
          </div>
        </div>
      </div>

      <!-- Dernières pages -->
      <div class="card">
        <div class="flex justify-between items-center mb-2">
          <h2 class="section-h">Dernières pages</h2>
          <router-link :to="{ name: 'PageList' }" class="btn btn-ghost btn-sm">Voir tout</router-link>
        </div>
        <div v-if="pagesStore.loading" class="text-muted text-sm">Chargement…</div>
        <div v-else-if="!pagesStore.pages.length" class="text-muted text-sm">Aucune page.</div>
        <div v-else>
          <div v-for="p in pagesStore.pages.slice(0,5)" :key="p.id" class="list-row">
            <div>
              <div class="fw-500 text-sm">{{ p.title }}</div>
              <span class="badge badge-neutral text-xs" v-if="p.category">{{ p.category.name }}</span>
            </div>
            <router-link :to="{ name: 'PageDetail', params: { id: p.id } }" class="btn btn-ghost btn-sm">→</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quiz'
import { usePagesStore } from '@/stores/pages'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'DashboardView',
  setup() {
    const quizStore = useQuizStore()
    const pagesStore = usePagesStore()
    const usersStore = useUsersStore()
    const authStore = useAuthStore()

    onMounted(async () => {
      await Promise.all([
        quizStore.fetchAll(),
        pagesStore.fetchAll(),
        ...(authStore.isAdmin ? [usersStore.fetchAll(), quizStore.fetchResultMessages()] : [])
      ])
    })

    return { quizStore, pagesStore, usersStore, authStore }
  }
})
</script>

<style scoped>
.stats-row { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:1rem; margin-bottom:2rem; }
.stat-card { text-align:center; }
.stat-icon { font-size:1.75rem; margin-bottom:.25rem; }
.stat-val  { font-family:var(--font-display); font-size:2.25rem; line-height:1; }
.stat-lbl  { font-size:.8rem; color:var(--c-muted); margin-top:.2rem; }
.dash-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
@media(max-width:860px){ .dash-grid{ grid-template-columns:1fr; } }
.section-h { font-family:var(--font-display); font-size:1.05rem; font-weight:600; }
.list-row  { display:flex; align-items:center; justify-content:space-between; padding:.6rem 0; border-bottom:1px solid var(--c-border); }
.list-row:last-child { border-bottom:none; }
</style>
