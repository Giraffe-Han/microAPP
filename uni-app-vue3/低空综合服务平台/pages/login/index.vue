<template>
  <view class="login-page">
    <view class="logo-wrap">
      <image src="/static/logo.png" mode="aspectFit" class="logo" />
      <view class="title">低空综合服务</view>
    </view>

    <view class="form-box">
      <view class="input-item">
        <text class="icon">👤</text>
        <input class="input" v-model="phone" type="number" placeholder="请输入手机号" />
      </view>
      <view class="input-item">
        <text class="icon">🔒</text>
        <input class="input" v-model="password" password placeholder="请输入密码" />
      </view>

      <button class="login-btn" type="primary" @tap="handleLogin">登录</button>
      
      <view class="divider">
        <view class="line"></view>
        <text class="text">其他登录方式</text>
        <view class="line"></view>
      </view>

      <button class="wechat-btn" @tap="handleWechatLogin">
        <image src="/static/icons/service.svg" class="wx-icon" />
        微信一键登录
      </button>

      <view class="action-links">
        <text @tap="goRegister">注册账号</text>
        <text @tap="forgotPwd">忘记密码</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { request } from '../../utils/request'

const phone = ref('')
const password = ref('')

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    uni.showToast({ title: '请填写手机号和密码', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  try {
    let user = null
    // 尝试 API 登录
    try {
      const res = await request({
        url: '/api/login',
        method: 'POST',
        data: { phone: phone.value, password: password.value }
      })
      user = res.user
    } catch (e) {
      // 模拟登录
      user = {
        id: 'mock_1',
        name: '温州飞友',
        phone: phone.value,
        avatar: '',
        role: 'user'
      }
    }

    uni.setStorageSync('user', JSON.stringify(user))
    uni.hideLoading()
    uni.showToast({ title: '登录成功' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '登录失败', icon: 'none' })
  }
}

const goRegister = () => {
  uni.navigateTo({ url: '/pages/register/index' })
}

const handleWechatLogin = () => {
  uni.showLoading({ title: '授权中...' })
  
  // 1. 获取微信 code
  uni.login({
    provider: 'weixin',
    success: (loginRes) => {
      console.log('微信登录 code:', loginRes.code)
      
      // 2. 模拟向后台请求 openid 并登录
      setTimeout(() => {
        const mockUser = {
          id: 'wx_' + Math.random().toString(36).substr(2, 9),
          name: '微信用户',
          phone: '',
          avatar: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
          role: 'user',
          isAuth: false // 标记是否实名
        }
        
        uni.setStorageSync('user', JSON.stringify(mockUser))
        uni.hideLoading()
        uni.showToast({ title: '登录成功' })
        
        setTimeout(() => {
          uni.switchTab({ url: '/pages/home/index' })
        }, 1500)
      }, 1000)
    },
    fail: () => {
      uni.hideLoading()
      uni.showToast({ title: '微信授权失败', icon: 'none' })
    }
  })
}

const forgotPwd = () => {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
  padding: 60px 30px;
}

.logo-wrap {
  text-align: center;
  margin-bottom: 60px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #323233;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f7f8fa;
  padding: 16px;
  border-radius: 12px;
}

.icon {
  font-size: 20px;
}

.input {
  flex: 1;
  font-size: 16px;
}

.login-btn {
  margin-top: 20px;
  height: 50px;
  line-height: 50px;
  border-radius: 25px;
  background-color: #2f7ef7 !important;
  font-size: 18px;
  font-weight: bold;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 10px 0;
}

.divider .line {
  flex: 1;
  height: 1px;
  background: #ebedf0;
}

.divider .text {
  font-size: 12px;
  color: #969799;
}

.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 50px;
  border-radius: 25px;
  background-color: #f7f8fa;
  font-size: 16px;
  color: #333;
  border: 1px solid #ebedf0;
}

.wechat-btn::after {
  border: none;
}

.wx-icon {
  width: 24px;
  height: 24px;
  filter: invert(47%) sepia(90%) some-other-filter; /* 模拟微信绿，或者直接用图标 */
  filter: brightness(0) saturate(100%) invert(42%) sepia(88%) saturate(357%) hue-rotate(101deg) brightness(93%) contrast(90%);
}

.action-links {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 14px;
  color: #969799;
}
</style>

