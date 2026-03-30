<template>
  <div style="max-width:560px">
    <div class="page-header">
      <router-link to="/admin/users" class="back-link">← Retour à la liste</router-link>
      <h1>Nouvel utilisateur</h1>
      <p>Créer un compte utilisateur ou administrateur</p>
    </div>

    <div class="card">
      <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>
      <div v-if="success" class="alert alert-success mb-2">Utilisateur créé avec succès !</div>

      <form @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <input v-model="form.user_name" type="text" class="form-control" placeholder="johndoe" required minlength="3" maxlength="32" />
          </div>
          <div class="form-group">
            <label class="form-label">Rôle</label>
            <select v-model="form.role" class="form-control">
              <option value="ROLE_USER">Utilisateur</option>
              <option value="ROLE_ADMIN">Administrateur</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="form.email" type="email" class="form-control" placeholder="user@example.com" required minlength="6" maxlength="32" />
        </div>

        <div class="form-group">
          <label class="form-label">Téléphone <span class="optional">(optionnel)</span></label>
          <input v-model="form.phone" type="tel" class="form-control" placeholder="+33 6 00 00 00 00" />
        </div>

        <div class="form-group">
          <label class="form-label">Mot de passe</label>
          <input v-model="form.password" type="password" class="form-control" required minlength="6" />
          <span class="form-hint">Minimum 6 caractères</span>
        </div>

        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <router-link to="/admin/users" class="btn btn-secondary">Annuler</router-link>
          <button type="submit" class="btn btn-primary" :disabled="store.loading">
            {{ store.loading ? 'Création…' : 'Créer l\'utilisateur' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import type { Role } from '@/types'

export default defineComponent({
  name: 'UserFormView',
  setup() {
    const store = useUsersStore()
    const authStore = useAuthStore()
    const success = ref(false)
    const form = reactive({
      user_name: '', email: '', phone: '', password: '',
      role: 'ROLE_USER' as Role
    })

    async function submit() {
      success.value = false
      try {
        if (form.role === 'ROLE_ADMIN') {
          // Utilise /auth/register-admin pour créer un admin
          await authApi.registerAdmin({
            user_name: form.user_name, email: form.email,
            phone: form.phone, password: form.password, role: form.role
          })
          await store.fetchAll()
        } else {
          await store.create({
            user_name: form.user_name, email: form.email,
            phone: form.phone, password: form.password, role: form.role
          })
        }
        success.value = true
        Object.assign(form, { user_name: '', email: '', phone: '', password: '', role: 'ROLE_USER' })
      } catch { /* erreur dans store */ }
    }

    return { store, form, success, submit }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.optional { font-weight:400; text-transform:none; letter-spacing:0; color:var(--c-muted); }
</style>
