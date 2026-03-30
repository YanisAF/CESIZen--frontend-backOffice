<template>
  <div class="shell" :class="{ collapsed: isCollapsed }">

    <!-- ── Sidebar ────────────────────────────────────────────────────────── -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">

      <!-- Brand -->
      <div class="sidebar-brand">
        <span class="brand-logo">🌿</span>
        <transition name="label-fade">
          <div v-if="!isCollapsed" class="brand-text">
            <div class="brand-name">CESIZen</div>
            <div class="brand-sub">Back-office</div>
          </div>
        </transition>
      </div>

      <!-- Toggle collapse -->
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed" :title="isCollapsed ? 'Développer' : 'Réduire'">
        <span class="collapse-icon">{{ isCollapsed ? '→' : '←' }}</span>
      </button>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <div class="nav-group">
          <span class="nav-group-label" v-if="!isCollapsed">Consulter</span>
          <router-link :to="{ name: 'QuizList' }" class="nav-link" active-class="active" :title="isCollapsed ? 'Quiz' : ''">
            <span class="nav-icon">🧠</span>
            <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Quiz</span></transition>
          </router-link>
          <router-link :to="{ name: 'PageList' }" class="nav-link" active-class="active" :title="isCollapsed ? 'Pages' : ''">
            <span class="nav-icon">📄</span>
            <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Pages</span></transition>
          </router-link>
        </div>

        <!-- Si connecté : liens back-office -->
        <div class="nav-group" v-if="authStore.isAuthenticated">
          <span class="nav-group-label" v-if="!isCollapsed">Back-office</span>
          <router-link to="/" class="nav-link" :title="isCollapsed ? 'Tableau de bord' : ''">
            <span class="nav-icon">⊞</span>
            <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Tableau de bord</span></transition>
          </router-link>
          <template v-if="authStore.isAdmin">
            <router-link to="/admin/quiz" class="nav-link" active-class="active" :title="isCollapsed ? 'Gestion quiz' : ''">
              <span class="nav-icon">✏️</span>
              <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Gestion quiz</span></transition>
            </router-link>
            <router-link to="/admin/pages" class="nav-link" active-class="active" :title="isCollapsed ? 'Gestion pages' : ''">
              <span class="nav-icon">📝</span>
              <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Gestion pages</span></transition>
            </router-link>
          </template>
        </div>

        <!-- Si connecté : compte -->
        <div class="nav-group" v-if="authStore.isAuthenticated">
          <span class="nav-group-label" v-if="!isCollapsed">Compte</span>
          <router-link to="/profile" class="nav-link" active-class="active" :title="isCollapsed ? 'Mon profil' : ''">
            <span class="nav-icon">👤</span>
            <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Mon profil</span></transition>
          </router-link>
        </div>

        <!-- Si non connecté : lien login -->
        <div class="nav-group" v-if="!authStore.isAuthenticated">
          <span class="nav-group-label" v-if="!isCollapsed">Compte</span>
          <router-link to="/login" class="nav-link" active-class="active" :title="isCollapsed ? 'Se connecter' : ''">
            <span class="nav-icon">🔐</span>
            <transition name="label-fade"><span v-if="!isCollapsed" class="nav-label">Se connecter</span></transition>
          </router-link>
        </div>
      </nav>

      <!-- Footer sidebar : utilisateur connecté -->
      <div class="sidebar-footer" v-if="authStore.isAuthenticated">
        <div class="user-row" v-if="!isCollapsed">
          <div class="user-avatar">{{ initials }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.currentUsername }}</div>
            <span class="badge" :class="authStore.isAdmin ? 'badge-admin' : 'badge-user'" style="font-size:.65rem">
              {{ authStore.isAdmin ? 'Admin' : 'User' }}
            </span>
          </div>
        </div>
        <div v-else class="user-avatar-collapsed" :title="authStore.currentUsername">
          {{ initials }}
        </div>
        <button
          class="btn btn-ghost btn-sm logout-btn"
          :class="{ 'icon-only': isCollapsed }"
          @click="logout"
          :title="isCollapsed ? 'Déconnexion' : ''"
        >
          <span>🚪</span>
          <transition name="label-fade"><span v-if="!isCollapsed">Déconnexion</span></transition>
        </button>
      </div>
    </aside>

    <!-- ── Main ────────────────────────────────────────────────────────────── -->
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
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default defineComponent({
  name: 'PublicLayout',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const isCollapsed = ref(false)

    const initials = computed((): string => {
      const name = authStore.currentUsername
      return name ? name.slice(0, 2).toUpperCase() : '?'
    })

    function logout() {
      authStore.logout()
      router.push('/login')
    }

    return { authStore, isCollapsed, initials, logout }
  }
})
</script>

