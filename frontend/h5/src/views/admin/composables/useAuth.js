import { ref, computed } from 'vue'
import axios, { authStorage } from '@/utils/http'

const SUPER_ADMIN_PHONE = 'wzdkjjfzyxgs'

export function useAuth() {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  const userRole = ref(user ? user.role : 'user')
  const isSuperAdmin = ref(user ? user.phone === SUPER_ADMIN_PHONE : false)

  const isAdmin = computed(() => userRole.value === 'admin')
  const isDslAdmin = computed(() => userRole.value === 'dsl_admin')
  const isStudyAdmin = computed(() => userRole.value === 'study_admin')
  const canManage = computed(() => isAdmin.value || isDslAdmin.value || isStudyAdmin.value)

  const refreshCurrentUser = async () => {
    const accessToken = authStorage.getAccessToken()
    if (!accessToken) return
    try {
      const res = await axios.get('/api/auth/me')
      if (res.data?.success) {
        const current = res.data.user || {}
        localStorage.setItem('user', JSON.stringify(current))
        userRole.value = current.role || 'user'
        isSuperAdmin.value = current.phone === SUPER_ADMIN_PHONE
      }
    } catch (error) {
      authStorage.clearTokens()
      localStorage.removeItem('user')
    }
  }

  return {
    userRole,
    isSuperAdmin,
    isAdmin,
    isDslAdmin,
    isStudyAdmin,
    canManage,
    refreshCurrentUser,
    SUPER_ADMIN_PHONE
  }
}
