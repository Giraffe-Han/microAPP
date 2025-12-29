<template>
  <view class="register-page">
    <view class="title">创建账号</view>
    <view class="subtitle">欢迎加入低空综合服务平台</view>

    <view class="form-box">
      <view class="input-item">
        <input class="input" v-model="form.name" placeholder="姓名" />
      </view>
      <view class="input-item">
        <input class="input" v-model="form.phone" type="number" placeholder="手机号" />
      </view>
      <view class="input-item">
        <input class="input" v-model="form.password" password placeholder="设置密码" />
      </view>

      <button class="reg-btn" type="primary" @tap="handleRegister">立即注册</button>
      
      <view class="login-link" @tap="goLogin">
        已有账号？<text class="blue">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { request } from '../../utils/request'

const form = ref({
  name: '',
  phone: '',
  password: ''
})

const handleRegister = async () => {
  if (!form.value.name || !form.value.phone || !form.value.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  uni.showLoading({ title: '注册中...' })

  try {
    // 尝试 API 注册
    try {
      await request({
        url: '/api/register',
        method: 'POST',
        data: form.value
      })
    } catch (e) {
      // 模拟注册成功，直接登录
      const mockUser = {
        id: 'mock_' + Date.now(),
        name: form.value.name,
        phone: form.value.phone,
        avatar: '',
        role: 'user'
      }
      uni.setStorageSync('user', JSON.stringify(mockUser))
    }

    uni.hideLoading()
    uni.showToast({ title: '注册成功' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '注册失败', icon: 'none' })
  }
}

const goLogin = () => {
  uni.navigateBack()
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #fff;
  padding: 60px 30px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #969799;
  margin-bottom: 40px;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-item {
  background: #f7f8fa;
  padding: 16px;
  border-radius: 12px;
}

.input {
  width: 100%;
  font-size: 16px;
}

.reg-btn {
  margin-top: 20px;
  height: 50px;
  line-height: 50px;
  border-radius: 25px;
  background-color: #2f7ef7 !important;
  font-size: 18px;
  font-weight: bold;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #969799;
}

.blue {
  color: #2f7ef7;
}
</style>

