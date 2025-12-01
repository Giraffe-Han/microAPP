<template>
  <div class="login-page">
    <van-nav-bar
      title="登录"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="login-container">
      <div class="logo-area">
        <van-image
          round
          width="80"
          height="80"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
        <h2 class="app-title">低空综合服务平台</h2>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="phone"
            name="phone"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请填写账号' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
        </van-cell-group>
        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit">
            登录
          </van-button>
        </div>
      </van-form>

      <div class="action-links">
        <span @click="$router.push('/register')">注册账号</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const phone = ref('')
const password = ref('')

const onSubmit = async (values) => {
  try {
    const res = await axios.post('/api/login', {
      phone: values.phone,
      password: values.password
    })

    if (res.data.success) {
      showSuccessToast('登录成功')
      // Store user info (simple localStorage for now)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      // Redirect based on role or to home
      if (res.data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/mine')
      }
    }
  } catch (error) {
    console.error(error)
    showFailToast(error.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f7f8fa;
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
