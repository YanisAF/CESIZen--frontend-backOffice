<template>
  <div class="shell">
    <!-- ── Sidebar ──────────────────────────────────────────────────────────── -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-logo">🌿</span>
        <div>
          <div class="brand-name">CESIZen</div>
          <div class="brand-sub">Back-office</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- Général -->
        <div class="nav-group">
          <span class="nav-group-label">Général</span>
          <router-link to="/" class="nav-link" :class="{ active: $route.name === 'Dashboard' }" exact>
            <span class="nav-icon">⊞</span> Tableau de bord
          </router-link>
          <router-link :to="{ name: 'QuizList' }" class="nav-link" active-class="active">
            <span class="nav-icon">🧠</span> Quiz
          </router-link>
          <router-link :to="{ name: 'PageList' }" class="nav-link" active-class="active">
            <span class="nav-icon">📄</span> Pages
          </router-link>
        </div>

        <!-- Admin -->
        <div class="nav-group" v-if="authStore.isAdmin">
          <span class="nav-group-label">Administration</span>
          <router-link to="/admin/quiz" class="nav-link" active-class="active">
            <span class="nav-icon">✏️</span> Gestion quiz
          </router-link>
          <router-link to="/admin/result-config" class="nav-link" active-class="active">
            <span class="nav-icon">⚙️</span> Config résultats
          </router-link>
          <router-link to="/admin/pages" class="nav-link" active-class="active">
            <span class="nav-icon">📝</span> Gestion pages
          </router-link>
          <router-link to="/admin/users" class="nav-link" active-class="active">
            <span class="nav-icon">👥</span> Utilisateurs
          </router-link>
        </div>

        <!-- Profil -->
        <div class="nav-group">
          <span class="nav-group-label">Compte</span>
          <router-link to="/profile" class="nav-link" active-class="active">
            <span class="nav-icon">👤</span> Mon profil
          </router-link>
          <router-link to="/reset" class="nav-link" active-class="active">
            <span class="nav-icon">🔑</span> Changer mot de passe
          </router-link>
        </div>
      </nav>

      <!-- Pied de sidebar -->
      <div class="sidebar-footer">
        <div class="user-row">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.currentUsername }}</div>
            <span class="badge" :class="authStore.isAdmin ? 'badge-admin' : 'badge-user'">
              {{ authStore.isAdmin ? 'Admin' : 'Utilisateur' }}
            </span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm w-full" style="justify-content:center" @click="logout">
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- ── Main ─────────────────────────────────────────────────────────────── -->
    <main class="main-area">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'AppLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const initials = computed(() => {
      const name = authStore.currentUsername
      return name ? name.slice(0, 2).toUpperCase() : '?'
    })

    function logout() {
      authStore.logout()
      router.push('/login')
    }

    return { authStore, initials, logout }
  }
})
</script>

<style scoped>
.shell { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar {
  width: var(--c-sidebar-w);
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  display: flex; flex-direction: column;
  position: fixed; top: 0; left: 0; height: 100vh;
  z-index: 100;
}
.sidebar-brand {
  display: flex; align-items: center; gap: .75rem;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--c-border);
}
.brand-logo { font-size: 1.6rem; }
.brand-name { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; color: var(--c-accent); line-height: 1.1; }
.brand-sub  { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: var(--c-muted); margin-top: 1px; }

.sidebar-nav { flex: 1; overflow-y: auto; padding: .75rem; }
.nav-group   { margin-bottom: 1.25rem; }
.nav-group-label {
  display: block; padding: 0 .5rem;
  font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
  color: var(--c-muted); margin-bottom: .3rem;
}
.nav-link {
  display: flex; align-items: center; gap: .6rem;
  padding: .5rem .75rem;
  border-radius: var(--radius-sm);
  font-size: .875rem; color: var(--c-muted);
  transition: background var(--transition), color var(--transition);
  margin-bottom: 2px;
}
.nav-link:hover { background: var(--c-bg); color: var(--c-text); }
.nav-link.active { background: var(--c-accent-lt); color: var(--c-accent); font-weight: 500; }
.nav-icon { font-size: .95rem; width: 1.15rem; text-align: center; flex-shrink: 0; }

.sidebar-footer {
  border-top: 1px solid var(--c-border);
  padding: .85rem;
  display: flex; flex-direction: column; gap: .6rem;
}
.user-row { display: flex; align-items: center; gap: .65rem; }
.user-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--c-accent-lt); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; font-weight: 700; flex-shrink: 0;
}
.user-name  { font-size: .825rem; font-weight: 600; line-height: 1.2; }

/* Main */
.main-area {
  margin-left: var(--c-sidebar-w);
  flex: 1;
  padding: 2.25rem 2.5rem;
  min-height: 100vh;
}
</style>
