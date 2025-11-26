<template>
  <div class="home-page">
    <!-- 顶部Banner - 参考时尚科技网站的设计风格 -->
    <div class="banner-section">
      <div class="banner-content">
        <h1 class="banner-title">低空综合服务平台</h1>
        <p class="banner-subtitle">专业 · 高效 · 安全 · 智能</p>
      </div>
      <div class="banner-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 快捷服务入口 -->
    <div class="quick-access">
      <div class="quick-grid">
        <div 
          v-for="item in quickServices" 
          :key="item.id"
          class="quick-item"
          @click="goToService(item.id)"
        >
          <div class="quick-icon" :style="{ background: item.gradient }">
            <van-icon :name="item.icon" size="28" color="#fff" />
          </div>
          <span class="quick-name">{{ item.name }}</span>
          <span class="quick-tag" v-if="item.hot">热门</span>
        </div>
      </div>
    </div>

    <!-- 服务分类 -->
    <div class="service-section">
      <div class="section-header">
        <h2 class="section-title">全部服务</h2>
        <span class="more-link" @click="$router.push('/services')">
          查看全部 <van-icon name="arrow" />
        </span>
      </div>

      <div class="service-list">
        <div 
          v-for="service in displayServices" 
          :key="service.id"
          class="service-card"
          @click="goToDetail(service.id)"
        >
          <div class="service-icon" :style="{ background: service.color }">
            <van-icon :name="service.icon" size="24" color="#fff" />
          </div>
          <div class="service-info">
            <h3 class="service-name">{{ service.name }}</h3>
            <p class="service-desc">{{ service.description }}</p>
          </div>
          <van-icon name="arrow" color="#c8c9cc" />
        </div>

        <!-- 更多服务按钮 -->
        <div class="more-service-btn" @click="$router.push('/services')">
          <van-icon name="apps-o" size="20" color="#667eea" />
          <span>查看更多服务</span>
          <van-icon name="arrow" size="16" color="#969799" />
        </div>
      </div>
    </div>

    <!-- 案例展示 -->
    <div class="cases-section">
      <div class="section-header">
        <h2 class="section-title">精选案例</h2>
        <span class="more-link" @click="$router.push('/cases')">
          查看全部 <van-icon name="arrow" />
        </span>
      </div>
      <div class="cases-banner" @click="$router.push('/cases')">
        <div class="banner-content">
          <van-icon name="video-o" size="40" color="#fff" />
          <div class="banner-text">
            <h3>精彩案例集锦</h3>
            <p>图片·视频·轮播展示</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 无人机外卖配送 -->
    <div class="delivery-section">
      <div class="section-header">
        <h2 class="section-title">特色服务</h2>
      </div>
      <div class="delivery-card" @click="goToDelivery">
        <div class="delivery-icon">
          <van-icon name="shopping-cart-o" size="48" color="#fff" />
        </div>
        <div class="delivery-content">
          <h3 class="delivery-title">无人机外卖配送</h3>
          <p class="delivery-desc">快速配送 · 安全可靠 · 即时送达</p>
          <div class="delivery-tag">
            <span class="tag-hot">🔥 热门</span>
            <span class="tag-new">✨ 在线下单</span>
          </div>
        </div>
        <div class="delivery-arrow">
          <van-icon name="arrow" size="20" color="#fff" />
        </div>
      </div>
    </div>

    <!-- 平台优势 -->
    <div class="advantages-section">
      <div class="section-header">
        <h2 class="section-title">平台优势</h2>
      </div>
      <div class="advantage-grid">
        <div v-for="(adv, index) in advantages" :key="index" class="advantage-item">
          <div class="advantage-icon">
            <van-icon :name="adv.icon" size="32" :color="adv.color" />
          </div>
          <h4 class="advantage-title">{{ adv.title }}</h4>
          <p class="advantage-desc">{{ adv.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 快捷服务 - 4个重点服务
const quickServices = ref([
  { id: 1, name: '无人机物流', icon: 'send-gift-o', hot: true, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }, // 物流配送
  { id: 2, name: '政务巡检', icon: 'eye-o', hot: true, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }, // 巡检监控
  { id: 3, name: '无人机托管', icon: 'shop-o', hot: true, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }, // 托管服务
  { id: 4, name: '无人机吊运', icon: 'upgrade', hot: true, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' } // 吊运上升
])

// 主要展示服务 - 只显示4项重点服务
const displayServices = ref([
  { id: 1, name: '无人机物流服务', description: '城市配送、紧急物资运输', icon: 'send-gift-o', color: '#667eea' }, // 物流配送
  { id: 2, name: '政务巡检服务', description: '环保监测、安全巡查', icon: 'eye-o', color: '#f5576c' }, // 巡检监控
  { id: 3, name: '无人机托管服务', description: '专业托管、保养维护', icon: 'shop-o', color: '#00f2fe' }, // 托管服务
  { id: 4, name: '无人机吊运服务', description: '高空吊运、建筑施工', icon: 'upgrade', color: '#38f9d7' } // 吊运上升
])

// 平台优势
const advantages = ref([
  { icon: 'shield-o', color: '#667eea', title: '专业可靠', description: '持证飞手，专业设备' },
  { icon: 'clock-o', color: '#f5576c', title: '快速响应', description: '24小时在线服务' },
  { icon: 'diamond-o', color: '#00f2fe', title: '优质服务', description: '一站式解决方案' },
  { icon: 'medal-o', color: '#38f9d7', title: '安全保障', description: '全程保险覆盖' }
])

const goToService = (id) => {
  router.push(`/service-detail/${id}`)
}

const goToDetail = (id) => {
  router.push(`/service-detail/${id}`)
}

// 跳转到无人机外卖配送页面
const goToDelivery = () => {
  window.location.href = 'https://app.wzsjy.com:8446/h5/#/pages/diy/diy?pageId=130&title=%E6%97%A0%E4%BA%BA%E6%9C%BA%E5%A4%96%E5%8D%96%E9%85%8D%E9%80%81&jyauthcode='
}
</script>

<style scoped>
.home-page {
  padding-bottom: 20px;
}

/* Banner区域 - 参考时尚科技网站的紫色渐变 */
.banner-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 50px 20px 60px;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: #fff;
}

.banner-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.banner-subtitle {
  font-size: 14px;
  opacity: 0.95;
}

.banner-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -30px;
  left: -30px;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 20%;
}

/* 快捷服务 */
.quick-access {
  margin: -40px 16px 16px;
  background: #fff;
  border-radius: 16px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 3;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.quick-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.quick-item:active .quick-icon {
  transform: scale(0.95);
}

.quick-name {
  font-size: 12px;
  color: #323233;
  text-align: center;
}

.quick-tag {
  position: absolute;
  top: -4px;
  right: 4px;
  background: #ff976a;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 服务列表 */
.service-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #323233;
}

.more-link {
  font-size: 14px;
  color: #969799;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.service-card:active {
  background: #ebedf0;
}

.service-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.service-info {
  flex: 1;
}

.service-name {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.service-desc {
  font-size: 12px;
  color: #969799;
}

/* 更多服务按钮 */
.more-service-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 12px;
  background: linear-gradient(135deg, #f7f8fa 0%, #e8eaf6 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 8px;
}

.more-service-btn:active {
  background: linear-gradient(135deg, #ebedf0 0%, #d1d5e8 100%);
  transform: scale(0.98);
}

.more-service-btn span {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

/* 案例展示 */
.cases-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.cases-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.cases-banner:active {
  transform: scale(0.98);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #fff;
}

.banner-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.banner-text p {
  font-size: 13px;
  opacity: 0.9;
}

/* 无人机外卖配送 */
.delivery-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.delivery-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #f06595 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.delivery-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.delivery-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 12px rgba(255, 107, 107, 0.3);
}

.delivery-icon {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.delivery-content {
  flex: 1;
  color: #fff;
  position: relative;
  z-index: 1;
}

.delivery-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delivery-desc {
  font-size: 13px;
  opacity: 0.95;
  margin-bottom: 10px;
  line-height: 1.5;
}

.delivery-tag {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.delivery-tag span {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tag-hot {
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.delivery-arrow {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* 平台优势 */
.advantages-section {
  margin: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.advantage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.advantage-item {
  text-align: center;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
}

.advantage-icon {
  margin-bottom: 8px;
}

.advantage-title {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 4px;
}

.advantage-desc {
  font-size: 12px;
  color: #969799;
}
</style>

