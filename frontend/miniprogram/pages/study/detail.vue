<template>
  <view class="study-detail-page" v-if="pkg">
    <view class="detail-content">
      <view class="pkg-header" :style="{ background: pkg.headerBg }">
        <view class="header-mask" />
        <view class="header-inner">
          <view class="pkg-tag-top">{{ pkg.tag }}</view>
          <view class="pkg-title">{{ pkg.name }}</view>
          <view class="pkg-price-row">
            <text class="currency">¥</text>
            <text class="price-num">{{ pkg.price }}</text>
            <text class="price-unit">/人</text>
          </view>
        </view>
      </view>

      <view v-if="contentReady">
        <view class="section-card">
          <view class="section-title">课程介绍</view>
          <text class="section-text">{{ pkg.intro }}</text>
        </view>

        <!-- 往期活动展示（支持后台配置） -->
        <view class="section-card" v-if="studyShowcase.length > 0">
          <view class="section-title">精彩回顾</view>
          <view class="showcase-grid">
            <view
              v-for="(item, idx) in studyShowcase"
              :key="idx"
              class="showcase-item"
              @tap="previewShowcase(idx)"
            >
              <image :src="item.image" mode="aspectFill" class="showcase-img" />
              <view class="showcase-info">
                <view class="showcase-title">{{ item.title }}</view>
                <view class="showcase-desc">{{ item.desc }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">课程安排</view>
          <view class="session-toggle">
            <view
              class="toggle-btn"
              :class="{ active: activeSession === 'am' }"
              @tap="activeSession = 'am'"
            >
              <text>上午场</text>
            </view>
            <view
              class="toggle-btn"
              :class="{ active: activeSession === 'pm' }"
              @tap="activeSession = 'pm'"
            >
              <text>下午场</text>
            </view>
          </view>
          <view class="schedule-list">
            <view v-for="(item, index) in pkg.schedule" :key="index" class="schedule-item">
              <view class="schedule-time">{{ activeSession === 'am' ? item.amTime : item.pmTime }}</view>
              <view class="schedule-line">
                <view class="schedule-dot" />
                <view class="schedule-bar" v-if="index < pkg.schedule.length - 1" />
              </view>
              <view class="schedule-content">
                <view class="schedule-name">{{ item.name }}</view>
                <view class="schedule-desc">{{ item.desc }}</view>
              </view>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">课程亮点</view>
          <view class="highlight-grid">
            <view v-for="(h, i) in pkg.highlights" :key="i" class="highlight-card">
              <text class="highlight-emoji">{{ h.emoji }}</text>
              <view class="highlight-name">{{ h.name }}</view>
              <view class="highlight-desc">{{ h.desc }}</view>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">适合人群</view>
          <view class="audience-list">
            <view v-for="(a, i) in pkg.audience" :key="i" class="audience-item">
              <text class="audience-icon">👤</text>
              <text>{{ a }}</text>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">费用说明</view>
          <view class="fee-info">
            <view v-for="(f, i) in pkg.feeInfo" :key="i" class="fee-item">
              <text class="fee-label">{{ f.label }}</text>
              <text class="fee-value">{{ f.value }}</text>
            </view>
          </view>
        </view>

        <view class="section-card">
          <view class="section-title">温馨提示</view>
          <view class="tips-list">
            <view v-for="(tip, i) in pkg.tips" :key="i" class="tip-item">
              <text class="tip-index">{{ i + 1 }}</text>
              <text class="tip-text">{{ tip }}</text>
            </view>
          </view>
        </view>

        <view class="section-card contact-section">
          <view class="section-title">联系客服</view>
          <view class="contact-info">
            <view class="contact-row">如有疑问，请咨询客服热线：</view>
            <view class="phone-link" @tap="makeCall('0577-55550500')">0577-55550500</view>
            <view class="work-time">工作时间：工作日 8:30-17:30</view>
          </view>
        </view>
      </view>

      <view v-else class="skeleton-wrap">
        <view class="skeleton-block" />
        <view class="skeleton-block" />
      </view>
    </view>

    <view class="action-bar">
      <button class="apply-btn" @tap="onApply">立即报名</button>
    </view>

    <HomeFloatButton />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onReady } from '@dcloudio/uni-app'
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import { request } from '../../utils/request'

const contentReady = ref(false)
const pkg = ref(null)
const activeSession = ref('am')

const studyShowcase = ref([])

const fetchShowcase = async () => {
  try {
    const res = await request({ url: '/api/services/config' })
    const allConfigs = res?.data || res || {}
    const config = allConfigs['9'] || {}
    if (config.studyShowcase && config.studyShowcase.length > 0) {
      studyShowcase.value = config.studyShowcase
    } else {
      try {
        const showcaseRes = await request({ url: '/api/study/showcase' })
        const items = showcaseRes?.data || showcaseRes || []
        if (Array.isArray(items) && items.length > 0) {
          studyShowcase.value = items
        }
      } catch (e) { /* use default */ }
    }
  } catch (e) {
    console.warn('Failed to load showcase:', e)
  }
}

const previewShowcase = (index) => {
  const urls = studyShowcase.value.map(item => item.image).filter(Boolean)
  if (urls.length > 0) {
    uni.previewImage({ urls, current: urls[index] || urls[0] })
  }
}

