<template>
  <div class="user-list-page">
    <DataToolbar>
      <template #filters>
        <van-search
          v-model="keyword"
          placeholder="手机号 / 姓名 / 用户名"
          shape="round"
          class="user-search"
          @search="fetchUsers"
          @clear="fetchUsers"
        />
      </template>
      <template #actions>
        <van-button type="primary" size="small" icon="search" @click="fetchUsers">查询</van-button>
        <van-button type="default" size="small" icon="replay" @click="onReset">重置</van-button>
      </template>
    </DataToolbar>

    <van-empty v-if="users.length === 0" description="暂无用户数据" />

    <van-cell-group v-else inset style="border-radius: var(--card-radius);">
      <van-cell v-for="u in users" :key="u.id">
        <template #title>
          <div class="user-info">
            <div class="user-name">{{ u.name || '-' }}</div>
            <div class="user-meta">手机号：{{ u.phone || '-' }}</div>
            <div class="user-meta">用户名：{{ u.username || '-' }}</div>
          </div>
        </template>
        <template #value>
          <div class="user-actions">
            <van-tag
              :type="u.role === 'admin' ? 'success' : (u.role === 'dsl_admin' ? 'primary' : 'default')"
              size="medium"
            >
              {{ roleLabel(u.role) }}
            </van-tag>
            <div class="action-buttons">
              <van-button
                v-if="isSuperAdmin && u.role !== 'dsl_admin' && u.phone !== SUPER_ADMIN_PHONE"
                size="mini"
                type="primary"
                plain
                @click="toggleUserRole(u)"
              >
                切换权限
              </van-button>
              <van-button
                v-if="canRecover(u)"
                size="mini"
                type="default"
                plain
                @click="openEdit(u)"
              >
                编辑信息
              </van-button>
              <van-button
                v-if="canRecover(u)"
                size="mini"
                type="warning"
                plain
                @click="resetPassword(u)"
              >
                重置密码
              </van-button>
              <van-button
                v-if="canRecover(u)"
                size="mini"
                type="danger"
                plain
                @click="cancelAccount(u)"
              >
                注销账号
              </van-button>
            </div>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 编辑用户信息弹窗（账号找回：协助修正手机号/用户名） -->
    <van-popup v-model:show="editVisible" position="bottom" :style="{ height: '60%' }" round>
      <div class="edit-popup">
        <div class="edit-header">
          <h3>编辑用户信息</h3>
        </div>

        <van-form @submit="saveUser">
          <van-cell-group inset>
            <van-field v-model="form.name" label="姓名" placeholder="请输入姓名" />
            <van-field
              v-model="form.phone"
              label="手机号"
              type="tel"
              maxlength="11"
              placeholder="请输入11位手机号"
            />
            <van-field v-model="form.username" label="用户名" placeholder="用于账号登录，可留空" />
          </van-cell-group>

          <div class="edit-tip">
            修改手机号或用户名后，请告知用户使用新的登录凭证。
          </div>

          <div style="margin: 16px; padding-bottom: 30px;">
            <van-button round block type="primary" native-type="submit" :loading="saving">
              保存修改
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 重置结果弹窗：明文密码仅展示一次 -->
    <van-dialog v-model:show="resultVisible" title="密码已重置" confirm-button-text="我已记录">
      <div class="reset-result">
        <div class="reset-user">{{ resultUser }}</div>
        <div class="reset-password" @click="copyPassword">{{ resultPassword }}</div>
        <van-button size="small" type="primary" plain icon="records" @click="copyPassword">
          复制密码
        </van-button>
        <div class="reset-tip">
          该密码仅显示一次，请及时告知用户。用户使用该临时密码登录后，将被强制要求设置自己的新密码；用户在各端的登录状态已失效。
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from '@/utils/http'
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant'
import DataToolbar from '../components/DataToolbar.vue'
import { useAuth } from '../composables/useAuth'

const { isSuperAdmin, isAdmin, SUPER_ADMIN_PHONE } = useAuth()

const users = ref([])
const keyword = ref('')

const editVisible = ref(false)
const saving = ref(false)
const editingId = ref('')
const form = reactive({ name: '', phone: '', username: '' })

const resultVisible = ref(false)
const resultUser = ref('')
const resultPassword = ref('')

const roleLabel = (role) => {
  const map = { admin: '管理员', dsl_admin: 'DSL管理', study_admin: '研学管理', user: '用户' }
  return map[role] || role || '-'
}

// 找回操作依赖 /api/admin 接口，仅 admin 角色可用；超管账号仅本人可操作
const canRecover = (user) => {
  if (!isAdmin.value) return false
  return user.phone !== SUPER_ADMIN_PHONE || isSuperAdmin.value
}

