<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link to="/login" class="back-link">← Retour à la connexion</router-link>
      <div class="auth-header">
        <div class="auth-logo">🔑</div>
        <h1>Réinitialisation</h1>
        <p>Choisissez le canal de réception du code</p>
      </div>

      <div v-if="resetStore.error" class="alert alert-error mb-2">{{ resetStore.error }}</div>

      <form @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="form-group">
          <label class="form-label">Identifiant</label>
          <input v-model="form.identifier" type="text" class="form-control" placeholder="Email ou nom d'utilisateur" required />
        </div>

        <div class="form-group">
          <label class="form-label">Canal de réception</label>
          <div class="channel-grid">
            <label class="channel-option" :class="{ selected: form.channel === 'email' }">
              <input type="radio" v-model="form.channel" value="email" style="display:none" />
              <span class="channel-icon">📧</span>
              <span class="channel-label">Email</span>
            </label>
            <label class="channel-option" :class="{ selected: form.channel === 'sms' }">
              <input type="radio" v-model="form.channel" value="sms" style="display:none" />
              <span class="channel-icon">📱</span>
              <span class="channel-label">SMS</span>
            </label>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2" style="justify-content:center" :disabled="resetStore.loading || !form.channel">
          {{ resetStore.loading ? 'Envoi…' : 'Recevoir le code' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useResetStore } from '@/stores/reset'

export default defineComponent({
  name: 'ResetChannelView',
  setup() {
    const resetStore = useResetStore()
    const router = useRouter()
    const form = reactive({ identifier: '', channel: '' as 'email' | 'sms' | '' })

    async function submit() {
      if (!form.channel) return
      try {
        await resetStore.requestReset({ identifier: form.identifier, channel: form.channel as 'email' | 'sms' })
        router.push('/reset/verify')
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
.back-link:hover { color:var(--c-text); }
.auth-header { text-align:center; margin-bottom:2rem; }
.auth-logo { font-size:2.25rem; margin-bottom:.5rem; }
.auth-header h1 { font-family:var(--font-display); font-size:1.6rem; font-weight:700; color:var(--c-text); }
.auth-header p { color:var(--c-muted); font-size:.875rem; margin-top:.25rem; }

.channel-grid { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; margin-top:.25rem; }
.channel-option {
  display:flex; flex-direction:column; align-items:center; gap:.4rem;
  padding:1rem; border:2px solid var(--c-border-2); border-radius:var(--radius);
  cursor:pointer; transition:all var(--transition);
}
.channel-option:hover { border-color:var(--c-accent-2); background:var(--c-surface-2); }
.channel-option.selected { border-color:var(--c-accent); background:var(--c-accent-lt); }
.channel-icon { font-size:1.5rem; }
.channel-label { font-size:.875rem; font-weight:500; }
</style>
