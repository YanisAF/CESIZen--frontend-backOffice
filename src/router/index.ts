import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [

    // ─── Auth ─────────────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true }
    },

    // ─── 403 ──────────────────────────────────────────────────────────────────
    {
      path: '/forbidden',
      name: 'Forbidden',
      component: () => import('@/views/ForbiddenView.vue')
    },

    // ─── Reset mot de passe (public, sans layout) ─────────────────────────────
    {
      path: '/reset',
      name: 'ResetChannel',
      component: () => import('@/views/reset/ResetChannelView.vue')
    },
    {
      path: '/reset/verify',
      name: 'ResetVerify',
      component: () => import('@/views/reset/ResetVerifyView.vue')
    },
    {
      path: '/reset/new-password',
      name: 'ResetNewPassword',
      component: () => import('@/views/reset/ResetNewPasswordView.vue')
    },

    // ─── Zone publique : /quiz et /pages — PublicLayout (sidebar réductible) ──
    {
      path: '/public',
      component: () => import('@/components/layout/PublicLayout.vue'),
      children: [
        { path: '',       redirect: { name: 'QuizList' } },
        {
          path: 'quiz',
          name: 'QuizList',
          component: () => import('@/views/quiz/QuizListView.vue')
        },
        {
          path: 'quiz/:id',
          name: 'QuizDetail',
          component: () => import('@/views/quiz/QuizDetailView.vue')
        },
        {
          path: 'pages',
          name: 'PageList',
          component: () => import('@/views/pages/PageListView.vue')
        },
        {
          path: 'pages/:id',
          name: 'PageDetail',
          component: () => import('@/views/pages/PageDetailView.vue')
        }
      ]
    },

    // Alias courts pour conserver /quiz et /pages sans le préfixe /public
    { path: '/quiz',        redirect: { name: 'QuizList' } },
    { path: '/quiz/:id',    redirect: (to) => ({ name: 'QuizDetail',  params: to.params }) },
    { path: '/pages',       redirect: { name: 'PageList' } },
    { path: '/pages/:id',   redirect: (to) => ({ name: 'PageDetail',  params: to.params }) },

    // ─── Back-office : / — AppLayout (admin uniquement) ───────────────────────
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/DashboardView.vue')
        },

        // Profil
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/profile/ProfileView.vue')
        },
        {
          path: 'profile/edit',
          name: 'ProfileEdit',
          component: () => import('@/views/profile/ProfileEditView.vue')
        },

        // Quiz admin
        {
          path: 'admin/quiz',
          name: 'AdminQuizList',
          component: () => import('@/views/quiz/AdminQuizListView.vue')
        },
        {
          path: 'admin/quiz/create',
          name: 'QuizCreate',
          component: () => import('@/views/quiz/QuizFormView.vue')
        },
        {
          path: 'admin/quiz/:id/edit',
          name: 'QuizEdit',
          component: () => import('@/views/quiz/QuizEditView.vue')
        },
        {
          path: 'admin/result-config',
          name: 'ResultConfig',
          component: () => import('@/views/result-config/ResultConfigView.vue')
        },

        // Pages admin
        {
          path: 'admin/pages',
          name: 'AdminPageList',
          component: () => import('@/views/pages/AdminPageListView.vue')
        },
        {
          path: 'admin/pages/create',
          name: 'PageCreate',
          component: () => import('@/views/pages/PageFormView.vue')
        },
        {
          path: 'admin/pages/:id/edit',
          name: 'PageEdit',
          component: () => import('@/views/pages/PageEditView.vue')
        },

        // Users admin
        {
          path: 'admin/users',
          name: 'UserList',
          component: () => import('@/views/users/UserListView.vue')
        },
        {
          path: 'admin/users/create',
          name: 'UserCreate',
          component: () => import('@/views/users/UserFormView.vue')
        },
        {
          path: 'admin/users/:id',
          name: 'UserDetail',
          component: () => import('@/views/users/UserDetailView.vue')
        }
      ]
    },

    // Fallback
    { path: '/:pathMatch(.*)*', redirect: '/login' }
  ]
})

// ─── Guards ───────────────────────────────────────────────────────────────────
router.beforeEach((to) => {
  const auth = useAuthStore()

  // Route réservée aux non-connectés
  if (to.meta.guest) {
    if (auth.isAuthenticated) {
      return auth.isAdmin ? { name: 'Dashboard' } : { name: 'QuizList' }
    }
    return
  }

  // Back-office → admin uniquement
  if (to.meta.requiresAdmin) {
    if (!auth.isAuthenticated) return { name: 'Login' }
    if (!auth.isAdmin)         return { name: 'Forbidden' }
  }
})

export default router
