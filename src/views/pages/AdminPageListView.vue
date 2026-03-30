<template>
  <div>
    <div class="page-header page-header-row">
      <div>
        <h1>Gestion des pages</h1>
        <p>Créer, éditer et supprimer les pages de contenu</p>
      </div>
      <router-link to="/admin/pages/create" class="btn btn-primary">+ Nouvelle page</router-link>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>

    <div class="table-wrap">
      <div v-if="store.loading" class="empty-state">Chargement…</div>
      <div v-else-if="!store.pages.length" class="empty-state text-muted">Aucune page créée.</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>#ID</th>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Blocs de contenu</th>
            <th>Image</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.pages" :key="p.id">
            <td class="text-muted text-xs">#{{ p.id }}</td>
            <td class="fw-500">{{ p.title }}</td>
            <td>
              <span class="badge badge-neutral" v-if="p.category">{{ p.category.name }}</span>
              <span class="text-muted" v-else>—</span>
            </td>
            <td>
              <span class="badge badge-user">{{ p.content?.length ?? 0 }}</span>
            </td>
            <td>
              <span class="badge badge-admin" v-if="p.imageUrl">✓</span>
              <span class="text-muted" v-else>—</span>
            </td>
            <td>
              <div class="flex gap-1" style="justify-content:flex-end">
                <router-link :to="{ name: 'PageDetail', params: { id: p.id } }" class="btn btn-ghost btn-sm">Voir</router-link>
                <router-link :to="`/admin/pages/${p.id}/edit`" class="btn btn-secondary btn-sm">Éditer</router-link>
                <button class="btn btn-danger btn-sm" @click="askDelete(p.id, p.title)">Suppr.</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      v-if="deleteTarget"
      :message="`Supprimer la page « ${deleteTarget.name} » et tout son contenu ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { usePagesStore } from '@/stores/pages'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'AdminPageListView',
  components: { ConfirmModal },
  setup() {
    const store = usePagesStore()
    const deleteTarget = ref<{ id: number; name: string } | null>(null)

    onMounted(() => store.fetchAll())

    function askDelete(id: number, name: string) { deleteTarget.value = { id, name } }

    async function doDelete() {
      if (!deleteTarget.value) return
      await store.deleteById(deleteTarget.value.id)
      deleteTarget.value = null
    }

    return { store, deleteTarget, askDelete, doDelete }
  }
})
</script>

<style scoped>
.empty-state { padding:2.5rem; text-align:center; font-size:.875rem; }
</style>
