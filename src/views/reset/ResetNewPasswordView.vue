<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <div class="auth-logo">🔒</div>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un nouveau mot de passe sécurisé</p>
      </div>

      <div v-if="resetStore.error" class="alert alert-error mb-2">{{ resetStore.error }}</div>
      <div v-if="success" class="alert alert-success mb-2">
        Mot de passe modifié ! Vous pouvez vous reconnecter.
      </div>

      <form v-if="!success" @submit.prevent="submit" class="flex flex-col gap-2">
        <div class="form-group">
          <label class="form-label">Nouveau mot de passe</label>
          <input v-model="form.password" type="password" class="form-control" placeholder="••••••••" required minlength="6" />
          <span class="form-hint">Minimum 6 caractères</span>
        </div>

        <div class="form-group">
          <label class="form-label">Confirmer le mot de passe</label>
          <input v-model="form.confirm" type="password" class="form-control" placeholder="••••••••" required />
          <span class="form-error" v-if="mismatch">Les mots de passe ne correspondent pas</span>
        </div>

        <button type="submit" class="btn btn-primary btn-lg w-full mt-2" style="justify-content:center" :disabled="resetStore.loading || mismatch">
          {{ resetStore.loading ? 'Modification…' : 'Valider' }}
        </button>
      </form>

      <router-link v-if="success" to="/login" class="btn btn-primary btn-lg w-full mt-2" style="display:flex;justify-content:center">
        Se connecter
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useResetStore } from '@/stores/reset'

export default defineComponent({
  name: 'ResetNewPasswordView',
  setup() {
    const resetStore = useResetStore()
    const router = useRouter()
    const success = ref(false)
    const form = reactive({ password: '', confirm: '' })

    onMounted(() => {
      if (!resetStore.resetJwt) router.replace('/reset')
    })

    const mismatch = computed(() => !!form.confirm && form.password !== form.confirm)

    async function submit() {
      if (mismatch.value) return
      try {
        await resetStore.resetPassword(form.password)
        success.value = true
      } catch { /* erreur dans store */ }
    }

    return { resetStore, form, mismatch, success, submit }
  }
})
</script>

<style scoped>
.auth-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--c-bg); padding:1rem; }
.auth-card { background:var(--c-surface); border:1px solid var(--c-border); border-radius:var(--radius-lg); box-shadow:var(--shadow-lg); padding:2.5rem; width:100%; max-width:420px; }
.auth-header { text-align:center; margin-bottom:2rem; }
.auth-logo { font-size:2.25rem; margin-bottom:.5rem; }
.auth-header h1 { font-family:var(--font-display); font-size:1.6rem; font-weight:700; }
.auth-header p { color:var(--c-muted); font-size:.875rem; margin-top:.25rem; }
</style>
