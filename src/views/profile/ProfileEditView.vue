<template>
  <div style="max-width:560px">
    <div class="page-header">
      <router-link to="/profile" class="back-link">← Retour au profil</router-link>
      <h1>Modifier mon profil</h1>
      <p>Mettez à jour vos informations personnelles</p>
    </div>

    <div v-if="loading" class="text-muted">Chargement…</div>

    <div class="card" v-else>
      <div v-if="saveError" class="alert alert-error mb-2">{{ saveError }}</div>
      <div v-if="success" class="alert alert-success mb-2">Profil mis à jour avec succès !</div>

      <form @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="form-group">
          <label class="form-label">Nom d'utilisateur</label>
          <input
            v-model="form.user_name"
            type="text"
            class="form-control"
            required
            minlength="3"
            maxlength="32"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="form-control"
            required
            minlength="6"
            maxlength="32"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Téléphone <span class="optional">(optionnel)</span></label>
          <input
            v-model="form.phone"
            type="tel"
            class="form-control"
            placeholder="+33 6 00 00 00 00"
          />
        </div>

        <div class="divider"></div>

        <div class="flex gap-1" style="justify-content:flex-end">
          <router-link to="/profile" class="btn btn-secondary">Annuler</router-link>
          <button type="submit" class="btn btn-primary" :disabled="usersStore.loading">
            {{ usersStore.loading ? 'Sauvegarde…' : 'Sauvegarder' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'ProfileEditView',
  setup() {
    const usersStore    = useUsersStore()
    const authStore     = useAuthStore()
    const loading       = ref(true)
    const success       = ref(false)
    const saveError     = ref('')

    const form = reactive({ user_name: '', email: '', phone: '' })

    let initialForm     = { user_name: '', email: '', phone: '' }
    const currentUserId = ref<number | null>(null)

    onMounted(async () => {
      loading.value = true
      try {
        const sub = authStore.currentSub
        if (!sub) return

        await usersStore.fetchAll()
        const found = usersStore.users.find(
          u => u.email === sub || u.user_name === sub
        )

        if (found) {
          await usersStore.fetchById(found.id)
          const user       = usersStore.selectedUser ?? found
          form.user_name   = user.user_name
          form.email       = user.email
          form.phone       = user.phone ?? ''

          initialForm         = { ...form }
          currentUserId.value = user.id
        }
      } finally {
        loading.value = false
      }
    })

    async function submit() {
      success.value   = false
      saveError.value = ''

      if (!currentUserId.value) {
        saveError.value = "Impossible d'identifier l'utilisateur."
        return
      }

      const changedFields: Record<string, string> = {}
      if (form.user_name !== initialForm.user_name) changedFields.user_name = form.user_name
      if (form.email     !== initialForm.email)     changedFields.email     = form.email
      if (form.phone     !== initialForm.phone)     changedFields.phone     = form.phone

      if (Object.keys(changedFields).length === 0) {
        saveError.value = 'Aucune modification détectée.'
        return
      }

      try {
        const allFieldsChanged = Object.keys(changedFields).length === 3

        if (allFieldsChanged) {
          // Tous les champs modifiés → PUT
          await usersStore.updateUser(currentUserId.value, {
            user_name: form.user_name,
            email:     form.email,
            phone:     form.phone,
          })
        } else {
          // Modification partielle → PATCH
          await usersStore.patchUser(currentUserId.value, changedFields)
        }

        initialForm   = { ...form }
        success.value = true
      } catch (err: any) {
        saveError.value = err?.message ?? 'Une erreur est survenue lors de la sauvegarde.'
      }
    }

    return { usersStore, form, loading, success, saveError, submit }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.optional  { font-weight:400; text-transform:none; letter-spacing:0; color:var(--c-muted); }
</style>