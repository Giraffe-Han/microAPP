<template>
  <view class="study-page">
    <view class="page-header">
      <view class="header-bg">
        <view class="header-mask" />
      </view>
      <view class="header-content">
        <image class="header-icon" src="/static/icons/study.svg" mode="aspectFit" />
        <view class="header-title">低空研学</view>
        <view class="header-subtitle">选择适合的研学课程，开启飞行探索之旅</view>
      </view>
    </view>

    <view class="package-list">
      <view
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card"
        :class="{ recommended: pkg.recommended }"
        @tap="goToDetail(pkg.id)"
      >
        <view v-if="pkg.recommended" class="recommend-badge">推荐</view>
        <view class="card-top">
          <view class="pkg-name">{{ pkg.name }}</view>
          <view class="pkg-tag">{{ pkg.tag }}</view>
        </view>
        <view class="card-price">
          <text class="currency">¥</text>
          <text class="amount">{{ pkg.price }}</text>
          <text class="unit">/人</text>
        </view>
        <view class="card-desc">{{ pkg.desc }}</view>
        <view class="card-highlights">
          <view v-for="(h, i) in pkg.highlights" :key="i" class="highlight-item">
            <text class="highlight-icon">✓</text>
            <text>{{ h }}</text>
          </view>
        </view>
        <view class="card-action">
          <view class="action-btn" :class="{ 'primary': pkg.recommended, 'outline': !pkg.recommended }">
            查看详情
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-tip">
      <text>如有疑问请联系客服：</text>
      <text class="phone-link" @tap="makeCall">0577-55550500</text>
    </view>

    <HomeFloatButton />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import HomeFloatButton from '@/components/HomeFloatButton.vue'

const packages = ref([
  {
    id: 'study-198',
    name: '无人机研学实践中心半日营',
    tag: '半日营',
    price: 198,
    recommended: false,
    desc: '走进无人机研学实践中心，通过科普讲座与飞行实操，激发青少年对低空科技的兴趣。',
    highlights: [
      '低空科普课堂',
      '模拟飞行体验',
      '真机操控实践',
      '结业证书颁发'
    ]
  },
  {
    id: 'study-238',
    name: '无人机亲子研学课程',
    tag: '亲子课程',
    price: 238,
    recommended: true,
    desc: '家长与孩子共同参与无人机研学课程，在亲子互动中体验飞行乐趣，增进亲子关系。',
    highlights: [
      '亲子协作飞行任务',
      '无人机拼搭组装',
      '无人机调试试飞',
      '球幕影院观影'
    ]
  }
])

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/study/detail?package=${id}` })
}

const makeCall = () => {
  uni.makePhoneCall({ phoneNumber: '0577-55550500' })
}
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 60px;
}

.page-header {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
}

.header-mask {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 60%);
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.header-icon {
  width: 52px;
  height: 52px;
  filter: brightness(0) invert(1);
  margin-bottom: 12px;
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}

.header-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.package-list {
  padding: 0 16px;
  margin-top: -40px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.package-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 20px;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: all 0.3s;
}

.package-card.recommended {
  border-color: #2563eb;
}

.recommend-badge {
  position: absolute;
  top: -1px;
  right: 20px;
  background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 0 0 8px 8px;
}

.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pkg-name {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
}

.pkg-tag {
  font-size: 11px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.08);
  padding: 3px 10px;
  border-radius: 20px;
  font-weight: 500;
}

.card-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
}

.currency {
  font-size: 16px;
  font-weight: 700;
  color: #ee0a24;
}

.amount {
  font-size: 36px;
  font-weight: 800;
  color: #ee0a24;
  line-height: 1;
  margin: 0 2px;
}

.unit {
  font-size: 13px;
  color: #969799;
}

.card-desc {
  font-size: 13px;
  color: #646566;
  line-height: 1.7;
  margin-bottom: 16px;
}

.card-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #323233;
}

.highlight-icon {
  color: #06b6d4;
  font-weight: 700;
  font-size: 12px;
}

.card-action {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 8px 28px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.action-btn.primary {
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
  color: #fff;
}

.action-btn.outline {
  background: #fff;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.bottom-tip {
  text-align: center;
  padding: 32px 16px 20px;
  font-size: 13px;
  color: #969799;
}

.phone-link {
  color: #2563eb;
  font-weight: 600;
}
</style>
