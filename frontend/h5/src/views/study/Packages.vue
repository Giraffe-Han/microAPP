<template>
  <div class="study-page" :class="{ 'flight-center': isFlightCenter }">
    <van-nav-bar
      :title="locationName"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />
    <HomeFloatButton />

    <div class="page-header">
      <div class="header-bg" :style="heroStyle" />
      <div class="header-content">
        <span v-if="isFlightCenter" class="hero-eyebrow">低空科普 · 探索与实践</span>
        <van-icon v-else name="/icons/study.svg" size="48" color="#ffffff" />
        <h1 class="header-title">{{ locationName }}</h1>
        <p class="header-subtitle">{{ isFlightCenter ? '让好奇心起飞，让探索看得见' : '选择适合的研学课程，开启飞行探索之旅' }}</p>
        <div v-if="isFlightCenter" class="hero-tags">
          <span><van-icon name="eye-o" /> 展厅与VR</span>
          <span><van-icon name="notes-o" /> 低空课堂</span>
          <span><van-icon name="apps-o" /> 动手实践</span>
        </div>
      </div>
    </div>

    <div v-if="isFlightCenter" class="selection-heading">
      <div><span class="section-kicker">探索低空科技</span><h2>选择你的研学套餐</h2></div>
      <span v-if="!loading" class="selection-count">{{ packages.length }}款套餐</span>
      <p>从沉浸参观到动手体验，找到喜欢的探索方式。</p>
    </div>
    <div v-if="loading && isFlightCenter" class="package-loading"><van-loading vertical>正在加载研学套餐</van-loading></div>
    <div class="package-list">
      <div
        v-for="(pkg, index) in packages"
        :key="pkg.id"
        class="package-card"
        :class="{ recommended: pkg.recommended, 'takeaway-card': pkg.feature?.icon === 'gift-o' }"
        role="link"
        tabindex="0"
        :aria-label="`${pkg.name}，${pkg.price}元每人，查看详情`"
        @keydown.enter.prevent="goToDetail(pkg.id)"
        @click="goToDetail(pkg.id)"
      >
        <div v-if="pkg.recommended" class="recommend-badge">推荐</div>
        <div v-if="isFlightCenter" class="card-eyebrow">
          <span class="card-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span>低空科普研学</span>
          <span v-if="pkg.highlights.length" class="card-item-count">{{ pkg.highlights.length }}项体验</span>
        </div>
        <div class="card-top">
          <div class="pkg-name">{{ pkg.name }}</div>
          <div class="pkg-tag">{{ pkg.tag }}</div>
        </div>
        <div class="card-price">
          <span class="currency">¥</span>
          <span class="amount">{{ pkg.price }}</span>
          <span class="unit">/人</span>
        </div>
        <div v-if="!isFlightCenter" class="card-desc">{{ pkg.desc }}</div>
        <div v-if="isFlightCenter && pkg.feature" class="package-feature">
          <van-icon :name="pkg.feature.icon" size="18" />
          <span>{{ pkg.feature.title }}</span>
        </div>
        <div class="card-highlights">
          <div v-for="(h, i) in pkg.highlights" :key="i" class="highlight-item">
            <template v-if="isFlightCenter">
              <span class="activity-icon"><van-icon :name="getStudyActivity(h).icon" size="20" /></span>
              <div><span class="activity-label">{{ getStudyActivity(h).label }}</span><span class="activity-name">{{ h }}</span></div>
            </template>
            <template v-else>
              <van-icon name="success" size="14" color="#06b6d4" />
              <span>{{ h }}</span>
            </template>
          </div>
        </div>
        <div class="card-action">
          <van-button
            :type="isFlightCenter || pkg.recommended ? 'primary' : 'default'"
            size="small"
            round
            :color="isFlightCenter ? (pkg.feature?.icon === 'gift-o' ? '#087f8c' : '#0071e3') : (pkg.recommended ? '#0071e3' : undefined)"
            :plain="!isFlightCenter && !pkg.recommended"
          >
            {{ isFlightCenter ? '查看套餐详情' : '查看详情' }}
            <van-icon v-if="isFlightCenter" name="arrow" />
          </van-button>
        </div>
      </div>
    </div>

    <div v-if="!loading && packages.length === 0" class="empty-tip">
      暂无可报名的研学课程
    </div>

    <div v-if="isFlightCenter && !loading && packages.length" class="booking-note">
      <span class="booking-icon"><van-icon name="calendar-o" size="24" /></span>
      <div><h3>预约你的低空探索之旅</h3><p>选择套餐 · 填写报名 · 联系确认</p><span>具体活动安排以预约确认为准</span></div>
    </div>
    <div class="bottom-tip">
      <span>如有疑问请联系客服：</span>
      <a class="phone-link" href="tel:0577-55550500">0577-55550500</a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import { smartBack } from '@/utils/miniprogram'
