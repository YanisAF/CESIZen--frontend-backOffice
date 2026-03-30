<template>
  <div>
    <div class="page-header page-header-row">
      <div>
        <h1>Utilisateurs</h1>
        <p>Gestion de tous les comptes</p>
      </div>
      <router-link to="/admin/users/create" class="btn btn-primary">+ Nouvel utilisateur</router-link>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>

    <div class="table-wrap">
      <div v-if="store.loading" class="loading-row">Chargement…</div>
      <div v-else-if="!store.users.length" class="loading-row text-muted">Aucun utilisateur.</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Dernière activité</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in store.paginatedUsers" :key="u.id">
            <td class="text-muted text-xs">#{{ u.id }}</td>
            <td class="fw-500">{{ u.user_name }}</td>
            <td>{{ u.email }}</td>
            <td class="text-muted">{{ u.phone ?? '—' }}</td>
            <td>
              <span class="badge" :class="u.role === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'">
                {{ u.role === 'ROLE_ADMIN' ? 'Admin' : 'Utilisateur' }}
              </span>
            </td>
            <td class="text-xs text-muted">{{ fmtDate(u.last_activity_at) }}</td>
            <td>
              <div class="flex gap-1" style="justify-content:flex-end">
                <router-link :to="`/admin/users/${u.id}`" class="btn btn-secondary btn-sm">Voir</router-link>
                <button class="btn btn-danger btn-sm" @click="askDelete(u.id, u.user_name)">Suppr.</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-if="store.users.length"
      :current="store.pagination.currentPage"
      :total-pages="store.totalPages"
      :per-page="store.pagination.perPage"
      :total="store.users.length"
      @page="store.setPage"
      @per-page="store.setPerPage"
    />

    <ConfirmModal
      v-if="deleteTarget"
      :message="`Supprimer l'utilisateur « ${deleteTarget.name} » ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import Pagination from '@/components/ui/Pagination.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'UserListView',
  components: { Pagination, ConfirmModal },
  setup() {
    const store = useUsersStore()
    const deleteTarget = ref<{ id: number; name: string } | null>(null)

    onMounted(() => store.fetchAll())

    function fmtDate(d: string) {
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    function askDelete(id: number, name: string) {
      deleteTarget.value = { id, name }
    }

    async function doDelete() {
      if (!deleteTarget.value) return
      await store.deleteById(deleteTarget.value.id)
      deleteTarget.value = null
    }

    return { store, deleteTarget, fmtDate, askDelete, doDelete }
  }
})
</script>

<style scoped>
.loading-row { padding: 2rem; text-align: center; color: var(--c-muted); font-size: .875rem; }
</style>
