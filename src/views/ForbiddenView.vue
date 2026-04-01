<template>
  <div class="forbidden-page">
    <div class="forbidden-card">
      <div class="forbidden-code">403</div>
      <h1 class="forbidden-title">Accès refusé</h1>
      <p class="forbidden-msg">
        Vous n'avez pas les droits nécessaires pour accéder au back-office.<br />
        Cette interface est réservée aux administrateurs.
      </p>

      <div class="forbidden-actions">
        <router-link :to="{ name: 'QuizList' }" class="btn btn-primary">Consulter les quiz</router-link>
        <router-link :to="{ name: 'PageList' }" class="btn btn-secondary">Consulter les pages</router-link>
        <button class="btn btn-ghost" @click="logout">Se déconnecter</button>
      </div>

      <div class="forbidden-info" v-if="authStore.isAuthenticated">
        <span class="text-muted text-xs">
          Connecté en tant que <strong>{{ authStore.currentUsername }}</strong>
          — rôle : <span class="badge badge-user">{{ authStore.currentRole }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'ForbiddenView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    function logout() {
      authStore.logout()
      router.push('/login')
    }

    return { authStore, logout }
  }
})
</script>

<style scoped>
.forbidden-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-bg);
  padding: 1.5rem;
}

.forbidden-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.forbidden-code {
  font-family: var(--font-display);
  font-size: 6rem;
  font-weight: 700;
  color: var(--c-red);
  line-height: 1;
  margin-bottom: .5rem;
  opacity: .15;
}

.forbidden-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: .75rem;
}

.forbidden-msg {
  color: var(--c-muted);
  font-size: .9rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.forbidden-actions {
  display: flex;
  flex-direction: column;
  gap: .6rem;
  align-items: center;
}

.forbidden-actions .btn {
  width: 100%;
  max-width: 260px;
  justify-content: center;
}

.forbidden-info {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--c-border);
}
</style>