import { getStudyPackageLocation, getStudyLocationName, getStudyActivity, getStudyPackageFeature, getStudyGallery, getStudyImageUrl } from '@/utils/study'

const route = useRoute()
const router = useRouter()
const onBack = () => smartBack(router)
const packages = ref([])
const loading = ref(true)

const locationKey = computed(() => typeof route.query.location === 'string' ? route.query.location : 'niushan')
const configuredLocations = ref([])
const locationInfo = computed(() => configuredLocations.value.find(loc => loc.key === locationKey.value))
const locationName = computed(() => locationInfo.value?.name || getStudyLocationName(locationKey.value))
const isFlightCenter = computed(() => locationKey.value === 'zhennan')
const heroStyle = computed(() => {
  if (!isFlightCenter.value) return {}
  const image = getStudyImageUrl(locationInfo.value?.cover || getStudyGallery(locationInfo.value)[0]?.image)
  return image ? { backgroundImage: `linear-gradient(100deg, rgba(8, 30, 63, .88), rgba(8, 30, 63, .45)), url(${image})` } : {}
})

watch(locationKey, async (selectedLocation, _, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  loading.value = true
  packages.value = []
  try {
    const res = await axios.get('/api/services/config')
    if (cancelled) return
    const config = res?.data?.data?.['9'] || {}
    configuredLocations.value = Array.isArray(config.locations) ? config.locations.filter(Boolean) : []
    const pkgs = config.packages || {}
    const ids = Object.keys(pkgs)
      .filter(id => pkgs[id] && pkgs[id].enabled !== false && getStudyPackageLocation(pkgs[id]) === selectedLocation)
      .sort((a, b) => {
        // 推荐课程排在最前面
        if (pkgs[a].recommended && !pkgs[b].recommended) return -1
        if (!pkgs[a].recommended && pkgs[b].recommended) return 1
        // 飞服中心按套餐价格递增，牛山保留原有排序。
        return selectedLocation === 'zhennan'
          ? (pkgs[a].price || 0) - (pkgs[b].price || 0)
          : (pkgs[b].price || 0) - (pkgs[a].price || 0)
      })
    packages.value = ids.map(id => ({
      id,
      name: pkgs[id].name || '',
      tag: pkgs[id].tag || '',
      price: pkgs[id].price || 0,
      recommended: pkgs[id].recommended || false,
      desc: pkgs[id].desc || pkgs[id].intro || '',
      highlights: Array.isArray(pkgs[id].cardHighlights) ? pkgs[id].cardHighlights : [],
      feature: getStudyPackageFeature(Array.isArray(pkgs[id].cardHighlights) ? pkgs[id].cardHighlights : [])
    }))
  } catch (e) {
    console.warn('加载研学配置失败:', e)
  } finally {
    if (!cancelled) loading.value = false
  }
}, { immediate: true })

