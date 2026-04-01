<template>
  <div style="max-width:720px">
    <div class="page-header">
      <router-link to="/admin/quiz" class="back-link">← Retour à la gestion quiz</router-link>
      <h1>Éditer le quiz</h1>
    </div>

    <div v-if="store.loading && !store.selectedQuiz" class="text-muted">Chargement…</div>
    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>

    <template v-if="store.selectedQuiz">
      <!-- ── Infos du quiz ────────────────────────────────────────────── -->
      <div class="card mb-2">
        <h2 class="section-title">Informations générales</h2>
        <div v-if="titleSuccess" class="alert alert-success mb-2">Quiz mis à jour !</div>

        <form @submit.prevent="updateQuiz" class="flex flex-col gap-2">
          <div class="form-group">
            <label class="form-label">Titre <span class="text-muted text-xs">(3–32 car.)</span></label>
            <input v-model="titleForm.title" type="text" class="form-control" required minlength="3" maxlength="32" />
          </div>
          <div class="form-group">
            <label class="form-label">Description <span class="text-muted text-xs">(3–32 car.)</span></label>
            <input v-model="titleForm.description" type="text" class="form-control" required minlength="3" maxlength="32" />
          </div>
          <div style="display:flex;justify-content:flex-end">
            <button type="submit" class="btn btn-primary btn-sm" :disabled="store.loading">
              {{ store.loading ? 'Sauvegarde…' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ── Questions ───────────────────────────────────────────────── -->
      <div class="card mb-2">
        <div class="flex justify-between items-center mb-2">
          <h2 class="section-title">Questions
            <span class="badge badge-user ml-1">{{ store.selectedQuiz.questionList?.length ?? 0 }}</span>
          </h2>
        </div>

        <!-- Liste des questions existantes -->
        <div v-if="!store.selectedQuiz.questionList?.length" class="text-muted text-sm mb-2">
          Aucune question pour le moment. Ajoutez-en ci-dessous.
        </div>
        <div v-else class="q-list mb-2">
          <div v-for="(q, i) in store.selectedQuiz.questionList" :key="q.id" class="q-row">
            <div class="q-row-left">
              <span class="q-num-badge">{{ i + 1 }}</span>
              <div>
                <div class="fw-500 text-sm">{{ q.statement }}</div>
                <div class="text-xs text-muted">Score : {{ q.scoreValue }} pt(s) · Réponse correcte : {{ q.correctAnswer === true ? 'Oui' : q.correctAnswer === false ? 'Non' : 'Non définie' }}</div>
              </div>
            </div>
            <button class="btn btn-danger btn-sm" @click="askDeleteQ(q.id!, q.statement)" :disabled="store.loading">✕</button>
          </div>
        </div>

        <!-- Formulaire ajout question -->
        <div class="add-q-form">
          <h3 class="add-q-title">Ajouter une question</h3>
          <div class="form-group mb-2">
            <label class="form-label">Énoncé</label>
            <input v-model="newQ.statement" type="text" class="form-control" placeholder="Ex : Avez-vous des troubles du sommeil ?" />
          </div>
          <div class="grid-2 mb-2">
            <div class="form-group">
              <label class="form-label">Valeur (score)</label>
              <input v-model.number="newQ.scoreValue" type="number" class="form-control" min="0" max="100" />
            </div>
          </div>
          <button
            class="btn btn-primary btn-sm"
            @click="addQuestion"
            :disabled="!newQ.statement.trim() || store.loading"
          >
            + Ajouter la question
          </button>
          <div v-if="qSuccess" class="alert alert-success mt-1" style="font-size:.8rem">Question ajoutée !</div>
        </div>
      </div>

      <!-- ── Danger ───────────────────────────────────────────────────── -->
      <div class="card danger-zone">
        <h3 class="danger-title">Zone de danger</h3>
        <div class="flex justify-between items-center">
          <div>
            <div class="fw-500 text-sm">Supprimer ce quiz</div>
            <div class="text-xs text-muted">Toutes les questions associées seront supprimées.</div>
          </div>
          <button class="btn btn-danger btn-sm" @click="showDeleteQuiz = true">Supprimer le quiz</button>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <ConfirmModal
      v-if="deleteQTarget"
      title="Supprimer la question"
      :message="`Supprimer « ${deleteQTarget.name} » ?`"
      :loading="store.loading"
      @confirm="doDeleteQ"
      @cancel="deleteQTarget = null"
    />

    <ConfirmModal
      v-if="showDeleteQuiz"
      title="Supprimer le quiz"
      :message="`Supprimer définitivement le quiz « ${store.selectedQuiz?.title} » ?`"
      :loading="store.loading"
      @confirm="doDeleteQuiz"
      @cancel="showDeleteQuiz = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'QuizEditView',
  components: { ConfirmModal },
  setup() {
    const store = useQuizStore()
    const route = useRoute()
    const router = useRouter()
    const quizId = Number(route.params.id)

    const titleForm = reactive({ title: '', description: '' })
    const newQ = reactive({ statement: '', scoreValue: 1 })
    const titleSuccess = ref(false)
    const qSuccess = ref(false)
    const deleteQTarget = ref<{ id: number; name: string } | null>(null)
    const showDeleteQuiz = ref(false)

    onMounted(async () => {
      await store.fetchById(quizId)
      if (store.selectedQuiz) {
        titleForm.title = store.selectedQuiz.title
        titleForm.description = store.selectedQuiz.description
      }
    })

    // Sync form si le quiz change
    watch(() => store.selectedQuiz, (q) => {
      if (q) { titleForm.title = q.title; titleForm.description = q.description }
    })

    async function updateQuiz() {
      titleSuccess.value = false
      await store.update(quizId, { title: titleForm.title, description: titleForm.description })
      titleSuccess.value = true
      setTimeout(() => { titleSuccess.value = false }, 2500)
    }

    async function addQuestion() {
      if (!newQ.statement.trim()) return
      qSuccess.value = false
      await store.addQuestion(quizId, { statement: newQ.statement, scoreValue: newQ.scoreValue })
      qSuccess.value = true
      newQ.statement = ''
      newQ.scoreValue = 1
      setTimeout(() => { qSuccess.value = false }, 2000)
    }

    function askDeleteQ(id: number, name: string) { deleteQTarget.value = { id, name } }

    async function doDeleteQ() {
      if (!deleteQTarget.value) return
      await store.deleteQuestion(quizId, deleteQTarget.value.id)
      deleteQTarget.value = null
    }

    async function doDeleteQuiz() {
      await store.deleteById(quizId)
      showDeleteQuiz.value = false
      router.push('/admin/quiz')
    }

    return { store, titleForm, newQ, titleSuccess, qSuccess, deleteQTarget, showDeleteQuiz, updateQuiz, addQuestion, askDeleteQ, doDeleteQ, doDeleteQuiz }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.section-title { font-family:var(--font-display); font-size:1.05rem; font-weight:600; margin-bottom:.75rem; }
.ml-1 { margin-left:.4rem; }

.q-list { display:flex; flex-direction:column; gap:.4rem; }
.q-row  { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding:.65rem .85rem; background:var(--c-surface-2); border:1px solid var(--c-border); border-radius:var(--radius-sm); }
.q-row-left { display:flex; align-items:flex-start; gap:.75rem; flex:1; min-width:0; }
.q-num-badge { width:24px; height:24px; border-radius:50%; background:var(--c-accent-lt); color:var(--c-accent); display:flex; align-items:center; justify-content:center; font-size:.7rem; font-weight:700; flex-shrink:0; }

.add-q-form { border-top:1px solid var(--c-border); padding-top:1rem; margin-top:.25rem; }
.add-q-title { font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--c-muted); margin-bottom:.75rem; }

.danger-zone  { border-color:#fca5a5; }
.danger-title { font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--c-red); margin-bottom:.85rem; }
</style>
