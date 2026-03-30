<template>
  <div style="max-width:800px; margin:0 auto; padding:2rem 1rem">
    <router-link :to="{ name: 'PageList' }" class="back-link">← Toutes les pages</router-link>

    <div v-if="pagesStore.loading" class="text-muted mt-2">Chargement…</div>
    <div v-else-if="!pagesStore.selectedPage" class="alert alert-error mt-2">Page introuvable.</div>

    <template v-else>
      <div v-if="pagesStore.selectedPage.imageUrl" class="hero-img-wrap mt-2">
        <img :src="pagesStore.selectedPage.imageUrl" :alt="pagesStore.selectedPage.title" class="hero-img" />
      </div>

      <div class="article-header mt-2">
        <span class="badge badge-neutral" v-if="pagesStore.selectedPage.category">
          {{ pagesStore.selectedPage.category.name }}
        </span>
        <h1 class="article-title mt-1">{{ pagesStore.selectedPage.title }}</h1>
      </div>

      <!-- Blocs de contenu (ContentPageDto: name, description, itemUrl) -->
      <div class="article-body mt-2">
        <div v-if="!pagesStore.selectedPage.content?.length" class="text-muted">
          Cette page ne contient pas encore de contenu.
        </div>
        <div v-for="(block, i) in pagesStore.selectedPage.content" :key="i" class="content-block">
          <h3 v-if="block.name" class="block-name">{{ block.name }}</h3>
          <p v-if="block.description" class="block-desc">{{ block.description }}</p>
          <a v-if="block.itemUrl" :href="block.itemUrl" target="_blank" rel="noopener" class="block-link">
            🔗 {{ block.itemUrl }}
          </a>
        </div>
      </div>

      <!-- Bouton éditer si admin -->
      <div class="mt-3" v-if="authStore.isAdmin">
        <router-link :to="`/admin/pages/${pagesStore.selectedPage.id}/edit`" class="btn btn-secondary btn-sm">
          ✏️ Modifier cette page
        </router-link>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePagesStore } from '@/stores/pages'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'PageDetailView',
  setup() {
    const pagesStore = usePagesStore()
    const authStore = useAuthStore()
    const route = useRoute()
    onMounted(() => pagesStore.fetchById(Number(route.params.id)))
    return { pagesStore, authStore }
  }
})
</script>

<style scoped>
.back-link  { font-size:.85rem; color:var(--c-muted); }
.back-link:hover { color:var(--c-text); }
.hero-img-wrap { border-radius:var(--radius); overflow:hidden; max-height:400px; }
.hero-img   { width:100%; height:100%; object-fit:cover; }
.article-header h1.article-title { font-family:var(--font-display); font-size:2rem; font-weight:700; line-height:1.2; }
.article-body { display:flex; flex-direction:column; gap:2rem; }
.content-block { }
.block-name  { font-family:var(--font-display); font-size:1.25rem; font-weight:600; margin-bottom:.4rem; }
.block-desc  { line-height:1.8; color:var(--c-text); white-space:pre-wrap; }
.block-link  { display:inline-block; margin-top:.4rem; color:var(--c-accent-2); font-size:.875rem; word-break:break-all; }
.block-link:hover { text-decoration:underline; }
.mt-1 { margin-top:.35rem; }
</style>
