<template>
  <div class="study-select-page">
    <van-nav-bar
      title="低空研学"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />
    <HomeFloatButton />

    <div class="page-header">
      <div class="header-bg" />
      <div class="header-content">
        <van-icon name="/icons/study.svg" size="48" color="#ffffff" />
        <h1 class="header-title">低空研学</h1>
        <p class="header-subtitle">请选择研学点位，开启飞行探索之旅</p>
      </div>
    </div>

    <div class="location-list">
      <div
        v-for="loc in locations"
        :key="loc.key"
        class="location-card"
        @click="goToLocation(loc)"
      >
        <div class="loc-cover" :style="coverStyle(loc)">
          <div class="loc-mask" />
          <span class="loc-tag">{{ loc.tag }}</span>
        </div>
        <div class="loc-body">
          <div class="loc-name">{{ loc.name }}</div>
          <div class="loc-subtitle">{{ loc.subtitle }}</div>
          <div class="loc-address" v-if="loc.address">
            <van-icon name="location-o" size="13" color="#0071e3" />
            <span>{{ loc.address }}</span>
          </div>
          <div class="loc-action">
            <span class="loc-enter">{{ loc.enterText }}</span>
            <van-icon name="arrow" size="14" color="#0071e3" />
          </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import { smartBack } from '@/utils/miniprogram'

const router = useRouter()
const onBack = () => smartBack(router)

// 默认点位配置（后台未配置时的兜底）
const defaultLocations = [
  {
    key: 'niushan',
    name: '牛山低空科创园',
    subtitle: '专业无人机研学课程，支持在线报名',
    address: '',
    tag: '课程报名',
    enterText: '查看课程',
    cover: '',
    action: 'packages',
    enabled: true
  },
  {
    key: 'zhennan',
    name: '浙南低空飞行服务中心',
    subtitle: '集展示、宣传、体验于一体的低空经济科普平台',
    address: '温州市鹿城区七都街道温州金融科技文化中心A4号楼',
    tag: '需求收集',
    enterText: '登记需求',
    cover: '',
    action: 'demand',
    enabled: true
  }
]

const locations = ref(defaultLocations)

const normalizeUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url
  return `/${url}`
}

const coverStyle = (loc) => {
  if (loc.cover) {
    return {
      backgroundImage: `url(${normalizeUrl(loc.cover)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return { background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)' }
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/services/config')
    const config = res?.data?.data?.['9'] || {}
    const remoteLocations = Array.isArray(config.locations) ? config.locations : []
    if (remoteLocations.length > 0) {
      // 后台配置优先，仅展示启用的点位，并与默认字段做兜底合并
      const merged = remoteLocations
        .filter(l => l && l.enabled !== false)
        .map(l => {
          const fallback = defaultLocations.find(d => d.key === l.key) || {}
          return { ...fallback, ...l }
        })
      if (merged.length > 0) locations.value = merged
    }
  } catch (e) {
    console.warn('加载研学点位配置失败:', e)
  }
})

const goToLocation = (loc) => {
  if (loc.action === 'demand') {
    // 浙南等需求收集点位，先进入点位介绍页，再登记需求
    router.push(`/study/intro?location=${loc.key}`)
  } else {
    // 牛山等课程报名点位，进入课程列表
    router.push(`/study/packages?location=${loc.key}`)
  }
}
</script>

<style scoped>
.study-select-page {
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

.location-list {
  padding: 0 16px;
  margin-top: -20px;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s;
  cursor: pointer;
}

.location-card:active {
  transform: scale(0.98);
}

.loc-cover {
  position: relative;
  height: 120px;
}

.loc-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 100%);
}

.loc-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  font-size: 12px;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
}

.loc-body {
  padding: 16px 20px 20px;
}

.loc-name {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
}

.loc-subtitle {
  font-size: 13px;
  color: #86868b;
  line-height: 1.6;
  margin-bottom: 10px;
}

.loc-address {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #0071e3;
  margin-bottom: 14px;
}

.loc-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.loc-enter {
  font-size: 14px;
  font-weight: 600;
  color: #0071e3;
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
