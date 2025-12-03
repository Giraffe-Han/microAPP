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
          <div class="service-icon-large">
            <van-icon :name="service.icon" size="28" :color="service.color" />
          </div>
          <h3 class="service-title">{{ service.name }}</h3>
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
  { id: 'flight', name: '飞行服务', description: '空域查询、飞行申报', icon: 'send-gift-o', color: '#1677ff' },
  { id: 8, name: '无人机外卖', description: '即时配送、在线下单', icon: 'shopping-cart-o', color: '#f5222d' },
  { id: 1, name: '无人机物流', description: '城市配送、物资运输', icon: 'logistics', color: '#1677ff' }, // 物流配送
  { id: 2, name: '政务巡检', description: '环保监测、安全巡查', icon: 'eye-o', color: '#ff9c6e' }, // 巡检监控
  { id: 3, name: '无人机托管', description: '专业托管、保养维护', icon: 'shop-o', color: '#52c41a' }, // 托管商店
  { id: 4, name: '无人机吊运', description: '高空吊运、设备安装', icon: 'upgrade', color: '#722ed1' }, // 吊运上升
  { id: 5, name: '航空表演', description: '活动表演、编队飞行', icon: 'fire-o', color: '#eb2f96' }, // 烟花表演
  { id: 6, name: '无人机培训', description: 'CAAC执照、技能培训', icon: 'certificate', color: '#faad14' }, // 证书培训
  { id: 7, name: '无人机租赁', description: '设备租赁、配件租赁', icon: 'coupon-o', color: '#13c2c2' }, // 租赁券
  { id: 9, name: '低空研学', description: '科普教育、实践体验', icon: 'records', color: '#eb2f96' }, // 研学记录
  { id: 10, name: '二手交易', description: '设备买卖、以旧换新', icon: 'exchange', color: '#fa8c16' }, // 交易兑换
  { id: 11, name: '金融服务', description: '设备保险、飞行护航', icon: 'balance-o', color: '#1677ff' } // 金融天平
])

const goToDetail = (id) => {
  if (id === 'flight') {
    window.location.href = 'https://gw.zndkfx.com/sso/cxwz'
  } else if (id === 8) {
    window.location.href = 'https://app.wzsjy.com:8446/h5/#/pages/diy/diy?pageId=130&title=%E6%97%A0%E4%BA%BA%E6%9C%BA%E5%A4%96%E5%8D%96%E9%85%8D%E9%80%81&jyauthcode='
  } else {
    router.push(`/service-detail/${id}`)
  }
}
</script>

<style scoped>
.services-page {
  background: #f5f5f5;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 8px;
  padding: 16px 12px;
  background: #fff;
}

.service-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}

.service-grid-item:active {
  opacity: 0.7;
}

.service-icon-large {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  background: transparent; /* Or keep light bg if preferred, but usually cleaner without or consistent */
}

.service-title {
  font-size: 12px;
  font-weight: 400;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.service-summary {
  display: none;
}
</style>

