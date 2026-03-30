<template>
  <div style="max-width:640px">
    <div class="page-header">
      <router-link to="/admin/quiz" class="back-link">← Retour à la gestion quiz</router-link>
      <h1>Nouveau quiz</h1>
      <p>Créez un quiz puis ajoutez vos questions</p>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>
    <div v-if="success" class="alert alert-success mb-2">
      Quiz créé ! Vous pouvez maintenant <router-link :to="`/admin/quiz/${createdId}/edit`" style="color:var(--c-accent);font-weight:500">ajouter des questions</router-link>.
    </div>

    <div class="card">
      <form @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="form-group">
          <label class="form-label">Titre <span class="text-muted text-xs">(3–32 caractères)</span></label>
          <input v-model="form.title" type="text" class="form-control" placeholder="Ex : Évaluation du stress" required minlength="3" maxlength="32" />
        </div>

        <div class="form-group">
          <label class="form-label">Description <span class="text-muted text-xs">(3–32 caractères)</span></label>
          <input v-model="form.description" type="text" class="form-control" placeholder="Courte description du quiz" required minlength="3" maxlength="32" />
        </div>

        <div class="flex gap-1 mt-1" style="justify-content:flex-end">
          <router-link to="/admin/quiz" class="btn btn-secondary">Annuler</router-link>
          <button type="submit" class="btn btn-primary" :disabled="store.loading">
            {{ store.loading ? 'Création…' : 'Créer le quiz' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quiz'

export default defineComponent({
  name: 'QuizFormView',
  setup() {
    const store = useQuizStore()
    const router = useRouter()
    const success = ref(false)
    const createdId = ref<number | null>(null)
    const form = reactive({ title: '', description: '' })

    async function submit() {
      success.value = false
      try {
        const created = await store.create(form)
        if (created) {
          createdId.value = created.id
          success.value = true
          // Redirige vers l'édition pour ajouter les questions
          setTimeout(() => router.push(`/admin/quiz/${created.id}/edit`), 1500)
        }
      } catch { /* erreur dans store */ }
    }

    return { store, form, success, createdId, submit }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
</style>