<style scoped>
/* ── Variables locales ─────────────────────────────────────────────────────── */
.shell {
  --sw: 240px;   /* largeur normale */
  --sw-c: 60px;  /* largeur réduite */
  display: flex;
  min-height: 100vh;
  transition: none;
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
.sidebar {
  width: var(--sw);
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 100;
  transition: width .25s cubic-bezier(.4,0,.2,1);
  overflow: hidden;
}
.sidebar.collapsed { width: var(--sw-c); }

/* Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: 1.1rem 1rem;
  border-bottom: 1px solid var(--c-border);
  min-height: 64px;
  overflow: hidden;
  flex-shrink: 0;
}
.brand-logo { font-size: 1.5rem; flex-shrink: 0; }
.brand-text { overflow: hidden; white-space: nowrap; }
.brand-name { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--c-accent); line-height: 1.1; }
.brand-sub  { font-size: .65rem; text-transform: uppercase; letter-spacing: .06em; color: var(--c-muted); }

/* Bouton toggle collapse */
.collapse-btn {
  position: absolute;
  top: 1.05rem;
  right: .6rem;
  width: 26px; height: 26px;
  border-radius: 50%;
  border: 1px solid var(--c-border-2);
  background: var(--c-surface);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
  flex-shrink: 0;
  z-index: 1;
}
.collapse-btn:hover { background: var(--c-bg); border-color: var(--c-accent-2); }
.collapse-icon { font-size: .7rem; color: var(--c-muted); line-height: 1; }

/* Nav */
.sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: .65rem .5rem; }
.nav-group   { margin-bottom: 1rem; }
.nav-group-label {
  display: block;
  padding: 0 .5rem;
  font-size: .65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  color: var(--c-muted);
  margin-bottom: .3rem;
  white-space: nowrap;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: .6rem;
  padding: .5rem .65rem;
  border-radius: var(--radius-sm);
  font-size: .875rem;
  color: var(--c-muted);
  transition: background var(--transition), color var(--transition);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
}
.nav-link:hover { background: var(--c-bg); color: var(--c-text); }
.nav-link.active { background: var(--c-accent-lt); color: var(--c-accent); font-weight: 500; }
.nav-icon  { font-size: .95rem; width: 1.1rem; text-align: center; flex-shrink: 0; }
.nav-label { overflow: hidden; }

/* Footer */
.sidebar-footer {
  border-top: 1px solid var(--c-border);
  padding: .75rem .6rem;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  flex-shrink: 0;
  overflow: hidden;
}
.user-row    { display: flex; align-items: center; gap: .6rem; overflow: hidden; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--c-accent-lt); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700; flex-shrink: 0;
}
.user-avatar-collapsed {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--c-accent-lt); color: var(--c-accent);
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700;
  margin: 0 auto;
  cursor: default;
}
.user-info { overflow: hidden; }
.user-name { font-size: .8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.logout-btn { justify-content: center; }
.logout-btn.icon-only { padding: .4rem; }

/* ── Main ──────────────────────────────────────────────────────────────────── */
.main-area {
  margin-left: var(--sw);
  flex: 1;
  padding: 2.25rem 2.5rem;
  min-height: 100vh;
  transition: margin-left .25s cubic-bezier(.4,0,.2,1);
}
.shell.collapsed .main-area {
  margin-left: var(--sw-c);
}

/* ── Transitions labels ────────────────────────────────────────────────────── */
.label-fade-enter-active { transition: opacity .15s ease .05s, transform .2s ease .05s; }
.label-fade-leave-active { transition: opacity .1s ease, transform .1s ease; }
.label-fade-enter-from   { opacity: 0; transform: translateX(-6px); }
.label-fade-leave-to     { opacity: 0; transform: translateX(-4px); }

/* ── Fade page ─────────────────────────────────────────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
