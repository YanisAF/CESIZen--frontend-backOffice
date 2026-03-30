<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/reset" class="back-link">← Retour</router-link>
      <div class="auth-header">
        <div class="auth-logo">📬</div>
        <h1>Vérification du code</h1>
        <p>Entrez le code reçu par {{ resetStore.channel === 'sms' ? 'SMS' : 'email' }}</p>
      </div>

      <div v-if="resetStore.error" class="alert alert-error mb-2">{{ resetStore.error }}</div>

      <form @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="form-group">
          <label class="form-label">Identifiant</label>
          <input v-model="form.identifier" type="text" class="form-control" placeholder="Email ou nom d'utilisateur" required />
          <span class="form-hint">Le même identifiant que l'étape précédente</span>
        </div>

        <div class="form-group">
          <label class="form-label">Code PIN</label>
          <input
            v-model="form.pin"
            type="text"
            class="form-control pin-input"
            placeholder="000000"
            maxlength="10"
            required
            autocomplete="one-time-code"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2" style="justify-content:center" :disabled="resetStore.loading">
          {{ resetStore.loading ? 'Vérification…' : 'Valider le code' }}
        </button>
      </form>

      <div class="resend-row">
        <span class="text-muted text-sm">Pas reçu le code ?</span>
        <router-link to="/reset" class="text-sm" style="color:var(--c-accent-2)">Renvoyer</router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResetStore } from '@/stores/reset'

export default defineComponent({
  name: 'ResetVerifyView',
  setup() {
    const resetStore = useResetStore()
    const router = useRouter()
    const form = reactive({ identifier: resetStore.identifier, pin: '' })

    onMounted(() => {
      // Si on arrive ici sans passer par l'étape 1, on redirige
      if (!resetStore.channel) router.replace('/reset')
    })

    async function submit() {
      try {
        await resetStore.verifyPin({ identifier: form.identifier, pin: form.pin })
        router.push('/reset/new-password')
      } catch { /* erreur dans store */ }
    }

    return { resetStore, form, submit }
  }
})
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--c-bg); padding:1rem; }
.auth-card { background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); padding:2.5rem; width:100%; max-width:420px; }
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:1.25rem; }
.auth-header { text-align:center; margin-bottom:2rem; }
.auth-logo { font-size:2.25rem; margin-bottom:.5rem; }
.auth-header h1 { font-family:var(--font-display); font-size:1.6rem; font-weight:700; }
.auth-header p { color:var(--c-muted); font-size:.875rem; margin-top:.25rem; }
.pin-input { font-size:1.4rem; letter-spacing:.3em; text-align:center; }
.resend-row { display:flex; align-items:center; justify-content:center; gap:.5rem; margin-top:1rem; }
</style>
