<template>
  <div class="study-page">
    <van-nav-bar
      title="低空研学"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />
    <HomeFloatButton />

    <div class="page-header">
      <div class="header-bg" />
      <div class="header-content">
        <van-icon name="/icons/study.svg" size="48" color="#ffffff" />
        <h1 class="header-title">低空研学</h1>
        <p class="header-subtitle">选择适合的研学课程，开启飞行探索之旅</p>
      </div>
    </div>

    <div class="package-list">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="package-card"
        :class="{ recommended: pkg.recommended }"
        @click="goToDetail(pkg.id)"
      >
        <div v-if="pkg.recommended" class="recommend-badge">推荐</div>
        <div class="card-top">
          <div class="pkg-name">{{ pkg.name }}</div>
          <div class="pkg-tag">{{ pkg.tag }}</div>
        </div>
        <div class="card-price">
          <span class="currency">¥</span>
          <span class="amount">{{ pkg.price }}</span>
          <span class="unit">/人</span>
        </div>
        <div class="card-desc">{{ pkg.desc }}</div>
        <div class="card-highlights">
          <div v-for="(h, i) in pkg.highlights" :key="i" class="highlight-item">
            <van-icon name="success" size="14" color="#06b6d4" />
            <span>{{ h }}</span>
          </div>
        </div>
        <div class="card-action">
          <van-button
            :type="pkg.recommended ? 'primary' : 'default'"
            size="small"
            round
            :color="pkg.recommended ? '#0071e3' : undefined"
            :plain="!pkg.recommended"
          >
            查看详情
          </van-button>
        </div>
      </div>
    </div>

    <div class="bottom-tip">
      <span>如有疑问请联系客服：</span>
      <a class="phone-link" href="tel:0577-55550500">0577-55550500</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HomeFloatButton from '@/components/HomeFloatButton.vue'

const router = useRouter()

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
  router.push(`/study/${id}`)
}
</script>

<style scoped>
.study-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 60px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  max-width: 520px;
  margin: 0 auto;
}

.page-header {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%);
}

.header-bg::after {
  content: '';
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
  color: #fff;
}

.header-content :deep(.van-icon__image) {
  filter: brightness(0) invert(1);
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  margin: 12px 0 8px;
}

.header-subtitle {
  font-size: 13px;
  opacity: 0.85;
  margin: 0;
}

.package-list {
  padding: 0 16px;
  margin-top: -36px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.package-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px 20px;
  position: relative;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
}

.package-card:active {
  transform: scale(0.98);
}

.package-card.recommended {
  border-color: #0071e3;
}

.recommend-badge {
  position: absolute;
  top: -1px;
  right: 20px;
  background: linear-gradient(135deg, #0071e3 0%, #06b6d4 100%);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 14px;
  border-radius: 0 0 10px 10px;
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
  color: #1d1d1f;
  flex: 1;
}

.pkg-tag {
  font-size: 11px;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
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
  color: #86868b;
}

.card-desc {
  font-size: 13px;
  color: #86868b;
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
  color: #424245;
}

.card-action {
  display: flex;
  justify-content: flex-end;
}

.bottom-tip {
  text-align: center;
  padding: 32px 16px 20px;
  font-size: 13px;
  color: #86868b;
}

.phone-link {
  color: #0071e3;
  font-weight: 600;
  text-decoration: none;
}
</style>
