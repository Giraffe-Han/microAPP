<template>
  <div class="login-page">
    <van-nav-bar
      title="登录"
      left-arrow
      @click-left="$router.back()"
    >
      <template #right>
        <van-icon name="wap-home-o" size="18" class="nav-home" @click="goHome" />
      </template>
    </van-nav-bar>

    <div class="login-container">
      <div class="logo-area">
        <div class="login-avatar" aria-label="default avatar">
          <van-icon name="contact" size="40" color="#8e8e93" />
        </div>
        <h2 class="app-title">低空综合服务平台</h2>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="authcode"
            name="authcode"
            label="授权码"
            placeholder="请输入授权码"
            :rules="[{ required: true, message: '请填写授权码' }]"
          />
        </van-cell-group>
        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>

      <div class="action-links">
        <span>使用畅行温州授权码登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import axios, { authStorage } from '@/utils/http'

const router = useRouter()
const route = useRoute()
const authcode = ref('')

const goHome = () => {
  router.replace('/home')
}

const ssoLogin = async (code) => {
  const res = await axios.post('/api/sso/login', { authcode: code })
  if (!res.data?.success) {
    throw new Error(res.data?.message || '授权登录失败')
  }
  localStorage.setItem('user', JSON.stringify(res.data.user))
  authStorage.setTokens(res.data.accessToken, res.data.refreshToken)
  showSuccessToast('登录成功')
  router.push('/home')
}

const onSubmit = async (values) => {
  try {
    await ssoLogin(values.authcode)
  } catch (error) {
    console.error(error)
    showFailToast(error?.message || '登录失败')
  }
}

onMounted(() => {
  const code = route.query.authcode
  if (typeof code === 'string' && code.trim()) {
    authcode.value = code.trim()
    ssoLogin(authcode.value).catch((error) => {
      console.error(error)
      showFailToast(error?.message || '授权登录失败')
    })
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.nav-home {
  color: #1d1d1f;
}

.login-container {
  padding-top: 40px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}

.login-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.app-title {
  margin-top: 16px;
  font-size: 20px;
  color: #333;
  font-weight: 600;
}

.action-links {
  text-align: center;
  margin-top: 16px;
  color: #667eea;
  font-size: 14px;
}
</style>
