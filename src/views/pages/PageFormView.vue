<template>
  <div style="max-width:720px">
    <div class="page-header">
      <router-link to="/admin/pages" class="back-link">← Retour à la gestion des pages</router-link>
      <h1>Nouvelle page</h1>
      <p>Créez une page de contenu avec ses blocs et une image optionnelle</p>
    </div>

    <div v-if="store.error" class="alert alert-error mb-2">{{ store.error }}</div>
    <div v-if="success" class="alert alert-success mb-2">Page créée avec succès !</div>

    <form @submit.prevent="submit">
      <!-- Infos principales -->
      <div class="card mb-2">
        <h2 class="section-title">Informations générales</h2>

        <div class="flex flex-col gap-2">
          <div class="form-group">
            <label class="form-label">Titre</label>
            <input v-model="form.title" type="text" class="form-control" placeholder="Titre de la page" required />
          </div>

          <div class="form-group">
            <label class="form-label">Catégorie</label>
            <select v-model.number="form.category" class="form-control" required>
              <option :value="0" disabled>Choisir une catégorie</option>
              <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Upload image -->
          <div class="form-group">
            <label class="form-label">Image <span class="optional">(optionnelle)</span></label>
            <div class="file-drop" @click="triggerFile" @dragover.prevent @drop.prevent="onDrop">
              <img v-if="imagePreview" :src="imagePreview" class="preview-img" />
              <div v-else class="file-drop-placeholder">
                <span style="font-size:2rem">📷</span>
                <p class="text-muted text-sm mt-1">Cliquez ou déposez une image JPG/PNG</p>
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            <button v-if="imagePreview" type="button" class="btn btn-ghost btn-sm mt-1" @click="clearImage">
              Supprimer l'image
            </button>
          </div>
        </div>
      </div>

      <!-- Blocs de contenu -->
      <div class="card mb-2">
        <div class="flex justify-between items-center mb-2">
          <h2 class="section-title">Blocs de contenu
            <span class="badge badge-user ml-1">{{ form.content.length }}</span>
          </h2>
          <button type="button" class="btn btn-secondary btn-sm" @click="addBlock">+ Ajouter un bloc</button>
        </div>

        <div v-if="!form.content.length" class="text-muted text-sm mb-2">
          Aucun bloc ajouté. Chaque bloc correspond à un <code>ContentPageDto</code> (name, description, itemUrl).
        </div>

        <div v-for="(block, i) in form.content" :key="i" class="content-block-editor">
          <div class="block-header">
            <span class="block-num">Bloc {{ i + 1 }}</span>
            <button type="button" class="btn btn-danger btn-sm" @click="removeBlock(i)">✕ Supprimer</button>
          </div>
          <div class="flex flex-col gap-2">
            <div class="form-group">
              <label class="form-label">Nom <span class="text-xs text-muted">(champ: name)</span></label>
              <input v-model="block.name" type="text" class="form-control" placeholder="Ex : Introduction" required />
            </div>
            <div class="form-group">
              <label class="form-label">Description <span class="text-xs text-muted">(champ: description)</span></label>
              <textarea v-model="block.description" class="form-control" rows="3" placeholder="Texte du contenu…" required style="resize:vertical"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">URL <span class="optional">(champ: itemUrl — optionnel)</span></label>
              <input v-model="block.itemUrl" type="url" class="form-control" placeholder="https://..." />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-1" style="justify-content:flex-end">
        <router-link to="/admin/pages" class="btn btn-secondary">Annuler</router-link>
        <button type="submit" class="btn btn-primary" :disabled="store.loading || !form.category">
          {{ store.loading ? 'Création…' : 'Publier la page' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { usePagesStore } from '@/stores/pages'
import type { ContentPageDto } from '@/types'

export default defineComponent({
  name: 'PageFormView',
  setup() {
    const store = usePagesStore()
    const success = ref(false)
    const imageFile = ref<File | null>(null)
    const imagePreview = ref<string | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)

    const form = reactive({
      title: '',
      category: 0 as number,
      content: [] as ContentPageDto[]
    })

    onMounted(() => store.fetchCategories())

    function addBlock() {
      form.content.push({ name: '', description: '', itemUrl: '' })
    }

    function removeBlock(i: number) { form.content.splice(i, 1) }

    function triggerFile() { fileInput.value?.click() }

    function onFileChange(e: Event) {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      imageFile.value = file
      imagePreview.value = URL.createObjectURL(file)
    }

    function onDrop(e: DragEvent) {
      const file = e.dataTransfer?.files?.[0]
      if (!file || !file.type.startsWith('image/')) return
      imageFile.value = file
      imagePreview.value = URL.createObjectURL(file)
    }

    function clearImage() { imageFile.value = null; imagePreview.value = null }

    async function submit() {
      success.value = false
      try {
        await store.create(
          { title: form.title, content: form.content, category: form.category },
          imageFile.value ?? undefined
        )
        success.value = true
        Object.assign(form, { title: '', category: 0, content: [] })
        clearImage()
      } catch { /* erreur dans store */ }
    }

    return { store, form, success, imagePreview, fileInput, addBlock, removeBlock, triggerFile, onFileChange, onDrop, clearImage, submit }
  }
})
</script>

<style scoped>
.back-link { font-size:.85rem; color:var(--c-muted); display:inline-block; margin-bottom:.5rem; }
.section-title { font-family:var(--font-display); font-size:1.05rem; font-weight:600; margin-bottom:.85rem; }
.optional { font-weight:400; text-transform:none; letter-spacing:0; color:var(--c-muted); }
.ml-1 { margin-left:.4rem; }

.file-drop {
  border:2px dashed var(--c-border-2); border-radius:var(--radius);
  background:var(--c-surface-2); cursor:pointer;
  min-height:120px; display:flex; align-items:center; justify-content:center;
  transition:border-color var(--transition), background var(--transition);
  overflow:hidden;
}
.file-drop:hover { border-color:var(--c-accent-2); background:var(--c-accent-lt); }
.file-drop-placeholder { text-align:center; padding:1.5rem; }
.preview-img { width:100%; max-height:220px; object-fit:contain; }

.content-block-editor {
  border:1px solid var(--c-border); border-radius:var(--radius-sm);
  padding:1rem; margin-bottom:.75rem; background:var(--c-surface-2);
}
.block-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:.75rem; }
.block-num { font-size:.75rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--c-muted); }
</style>
