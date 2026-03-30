<template>
  <div>
    <div class="page-header">
      <h1>Pages de contenu</h1>
      <p>Ressources et articles bien-être</p>
    </div>

    <div v-if="pagesStore.error" class="alert alert-error mb-2">{{ pagesStore.error }}</div>

    <!-- Filtre catégories -->
    <div class="filter-bar mb-2" v-if="pagesStore.categories.length">
      <button class="filter-chip" :class="{ active: !selectedCat }" @click="selectedCat = null">Toutes</button>
      <button
        v-for="c in pagesStore.categories" :key="c.id"
        class="filter-chip" :class="{ active: selectedCat === c.id }"
        @click="selectedCat = c.id"
      >{{ c.name }}</button>
    </div>

    <div v-if="pagesStore.loading" class="text-muted">Chargement…</div>

    <div class="pages-grid" v-else>
      <div v-if="!filteredPages.length" class="text-muted">Aucune page disponible.</div>
      <div v-for="p in filteredPages" :key="p.id" class="page-card card">
        <div v-if="p.imageUrl" class="page-img-wrap">
          <img :src="p.imageUrl" :alt="p.title" class="page-img" />
        </div>
        <div v-else class="page-img-placeholder">📄</div>

        <div class="page-card-body">
          <span class="badge badge-neutral mb-1" v-if="p.category">{{ p.category.name }}</span>
          <h3 class="page-card-title">{{ p.title }}</h3>
          <p class="page-card-preview text-muted text-sm" v-if="p.content?.length">
            {{ p.content[0]?.description?.slice(0, 100) }}{{ (p.content[0]?.description?.length ?? 0) > 100 ? '…' : '' }}
          </p>
          <router-link :to="{ name: 'PageDetail', params: { id: p.id } }" class="btn btn-secondary btn-sm mt-2">Lire →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { usePagesStore } from '@/stores/pages'

export default defineComponent({
  name: 'PageListView',
  setup() {
    const pagesStore = usePagesStore()
    const selectedCat = ref<number | null>(null)

    onMounted(() => Promise.all([pagesStore.fetchAll(), pagesStore.fetchCategories()]))

    const filteredPages = computed(() =>
      selectedCat.value
        ? pagesStore.pages.filter(p => p.category?.id === selectedCat.value)
        : pagesStore.pages
    )

    return { pagesStore, selectedCat, filteredPages }
  }
})
</script>

<style scoped>
.filter-bar { display:flex; align-items:center; gap:.5rem; flex-wrap:wrap; }
.filter-chip { padding:.3rem .75rem; border-radius:999px; border:1px solid var(--c-border-2); background:var(--c-surface); font-size:.8rem; cursor:pointer; transition:all var(--transition); }
.filter-chip:hover { background:var(--c-surface-2); }
.filter-chip.active { background:var(--c-accent); color:#fff; border-color:var(--c-accent); }
.pages-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:1.25rem; }
.page-card  { padding:0; overflow:hidden; display:flex; flex-direction:column; transition:box-shadow .2s; }
.page-card:hover { box-shadow:var(--shadow); }
.page-img-wrap { height:160px; overflow:hidden; }
.page-img  { width:100%; height:100%; object-fit:cover; }
.page-img-placeholder { height:120px; background:var(--c-accent-lt); display:flex; align-items:center; justify-content:center; font-size:2.5rem; }
.page-card-body  { padding:1.25rem; flex:1; display:flex; flex-direction:column; gap:.35rem; }
.page-card-title { font-family:var(--font-display); font-size:1.05rem; font-weight:600; }
.page-card-preview { flex:1; line-height:1.5; }
.mb-1 { margin-bottom:.35rem; }
.mt-2 { margin-top:.5rem; }
</style>
