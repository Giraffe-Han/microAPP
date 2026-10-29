<template>
  <div class="study-detail-page" v-if="pkg" :class="{ 'flight-center-detail': isFlightCenter }">
    <van-nav-bar
      :title="pkg.name"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
      :border="false"
    />
    <HomeFloatButton />

    <div class="pkg-header" :style="headerStyle">
      <div class="header-mask" />
      <div class="header-inner">
        <p v-if="isFlightCenter" class="venue-eyebrow"><van-icon name="location-o" /> {{ locationName }}</p>
        <span class="pkg-tag-top">{{ pkg.tag }}</span>
        <h1 class="pkg-title">{{ pkg.name }}</h1>
        <div class="pkg-price-row">
          <span class="currency">¥</span>
          <span class="price-num">{{ pkg.price }}</span>
          <span class="price-unit">/人</span>
          <span v-if="isFlightCenter" class="reservation-tag">预约报名</span>
        </div>
        <p v-if="isFlightCenter" class="hero-caption">从好奇出发，在体验中探索低空科技</p>
      </div>
    </div>

    <div class="detail-body" v-if="contentReady">
      <div class="section-card">
        <h2 class="section-title">研学内容</h2>
        <p class="section-text">{{ pkg.intro }}</p>
        <div v-if="isFlightCenter && packageFeature" class="detail-feature">
          <span class="detail-feature-icon"><van-icon :name="packageFeature.icon" size="22" /></span>
          <div><strong>{{ packageFeature.title }}</strong><p>{{ packageFeature.desc }}</p></div>
        </div>
      </div>

      <!-- 研学目标 -->
      <div class="section-card" v-if="pkg.studyGoals && pkg.studyGoals.length > 0">
        <h2 class="section-title">研学目标</h2>
        <div class="goals-list">
          <div v-for="(goal, i) in pkg.studyGoals" :key="i" class="goal-item">
            <div class="goal-label">{{ goal.label }}</div>
            <div class="goal-content">{{ goal.content }}</div>
          </div>
        </div>
      </div>

      <!-- 服务项目（课程包独立） -->
      <div class="section-card" v-if="pkg.projects && pkg.projects.length > 0">
        <h2 class="section-title">{{ isFlightCenter ? '套餐体验' : '服务项目' }}</h2>
        <p v-if="isFlightCenter" class="section-lead">{{ pkg.projects.length }}项体验，走近低空科技的不同侧面</p>
        <div class="project-grid">
          <div v-for="(p, i) in pkg.projects" :key="i" class="project-item">
            <template v-if="isFlightCenter">
              <span class="experience-icon">
                <img v-if="p.icon && p.icon !== 'star-o' && (p.icon.startsWith('http') || p.icon.startsWith('/'))" :src="p.icon" alt="" />
                <van-icon v-else :name="p.icon && p.icon !== 'star-o' ? p.icon : getStudyActivity(p.name).icon" size="24" />
              </span>
              <div class="experience-content">
                <span class="experience-label">{{ getStudyActivity(p.name).label }}</span>
                <h3>{{ p.name }}</h3>
                <p v-if="p.desc || getStudyActivity(p.name).desc">{{ p.desc || getStudyActivity(p.name).desc }}</p>
              </div>
              <span class="experience-number">{{ String(i + 1).padStart(2, '0') }}</span>
            </template>
            <template v-else>
              <template v-if="p.icon && p.icon.startsWith('http')">
                <img :src="p.icon" style="width:24px;height:24px;object-fit:contain;" />
              </template>
              <template v-else>
                <van-icon :name="p.icon || 'star-o'" size="24" color="#424245" />
              </template>
              <span>{{ p.name }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 往期活动展示（课程包独立） -->
      <div class="section-card" v-if="pkg.showcase && pkg.showcase.length > 0">
        <h2 class="section-title">精彩回顾</h2>
        <div class="showcase-grid">
          <div
            v-for="(item, idx) in pkg.showcase"
            :key="idx"
            class="showcase-item"
            @click="previewShowcase(item)"
          >
            <van-image
              :src="item.image ? getCompressedImage(item.image, 600) : ''"
              fit="cover"
              width="100%"
              height="140"
              radius="12"
              lazy-load
            >
              <template #loading>
                <div class="image-loading">
                  <van-loading type="spinner" size="20" />
                </div>
              </template>
              <template #error>
                <div class="image-error">
                  <van-icon name="photo-fail" size="24" color="#c8c8c8" />
                  <span>加载失败</span>
                </div>
              </template>
            </van-image>
            <div class="showcase-info">
              <div class="showcase-title">{{ item.title }}</div>
              <div class="showcase-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isFlightCenter && (venueGallery.length || locationInfo.address)" class="section-card venue-section">
        <div class="venue-heading">
          <h2 class="section-title">研学场馆</h2>
          <button type="button" class="venue-link" @click="goToVenue">场馆介绍 <van-icon name="arrow" /></button>
        </div>
        <p class="section-lead">{{ locationName }}</p>
        <van-swipe v-if="venueGallery.length" class="venue-swipe" :autoplay="4000" indicator-color="#ffffff">
          <van-swipe-item v-for="(image, index) in venueGallery" :key="`${image.image}-${index}`">
            <button type="button" class="venue-photo" :aria-label="`查看${image.title || '场馆实景'}大图`" @click="previewVenue(index)">
              <van-image :src="getCompressedImage(image.image, 800)" :alt="image.title || '场馆实景'" fit="cover" width="100%" height="200">
                <template #error><div class="venue-image-error"><van-icon name="photo-fail" size="24" /><span>场馆图片暂不可用</span></div></template>
              </van-image>
              <span class="venue-photo-caption">{{ image.title || '场馆实景' }}<small>{{ index + 1 }} / {{ venueGallery.length }}</small></span>
            </button>
          </van-swipe-item>
        </van-swipe>
        <p v-if="locationInfo.address" class="venue-address"><van-icon name="location-o" /><span>{{ locationInfo.address }}</span></p>
      </div>

      <div class="section-card" v-if="pkg.schedule && pkg.schedule.length > 0">
        <h2 class="section-title">课程安排</h2>
        <div class="session-toggle">
          <div
            class="toggle-btn"
            :class="{ active: activeSession === 'am' }"
            @click="activeSession = 'am'"
          >上午场</div>
          <div
            class="toggle-btn"
            :class="{ active: activeSession === 'pm' }"
            @click="activeSession = 'pm'"
          >下午场</div>
        </div>
        <div class="schedule-list">
          <div v-for="(item, index) in pkg.schedule" :key="index" class="schedule-item">
            <div class="schedule-time">{{ activeSession === 'am' ? item.amTime : item.pmTime }}</div>
            <div class="schedule-marker">
              <div class="schedule-dot" />
            </div>
            <div class="schedule-content">
              <div class="schedule-name">{{ item.name }}</div>
              <div class="schedule-location" v-if="item.location">
                <van-icon name="location-o" size="12" color="#0071e3" />
                <span>{{ item.location }}</span>
              </div>
              <div class="schedule-desc">{{ item.desc }}</div>
              <div class="schedule-purpose" v-if="item.purpose">
                <span class="purpose-label">课程目的</span>
                <span>{{ item.purpose }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card" v-if="pkg.audience && pkg.audience.length > 0">
        <h2 class="section-title">适合人群</h2>
        <div class="audience-list">
          <div v-for="(a, i) in pkg.audience" :key="i" class="audience-item">
            <van-icon name="friends-o" size="16" color="#0071e3" />
            <span>{{ a }}</span>
          </div>
        </div>
      </div>

      <div class="section-card" v-if="pkg.feeInfo && pkg.feeInfo.length > 0">
        <h2 class="section-title">费用说明</h2>
        <div class="fee-info">
          <div v-for="(f, i) in pkg.feeInfo" :key="i" class="fee-item">
            <span class="fee-label">{{ f.label }}</span>
            <span class="fee-value">{{ f.value }}</span>
          </div>
        </div>
      </div>

      <!-- 服务优势（课程包独立） -->
      <div class="section-card" v-if="pkg.advantages && pkg.advantages.length > 0">
        <h2 class="section-title">服务优势</h2>
        <div class="advantage-list">
          <div v-for="(adv, i) in pkg.advantages" :key="i" class="advantage-item">
            <van-icon name="success" size="16" color="#0071e3" />
            <span>{{ adv }}</span>
          </div>
        </div>
      </div>

      <!-- 安全宣讲 -->
      <div class="section-card" v-if="pkg.safetyBriefing && pkg.safetyBriefing.length > 0">
        <h2 class="section-title">安全宣讲</h2>
        <div class="safety-list">
          <div v-for="(item, i) in pkg.safetyBriefing" :key="i" class="safety-item">
            <van-icon name="shield-o" size="16" color="#0071e3" />
            <span>{{ item }}</span>
          </div>
        </div>
      </div>

      <!-- 研学总结 -->
      <div class="section-card" v-if="pkg.studySummary">
        <h2 class="section-title">研学总结</h2>
        <p class="section-text">{{ pkg.studySummary }}</p>
      </div>

      <div v-if="isFlightCenter" class="section-card booking-section">
        <h2 class="section-title">如何预约报名</h2>
        <div class="booking-steps">
          <div v-for="(step, index) in bookingSteps" :key="step.title" class="booking-step">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <div><h3>{{ step.title }}</h3><p>{{ step.desc }}</p></div>
          </div>
        </div>
        <div class="booking-reminder"><van-icon name="info-o" /><span>报名后将与您联系确认，具体活动安排以预约确认为准。</span></div>
      </div>

      <div class="section-card" v-if="pkg.tips && pkg.tips.length > 0">
        <h2 class="section-title">温馨提示</h2>
        <div class="tips-list">
          <div v-for="(tip, i) in pkg.tips" :key="i" class="tip-item">
            <span class="tip-index">{{ i + 1 }}</span>
            <span class="tip-text">{{ tip }}</span>
          </div>
        </div>
      </div>

      <div class="section-card contact-section">
        <h2 class="section-title">联系客服</h2>
        <div class="contact-info">
          <p class="contact-row">如有疑问，请咨询客服热线：</p>
          <a class="phone-link" href="tel:0577-55550500">0577-55550500</a>
          <p class="work-time">工作时间：工作日 9:00-17:30</p>
        </div>
      </div>
    </div>

    <div v-else class="loading-wrap">
      <van-loading vertical>加载中...</van-loading>
    </div>

    <div class="action-bar">
      <div v-if="isFlightCenter" class="action-price"><span>套餐费用</span><strong>¥{{ pkg.price }}<small>/人</small></strong></div>
      <van-button type="primary" block round color="#0071e3" @click="onApply">
        立即报名
      </van-button>
    </div>
  </div>
  <div v-else class="study-detail-page">
    <van-nav-bar title="课程详情" left-arrow @click-left="onBack" fixed placeholder />
    <div v-if="!contentReady" class="loading-wrap"><van-loading vertical>加载中...</van-loading></div>
    <van-empty v-else description="该研学课程不存在或已下架" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import axios from 'axios'
import { smartBack } from '@/utils/miniprogram'
import { getStudyPackageLocation, getStudyLocationName, getStudyActivity, getStudyPackageFeature, getStudyGallery, getStudyImageUrl } from '@/utils/study'

const route = useRoute()
const router = useRouter()
const onBack = () => smartBack(router)
const contentReady = ref(false)
const pkg = ref(null)
const activeSession = ref('am')
const locationInfo = ref({})
const isFlightCenter = computed(() => pkg.value?.location === 'zhennan')
const locationName = computed(() => locationInfo.value.name || getStudyLocationName(pkg.value?.location))
const venueGallery = computed(() => getStudyGallery(locationInfo.value))
const packageFeature = computed(() => getStudyPackageFeature((pkg.value?.projects || []).map(item => item.name)))
const bookingSteps = [
  { title: '选择研学套餐', desc: '浏览套餐内容，选择喜欢的体验方式。' },
  { title: '填写报名信息', desc: '填写联系人、参与人数、期望日期与场次。' },
  { title: '联系确认安排', desc: '提交报名后，等待工作人员与您联系确认。' }
]
const goToVenue = () => router.push({ path: '/study/intro', query: { location: pkg.value.location } })
const previewVenue = (index) => showImagePreview({
  images: venueGallery.value.map(item => getCompressedImage(item.image, 1200)),
  startPosition: index,
  closeable: true
})

const normalizeUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url
  if (url.includes('.') || url.includes('/')) return `/${url}`
  return url
}

// 获取压缩后的图片URL
const getCompressedImage = (url, width = 800) => {
  if (!url) return ''
  const normalizedUrl = normalizeUrl(url)
  // 对于空图片返回空字符串
  if (!normalizedUrl) return ''
  // 使用后端压缩接口
  return `/api/image?url=${encodeURIComponent(normalizedUrl)}&width=${width}&quality=75`
}

const headerStyle = computed(() => {
  let bg = pkg.value?.headerBg
  if (isFlightCenter.value && (!bg || bg.startsWith('linear-gradient'))) {
    const scene = getStudyImageUrl(locationInfo.value.cover || venueGallery.value[0]?.image)
    if (scene) bg = scene
  }
  if (!bg) {
    return { background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)' }
  }
  // 如果是图片URL（http或相对路径），使用压缩接口
  if (bg.startsWith('http') || bg.startsWith('/') || bg.startsWith('uploads/')) {
    const imageUrl = bg.startsWith('uploads/') ? `/${bg}` : bg
    return {
      backgroundImage: `url(${getCompressedImage(imageUrl, 800)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }
  // 否则使用渐变色
  return { background: bg }
})

const previewShowcase = (item) => {
  if (!item?.image) return
  showImagePreview([getCompressedImage(item.image, 1200)])
}

watch(() => route.params.id, async (id, _, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  pkg.value = null
  locationInfo.value = {}
  contentReady.value = false
  try {
    const configRes = await axios.get('/api/services/config')
    if (cancelled) return
    const allConfigs = configRes?.data?.data || {}
    const config = allConfigs['9'] || {}

    // 直接使用后台课程包数据
    if (Object.prototype.hasOwnProperty.call(config.packages || {}, id) && config.packages[id] && config.packages[id].enabled !== false) {
      const remotePkg = config.packages[id]
      const location = getStudyPackageLocation(remotePkg)
      locationInfo.value = (Array.isArray(config.locations) ? config.locations : []).find(loc => loc?.key === location) || {}
      pkg.value = {
        id,
        location,
        name: remotePkg.name || '',
        tag: remotePkg.tag || '',
        price: remotePkg.price || 0,
        headerBg: remotePkg.headerBg || '',
        intro: remotePkg.intro || '',
        studyGoals: remotePkg.studyGoals || [],
        schedule: remotePkg.schedule || [],
        audience: remotePkg.audience || [],
        feeInfo: remotePkg.feeInfo || [],
        tips: remotePkg.tips || [],
        projects: remotePkg.projects || [],
        advantages: remotePkg.advantages || [],
        showcase: remotePkg.showcase || [],
        safetyBriefing: remotePkg.safetyBriefing || [],
        studySummary: remotePkg.studySummary || '',
      }
    }
  } catch (e) {
    console.warn('加载配置失败:', e)
  }

  if (!cancelled) contentReady.value = true
}, { immediate: true })

const onApply = () => {
  if (!pkg.value) return
  router.push({
    path: '/service-apply/9',
    query: { package: pkg.value.id, location: pkg.value.location }
  })
}
</script>

<style scoped>
.study-detail-page {
  min-height: 100vh;
  background: #fbfbfd;
  padding-bottom: 100px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  max-width: 520px;
  margin: 0 auto;
}

:deep(.van-nav-bar) {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: none;
}

:deep(.van-nav-bar__title) {
  font-weight: 600;
  color: #1d1d1f;
}

.pkg-header {
  position: relative;
  padding: 40px 20px 54px;
  overflow: hidden;
}

.header-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 100%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
}

.header-inner {
  position: relative;
  z-index: 1;
  animation: fadeUp 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.pkg-tag-top {
  display: inline-block;
  font-size: 11px;
  color: rgba(255,255,255,0.9);
  background: rgba(255,255,255,0.2);
  padding: 3px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.pkg-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: -0.5px;
}

.pkg-price-row {
  display: flex;
  align-items: baseline;
}

.pkg-price-row .currency {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.pkg-price-row .price-num {
  font-size: 40px;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  margin: 0 2px;
}

.pkg-price-row .price-unit {
  font-size: 14px;
  color: rgba(255,255,255,0.8);
}

.detail-body {
  animation: fadeUp 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.section-card {
  background: #fff;
  margin: 12px 16px;
  padding: 18px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.section-card:first-child {
  margin-top: -24px;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: #1d1d1f;
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 4px solid #0071e3;
}

.section-text {
  font-size: 15px;
  color: #424245;
  line-height: 1.7;
  margin: 0;
}

/* 课程安排时间线 */
/* 精彩回顾 / 往期活动展示 */
.showcase-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.showcase-item {
  background: #f5f5f7;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.showcase-item:active {
  transform: scale(0.98);
}

.showcase-info {
  padding: 14px 16px 16px;
}

/* 图片加载状态 */
.image-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  background: #f5f5f7;
}

.image-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 140px;
  background: #f5f5f7;
  gap: 8px;
}

.image-error span {
  font-size: 12px;
  color: #c8c8c8;
}

.showcase-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.showcase-desc {
  font-size: 13px;
  color: #86868b;
  line-height: 1.5;
}

/* 上午/下午切换 */
.session-toggle {
  display: flex;
  background: #f5f5f7;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 16px;
}

.toggle-btn {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
}

.toggle-btn.active {
  background: #fff;
  color: #0071e3;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.schedule-list {
  padding-left: 4px;
}

.schedule-item {
  display: grid;
  grid-template-columns: 48px 20px 1fr;
  gap: 12px;
  padding-bottom: 20px;
  position: relative;
}

.schedule-item:last-child {
  padding-bottom: 0;
}

.schedule-time {
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
  padding-top: 2px;
  text-align: right;
}

.schedule-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 5px;
}

.schedule-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
  position: relative;
  z-index: 1;
}

.schedule-item:not(:last-child) .schedule-marker::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 18px;
  bottom: -20px;
  transform: translateX(-0.5px);
  width: 1px;
  border-left: 1px dashed #d2d2d7;
}

.schedule-content {
  flex: 1;
}

.schedule-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.schedule-desc {
  font-size: 13px;
  color: #86868b;
  line-height: 1.5;
}

.schedule-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #0071e3;
  margin-bottom: 4px;
}

.schedule-purpose {
  font-size: 12px;
  color: #636366;
  line-height: 1.5;
  margin-top: 6px;
  padding: 8px 10px;
  background: #f5f5f7;
  border-radius: 8px;
}

.purpose-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: #0071e3;
  background: rgba(0, 113, 227, 0.08);
  padding: 1px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

/* 研学目标 */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-item {
  padding: 14px;
  background: #f5f5f7;
  border-radius: 12px;
}

.goal-label {
  font-size: 13px;
  font-weight: 700;
  color: #0071e3;
  margin-bottom: 6px;
}

.goal-content {
  font-size: 14px;
  color: #424245;
  line-height: 1.7;
}

/* 安全宣讲 */
.safety-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.safety-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #424245;
  line-height: 1.6;
}

.safety-item .van-icon {
  flex-shrink: 0;
  margin-top: 3px;
}

/* 服务项目 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.project-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 12px;
  background: #f5f5f7;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  overflow: visible;
}

.project-item .van-icon {
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
}

/* 服务优势 */
.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #424245;
}

/* 适合人群 */
.audience-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audience-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #424245;
}

/* 费用说明 */
.fee-info {
  display: flex;
  flex-direction: column;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebedf0;
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-label {
  font-size: 14px;
  color: #86868b;
}

.fee-value {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

/* 温馨提示 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.tip-index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #f0f2ff;
  color: #0071e3;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-text {
  font-size: 13px;
  color: #424245;
  line-height: 1.6;
  flex: 1;
}

/* 联系客服 */
.contact-section {
  text-align: center;
}

.contact-row {
  font-size: 14px;
  color: #86868b;
  margin: 0 0 8px;
}

.phone-link {
  font-size: 24px;
  font-weight: 700;
  color: #0071e3;
  text-decoration: none;
  display: block;
  margin: 12px 0;
}

.work-time {
  font-size: 12px;
  color: #86868b;
  margin: 8px 0 0;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: min(520px, calc(100% - 40px));
  z-index: 100;
}

.action-bar :deep(.van-button) {
  height: 54px;
  font-size: 17px;
  font-weight: 600;
  box-shadow: 0 10px 20px rgba(0, 113, 227, 0.2);
}

.loading-wrap {
  padding: 100px 0;
  text-align: center;
}

.flight-center-detail { background: #f3f7fb; padding-bottom: calc(110px + env(safe-area-inset-bottom)); }
.flight-center-detail .pkg-header { padding: 26px 24px 52px; }
.flight-center-detail .header-mask { background: linear-gradient(100deg, rgba(6, 28, 58, .88), rgba(6, 28, 58, .5)); }
.venue-eyebrow { display: flex; align-items: center; gap: 5px; font-size: 11px; line-height: 1.6; color: #cce9ff; margin: 0 0 18px; }
.flight-center-detail .pkg-tag-top { border: 1px solid rgba(255, 255, 255, .25); padding: 4px 10px; }
.flight-center-detail .pkg-title { line-height: 1.4; font-size: 25px; margin-bottom: 18px; }
.flight-center-detail .pkg-price-row { gap: 2px; }
.reservation-tag { margin-left: 12px; padding: 4px 8px; background: rgba(255, 255, 255, .13); border-radius: 5px; color: #e0efff; font-size: 10px; }
.hero-caption { margin: 16px 0 0; color: #c9ddee; font-size: 12px; line-height: 1.6; }
.flight-center-detail .section-card { padding: 20px 18px; border: 1px solid #e7eef5; border-radius: 18px; box-shadow: 0 6px 22px rgba(27, 58, 94, .03); margin-bottom: 16px; }
.flight-center-detail .section-title { padding-left: 10px; border-left-width: 3px; font-size: 17px; color: #16334f; margin-bottom: 14px; }
.flight-center-detail .section-text { font-size: 13px; color: #65798e; line-height: 1.9; }
.detail-feature { display: flex; align-items: flex-start; gap: 12px; background: #edf6fc; padding: 14px; border-radius: 12px; margin-top: 16px; }
.detail-feature-icon { flex-shrink: 0; width: 38px; height: 38px; display: grid; place-items: center; background: #fff; color: #087f8c; border-radius: 11px; }
.detail-feature strong { display: block; color: #1b5d7e; font-size: 13px; line-height: 1.6; }
.detail-feature p { margin: 5px 0 0; color: #6d899d; font-size: 12px; line-height: 1.7; }
.section-lead { margin: -4px 0 16px; font-size: 12px; line-height: 1.6; color: #7a8c9f; }
.flight-center-detail .project-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
.flight-center-detail .project-item { position: relative; flex-direction: row; align-items: flex-start; gap: 12px; background: #f6f9fc; border: 1px solid #eaf0f7; border-radius: 14px; padding: 16px 14px; }
.experience-icon { flex-shrink: 0; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 12px; background: #e7f0fc; color: #1572b8; }
.experience-icon img { width: 24px; height: 24px; object-fit: contain; }
.flight-center-detail .project-item:nth-child(even) .experience-icon { color: #088692; background: #e5f5f3; }
.experience-content { min-width: 0; flex: 1; padding-top: 2px; }
.experience-label { display: block; color: #7d90a5; font-size: 10px; letter-spacing: 1px; margin-bottom: 7px; }
.experience-content h3 { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.65; color: #24435f; overflow-wrap: anywhere; }
.experience-content p { margin: 7px 0 0; color: #7a8c9e; font-size: 12px; line-height: 1.8; }
.experience-number { position: absolute; right: 14px; top: 16px; color: #c2d2e3; font-size: 16px; font-weight: 700; }
.venue-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.venue-link { border: 0; background: transparent; font-size: 11px; color: #2476b4; padding: 2px 0; cursor: pointer; }
.venue-swipe { border-radius: 13px; overflow: hidden; background: #eaf0f5; }
.venue-photo { display: block; position: relative; width: 100%; border: 0; padding: 0; background: transparent; cursor: pointer; }
.venue-photo-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 26px 14px 20px; text-align: left; background: linear-gradient(transparent, rgba(0, 22, 44, .75)); color: #fff; font-size: 12px; }
.venue-photo-caption small { float: right; font-size: 10px; }
.venue-address { display: flex; align-items: flex-start; gap: 6px; margin: 14px 0 0; font-size: 12px; color: #68829b; line-height: 1.8; }
.venue-address .van-icon { flex-shrink: 0; margin-top: 4px; }
.venue-image-error { height: 200px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 8px; color: #8a9cac; font-size: 12px; }
.booking-steps { display: flex; flex-direction: column; gap: 18px; }
.booking-step { display: flex; gap: 12px; align-items: flex-start; }
.booking-step > span { flex-shrink: 0; width: 30px; height: 30px; display: grid; place-items: center; background: #eaf3fc; border-radius: 9px; color: #2277b4; font-size: 11px; font-weight: 700; }
.booking-step h3 { margin: 0; color: #34516d; font-size: 13px; line-height: 1.6; }
.booking-step p { margin: 4px 0 0; color: #8494a5; font-size: 12px; line-height: 1.7; }
.booking-reminder { display: flex; align-items: flex-start; gap: 7px; margin-top: 20px; padding: 12px; border-radius: 9px; color: #788fa5; background: #f3f7fb; font-size: 11px; line-height: 1.8; }
.booking-reminder .van-icon { margin-top: 3px; flex-shrink: 0; }
.flight-center-detail .action-bar { box-sizing: border-box; display: flex; align-items: center; gap: 16px; bottom: 0; width: 100%; max-width: 520px; padding: 12px 20px calc(12px + env(safe-area-inset-bottom)); background: rgba(255, 255, 255, .97); border-top: 1px solid #e7edf4; box-shadow: 0 -4px 18px rgba(25, 54, 84, .05); }
.action-price { flex-shrink: 0; min-width: 100px; }
.action-price > span { display: block; font-size: 10px; color: #8495a7; margin-bottom: 4px; }
.action-price strong { display: block; color: #116fb0; font-size: 24px; line-height: 1.2; }
.action-price small { font-size: 11px; font-weight: 400; margin-left: 4px; color: #8a99a9; }
.flight-center-detail .action-bar .van-button { height: 46px; font-size: 14px; box-shadow: none; }
@media (max-width: 360px) {
  .flight-center-detail .pkg-header { padding-left: 20px; padding-right: 20px; }
  .flight-center-detail .pkg-title { font-size: 22px; }
  .flight-center-detail .section-card { padding-left: 14px; padding-right: 14px; }
  .flight-center-detail .project-item { padding: 14px 10px; gap: 10px; }
  .experience-icon { width: 36px; height: 36px; }
  .experience-content h3 { font-size: 13px; }
}
</style>
