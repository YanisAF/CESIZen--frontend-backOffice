<template>
  <div>
    <div class="page-header page-header-row">
      <div>
        <h1>Gestion des quiz</h1>
        <p>Créer, éditer et supprimer les quiz</p>
      </div>
      <router-link to="/admin/quiz/create" class="btn btn-primary">+ Nouveau quiz</router-link>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>
    <div v-if="store.loading" class="text-muted">Chargement…</div>

    <div class="table-wrap" v-else>
      <div v-if="!store.quizList.length" class="empty-state">Aucun quiz créé. Commencez par en créer un !</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Questions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in store.quizList" :key="q.id">
            <td class="text-muted text-xs">#{{ q.id }}</td>
            <td class="fw-500">{{ q.title }}</td>
            <td class="text-muted text-sm" style="max-width:280px">{{ q.description }}</td>
            <td>
              <span class="badge badge-user">{{ q.questionList?.length ?? 0 }}</span>
            </td>
            <td>
              <div class="flex gap-1" style="justify-content:flex-end">
                <router-link :to="{ name: 'QuizDetail', params: { id: q.id } }" class="btn btn-ghost btn-sm">Voir</router-link>
                <router-link :to="`/admin/quiz/${q.id}/edit`" class="btn btn-secondary btn-sm">Éditer</router-link>
                <button class="btn btn-danger btn-sm" @click="askDelete(q.id, q.title)">Suppr.</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      v-if="deleteTarget"
      :message="`Supprimer le quiz « ${deleteTarget.name} » et toutes ses questions ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useQuizStore } from '@/stores/quiz'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'AdminQuizListView',
  components: { ConfirmModal },
  setup() {
    const store = useQuizStore()
    const deleteTarget = ref<{ id: number; name: string } | null>(null)

    onMounted(() => store.fetchAll())

    function askDelete(id: number, name: string) { deleteTarget.value = { id, name } }

    async function doDelete() {
      if (!deleteTarget.value) return
      await store.deleteById(deleteTarget.value.id)
      deleteTarget.value = null
    }

    return { store, deleteTarget, askDelete, doDelete }
  }
})
</script>

<style scoped>
.empty-state { padding:3rem; text-align:center; color:var(--c-muted); font-size:.9rem; }
</style>
