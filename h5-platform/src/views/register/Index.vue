<template>
  <div class="register-page">
    <van-nav-bar
      title="注册账号"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="register-container">
      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="name"
            name="name"
            label="昵称"
            placeholder="请输入昵称"
            :rules="[{ required: true, message: '请填写昵称' }]"
          />
          <van-field
            v-model="phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请填写手机号' }]"
          />
          <van-field
            v-model="password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="[{ required: true, message: '请填写密码' }]"
          />
          <van-field
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            label="确认密码"
            placeholder="请再次输入密码"
            :rules="[
              { required: true, message: '请再次输入密码' },
              { validator: validatePass, message: '两次输入密码不一致' }
            ]"
          />
        </van-cell-group>
        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit">
            注册并登录
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import axios from 'axios'

const router = useRouter()
const name = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')

const validatePass = (val) => {
  return val === password.value
}

const onSubmit = async (values) => {
  try {
    const res = await axios.post('/api/register', {
      name: values.name,
      phone: values.phone,
      password: values.password
    })

    if (res.data.success) {
      showSuccessToast('注册成功')
      // Store user info
      localStorage.setItem('user', JSON.stringify(res.data.user))
      
      // Redirect to mine
      router.push('/mine')
    }
  } catch (error) {
    console.error(error)
    showFailToast(error.response?.data?.message || '注册失败')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.register-container {
  padding-top: 20px;
}
</style>
