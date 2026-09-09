<template>
  <view class="register-page">
    <view class="logo-wrap">
      <view class="register-avatar">
        <text class="avatar-text">+</text>
      </view>
      <view class="title">创建账号</view>
    </view>

    <view class="form-box">
      <view class="input-item">
        <text class="label">手机号</text>
        <input class="input" v-model="form.phone" type="number" placeholder="请输入手机号" />
      </view>
      <view class="input-item">
        <text class="label">姓名</text>
        <input class="input" v-model="form.name" placeholder="请输入姓名（选填）" />
      </view>
      <view class="input-item">
        <text class="label">密码</text>
        <input class="input" v-model="form.password" password placeholder="请设置登录密码" />
      </view>
      <view class="input-item">
        <text class="label">确认</text>
        <input class="input" v-model="form.confirmPassword" password placeholder="请再次输入密码" />
      </view>
      <view class="input-item">
        <text class="label">验证码</text>
        <input class="input" v-model="form.captchaCode" maxlength="6" placeholder="请输入图形验证码" />
        <image
          v-if="captcha.image"
          class="captcha-img"
          :src="captcha.image"
          mode="aspectFit"
          @tap="loadCaptcha"
        />
        <text v-else class="captcha-loading" @tap="loadCaptcha">加载中</text>
      </view>

      <view class="captcha-tip">看不清？点击图片刷新</view>

      <view class="agreement-check" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
          <text v-if="agreed" class="check-mark">✓</text>
        </view>
        <view class="agreement-text">
          我已阅读并同意
          <text class="link" @tap.stop="goAgreement('user')">《用户协议》</text>
          和
          <text class="link" @tap.stop="goAgreement('privacy')">《隐私政策》</text>
        </view>
      </view>

      <button class="reg-btn" type="primary" @tap="handleRegister" :loading="loading">注册</button>
      
      <view class="login-link" @tap="goLogin">
        已有账号？<text class="blue">立即登录</text>
      </view>

      <view class="sso-tip">
        <text>从畅行温州平台跳转将自动注册登录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request, authStorage } from '../../utils/request'

const loading = ref(false)

const form = ref({
  phone: '',
  name: '',
  password: '',
  confirmPassword: '',
  captchaCode: ''
})

const captcha = ref({ captchaId: '', image: '' })

// 隐私政策/用户协议明示同意：默认不勾选，未勾选不得注册
const agreed = ref(false)

const goAgreement = (type) => {
  uni.navigateTo({ url: `/pages/agreement/index?type=${type}` })
}

// 小程序 image 组件不支持 SVG，需请求 PNG 格式
// 验证码在服务端一次性消费，任何提交结果都需重新拉取
const loadCaptcha = async () => {
  captcha.value = { captchaId: '', image: '' }
  form.value.captchaCode = ''
  try {
    const res = await request({ url: '/api/auth/captcha?format=png' })
    if (!res?.success) throw new Error(res?.message || '获取验证码失败')
    captcha.value = { captchaId: res.captchaId, image: res.image }
  } catch (error) {
    console.error(error)
    uni.showToast({ title: '验证码加载失败，请点击重试', icon: 'none' })
  }
}

onMounted(loadCaptcha)

const handleRegister = async () => {
  if (!form.value.phone) {
    return uni.showToast({ title: '请填写手机号', icon: 'none' })
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  }
  if (!form.value.password || form.value.password.length < 6) {
    return uni.showToast({ title: '密码至少6位', icon: 'none' })
  }
  if (form.value.password !== form.value.confirmPassword) {
    return uni.showToast({ title: '两次密码不一致', icon: 'none' })
  }
  if (!form.value.captchaCode) {
    return uni.showToast({ title: '请输入图形验证码', icon: 'none' })
  }
  if (!agreed.value) {
    return uni.showToast({ title: '请先阅读并勾选同意《用户协议》和《隐私政策》', icon: 'none' })
  }

  loading.value = true
  try {
    const res = await request({
      url: '/api/auth/register',
      method: 'POST',
      data: {
        phone: form.value.phone,
        name: form.value.name || `User${form.value.phone.slice(-4)}`,
        password: form.value.password,
        captchaId: captcha.value.captchaId,
        captchaCode: form.value.captchaCode
      }
    })

    if (!res?.success) {
      throw new Error(res?.message || '注册失败')
    }

    uni.setStorageSync('user', JSON.stringify(res.user))
    authStorage.setTokens(res.accessToken, res.refreshToken)

    uni.showToast({ title: '注册成功' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/index' })
    }, 1000)
  } catch (error) {
    console.error(error)
    const msg = error?.data?.message || error?.message || '注册失败'
    uni.showToast({ title: msg, icon: 'none' })
    await loadCaptcha()
  } finally {
    loading.value = false
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
  padding: 80px 30px 30px;
}

.logo-wrap {
  text-align: center;
  margin-bottom: 40px;
}

.register-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.avatar-text {
  font-size: 36px;
  color: #667eea;
}

.title {
  font-size: 22px;
  font-weight: bold;
  color: #323233;
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
  width: 50px;
  font-size: 15px;
  color: #323233;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 15px;
}

.captcha-img {
  width: 96px;
  height: 36px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 6px;
}

.captcha-loading {
  width: 96px;
  font-size: 12px;
  color: #969799;
  text-align: center;
  flex-shrink: 0;
}

.captcha-tip {
  font-size: 12px;
  color: #969799;
  text-align: right;
  margin-top: -8px;
}

.agreement-check {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 4px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #c8c9cc;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.checkbox.checked {
  background: #667eea;
  border-color: #667eea;
}

.check-mark {
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.agreement-text {
  flex: 1;
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
}

.agreement-text .link {
  color: #667eea;
}

.reg-btn {
  margin-top: 12px;
  height: 48px;
  line-height: 48px;
  border-radius: 24px;
  background-color: #667eea !important;
  font-size: 17px;
  font-weight: bold;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #969799;
}

.blue {
  color: #667eea;
}

.sso-tip {
  text-align: center;
  font-size: 13px;
  color: #c8c9cc;
  margin-top: 20px;
}
</style>
