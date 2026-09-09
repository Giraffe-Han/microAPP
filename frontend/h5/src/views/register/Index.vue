<template>
  <div class="register-page">
    <van-nav-bar
      title="注册账号"
      left-arrow
      @click-left="onBack"
    />

    <div class="register-container">
      <div class="logo-area">
        <div class="register-avatar">
          <van-icon name="add-o" size="40" color="#667eea" />
        </div>
        <h2 class="app-title">创建账号</h2>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[
              { required: true, message: '请填写手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入姓名（选填）"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请设置登录密码"
            :rules="[
              { required: true, message: '请设置密码' },
              { pattern: /^.{6,}$/, message: '密码至少6位' }
            ]"
          />
          <van-field
            v-model="form.confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请确认密码' },
              { validator: validateConfirmPassword, message: '两次密码不一致' }
            ]"
          />
          <van-field
            v-model="form.captchaCode"
            name="captchaCode"
            label="验证码"
            placeholder="请输入图形验证码"
            maxlength="6"
            :rules="[{ required: true, message: '请填写图形验证码' }]"
          >
            <template #button>
              <img
                v-if="captcha.image"
                :src="captcha.image"
                class="captcha-img"
                alt="图形验证码"
                @click="loadCaptcha"
              />
              <van-loading v-else type="spinner" size="18" />
            </template>
          </van-field>
        </van-cell-group>

        <div class="captcha-tip">看不清？点击图片刷新</div>

        <div class="agreement-check">
          <van-checkbox v-model="agreed" shape="square" icon-size="16px">
            <span class="agreement-text">
              我已阅读并同意
              <span class="link" @click.stop="goAgreement('user')">《用户协议》</span>
              和
              <span class="link" @click.stop="goAgreement('privacy')">《隐私政策》</span>
            </span>
          </van-checkbox>
        </div>

        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            注册
          </van-button>
        </div>
      </van-form>

      <div class="action-links">
        <span @click="goLogin">已有账号？立即登录</span>
      </div>

      <div class="sso-tip">
        <van-divider>或</van-divider>
        <p>从畅行温州平台跳转将自动注册登录</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import axios, { authStorage } from '@/utils/http'
import { smartBack } from '@/utils/miniprogram'

const router = useRouter()
const onBack = () => smartBack(router)
const loading = ref(false)

const form = ref({
  phone: '',
  name: '',
  password: '',
  confirmPassword: '',
  captchaCode: ''
})

const captcha = ref({
  captchaId: '',
  image: ''
})

// 验证码在服务端一次性消费，任何提交结果都需重新拉取
const loadCaptcha = async () => {
  captcha.value.image = ''
  form.value.captchaCode = ''
  try {
    const res = await axios.get('/api/auth/captcha')
    if (!res.data?.success) {
      throw new Error(res.data?.message || '获取验证码失败')
    }
    captcha.value = {
      captchaId: res.data.captchaId,
      image: res.data.image
    }
  } catch (error) {
    console.error(error)
    showFailToast('图形验证码加载失败，请点击图片重试')
  }
}

const validateConfirmPassword = (value) => {
  return value === form.value.password
}

// 隐私政策/用户协议明示同意：默认不勾选，未勾选不得注册
const agreed = ref(false)

const goAgreement = (type) => {
  router.push(`/agreement/${type}`)
}

const goLogin = () => {
  router.replace('/login')
}

const onSubmit = async (values) => {
  if (!agreed.value) {
    showFailToast('请先阅读并勾选同意《用户协议》和《隐私政策》')
    return
  }
  loading.value = true
  try {
    const res = await axios.post('/api/auth/register', {
      phone: values.phone,
      name: values.name || `User${values.phone.slice(-4)}`,
      password: values.password,
      captchaId: captcha.value.captchaId,
      captchaCode: values.captchaCode
    })

    if (!res.data?.success) {
      throw new Error(res.data?.message || '注册失败')
    }

    // 注册成功后自动登录
    localStorage.setItem('user', JSON.stringify(res.data.user))
    authStorage.setTokens(res.data.accessToken, res.data.refreshToken)

    showSuccessToast('注册成功')
    router.push('/home')
  } catch (error) {
    console.error(error)
    showFailToast(error?.response?.data?.message || error?.message || '注册失败')
    await loadCaptcha()
  } finally {
    loading.value = false
  }
}

onMounted(loadCaptcha)
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.register-container {
  padding-top: 40px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.register-avatar {
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

.captcha-img {
  display: block;
  width: 96px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
}

.captcha-tip {
  margin: 8px 32px 0;
  font-size: 12px;
  color: #969799;
  text-align: right;
}

.agreement-check {
  margin: 16px 16px 0;
}

.agreement-text {
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
}

.agreement-check .link {
  color: #667eea;
}

.action-links {
  text-align: center;
  margin-top: 16px;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
}

.sso-tip {
  margin-top: 32px;
  padding: 0 16px;
  text-align: center;
}

.sso-tip p {
  color: #969799;
  font-size: 13px;
  margin-top: 8px;
}
</style>
