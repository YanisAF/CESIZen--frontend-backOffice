<template>
  <div>
    <div class="page-header page-header-row">
      <div>
        <h1>Configuration des résultats</h1>
        <p>Définissez les seuils de score et les messages renvoyés aux utilisateurs</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">+ Nouvelle config</button>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>

    <!-- Filtre par quiz -->
    <div class="filter-bar mb-2" v-if="quizStore.quizList.length">
      <span class="text-muted text-sm">Filtrer par quiz :</span>
      <button class="filter-chip" :class="{ active: !filterQuizId }" @click="filterQuizId = null">Tous</button>
      <button
        v-for="q in quizStore.quizList" :key="q.id"
        class="filter-chip"
        :class="{ active: filterQuizId === q.id }"
        @click="filterQuizId = q.id"
      >{{ q.title }}</button>
    </div>

    <div class="table-wrap">
      <div v-if="store.loading" class="empty-state">Chargement…</div>
      <div v-else-if="!filteredMessages.length" class="empty-state text-muted">
        Aucune configuration. Créez-en une pour définir les messages de résultat.
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Quiz</th>
            <th>Score min</th>
            <th>Score max</th>
            <th>Niveau de risque</th>
            <th>Message</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in filteredMessages" :key="m.id">
            <td>
              <span class="badge badge-neutral">#{{ m.quizId }}</span>
              <span class="text-xs text-muted ml-1">{{ quizName(m.quizId) }}</span>
            </td>
            <td class="fw-500">{{ m.minScore }}</td>
            <td class="fw-500">{{ m.maxScore }}</td>
            <td>
              <span class="badge" :class="riskClass(m.riskLevel)">{{ m.riskLevel }}</span>
            </td>
            <td class="text-sm text-muted" style="max-width:300px;white-space:pre-wrap">{{ m.message }}</td>
            <td>
              <div class="flex gap-1" style="justify-content:flex-end">
                <button class="btn btn-secondary btn-sm" @click="openEdit(m)">Éditer</button>
                <button class="btn btn-danger btn-sm" @click="askDelete(m.id, m.riskLevel)">Suppr.</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Créer / Éditer -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal" style="max-width:540px">
        <p class="modal-title">{{ editingId ? 'Modifier la configuration' : 'Nouvelle configuration' }}</p>

        <div class="flex flex-col gap-2">
          <div class="form-group">
            <label class="form-label">Quiz associé</label>
            <select v-model.number="form.quizId" class="form-control">
              <option value="" disabled>Choisir un quiz</option>
              <option v-for="q in quizStore.quizList" :key="q.id" :value="q.id">
                #{{ q.id }} — {{ q.title }}
              </option>
            </select>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Score minimum</label>
              <input v-model.number="form.minScore" type="number" class="form-control" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Score maximum</label>
              <input v-model.number="form.maxScore" type="number" class="form-control" min="0" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Niveau de risque</label>
            <select v-model="form.riskLevel" class="form-control">
              <option value="FAIBLE">FAIBLE</option>
              <option value="MODERE">MODERE</option>
              <option value="ELEVE">ELEVE</option>
              <option value="CRITIQUE">CRITIQUE</option>
            </select>
            <span class="form-hint">Correspond à la valeur retournée par l'API de score</span>
          </div>

          <div class="form-group">
            <label class="form-label">Message affiché à l'utilisateur</label>
            <textarea v-model="form.message" class="form-control" rows="4" placeholder="Ex : Votre niveau de stress est faible. Continuez ainsi !" style="resize:vertical"></textarea>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeModal">Annuler</button>
          <button class="btn btn-primary" @click="save" :disabled="store.loading || !form.quizId || !form.message">
            {{ store.loading ? 'Sauvegarde…' : 'Sauvegarder' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      v-if="deleteTarget"
      :message="`Supprimer la configuration « ${deleteTarget.name} » ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quiz'
import type { ResultMessageResponse } from '@/types'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'ResultConfigView',
  components: { ConfirmModal },
  setup() {
    const store = useQuizStore()
    const showModal = ref(false)
    const editingId = ref<number | null>(null)
    const filterQuizId = ref<number | null>(null)
    const deleteTarget = ref<{ id: number; name: string } | null>(null)

    const form = reactive({
      quizId: 0 as number,
      minScore: 0,
      maxScore: 10,
      riskLevel: 'FAIBLE',
      message: ''
    })

    onMounted(() => {
      store.fetchResultMessages()
      store.fetchAll()
    })

    const filteredMessages = computed(() =>
      filterQuizId.value
        ? store.resultMessages.filter(m => m.quizId === filterQuizId.value)
        : store.resultMessages
    )

    function quizName(id: number) {
      return store.quizList.find(q => q.id === id)?.title ?? ''
    }

    function riskClass(level: string) {
      const l = level?.toLowerCase()
      if (l?.includes('faible')) return 'badge-admin'
      if (l?.includes('modere') || l?.includes('moyen')) return 'badge-warning'
      return 'badge-danger'
    }

    function openCreate() {
      editingId.value = null
      Object.assign(form, { quizId: 0, minScore: 0, maxScore: 10, riskLevel: 'FAIBLE', message: '' })
      showModal.value = true
    }

    function openEdit(m: ResultMessageResponse) {
      editingId.value = m.id
      Object.assign(form, { quizId: m.quizId, minScore: m.minScore, maxScore: m.maxScore, riskLevel: m.riskLevel, message: m.message })
      showModal.value = true
    }

    function closeModal() { showModal.value = false; editingId.value = null }

    async function save() {
      const payload = { quizId: form.quizId, minScore: form.minScore, maxScore: form.maxScore, riskLevel: form.riskLevel, message: form.message }
      if (editingId.value) {
        await store.updateResultMessage(editingId.value, payload)
      } else {
        await store.createResultMessage(payload)
      }
      closeModal()
    }

    function askDelete(id: number, name: string) { deleteTarget.value = { id, name } }

    async function doDelete() {
      if (!deleteTarget.value) return
      await store.deleteResultMessage(deleteTarget.value.id)
      deleteTarget.value = null
    }

    return { store, quizStore: store, showModal, editingId, form, filterQuizId, filteredMessages, deleteTarget, quizName, riskClass, openCreate, openEdit, closeModal, save, askDelete, doDelete }
  }
})
</script>

<style scoped>
.filter-bar { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.filter-chip { padding:.3rem .75rem; border-radius:999px; border:1px solid var(--c-border-2); background:var(--c-surface); font-size:.8rem; cursor:pointer; transition:all var(--transition); }
.filter-chip:hover { background:var(--c-surface-2); }
.filter-chip.active { background:var(--c-accent); color:#fff; border-color:var(--c-accent); }
.empty-state { padding:2.5rem; text-align:center; font-size:.875rem; }
.ml-1 { margin-left:.3rem; }
</style>
