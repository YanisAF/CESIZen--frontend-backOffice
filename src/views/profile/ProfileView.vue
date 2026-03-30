<template>
  <div style="max-width:640px">
    <div class="page-header">
      <h1>Mon profil</h1>
      <p>Votre espace personnel</p>
    </div>

    <div v-if="loading" class="text-muted">Chargement du profil…</div>
    <div v-else-if="loadError" class="alert alert-error mb-2">{{ loadError }}</div>

    <template v-else-if="me">
      <!-- Carte identité -->
      <div class="card mb-2">
        <div class="profile-hero">
          <div class="profile-avatar">{{ initials }}</div>
          <div>
            <div class="profile-name">{{ me.user_name }}</div>
            <span class="badge" :class="me.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'">
              {{ me.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Utilisateur' }}
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-list">
          <div class="detail-row">
            <span class="detail-key">Email</span>
            <span>{{ me.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Téléphone</span>
            <span>{{ me.phone ?? '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">Dernière activité</span>
            <span>{{ fmtDate(me.last_activity_at) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-key">ID interne</span>
            <span class="text-muted text-xs">#{{ me.id }}</span>
          </div>
        </div>
      </div>

      <!-- Modifier les infos -->
      <div class="card mb-2">
        <div class="action-row">
          <div>
            <div class="fw-500 text-sm">Modifier mes informations</div>
            <div class="text-xs text-muted" style="margin-top:.25rem">Nom d'utilisateur, email, téléphone.</div>
          </div>
          <router-link to="/profile/edit" class="btn btn-secondary btn-sm">Modifier</router-link>
        </div>
      </div>

      <!-- Mot de passe -->
      <div class="card mb-2">
        <div class="action-row">
          <div>
            <div class="fw-500 text-sm">Réinitialiser mon mot de passe</div>
            <div class="text-xs text-muted" style="margin-top:.25rem">Via email ou SMS.</div>
          </div>
          <router-link to="/reset" class="btn btn-secondary btn-sm">Changer</router-link>
        </div>
      </div>

      <!-- Zone danger -->
      <div class="card danger-zone">
        <h3 class="danger-title">Zone de danger</h3>
        <div class="action-row">
          <div>
            <div class="fw-500 text-sm">Supprimer mon compte</div>
            <div class="text-xs text-muted" style="margin-top:.25rem">Cette action est définitive et irréversible.</div>
          </div>
          <button class="btn btn-danger btn-sm" @click="showDelete = true">Supprimer mon compte</button>
        </div>
      </div>
    </template>

    <!-- Fallback debug si sub introuvable dans la liste -->
    <div v-else-if="!loading" class="card">
      <p class="text-muted text-sm">
        Impossible de charger le profil — l'identifiant JWT (<code>sub</code>) ne correspond
        à aucun utilisateur retourné par l'API.
      </p>
      <div style="margin-top:.75rem;font-family:monospace;font-size:.75rem;background:var(--c-surface-2);padding:.75rem;border-radius:var(--radius-sm);color:var(--c-muted)">
        sub (JWT) : {{ authStore.currentSub }}<br/>
        role : {{ authStore.currentRole }}
      </div>
    </div>

    <ConfirmModal
      v-if="showDelete"
      title="Supprimer mon compte"
      message="Voulez-vous vraiment supprimer définitivement votre compte ? Cette action est irréversible."
      confirm-label="Oui, supprimer"
      :loading="usersStore.loading"
      @confirm="doDeleteSelf"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import type { UserResponse } from '@/types'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'ProfileView',
  components: { ConfirmModal },
  setup() {
    const usersStore = useUsersStore()
    const authStore = useAuthStore()
    const router = useRouter()
    const showDelete = ref(false)
    const loading = ref(true)
    const loadError = ref('')
    const me = ref<UserResponse | null>(null)

    onMounted(async () => {
      loading.value = true
      loadError.value = ''
      try {
        // Le JWT Spring contient :
        //   sub  = l'identifier utilisé au login (email ou userName selon CustomUserDetailsService)
        //   role = ["ROLE_ADMIN"] ou ["ROLE_USER"]
        // Il n'y a PAS d'userId dans le payload.
        // On charge la liste des users et on matche par email ou user_name.

        const sub = authStore.currentSub
        if (!sub) {
          loadError.value = 'Impossible de lire l\'identifiant depuis le token JWT.'
          return
        }

        await usersStore.fetchAll()

        const found = usersStore.users.find(
          u => u.email === sub || u.user_name === sub
        )

        if (found) {
          // Charger la fiche complète
          await usersStore.fetchById(found.id)
          me.value = usersStore.selectedUser ?? found
        } else {
          loadError.value = `Aucun profil trouvé pour « ${sub} ».`
        }
      } catch (err: unknown) {
        loadError.value = (err as { response?: { data?: { message?: string } } })
          .response?.data?.message ?? 'Erreur lors du chargement du profil.'
      } finally {
        loading.value = false
      }
    })

    const initials = computed((): string =>
      (me.value?.user_name ?? '?').slice(0, 2).toUpperCase()
    )

    function fmtDate(d: string): string {
      return new Date(d).toLocaleString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    }

    async function doDeleteSelf() {
      if (!me.value) return
      await usersStore.deleteById(me.value.id)
      authStore.logout()
      router.push('/login')
    }

    return {
      usersStore, authStore, me,
      loading, loadError,
      initials, showDelete,
      fmtDate, doDeleteSelf
    }
  }
})
</script>

<style scoped>
.profile-hero {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.25rem;
}
.profile-avatar {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--c-accent-lt); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 700; flex-shrink: 0;
}
.profile-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; }

.detail-list { display: flex; flex-direction: column; }
.detail-row  {
  display: flex; justify-content: space-between; align-items: center;
  padding: .6rem 0; border-bottom: 1px solid var(--c-border); font-size: .875rem;
}
.detail-row:last-child { border-bottom: none; }
.detail-key  {
  font-size: .75rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .05em;
  color: var(--c-muted);
}

.action-row   { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.danger-zone  { border-color: #fca5a5; }
.danger-title {
  font-size: .8rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .05em;
  color: var(--c-red); margin-bottom: .85rem;
}
</style>
