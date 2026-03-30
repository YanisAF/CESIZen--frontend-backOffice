<template>
  <div style="max-width:720px">
    <div class="page-header">
      <router-link to="/admin/pages" class="back-link">← Retour à la gestion des pages</router-link>
      <h1>Éditer la page</h1>
    </div>

    <div v-if="store.loading && !store.selectedPage" class="text-muted">Chargement…</div>
    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>

    <template v-if="store.selectedPage">
      <div v-if="saveSuccess" class="alert alert-success mb-2">Page mise à jour !</div>

      <form @submit.prevent="submit">
        <!-- Infos principales -->
        <div class="card mb-2">
          <h2 class="section-title">Informations générales</h2>
          <div class="flex flex-col gap-2">
            <div class="form-group">
              <label class="form-label">Titre</label>
              <input v-model="form.title" type="text" class="form-control" required />
            </div>

            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <select v-model.number="form.category" class="form-control" required>
                <option :value="0" disabled>Choisir une catégorie</option>
                <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>

            <!-- Image actuelle -->
            <div class="form-group" v-if="store.selectedPage.imageUrl && !newImagePreview">
              <label class="form-label">Image actuelle</label>
              <img :src="store.selectedPage.imageUrl" class="current-img" :alt="form.title" />
            </div>

            <div class="form-group">
              <label class="form-label">{{ store.selectedPage.imageUrl ? 'Remplacer l\'image' : 'Ajouter une image' }} <span class="optional">(optionnel)</span></label>
              <div class="file-drop" @click="triggerFile" @dragover.prevent @drop.prevent="onDrop">
                <img v-if="newImagePreview" :src="newImagePreview" class="preview-img" />
                <div v-else class="file-drop-placeholder text-muted text-sm">
                  <span style="font-size:1.5rem">📷</span>
                  <p class="mt-1">Cliquez pour changer l'image</p>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            </div>
          </div>
        </div>

        <!-- Blocs de contenu -->
        <div class="card mb-2">
          <div class="flex justify-between items-center mb-2">
            <h2 class="section-title">Blocs de contenu
              <span class="badge badge-user ml-1">{{ form.content.length }}</span>
            </h2>
            <button type="button" class="btn btn-secondary btn-sm" @click="addBlock">+ Ajouter</button>
          </div>

          <div v-if="!form.content.length" class="text-muted text-sm mb-2">Aucun bloc de contenu.</div>

          <div v-for="(block, i) in form.content" :key="i" class="content-block-editor">
            <div class="block-header">
              <span class="block-num">Bloc {{ i + 1 }}</span>
              <button type="button" class="btn btn-danger btn-sm" @click="removeBlock(i)">✕</button>
            </div>
            <div class="flex flex-col gap-2">
              <div class="form-group">
                <label class="form-label">Nom</label>
                <input v-model="block.name" type="text" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea v-model="block.description" class="form-control" rows="3" required style="resize:vertical"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">URL <span class="optional">(optionnel)</span></label>
                <input v-model="block.itemUrl" type="url" class="form-control" placeholder="https://..." />
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-1" style="justify-content:flex-end">
          <router-link to="/admin/pages" class="btn btn-secondary">Annuler</router-link>
          <button type="submit" class="btn btn-primary" :disabled="store.loading">
            {{ store.loading ? 'Sauvegarde…' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </form>

      <!-- Zone danger -->
      <div class="card danger-zone mt-2">
        <h3 class="danger-title">Zone de danger</h3>
        <div class="flex justify-between items-center">
          <div>
            <div class="fw-500 text-sm">Supprimer cette page</div>
            <div class="text-xs text-muted">Tous les blocs de contenu associés seront supprimés.</div>
          </div>
          <button class="btn btn-danger btn-sm" @click="showDelete = true">Supprimer</button>
        </div>
      </div>
    </template>

    <ConfirmModal
      v-if="showDelete"
      title="Supprimer la page"
      :message="`Supprimer définitivement « ${store.selectedPage?.title} » ?`"
      :loading="store.loading"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePagesStore } from '@/stores/pages'
import type { ContentPageDto } from '@/types'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

export default defineComponent({
  name: 'PageEditView',
  components: { ConfirmModal },
  setup() {
    const store = usePagesStore()
    const route = useRoute()
    const router = useRouter()
    const pageId = Number(route.params.id)

    const form = reactive({ title: '', category: 0 as number, content: [] as ContentPageDto[] })
    const newImageFile = ref<File | null>(null)
    const newImagePreview = ref<string | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)
    const saveSuccess = ref(false)
    const showDelete = ref(false)

    onMounted(async () => {
      await Promise.all([store.fetchById(pageId), store.fetchCategories()])
      syncForm()
    })

    watch(() => store.selectedPage, syncForm)

    function syncForm() {
      const p = store.selectedPage
      if (!p) return
      form.title = p.title
      form.category = p.category?.id ?? 0
      form.content = p.content ? p.content.map(c => ({ ...c })) : []
    }

    function addBlock() { form.content.push({ name: '', description: '', itemUrl: '' }) }
    function removeBlock(i: number) { form.content.splice(i, 1) }
    function triggerFile() { fileInput.value?.click() }

    function onFileChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      newImageFile.value = file
      newImagePreview.value = URL.createObjectURL(file)
    }

    function onDrop(e: DragEvent) {
      const file = e.dataTransfer?.files?.[0]
      if (!file || !file.type.startsWith('image/')) return
      newImageFile.value = file
      newImagePreview.value = URL.createObjectURL(file)
    }

    async function submit() {
      saveSuccess.value = false
      try {
        await store.update(pageId, { title: form.title, content: form.content, category: form.category }, newImageFile.value ?? undefined)
        saveSuccess.value = true
        newImageFile.value = null
        newImagePreview.value = null
        setTimeout(() => { saveSuccess.value = false }, 3000)
      } catch { /* erreur dans store */ }
    }

    async function doDelete() {
      await store.deleteById(pageId)
      showDelete.value = false
      router.push('/admin/pages')
    }

    return { store, form, newImagePreview, fileInput, saveSuccess, showDelete, addBlock, removeBlock, triggerFile, onFileChange, onDrop, submit, doDelete }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.section-title { font-family:var(--font-display); font-size:1.05rem; font-weight:600; margin-bottom:.85rem; }
.optional { font-weight:400; text-transform:none; letter-spacing:0; color:var(--c-muted); }
.ml-1 { margin-left:.4rem; }
.current-img { width:100%; max-height:200px; object-fit:contain; border-radius:var(--radius-sm); border:1px solid var(--c-border); }
.file-drop { border:2px dashed var(--c-border-2); border-radius:var(--radius); background:var(--c-surface-2); cursor:pointer; min-height:80px; display:flex; align-items:center; justify-content:center; overflow:hidden; transition:border-color var(--transition); }
.file-drop:hover { border-color:var(--c-accent-2); }
.file-drop-placeholder { text-align:center; padding:1.25rem; }
.preview-img { width:100%; max-height:200px; object-fit:contain; }
.content-block-editor { border:1px solid var(--c-border); border-radius:var(--radius-sm); padding:1rem; margin-bottom:.75rem; background:var(--c-surface-2); }
.block-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
.block-num { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--c-muted); }
.danger-zone  { border-color:#fca5a5; }
.danger-title { font-size:.8rem; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--c-red); margin-bottom:.85rem; }
</style>
