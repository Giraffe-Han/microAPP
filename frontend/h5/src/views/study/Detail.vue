<template>
  <div class="study-detail-page" v-if="pkg">
    <van-nav-bar
      :title="pkg.name"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
      :border="false"
    />
    <HomeFloatButton />

    <div class="pkg-header" :style="{ background: pkg.headerBg }">
      <div class="header-mask" />
      <div class="header-inner">
        <span class="pkg-tag-top">{{ pkg.tag }}</span>
        <h1 class="pkg-title">{{ pkg.name }}</h1>
        <div class="pkg-price-row">
          <span class="currency">¥</span>
          <span class="price-num">{{ pkg.price }}</span>
          <span class="price-unit">/人</span>
        </div>
      </div>
    </div>

    <div class="detail-body" v-if="contentReady">
      <div class="section-card">
        <h2 class="section-title">课程介绍</h2>
        <p class="section-text">{{ pkg.intro }}</p>
      </div>

      <!-- 往期活动展示（支持后台配置） -->
      <div class="section-card" v-if="studyShowcase.length > 0">
        <h2 class="section-title">精彩回顾</h2>
        <div class="showcase-grid">
          <div
            v-for="(item, idx) in studyShowcase"
            :key="idx"
            class="showcase-item"
            @click="previewShowcase(item)"
          >
            <van-image :src="normalizeUrl(item.image)" fit="cover" width="100%" height="140" radius="12" />
            <div class="showcase-info">
              <div class="showcase-title">{{ item.title }}</div>
              <div class="showcase-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
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
              <div class="schedule-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2 class="section-title">课程亮点</h2>
        <div class="highlight-grid">
          <div v-for="(h, i) in pkg.highlights" :key="i" class="highlight-card">
            <span class="highlight-emoji">{{ h.emoji }}</span>
            <div class="highlight-name">{{ h.name }}</div>
            <div class="highlight-desc">{{ h.desc }}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2 class="section-title">适合人群</h2>
        <div class="audience-list">
          <div v-for="(a, i) in pkg.audience" :key="i" class="audience-item">
            <van-icon name="friends-o" size="16" color="#0071e3" />
            <span>{{ a }}</span>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h2 class="section-title">费用说明</h2>
        <div class="fee-info">
          <div v-for="(f, i) in pkg.feeInfo" :key="i" class="fee-item">
            <span class="fee-label">{{ f.label }}</span>
            <span class="fee-value">{{ f.value }}</span>
          </div>
        </div>
      </div>

      <div class="section-card">
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
      <van-button type="primary" block round color="#0071e3" @click="onApply">
        立即报名
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview } from 'vant'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const contentReady = ref(false)
const pkg = ref(null)
const activeSession = ref('am')

const normalizeUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) return url
  if (url.includes('.') || url.includes('/')) return `/${url}`
  return url
}

const studyShowcase = ref([])

const fetchShowcase = async () => {
  try {
    const configRes = await axios.get('/api/services/config')
    const allConfigs = configRes?.data?.data || {}
    const config = allConfigs['9'] || {}
    if (config.studyShowcase && config.studyShowcase.length > 0) {
      studyShowcase.value = config.studyShowcase
    } else {
      const showcaseRes = await axios.get('/api/study/showcase')
      const items = showcaseRes?.data?.data || []
      if (Array.isArray(items) && items.length > 0) {
        studyShowcase.value = items
      }
    }
  } catch (e) {
    console.warn('Failed to load showcase:', e)
  }
}

const previewShowcase = (item) => {
  if (!item?.image) return
  showImagePreview([normalizeUrl(item.image)])
}

