<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal">
      <p class="modal-title">{{ title }}</p>
      <p style="color:var(--c-muted);font-size:.9rem">{{ message }}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="$emit('cancel')">Annuler</button>
        <button class="btn btn-danger" @click="$emit('confirm')" :disabled="loading">
          {{ loading ? 'Suppression…' : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ConfirmModal',
  props: {
    title:        { type: String, default: 'Confirmer la suppression' },
    message:      { type: String, default: 'Cette action est irréversible.' },
    confirmLabel: { type: String, default: 'Supprimer' },
    loading:      { type: Boolean, default: false }
  },
  emits: ['confirm', 'cancel']
})
</script>
