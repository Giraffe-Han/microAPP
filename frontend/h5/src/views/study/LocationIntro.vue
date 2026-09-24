<template>
  <div class="intro-page">
    <van-nav-bar
      :title="loc.name || '研学点位'"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />
    <HomeFloatButton />

    <div class="cover" :style="coverStyle">
      <div class="cover-mask" />
      <div class="cover-content">
        <span class="cover-tag" v-if="loc.tag">{{ loc.tag }}</span>
        <h1 class="cover-title">{{ loc.name }}</h1>
        <p class="cover-subtitle" v-if="loc.subtitle">{{ loc.subtitle }}</p>
      </div>
    </div>

    <div class="intro-body">
      <div class="section-title">
        <span class="bar" />
        <span>点位介绍</span>
      </div>
      <div class="intro-text">
        <p v-for="(para, i) in introParagraphs" :key="i">{{ para }}</p>
      </div>

      <div v-if="galleryItems.length" class="gallery-section">
        <div class="section-title gallery-heading">
          <span class="bar" />
          <span>场馆实景</span>
          <span class="gallery-count">{{ galleryItems.length }}张</span>
        </div>
        <van-swipe class="gallery-swipe" :autoplay="4000" indicator-color="#ffffff">
          <van-swipe-item v-for="(image, index) in galleryItems" :key="`${image.image}-${index}`">
            <div class="gallery-slide" @click="previewGallery(index)">
              <img :src="image.image" :alt="image.title || '场馆实景'" />
              <div v-if="image.title || image.desc" class="gallery-caption">
                <div v-if="image.title" class="gallery-title">{{ image.title }}</div>
                <div v-if="image.desc" class="gallery-desc">{{ image.desc }}</div>
              </div>
            </div>
          </van-swipe-item>
        </van-swipe>
        <div class="gallery-hint">点击图片可查看大图</div>
      </div>

      <div class="info-row" v-if="loc.address">
        <van-icon name="location-o" size="16" color="#0071e3" />
        <span>{{ loc.address }}</span>
      </div>

      <div class="tip-card">
        <van-icon name="info-o" size="16" color="#0071e3" />
        <span>该中心研学参观采用预约方式，暂不对外收费。欢迎登记您的研学需求，我们将尽快与您联系安排。</span>
      </div>
    </div>

    <div class="bottom-bar">
      <van-button type="primary" block round @click="goToForm">
        {{ loc.enterText || '登记需求' }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { showImagePreview } from 'vant'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import { smartBack } from '@/utils/miniprogram'

const route = useRoute()
const router = useRouter()
const onBack = () => smartBack(router)

const locationKey = computed(() => {
  const q = typeof route.query.location === 'string' ? route.query.location : ''
  return q || 'zhennan'
})

// 默认兜底
const defaultLoc = {
  key: 'zhennan',
  name: '浙南低空飞行服务中心',
  subtitle: '集展示、宣传、体验于一体的低空经济科普平台',
  address: '浙江省温州市鹿城区七都街道温州金融科技文化中心A4号楼',
  tag: '需求收集',
  enterText: '登记需求',
  cover: '',
  action: 'demand',
  gallery: [],
  intro: '浙南低空飞行服务中心由温州低空经济发展有限公司下属浙南低空飞行服务管理（温州）有限公司建设，是温州市打造“全国一流、全省领先”的低空飞行服务平台，集展示、宣传、体验功能于一体，是呈现温州低空经济发展历程与成果的重要场所。\n中心设有低空经济科普体验区（低空经济启航介绍、国家战略历程、科普体验、VR体验等）与低空经济展示区（起降点布局、应用场景、产品展示、展望未来等），配备VR操作体验仓、VR体验设备及多台低空经济展示产品，带来沉浸式低空科普体验。\n面向政企、学校及普通访客，常态化开展低空知识宣讲、行业案例科普与研学沙龙，通过实景参观、图文展板、实物展品与VR互动，全方位普及无人机与通航飞行应用知识。\n开放时间：周一至周日 8:30-17:00（预约开放）；预约电话：0577-55558069。'
}

const loc = ref({ ...defaultLoc })

const normalizeUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url
  return `/${url}`
}

const coverStyle = computed(() => {
  if (loc.value.cover) {
    return {
      backgroundImage: `url(${normalizeUrl(loc.value.cover)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }
  }
  return { background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)' }
})

const introParagraphs = computed(() => {
  const text = loc.value.intro || defaultLoc.intro
  return String(text)
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
})

const galleryItems = computed(() => {
  const gallery = Array.isArray(loc.value.gallery) ? loc.value.gallery : []
  return gallery
    .map(item => typeof item === 'string' ? { image: item, title: '', desc: '' } : item)
    .filter(item => item?.image)
    .map(item => ({ ...item, image: normalizeUrl(item.image) }))
})

const previewGallery = (index) => {
  showImagePreview({
    images: galleryItems.value.map(item => item.image),
    startPosition: index,
    closeable: true
  })
}

onMounted(async () => {
  try {
    const res = await axios.get('/api/services/config')
    const config = res?.data?.data?.['9'] || {}
    const list = Array.isArray(config.locations) ? config.locations : []
    const found = list.find(l => l && l.key === locationKey.value)
    if (found) {
      loc.value = { ...defaultLoc, ...found }
    }
  } catch (e) {
    console.warn('加载研学点位配置失败:', e)
  }
})

const goToForm = () => {
  router.push(`/service-apply/9?location=${locationKey.value}`)
}
</script>

<style scoped>
.intro-page {
  min-height: 100vh;
  background: #f5f6fa;
  padding-bottom: 88px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  max-width: 520px;
  margin: 0 auto;
}

.cover {
  position: relative;
  height: 220px;
}

.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%);
}

.cover-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20px;
  color: #fff;
  z-index: 1;
}

.cover-tag {
  display: inline-block;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.22);
  padding: 4px 12px;
  border-radius: 20px;
  backdrop-filter: blur(6px);
  margin-bottom: 10px;
}

.cover-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 6px;
}

.cover-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.intro-body {
  margin: -20px 16px 0;
  position: relative;
  z-index: 2;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 14px;
}

.section-title .bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #06b6d4 0%, #2563eb 100%);
}

.intro-text p {
  font-size: 14px;
  color: #4b4b4f;
  line-height: 1.8;
  margin: 0 0 12px;
}

.intro-text p:last-child {
  margin-bottom: 0;
}

.gallery-section {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #f0f0f2;
}

.gallery-heading {
  margin-bottom: 12px;
}

.gallery-count {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: #86868b;
}

.gallery-swipe {
  overflow: hidden;
  border-radius: 12px;
  background: #f5f6fa;
}

.gallery-slide {
  position: relative;
  height: 190px;
  cursor: pointer;
}

.gallery-slide img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.gallery-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 26px 14px 14px;
  color: #fff;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.72));
}

.gallery-title {
  font-size: 14px;
  font-weight: 600;
}

.gallery-desc {
  margin-top: 3px;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.9;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gallery-hint {
  margin-top: 6px;
  text-align: center;
  font-size: 11px;
  color: #a1a1a6;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
  color: #4b4b4f;
  line-height: 1.6;
}

.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  background: #e8f3ff;
  border-radius: 12px;
  font-size: 13px;
  color: #0071e3;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 520px;
  margin: 0 auto;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.06);
  z-index: 10;
}
</style>