const packageData = {
  'study-198': {
    id: 'study-198',
    name: '无人机研学实践中心半日营',
    tag: '半日营',
    price: 198,
    headerBg: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    intro: '走进温州低空经济发展有限公司无人机研学实践中心，通过展厅参观、科普启蒙、木质无人机组装与无人机调试穿越飞行四大环节，让青少年在半天时间内系统了解无人机基础知识，亲手体验组装与飞行的乐趣，激发对低空科技的探索热情。',
    schedule: [
      { amTime: '08:50', pmTime: '13:50', name: '集合签到', desc: '研学中心集合，签到报到' },
      { amTime: '09:00', pmTime: '14:00', name: '开营破冰', desc: '破冰互动，营造轻松氛围' },
      { amTime: '09:10', pmTime: '14:10', name: '展厅参观', desc: '无人机机型讲解及各领域场景应用介绍' },
      { amTime: '09:40', pmTime: '14:40', name: '授课：科普启蒙', desc: '讲解无人机飞行原理及应用' },
      { amTime: '10:10', pmTime: '15:10', name: '木质无人机组装', desc: '在导师指导下动手组装木质无人机' },
      { amTime: '11:10', pmTime: '16:10', name: '无人机调试与穿越飞行', desc: '对组装完成的无人机进行调试并体验穿越飞行' },
      { amTime: '11:30', pmTime: '16:30', name: '结营仪式', desc: '拍照留念，圆满结营' }
    ],
    highlights: [
      { emoji: '🏛️', name: '展厅参观', desc: '无人机机型及场景应用讲解' },
      { emoji: '📚', name: '科普启蒙', desc: '无人机飞行原理与应用科普' },
      { emoji: '🔧', name: '木质无人机组装', desc: '亲手组装专属木质无人机' },
      { emoji: '🚁', name: '调试与穿越飞行', desc: '调试无人机并完成穿越飞行' }
    ],
    audience: [
      '6-16 岁青少年',
      '对无人机/航空科技有兴趣的学生',
      '学校/机构团体组织研学活动'
    ],
    feeInfo: [
      { label: '课程价格', value: '¥198/人' },
      { label: '课程时长', value: '半天（约 2.5 小时）' },
      { label: '费用包含', value: '教学费、器材使用费、保险费、证书费' },
      { label: '成团人数', value: '10 人起' }
    ],
    showcase: [
      { title: '低空科普课堂', desc: '从基础原理到安全规范，互动式讲解让孩子更易理解。', image: '/images/study/science-class.svg' },
      { title: '真机飞行体验', desc: '在专业导师指导下完成基础操控与任务闯关，提升动手能力。', image: '/images/study/flight-experience.svg' },
      { title: '成果与纪念', desc: '完成学习任务与展示，记录成长瞬间，获得满满成就感。', image: '/images/study/achievement.svg' }
    ],
    tips: [
      '请提前 3 个工作日预约，以便安排场地和导师。',
      '活动当天请穿着运动服装及运动鞋，便于户外实操。',
      '恶劣天气情况下，室外环节将调整为室内模拟训练。',
      '每位学员需签署安全协议，未成年人需家长签字。'
    ]
  },
  'study-238': {
    id: 'study-238',
    name: '无人机亲子研学课程',
    tag: '亲子课程',
    price: 238,
    headerBg: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    intro: '专为家庭设计的无人机亲子研学课程，家长与孩子共同参与无人机组装、编程飞行与亲子协作飞行任务，在互动中增进亲子关系，让科技教育成为家庭的共同记忆。',
    schedule: [
      { amTime: '08:50', pmTime: '13:50', name: '集合签到', desc: '亲子家庭签到，领取活动礼包与手册' },
      { amTime: '09:00', pmTime: '14:00', name: '开营破冰', desc: '破冰互动，营造轻松氛围' },
      { amTime: '09:10', pmTime: '14:10', name: '展厅参观', desc: '参观无人机研学实践中心展厅' },
      { amTime: '09:30', pmTime: '14:30', name: '无人机启蒙课程', desc: '趣味讲解无人机原理，亲子互动问答' },
      { amTime: '10:00', pmTime: '15:00', name: '拼搭无人机组装', desc: '家长与孩子协作完成无人机拼搭组装' },
      { amTime: '11:00', pmTime: '16:00', name: '无人机调试试飞', desc: '亲手调试并完成无人机试飞体验' },
      { amTime: '11:20', pmTime: '16:20', name: '球幕影院观影', desc: '沉浸式球幕影院，感受低空飞行视觉盛宴' },
      { amTime: '11:55', pmTime: '16:55', name: '结营仪式', desc: '拍照留念，颁发结业证书' }
    ],
    highlights: [
      { emoji: '👨‍👩‍👧', name: '亲子协作', desc: '家长孩子共同完成任务' },
      { emoji: '🔧', name: '动手组装', desc: '亲手拼搭一架无人机' },
      { emoji: '🚁', name: '调试试飞', desc: '亲手操控无人机飞行' },
      { emoji: '🎬', name: '球幕观影', desc: '沉浸式球幕影院体验' }
    ],
    audience: [
      '6-14 岁儿童及家长（1大1小）',
      '希望增进亲子关系的家庭',
      '对科技教育感兴趣的亲子家庭'
    ],
    feeInfo: [
      { label: '课程价格', value: '¥238/人（1大1小为一组）' },
      { label: '课程时长', value: '半天（约 3 小时）' },
      { label: '费用包含', value: '教学费、器材使用费、保险费、证书费、竞赛奖品' },
      { label: '成团人数', value: '15 组起' }
    ],
    showcase: [
      { title: '低空科普课堂', desc: '从基础原理到安全规范，互动式讲解让孩子更易理解。', image: '/images/study/science-class.svg' },
      { title: '低空知识启蒙', desc: '通过趣味互动教学，带领亲子家庭走进无人机的世界，探索低空飞行的奥秘。', image: '/images/study/flight-experience.svg' },
      { title: '球幕影院观影', desc: '沉浸式球幕影院，以震撼视角感受低空飞行的壮丽景象。', image: '/images/study/achievement.svg' },
      { title: '真机飞行体验', desc: '在专业导师指导下完成基础操控与任务闯关，提升动手能力。', image: '/images/study/flight-experience.svg' },
      { title: '成果与纪念', desc: '完成学习任务与展示，记录成长瞬间，获得满满成就感。', image: '/images/study/achievement.svg' }
    ],
    tips: [
      '请提前 3 个工作日预约，以便安排场地和导师。',
      '建议家长与孩子穿着舒适运动服装参加活动。',
      '恶劣天气情况下，室外环节将调整为室内活动。',
      '每组家庭限 1 位大人 + 1 位小孩，额外人员请另行报名。',
      '活动中需签署安全协议，未成年人由随行家长签字。'
    ]
  }
}

onMounted(() => {
  const id = route.params.id || 'study-198'
  pkg.value = packageData[id] || packageData['study-198']
  studyShowcase.value = pkg.value.showcase || []
  fetchShowcase()
  setTimeout(() => { contentReady.value = true }, 200)
})

const onApply = () => {
  router.push(`/service-apply/9?package=${pkg.value.id}`)
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
  background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.18) 0%, transparent 55%);
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

/* 课程亮点 */
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.highlight-card {
  background: #f5f5f7;
  border-radius: 14px;
  padding: 16px 14px;
  text-align: center;
}

.highlight-emoji {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
}

.highlight-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
}

.highlight-desc {
  font-size: 11px;
  color: #86868b;
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
</style>
