<template>
  <view class="cp-page">
    <view v-if="forced" class="cp-notice">
      <text>管理员已重置您的账号密码。为保障账号安全，请设置您自己的新密码后继续使用。</text>
    </view>

    <view class="form-box">
      <view class="input-item" v-if="!forced">
        <text class="label">原密码</text>
        <input class="input" v-model="oldPassword" password placeholder="请输入原密码" />
      </view>
      <view class="input-item">
        <text class="label">新密码</text>
        <input class="input" v-model="newPassword" password placeholder="请输入新密码（至少6位）" />
      </view>
      <view class="input-item">
        <text class="label">确认密码</text>
        <input class="input" v-model="confirmPassword" password placeholder="请再次输入新密码" />
      </view>

      <button class="submit-btn" type="primary" @tap="onSubmit" :loading="loading">
        {{ forced ? '设置并继续' : '确认修改' }}
      </button>

      <view v-if="forced" class="logout-link" @tap="onLogout">暂不设置，退出登录</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request, authStorage } from '../../utils/request'

const forced = ref(false)
const loading = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

onLoad((options) => {
  forced.value = !!(options && (options.forced === '1' || options.forced === 'true'))
  if (forced.value) {
    uni.setNavigationBarTitle({ title: '设置新密码' })
  }
  // 未登录（无令牌）时回到登录页
  if (!authStorage.getAccessToken()) {
    uni.reLaunch({ url: '/pages/login/index' })
  }
})

const onSubmit = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    uni.showToast({ title: '新密码至少6位', icon: 'none' })
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (!forced.value && !oldPassword.value) {
    uni.showToast({ title: '请输入原密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const data = { newPassword: newPassword.value }
    if (!forced.value) data.oldPassword = oldPassword.value
    const res = await request({ url: '/api/auth/change-password', method: 'POST', data })
    if (!res?.success) {
      throw new Error(res?.message || '密码修改失败')
    }

    // 同步本地缓存的用户标记，避免重复触发强制改密
    try {
      const stored = uni.getStorageSync('user')
      if (stored) {
        const u = JSON.parse(stored)
        u.mustChangePassword = false
        uni.setStorageSync('user', JSON.stringify(u))
      }
    } catch (e) { /* ignore */ }

    uni.showToast({ title: '密码修改成功' })
    setTimeout(() => {
      if (forced.value) {
        uni.switchTab({ url: '/pages/home/index' })
      } else {
        uni.navigateBack()
      }
    }, 1000)
  } catch (error) {
    const msg = error?.data?.message || error?.message || '密码修改失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loading.value = false
  }
}

const onLogout = () => {
  request({ url: '/api/auth/logout', method: 'POST' }).catch(() => {})
  authStorage.clearTokens()
  uni.removeStorageSync('user')
  uni.reLaunch({ url: '/pages/login/index' })
}
</script>

<style scoped>
.cp-page {
  min-height: 100vh;
  background: #fff;
  padding: 24px 30px 30px;
  box-sizing: border-box;
}

.cp-notice {
  background: #fff7e6;
  color: #ad6800;
  font-size: 13px;
  line-height: 1.6;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-item {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  padding: 14px 16px;
  border-radius: 12px;
}

.label {
  width: 70px;
  font-size: 15px;
  color: #323233;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 15px;
}

.submit-btn {
  margin-top: 12px;
  height: 48px;
  line-height: 48px;
  border-radius: 24px;
  background-color: #667eea !important;
  font-size: 17px;
  font-weight: bold;
}

.logout-link {
  text-align: center;
  margin-top: 8px;
  color: #969799;
  font-size: 13px;
}
</style>
