<template>
  <div class="layout">
    <router-view />
    <van-tabbar v-if="showTabbar" route active-color="#000000" inactive-color="#969799" style="padding-bottom: env(safe-area-inset-bottom);">
      <van-tabbar-item to="/home">
        <span>服务大厅</span>
        <template #icon="props">
          <van-icon :name="props.active ? 'wap-home' : 'wap-home-o'" />
        </template>
      </van-tabbar-item>
      
      <van-tabbar-item to="/services">
        <span>全部服务</span>
        <template #icon="props">
          <van-icon :name="props.active ? 'shop' : 'shop-o'" />
        </template>
      </van-tabbar-item>
      
      <van-tabbar-item to="/applications">
        <span>我的申请</span>
        <template #icon="props">
          <van-icon :name="props.active ? 'todo-list' : 'todo-list-o'" />
        </template>
      </van-tabbar-item>
      
      <van-tabbar-item to="/mine">
        <span>个人中心</span>
        <template #icon="props">
          <van-icon :name="props.active ? 'user' : 'user-o'" />
        </template>
      </van-tabbar-item>
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

:deep(.van-tabbar) {
  height: 60px;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: content-box;
}

:deep(.van-tabbar-item__icon) {
  margin-bottom: 4px;
}
</style>

