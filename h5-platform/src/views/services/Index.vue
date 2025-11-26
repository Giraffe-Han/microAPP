<template>
  <div class="services-page page-container">
    <van-sticky>
      <van-search v-model="searchText" placeholder="搜索服务" shape="round" />
    </van-sticky>

    <div class="content-wrapper">
      <div class="service-grid">
        <div
          v-for="service in allServices"
          :key="service.id"
          class="service-grid-item"
          @click="goToDetail(service.id)"
        >
          <div class="service-icon-large" :style="{ background: service.color }">
            <van-icon :name="service.icon" size="32" color="#fff" />
          </div>
          <h3 class="service-title">{{ service.name }}</h3>
          <p class="service-summary">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchText = ref('')

// 十一项服务完整列表（图标已优化）
const allServices = ref([
  { id: 1, name: '无人机物流', description: '城市配送、物资运输', icon: 'send-gift-o', color: '#667eea' }, // 物流配送
  { id: 2, name: '政务巡检', description: '环保监测、安全巡查', icon: 'eye-o', color: '#f5576c' }, // 巡检监控
  { id: 3, name: '无人机托管', description: '专业托管、保养维护', icon: 'shop-o', color: '#00f2fe' }, // 托管商店
  { id: 4, name: '无人机吊运', description: '高空吊运、设备安装', icon: 'upgrade', color: '#38f9d7' }, // 吊运上升
  { id: 5, name: '航空表演', description: '活动表演、编队飞行', icon: 'fire-o', color: '#da77f2' }, // 烟花表演
  { id: 6, name: '无人机培训', description: 'CAAC执照、技能培训', icon: 'certificate', color: '#20c997' }, // 证书培训
  { id: 7, name: '无人机租赁', description: '设备租赁、配件租赁', icon: 'coupon-o', color: '#4c6ef5' }, // 租赁券
  { id: 8, name: '无人机外卖', description: '即时配送、在线下单', icon: 'shopping-cart-o', color: '#ff6b6b' }, // 外卖配送
  { id: 9, name: '低空研学', description: '科普教育、实践体验', icon: 'records', color: '#9c27b0' }, // 研学记录
  { id: 10, name: '二手交易', description: '设备买卖、以旧换新', icon: 'exchange', color: '#ff9800' }, // 交易兑换
  { id: 11, name: '金融服务', description: '设备保险、飞行护航', icon: 'balance-o', color: '#00bcd4' } // 金融天平
])

const goToDetail = (id) => {
  router.push(`/service-detail/${id}`)
}
</script>

<style scoped>
.services-page {
  background: #f5f5f5;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.service-grid-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.service-grid-item:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-icon-large {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.service-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 6px;
}

.service-summary {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}
</style>

