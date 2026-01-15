import { createRouter, createWebHistory } from 'vue-router'
import { showFailToast } from 'vant'
import axios, { authStorage } from '@/utils/http'

const routes = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layout/Index.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/Index.vue'),
        meta: { title: '服务大厅', showTabbar: true }
      },
      {
        path: '/services',
        name: 'Services',
        component: () => import('@/views/services/Index.vue'),
        meta: { title: '全部服务', showTabbar: true }
      },
      {
        path: '/applications',
        name: 'Applications',
        component: () => import('@/views/applications/Index.vue'),
        meta: { title: '我的申请', showTabbar: true }
      },
      {
        path: '/mine',
        name: 'Mine',
        component: () => import('@/views/mine/Index.vue'),
        meta: { title: '个人中心', showTabbar: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/Index.vue'),
    meta: { title: '注册账号' }
  },
  {
    path: '/service-detail/:id',
    name: 'ServiceDetail',
    component: () => import('@/views/services/Detail.vue'),
    meta: { title: '服务详情' }
  },
  {
    path: '/service-apply/:id',
    name: 'ServiceApply',
    component: () => import('@/views/services/Apply.vue'),
    meta: { title: '服务申请' }
  },
  {
    path: '/cases',
    name: 'Cases',
    component: () => import('@/views/cases/Index.vue'),
    meta: { title: '案例展示' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/admin/Index.vue'),
    meta: { title: '后台管理' }
  },
  {
    path: '/games',
    name: 'Games',
    component: () => import('@/views/games/Lobby.vue'),
    meta: { title: 'Fruit Box', showTabbar: false }
  },
  {
    path: '/games/play',
    name: 'GamesPlay',
    component: () => import('@/views/games/Play.vue'),
    meta: { title: 'Fruit Box', showTabbar: false }
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

router.beforeEach(async (to, from, next) => {
  document.title = to.meta.title || '低空综合服务平台'
  
  // Admin route protection
  if (to.path.startsWith('/admin')) {
    const accessToken = authStorage.getAccessToken()
    const userStr = localStorage.getItem('user')
    if (!accessToken && !userStr) {
      next('/login')
      return
    }
    let user = null
    if (userStr) {
      try {
        user = JSON.parse(userStr)
      } catch (e) {
        user = null
      }
    }
    if (!user && accessToken) {
      try {
        const res = await axios.get('/api/auth/me')
        if (res.data?.success) {
          user = res.data.user
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (e) {
        user = null
      }
    }
    if (!user) {
      next('/login')
      return
    }
    if (user.role !== 'admin' && user.role !== 'dsl_admin') {
      showFailToast('无管理权限，请使用管理员账号登录')
      next('/login')
      return
    }
  }
  
  next()
})

export default router

