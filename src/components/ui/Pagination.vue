<template>
  <div class="pagination-bar">
    <div class="per-page-row">
      <span class="text-muted text-sm">Afficher</span>
      <select class="form-control" style="width:auto" :value="perPage" @change="onPerPage">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
      <span class="text-muted text-sm">par page — {{ total }} résultats</span>
    </div>

    <div class="page-btns">
      <button class="btn btn-secondary btn-sm" @click="$emit('page', current - 1)" :disabled="current <= 1">←</button>
      <template v-for="p in visiblePages" :key="p">
        <span v-if="p === '...'" class="page-ellipsis">…</span>
        <button
          v-else
          class="btn btn-sm"
          :class="p === current ? 'btn-primary' : 'btn-secondary'"
          @click="$emit('page', p)"
        >{{ p }}</button>
      </template>
      <button class="btn btn-secondary btn-sm" @click="$emit('page', current + 1)" :disabled="current >= totalPages">→</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
export default defineComponent({
  name: 'Pagination',
  props: {
    current:    { type: Number, required: true },
    totalPages: { type: Number, required: true },
    perPage:    { type: Number as PropType<10|20|50>, default: 10 },
    total:      { type: Number, default: 0 }
  },
  emits: ['page', 'per-page'],
  setup(props, { emit }) {
    const visiblePages = computed(() => {
      const pages: (number | string)[] = []
      const tp = props.totalPages
      const cur = props.current
      if (tp <= 7) {
        for (let i = 1; i <= tp; i++) pages.push(i)
      } else {
        pages.push(1)
        if (cur > 3) pages.push('...')
        for (let i = Math.max(2, cur - 1); i <= Math.min(tp - 1, cur + 1); i++) pages.push(i)
        if (cur < tp - 2) pages.push('...')
        pages.push(tp)
      }
      return pages
    })

    function onPerPage(e: Event) {
      emit('per-page', Number((e.target as HTMLSelectElement).value) as 10|20|50)
    }

    return { visiblePages, onPerPage }
  }
})
</script>

<style scoped>
.pagination-bar { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem; margin-top:1.25rem; }
.per-page-row   { display:flex; align-items:center; gap:.5rem; }
.page-btns      { display:flex; align-items:center; gap:.25rem; }
.page-ellipsis  { padding:0 .4rem; color:var(--c-muted); }
</style>
