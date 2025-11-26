<template>
  <div class="layout">
    <router-view />
    <van-tabbar v-if="showTabbar" route active-color="#667eea" style="padding-bottom: env(safe-area-inset-bottom);">
      <van-tabbar-item to="/home" icon="wap-home-o">服务大厅</van-tabbar-item>
      <van-tabbar-item to="/services" icon="apps-o">全部服务</van-tabbar-item>
      <van-tabbar-item to="/applications" icon="records">我的申请</van-tabbar-item>
      <van-tabbar-item to="/mine" icon="user-o">个人中心</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showTabbar = computed(() => route.meta.showTabbar)
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>