const goToDetail = (id) => {
  router.push({ path: `/study/${id}`, query: { location: locationKey.value } })
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

.empty-tip {
  text-align: center;
  padding: 48px 16px 8px;
  font-size: 14px;
  color: #86868b;
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

.flight-center { background: #f3f7fb; padding-bottom: 24px; }
.flight-center .page-header { height: auto; min-height: 238px; }
.flight-center .header-bg { background-size: cover; background-position: center; background-color: #0c4680; }
.flight-center .header-bg::after { background: radial-gradient(ellipse at 90% 15%, rgba(73, 221, 235, .2), transparent 65%); }
.flight-center .header-content { box-sizing: border-box; min-height: 238px; height: auto; align-items: flex-start; padding: 32px 24px; }
.hero-eyebrow { font-size: 11px; letter-spacing: 2px; color: #c5ecff; }
.flight-center .header-title { font-size: 24px; line-height: 1.4; margin: 14px 0 8px; }
.flight-center .header-subtitle { line-height: 1.7; }
.hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.hero-tags span { display: inline-flex; align-items: center; gap: 5px; padding: 6px 9px; border: 1px solid rgba(255, 255, 255, .24); border-radius: 8px; background: rgba(255, 255, 255, .09); font-size: 11px; }
.selection-heading { display: flex; align-items: center; flex-wrap: wrap; justify-content: space-between; padding: 24px 20px 18px; }
.section-kicker { font-size: 10px; color: #078292; letter-spacing: 2px; }
.selection-heading h2 { margin: 6px 0 0; font-size: 20px; color: #16304d; }
.selection-heading p { flex-basis: 100%; margin: 10px 0 0; font-size: 12px; color: #6d7f92; line-height: 1.6; }
.selection-count { border-radius: 20px; padding: 6px 10px; background: #e6eef8; color: #51718e; font-size: 11px; }
.package-loading { padding: 28px; }
.flight-center .package-list { margin-top: 0; gap: 18px; }
.flight-center .package-card { --accent: #0071e3; --tint: #edf5ff; padding: 20px 18px 18px; border: 1px solid #e2ebf5; border-top: 4px solid var(--accent); border-radius: 18px; box-shadow: 0 8px 24px rgba(26, 64, 106, .05); }
.flight-center .package-card.takeaway-card { --accent: #087f8c; --tint: #edf8f6; }
.flight-center .package-card:focus-visible { outline: 3px solid #71c2ff; outline-offset: 3px; }
.card-eyebrow { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; font-size: 10px; color: #7b8ba0; letter-spacing: 1px; }
.card-number { font-size: 18px; font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; }
.card-item-count { margin-left: auto; letter-spacing: 0; }
.flight-center .card-top { align-items: flex-start; margin-bottom: 12px; }
.flight-center .pkg-name { min-width: 0; font-size: 19px; line-height: 1.45; color: #17314e; }
.flight-center .pkg-tag { flex-shrink: 0; white-space: nowrap; background: var(--tint); color: var(--accent); margin-top: 3px; }
.flight-center .card-price { gap: 1px; margin-bottom: 16px; }
.flight-center .currency, .flight-center .amount { color: var(--accent); }
.flight-center .amount { font-size: 38px; }
.flight-center .unit { margin-left: 3px; font-size: 12px; }
.package-feature { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 10px 12px; color: var(--accent); background: var(--tint); border-radius: 10px; font-size: 12px; font-weight: 600; line-height: 1.5; }
.package-feature .van-icon { flex-shrink: 0; }
.flight-center .card-highlights { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
.flight-center .highlight-item { flex-direction: column; align-items: flex-start; gap: 9px; padding: 12px 10px; background: #f7f9fc; border: 1px solid #eef2f7; border-radius: 12px; }
.activity-icon { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; color: var(--accent); background: var(--tint); }
.activity-label { display: block; font-size: 10px; color: #7d8b9d; margin-bottom: 5px; }
.activity-name { display: block; font-size: 12px; line-height: 1.65; color: #29435e; overflow-wrap: anywhere; }
.flight-center .card-action .van-button { width: 100%; height: 42px; font-size: 13px; font-weight: 600; }
.flight-center .card-action .van-icon { margin-left: 8px; }
.booking-note { display: flex; align-items: flex-start; gap: 12px; margin: 22px 16px 0; padding: 18px; background: #e8eff7; border-radius: 16px; }
.booking-icon { flex-shrink: 0; width: 42px; height: 42px; display: grid; place-items: center; color: #17689f; background: #fff; border-radius: 12px; }
.booking-note h3 { margin: 0; color: #244362; font-size: 14px; }
.booking-note p { font-size: 12px; color: #426380; margin: 9px 0 6px; line-height: 1.6; }
.booking-note div > span { color: #7b8fa3; font-size: 11px; }
.flight-center .bottom-tip { display: flex; justify-content: center; flex-wrap: wrap; gap: 4px; padding: 24px 16px; font-size: 12px; }
@media (max-width: 360px) {
  .flight-center .header-content { padding: 28px 20px; }
  .flight-center .header-title { font-size: 22px; }
  .flight-center .package-card { padding: 18px 14px 14px; }
  .flight-center .pkg-name { font-size: 17px; }
  .flight-center .pkg-tag { padding: 3px 7px; }
}
</style>
