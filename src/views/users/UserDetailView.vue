<template>
  <div style="max-width:640px">
    <div class="page-header">
      <router-link to="/admin/users" class="back-link">← Retour à la liste</router-link>
      <h1>Fiche utilisateur</h1>
    </div>

    <div v-if="store.loading" class="text-muted">Chargement…</div>
    <div v-else-if="store.error" class="alert alert-error">{{ store.error }}</div>

    <template v-else-if="user">
      <!-- Carte principale -->
      <div class="card mb-2">
        <div class="user-hero">
          <div class="user-avatar-lg">{{ initials }}</div>
          <div>
            <div class="user-fullname">{{ user.user_name }}</div>
            <span class="badge" :class="user.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'">
              {{ user.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur' }}
            </span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-list">
          <div class="detail-row"><span class="detail-key">Email</span><span>{{ user.email }}</span></div>
          <div class="detail-row"><span class="detail-key">Téléphone</span><span>{{ user.phone ?? '—' }}</span></div>
          <div class="detail-row"><span class="detail-key">Dernière activité</span><span>{{ fmtDate(user.last_activity_at) }}</span></div>
          <div class="detail-row"><span class="detail-key">ID</span><span class="text-muted text-xs">#{{ user.id }}</span></div>
        </div>
      </div>

      <!-- Zone danger -->
      <div class="card danger-zone">
        <h3 class="danger-title">Zone de danger</h3>

        <!-- Anonymisation -->
        <div class="danger-action">
          <div>
            <div class="fw-500 text-sm">Anonymiser l'utilisateur</div>
            <div class="text-xs text-muted">Efface les données personnelles tout en conservant l'historique.</div>
          </div>
          <button class="btn btn-secondary btn-sm" @click="showAnonymize = true">Anonymiser</button>
        </div>

        <div class="divider"></div>

        <!-- Suppression -->
        <div class="danger-action">
          <div>
            <div class="fw-500 text-sm">Supprimer le compte</div>
            <div class="text-xs text-muted">Cette action est irréversible.</div>
          </div>
          <button class="btn btn-danger btn-sm" @click="showDelete = true">Supprimer</button>
        </div>
      </div>
    </template>

    <!-- Modals -->
    <ConfirmModal
      v-if="showDelete"
      title="Supprimer le compte"
      :message="`Supprimer définitivement l'utilisateur « ${user?.user_name} » ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />

    <div v-if="showAnonymize" class="modal-overlay" @click.self="showAnonymize = false">
      <div class="modal">
        <p class="modal-title">Anonymiser l'utilisateur</p>
        <p class="text-muted text-sm">
          Cette action remplacera les données personnelles de <strong>{{ user?.user_name }}</strong> par des valeurs anonymes.
          L'historique d'activité est conservé.
        </p>
        <div class="alert alert-warning mt-2" style="font-size:.825rem">
          ⚠️ Le back-end ne propose pas encore d'endpoint d'anonymisation manuel.
          Cette action est préparée côté front pour une intégration future.
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showAnonymize = false">Annuler</button>
          <button class="btn btn-danger" @click="showAnonymize = false">Confirmer (non implémenté)</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'UserDetailView',
  components: { ConfirmModal },
  setup() {
    const store = useUsersStore()
    const route = useRoute()
    const router = useRouter()
    const showDelete = ref(false)
    const showAnonymize = ref(false)

    onMounted(() => store.fetchById(Number(route.params.id)))

    const user = computed(() => store.selectedUser)
    const initials = computed(() => (user.value?.user_name ?? '?').slice(0, 2).toUpperCase())

    function fmtDate(d: string) {
      return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    async function doDelete() {
      if (!user.value) return
      await store.deleteById(user.value.id)
      showDelete.value = false
      router.push('/admin/users')
    }

    return { store, user, initials, showDelete, showAnonymize, fmtDate, doDelete }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.user-hero { display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; }
.user-avatar-lg { width:56px; height:56px; border-radius:50%; background:var(--c-accent-lt); color:var(--c-accent); display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:700; flex-shrink:0; }
.user-fullname { font-family:var(--font-display); font-size:1.35rem; font-weight:600; }
.detail-list { display:flex; flex-direction:column; gap:0; }
.detail-row { display:flex; justify-content:space-between; align-items:center; padding:.6rem 0; border-bottom:1px solid var(--c-border); font-size:.875rem; }
.detail-row:last-child { border-bottom:none; }
.detail-key { font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.05em; color:var(--c-muted); }
.danger-zone { border-color:#fca5a5; }
.danger-title { font-size:.85rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--c-red); margin-bottom:1rem; }
.danger-action { display:flex; align-items:center; justify-content:space-between; gap:1rem; }
</style>
