<template>
  <div class="cp-page">
    <van-nav-bar
      :title="forced ? '设置新密码' : '修改密码'"
      :left-arrow="!forced"
      @click-left="onBack"
    />

    <div class="cp-container">
      <div v-if="forced" class="cp-notice">
        <van-icon name="info-o" />
        <span>管理员已重置您的账号密码。为保障账号安全，请设置您自己的新密码后继续使用。</span>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-if="!forced"
            v-model="form.oldPassword"
            type="password"
            name="oldPassword"
            label="原密码"
            placeholder="请输入原密码"
            :rules="[{ required: true, message: '请填写原密码' }]"
          />
          <van-field
            v-model="form.newPassword"
            type="password"
            name="newPassword"
            label="新密码"
            placeholder="请输入新密码（至少6位）"
            :rules="[
              { required: true, message: '请填写新密码' },
              { pattern: /^.{6,}$/, message: '密码至少6位' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入新密码"
            :rules="[
              { required: true, message: '请再次填写新密码' },
              { validator: validateConfirm, message: '两次输入的密码不一致' }
            ]"
          />
        </van-cell-group>

        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            {{ forced ? '设置并继续' : '确认修改' }}
          </van-button>
        </div>
      </van-form>

      <div v-if="forced" class="cp-logout" @click="onBack">暂不设置，退出登录</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import axios, { authStorage } from '@/utils/http'

const route = useRoute()
const router = useRouter()

const forced = computed(() => route.query.forced === '1' || route.query.forced === 'true')
const loading = ref(false)
const form = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })

const validateConfirm = (value) => value === form.value.newPassword

onMounted(() => {
  // 未登录（无令牌）时回到登录页
  if (!authStorage.getAccessToken()) {
    router.replace('/login')
  }
})

// 强制改密时，返回等同于退出登录；常规改密则返回上一页
const onBack = () => {
  if (forced.value) {
    axios.post('/api/auth/logout').catch(() => {})
    localStorage.removeItem('user')
    authStorage.clearTokens()
    router.replace('/login')
    return
  }
  router.back()
}

const onSubmit = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    showFailToast('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    const payload = { newPassword: form.value.newPassword }
    if (!forced.value) payload.oldPassword = form.value.oldPassword

    const res = await axios.post('/api/auth/change-password', payload)
    if (!res.data?.success) {
      throw new Error(res.data?.message || '密码修改失败')
    }

    // 同步本地缓存的用户标记，避免重复触发强制改密
    try {
      const cached = JSON.parse(localStorage.getItem('user') || 'null')
      if (cached) localStorage.setItem('user', JSON.stringify({ ...cached, mustChangePassword: false }))
    } catch (e) { /* ignore */ }

    showSuccessToast('密码修改成功')
    setTimeout(() => {
      router.replace('/home')
    }, 1000)
  } catch (error) {
    console.error(error)
    showFailToast(error?.response?.data?.message || error?.message || '密码修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.cp-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.cp-container {
  padding-top: 24px;
}

.cp-notice {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin: 0 16px 16px;
  padding: 12px;
  border-radius: 8px;
  background: #fff7e6;
  color: #ad6800;
  font-size: 13px;
  line-height: 1.6;
}

.cp-notice .van-icon {
  margin-top: 2px;
}

.cp-logout {
  text-align: center;
  margin-top: 8px;
  color: #969799;
  font-size: 13px;
  cursor: pointer;
}
</style>
