<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🌿</div>
        <h1>CESIZen</h1>
        <p>Connexion au back-office</p>
      </div>

      <div v-if="authStore.error" class="alert alert-error mb-2">{{ authStore.error }}</div>

      <form @submit.prevent="submit" class="auth-form">
        <div class="form-group">
          <label class="form-label">Identifiant <span class="text-muted text-xs">(email ou nom d'utilisateur)</span></label>
          <input
            v-model="form.identifier"
            type="text"
            class="form-control"
            placeholder="email ou nom d'utilisateur"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group mt-2">
          <label class="form-label">Mot de passe</label>
          <input
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-3" style="justify-content:center" :disabled="authStore.loading">
          {{ authStore.loading ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>

      <div class="auth-links">
        <router-link to="/reset">Mot de passe oublié ?</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'LoginView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const form = reactive({ identifier: '', password: '' })

    async function submit() {
      try {
        await authStore.login(form)
        router.push(authStore.isAdmin ? { name: 'Dashboard' } : { name: 'QuizList' })
      } catch { /* erreur affichée via store */ }
    }

    return { authStore, form, submit }
  }
})
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--c-bg); padding:1rem; }
.auth-card { background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); padding:2.5rem; width:100%; max-width:420px; }
.auth-header { text-align:center; margin-bottom:2rem; }
.auth-logo { font-size:2.5rem; margin-bottom:.5rem; }
.auth-header h1 { font-family:var(--font-display); font-size:1.75rem; font-weight:700; color:var(--c-accent); }
.auth-header p { color:var(--c-muted); font-size:.875rem; margin-top:.25rem; }
.auth-form { display:flex; flex-direction:column; gap:0; }
.auth-links { text-align:center; margin-top:1.25rem; font-size:.85rem; color:var(--c-muted); }
.auth-links a { color:var(--c-accent-2); font-weight:500; }
.auth-links a:hover { text-decoration:underline; }
</style>