const packageData = {
  'study-198': {
    id: 'study-198',
    name: '无人机研学实践中心半日营',
    tag: '半日营',
    price: 198,
    headerBg: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    intro: '走进无人机研学实践中心，通过低空科普讲座、模拟飞行训练与真机操控实践三大环节，让青少年在半天时间内系统了解无人机基础知识，亲身体验飞行操控的乐趣，激发对低空科技的探索热情。',
    schedule: [
      { amTime: '09:00', pmTime: '14:00', name: '签到集合', desc: '研学中心集合，领取学习资料与活动手册' },
      { amTime: '09:15', pmTime: '14:15', name: '低空科普课堂', desc: '无人机发展历程、飞行原理、安全知识讲解' },
      { amTime: '10:00', pmTime: '15:00', name: '模拟飞行体验', desc: '专业模拟器操作训练，掌握基本飞行技巧' },
      { amTime: '10:45', pmTime: '15:45', name: '真机操控实践', desc: '在专业导师指导下完成真机飞行任务' },
      { amTime: '11:30', pmTime: '16:30', name: '结业总结', desc: '成果展示、颁发结业证书、合影留念' }
    ],
    highlights: [
      { emoji: '📚', name: '科普讲座', desc: '从原理到应用的系统科普' },
      { emoji: '🎮', name: '模拟飞行', desc: '专业模拟器安全体验' },
      { emoji: '🚁', name: '真机操控', desc: '导师一对一指导飞行' },
      { emoji: '🏆', name: '结业证书', desc: '完成课程获颁证书' }
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
      { title: '低空科普课堂', desc: '从基础原理到安全规范，互动式讲解让孩子更易理解。', image: '/static/images/study/science-class.svg' },
      { title: '真机飞行体验', desc: '在专业导师指导下完成基础操控与任务闯关，提升动手能力。', image: '/static/images/study/flight-experience.svg' },
      { title: '成果与纪念', desc: '完成学习任务与展示，记录成长瞬间，获得满满成就感。', image: '/static/images/study/achievement.svg' }
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
      { label: '成团人数', value: '5 组家庭起' }
    ],
    showcase: [
      { title: '低空科普课堂', desc: '从基础原理到安全规范，互动式讲解让孩子更易理解。', image: '/static/images/study/science-class.svg' },
      { title: '低空知识启蒙', desc: '通过趣味互动教学，带领亲子家庭走进无人机的世界，探索低空飞行的奥秘。', image: '/static/images/study/flight-experience.svg' },
      { title: '球幕影院观影', desc: '沉浸式球幕影院，以震撼视角感受低空飞行的壮丽景象。', image: '/static/images/study/achievement.svg' },
      { title: '真机飞行体验', desc: '在专业导师指导下完成基础操控与任务闯关，提升动手能力。', image: '/static/images/study/flight-experience.svg' },
      { title: '成果与纪念', desc: '完成学习任务与展示，记录成长瞬间，获得满满成就感。', image: '/static/images/study/achievement.svg' }
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

onLoad((options) => {
  const id = options.package || 'study-198'
  pkg.value = packageData[id] || packageData['study-198']
  if (pkg.value) {
    uni.setNavigationBarTitle({ title: pkg.value.name })
    studyShowcase.value = pkg.value.showcase || []
  }
  fetchShowcase()
})

onReady(() => {
  setTimeout(() => { contentReady.value = true }, 150)
})

const onApply = () => {
  uni.navigateTo({ url: `/pages/services/apply?id=9&package=${pkg.value.id}` })
}

const makeCall = (phone) => {
  uni.makePhoneCall({ phoneNumber: phone })
}
</script>

<style scoped>
.study-detail-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 100px;
}

.pkg-header {
  position: relative;
  padding: 40px 20px 50px;
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
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
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

.section-card {
  background: #fff;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
}

.section-card:first-child {
  margin-top: -24px;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #323233;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #2563eb;
}

.section-text {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
  display: block;
}

/* 课程安排时间线 */
/* 精彩回顾 / 往期活动展示 */
.showcase-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.showcase-item {
  background: #f7f8fa;
  border-radius: 16rpx;
  overflow: hidden;
}

.showcase-img {
  width: 100%;
  height: 280rpx;
}

.showcase-info {
  padding: 16rpx 20rpx 20rpx;
}

.showcase-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.showcase-desc {
  font-size: 24rpx;
  color: #646566;
  line-height: 1.6;
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
  color: #646566;
  transition: all 0.25s;
}

.toggle-btn.active {
  background: #fff;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.schedule-list {
  padding-left: 4px;
}

.schedule-item {
  display: flex;
  gap: 12px;
  min-height: 60px;
}

.schedule-time {
  width: 42px;
  font-size: 13px;
  font-weight: 600;
  color: #323233;
  padding-top: 2px;
  flex-shrink: 0;
}

.schedule-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
}

.schedule-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2563eb;
  border: 2px solid #dbeafe;
  flex-shrink: 0;
}

.schedule-bar {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  margin-top: 4px;
}

.schedule-content {
  flex: 1;
  padding-bottom: 16px;
}

.schedule-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.schedule-desc {
  font-size: 12px;
  color: #969799;
  line-height: 1.5;
}

/* 课程亮点 */
.highlight-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.highlight-card {
  background: #f7f8fa;
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
}

.highlight-emoji {
  font-size: 28px;
  display: block;
  margin-bottom: 6px;
}

.highlight-name {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.highlight-desc {
  font-size: 11px;
  color: #969799;
}

/* 适合人群 */
.audience-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.audience-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #646566;
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
  color: #646566;
}

.fee-value {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

/* 温馨提示 */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.tip-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f0f2ff;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-text {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  flex: 1;
}

/* 联系客服 */
.contact-section {
  text-align: center;
}

.contact-row {
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}

.phone-link {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
  margin: 12px 0;
}

.work-time {
  font-size: 12px;
  color: #969799;
  margin-top: 8px;
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eee;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 100;
}

.apply-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%) !important;
  border: none;
}

/* 骨架屏 */
.skeleton-wrap {
  padding: 20px;
}

.skeleton-block {
  height: 120px;
  background: #eee;
  border-radius: 12px;
  margin-bottom: 16px;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}
</style>