const fetchUsers = async () => {
  const kw = keyword.value.trim()
  try {
    if (isAdmin.value) {
      const res = await axios.get('/api/admin/users', { params: kw ? { keyword: kw } : {} })
      users.value = Array.isArray(res.data?.data) ? res.data.data : []
      return
    }
    // 非 admin 角色沿用 legacy 接口（返回裸数组），关键词在本地过滤
    const res = await axios.get('/api/users')
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.users || [])
    const list = Array.isArray(raw) ? raw : []
    users.value = kw
      ? list.filter(u => [u.phone, u.name, u.username]
        .some(field => String(field || '').toLowerCase().includes(kw.toLowerCase())))
      : list
  } catch (error) {
    showFailToast('获取用户数据失败')
    console.error(error)
  }
}

const onReset = () => {
  keyword.value = ''
  fetchUsers()
}

const toggleUserRole = async (user) => {
  if (!isSuperAdmin.value) {
    showFailToast('仅超级管理员可调整权限')
    return
  }
  if (user.phone === SUPER_ADMIN_PHONE) {
    showFailToast('超级管理员权限不可修改')
    return
  }
  const newRole = user.role === 'admin' ? 'user' : 'admin'
  try {
    await axios.post('/api/user/role', { id: user.id, role: newRole })
    user.role = newRole
    showSuccessToast('权限更新成功')
  } catch (error) {
    showFailToast('权限更新失败')
    console.error(error)
  }
}

const openEdit = (user) => {
  editingId.value = user.id
  form.name = user.name || ''
  form.phone = user.phone || ''
  form.username = user.username || ''
  editVisible.value = true
}

const saveUser = async () => {
  const phone = form.phone.trim()
  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
    showFailToast('手机号格式不正确')
    return
  }
  saving.value = true
  try {
    const res = await axios.put(`/api/admin/users/${editingId.value}`, {
      name: form.name.trim(),
      phone,
      username: form.username.trim()
    })
    if (!res.data?.success) throw new Error(res.data?.message || '保存失败')
    showSuccessToast('用户信息已更新')
    editVisible.value = false
    await fetchUsers()
  } catch (error) {
    showFailToast(error?.response?.data?.message || error.message || '保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

const resetPassword = async (user) => {
  try {
    await showConfirmDialog({
      title: '确认重置密码',
      message: `将为 ${user.name || user.phone || '该用户'} 生成一个临时密码，重置后该用户需重新登录并设置自己的新密码。`
    })
  } catch {
    return
  }
  try {
    const res = await axios.post(`/api/admin/users/${user.id}/reset-password`, {})
    if (!res.data?.success) throw new Error(res.data?.message || '重置失败')
    resultUser.value = `${user.name || '-'}（${user.phone || '-'}）`
    resultPassword.value = res.data.password
    resultVisible.value = true
  } catch (error) {
    showFailToast(error?.response?.data?.message || error.message || '重置失败')
    console.error(error)
  }
}

// 后台人工注销：核实用户身份后删除账号登录凭证与个人资料
const cancelAccount = async (user) => {
  try {
    await showConfirmDialog({
      title: '确认注销账号',
      message: `将注销 ${user.name || user.phone || '该用户'} 的账号，删除其登录凭证与个人资料，且不可恢复。请确认已完成身份核实。`,
      confirmButtonText: '确认注销',
      confirmButtonColor: '#ee0a24'
    })
  } catch {
    return
  }
  try {
    const res = await axios.delete(`/api/admin/users/${user.id}`)
    if (!res.data?.success) throw new Error(res.data?.message || '注销失败')
    showSuccessToast('账号已注销')
    await fetchUsers()
  } catch (error) {
    showFailToast(error?.response?.data?.message || error.message || '注销失败')
    console.error(error)
  }
}

const copyPassword = async () => {
  const text = resultPassword.value
  if (!text) return
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 非 HTTPS 环境下 clipboard API 不可用，回退到 execCommand
      const input = document.createElement('textarea')
      input.value = text
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    showSuccessToast('已复制')
  } catch (error) {
    showFailToast('复制失败，请手动记录')
    console.error(error)
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.user-search {
  flex: 1;
  min-width: 0;
  padding: 0;
  background: transparent;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: var(--text-color);
}

.user-meta {
  font-size: 12px;
  color: var(--text-secondary);
}

.user-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.edit-popup {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.edit-header {
  margin-bottom: 16px;
}

.edit-header h3 {
  margin: 0;
  font-size: 18px;
}

.edit-tip {
  margin: 12px 16px 0;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.reset-result {
  padding: 20px 16px;
  text-align: center;
}

.reset-user {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.reset-password {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-color);
  margin-bottom: 12px;
  word-break: break-all;
  cursor: pointer;
}

.reset-tip {
  margin-top: 12px;
  font-size: 12px;
  color: #ee0a24;
  line-height: 1.6;
  text-align: left;
}
</style>
