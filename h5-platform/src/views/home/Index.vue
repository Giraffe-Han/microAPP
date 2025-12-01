<template>
  <div class="home-page">
    <!-- 顶部区域：定位+搜索 -->
    <div class="header-section">
      <div class="location-bar">
        <span class="location-text">温州市 <van-icon name="arrow-down" size="12" /></span>
        <div class="weather-info">20°C 晴</div>
      </div>
      <div class="search-bar">
        <van-search placeholder="搜索服务/案例" shape="round" background="transparent" />
      </div>
    </div>

    <!-- 功能金刚区 - 支付宝风格 -->
    <div class="main-functions">
      <div class="function-grid">
        <div 
          v-for="item in quickServices" 
          :key="item.id"
          class="function-item"
          @click="goToService(item.id)"
        >
          <div class="function-icon-wrapper">
            <van-icon :name="item.icon" size="28" :color="item.color" />
          </div>
          <span class="function-name">{{ item.name }}</span>
        </div>
        <!-- 添加一些占位功能以凑齐8个 -->
        <div class="function-item" @click="$router.push('/services')">
          <div class="function-icon-wrapper">
            <van-icon name="apps-o" size="28" color="#1677ff" />
          </div>
          <span class="function-name">全部服务</span>
        </div>
      </div>
    </div>

    <!-- 消息通知栏 -->
    <div class="notice-bar-section">
      <van-notice-bar
        left-icon="volume-o"
        :scrollable="false"
      >
        <van-swipe
          vertical
          class="notice-swipe"
          :autoplay="3000"
          :touchable="false"
          :show-indicators="false"
        >
          <van-swipe-item>交享点无人机外卖配送正式上线</van-swipe-item>
          <van-swipe-item>新开通江心屿无人机外卖配送</van-swipe-item>
        </van-swipe>
      </van-notice-bar>
    </div>

    <!-- 核心服务卡片区 -->
    <div class="content-area">
      <!-- 无人机外卖 - 突出展示 -->
      <div class="feature-card delivery-card" @click="goToDelivery">
        <div class="card-info">
          <h3>无人机外卖</h3>
          
          <div class="tags">
            <span class="tag">热门</span>
            
          </div>
        </div>
        <div class="card-image">
          <van-icon name="logistics" size="64" color="#fff" style="opacity: 0.9;" />
        </div>
      </div>

      <!-- 左右分栏推荐 -->
      <div class="recommend-grid">
        <div class="recommend-card blue-card" @click="$router.push('/cases')">
          <h4>精选案例</h4>
          <p>行业应用示范</p>
          <van-icon name="video-o" size="32" class="card-icon" />
        </div>
        <div class="recommend-card orange-card" @click="$router.push('/services')">
          <h4>服务大厅</h4>
          <p>一站式办理</p>
          <van-icon name="service-o" size="32" class="card-icon" />
        </div>
      </div>

      <!-- 为你推荐 (服务列表) -->
      <div class="service-feed">
        <div class="section-title">为你推荐</div>
        <div 
          v-for="service in displayServices" 
          :key="service.id"
          class="feed-card"
          @click="goToDetail(service.id)"
        >
          <div class="feed-icon" :style="{ background: service.bgLight }">
            <van-icon :name="service.icon" size="24" :color="service.color" />
          </div>
          <div class="feed-content">
            <div class="feed-title">{{ service.name }}</div>
            <div class="feed-desc">{{ service.description }}</div>
          </div>
          <van-button size="mini" round :color="service.color" plain>去办理</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 快捷服务 - 模仿支付宝首页图标
const quickServices = ref([
  { id: 1, name: '物流配送', icon: 'logistics', color: '#1677ff' },
  { id: 2, name: '政务巡检', icon: 'eye-o', color: '#ff9c6e' },
  { id: 3, name: '机库托管', icon: 'shop-o', color: '#52c41a' },
  { id: 4, name: '设备吊运', icon: 'upgrade', color: '#722ed1' },
  { id: 6, name: '无人机培训', icon: 'certificate', color: '#faad14' },
  { id: 9, name: '低空研学', icon: 'records', color: '#eb2f96' },
  { id: 8, name: '外卖配送', icon: 'shopping-cart-o', color: '#f5222d' },
  // { id: 8, name: '全部服务', icon: 'apps-o', color: '#1677ff' } // Handled manually
])

// 推荐服务列表
const displayServices = ref([
  { id: 1, name: '无人机物流', description: '城市极速配送，解决最后一公里难题', icon: 'logistics', color: '#1677ff', bgLight: '#e6f7ff' },
  { id: 2, name: '政务巡检', description: '高效环保监测、交通疏导、安全巡查', icon: 'eye-o', color: '#ff9c6e', bgLight: '#fff7e6' },
  { id: 3, name: '无人机托管', description: '专业机库托管，定期维护保养', icon: 'shop-o', color: '#52c41a', bgLight: '#f6ffed' },
  { id: 4, name: '高空吊运', description: '建筑材料、基站设备高空精准吊运', icon: 'upgrade', color: '#722ed1', bgLight: '#f9f0ff' }
])

const goToService = (id) => {
  if (id === 8) {
    goToDelivery()
  } else {
    router.push(`/service-detail/${id}`)
  }
}

const goToDetail = (id) => {
  router.push(`/service-detail/${id}`)
}

const goToDelivery = () => {
  window.location.href = 'https://app.wzsjy.com:8446/h5/#/pages/diy/diy?pageId=130&title=%E6%97%A0%E4%BA%BA%E6%9C%BA%E5%A4%96%E5%8D%96%E9%85%8D%E9%80%81&jyauthcode='
}
</script>

<style scoped>
.home-page {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* 顶部区域 */
.header-section {
  background: linear-gradient(180deg, #1677ff 0%, #ffffff 100%);
  padding: 12px 16px 20px;
  color: #fff;
}

.location-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.location-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.search-bar :deep(.van-search) {
  padding: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-bar :deep(.van-search__content) {
  background: #f7f8fa;
}

.search-bar :deep(.van-field__control) {
  color: #323233;
}

.search-bar :deep(.van-icon) {
  color: #969799;
}

.search-bar :deep(input::placeholder) {
  color: #969799;
}

/* 功能金刚区 */
.main-functions {
  background: #fff;
  padding: 16px 0;
  margin-bottom: 10px;
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 16px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.function-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f7f8fa;
}

.function-name {
  font-size: 12px;
  color: #333;
}

/* 消息通知 */
.notice-bar-section {
  margin-bottom: 10px;
  background: #fff;
}

.notice-swipe {
  height: 40px;
  line-height: 40px;
}

/* 内容区域 */
.content-area {
  padding: 0 12px;
}

/* 特色卡片 */
.feature-card {
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.delivery-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
}

.card-info h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.card-info p {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 1px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.recommend-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.recommend-card {
  padding: 16px;
  border-radius: 12px;
  position: relative;
  height: 100px;
}

.blue-card {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #0050b3;
}

.orange-card {
  background: linear-gradient(135deg, #fff7e6 0%, #ffd591 100%);
  color: #d46b08;
}

.recommend-card h4 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.recommend-card p {
  font-size: 12px;
  opacity: 0.8;
}

.card-icon {
  position: absolute;
  bottom: 12px;
  right: 12px;
  opacity: 0.5;
}

/* 推荐列表 */
.service-feed {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.feed-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.feed-card:last-child {
  border-bottom: none;
}

.feed-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-content {
  flex: 1;
}

.feed-title {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.feed-desc {
  font-size: 12px;
  color: #999;
}
</style>

