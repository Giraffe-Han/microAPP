<template>
  <div class="register-page">
    <van-nav-bar
      title="注册账号"
      left-arrow
      @click-left="$router.back()"
    />

    <div class="register-container">
      <van-empty
        image="error"
        description="平台采用统一用户体系，不支持本地注册"
      >
        <van-button round type="primary" @click="goLogin">
          返回登录
        </van-button>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const goLogin = () => {
  router.replace('/login')
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
