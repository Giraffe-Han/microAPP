<template>
  <div class="service-detail-page">
    <van-nav-bar
      title="服务详情"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="detail-content">
      <!-- 服务图标 -->
      <div class="service-header">
        <div class="service-icon-big" :style="{ background: serviceColor }">
          <van-icon :name="serviceIcon" size="48" color="#fff" />
        </div>
        <h1 class="service-name">{{ serviceName }}</h1>
        <p class="service-slogan">{{ serviceSlogan }}</p>
      </div>

      <!-- 服务介绍 -->
      <div class="section-card">
        <h2 class="section-title">服务介绍</h2>
        <p class="section-text">{{ serviceIntro }}</p>
      </div>

      <!-- 服务项目 -->
      <div class="section-card">
        <h2 class="section-title">服务项目</h2>
        <div class="project-grid">
          <div v-for="(item, index) in serviceProjects" :key="index" class="project-item">
            <van-icon :name="item.icon" size="24" :color="serviceColor" />
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 服务优势 -->
      <div class="section-card">
        <h2 class="section-title">服务优势</h2>
        <div class="advantage-list">
          <div v-for="(adv, index) in serviceAdvantages" :key="index" class="advantage-item">
            <van-icon name="success" size="16" color="#07c160" />
            <span>{{ adv }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button icon="service-o" plain type="primary">
        咨询客服
      </van-button>
      <van-button type="primary" block @click="onApply">
        立即申请
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const serviceId = route.params.id

// 服务数据映射（图标已优化）
const serviceData = {
  '1': {
    name: '无人机物流服务',
    slogan: '快速配送 · 安全可靠 · 覆盖全城',
    icon: 'send-gift-o', // 物流配送
    color: '#1677ff',
    intro: '无人机物流服务利用先进的无人机技术，为城市和偏远地区提供快速、高效的物资配送服务。',
    projects: [
      { name: '城市配送', icon: 'shopping-cart-o' }, // 购物车配送
      { name: '紧急物资', icon: 'warning-o' }, // 紧急警告
      { name: '医疗运输', icon: 'add-o' }, // 医疗十字
      { name: '特殊货物', icon: 'gift-o' } // 礼物货物
    ],
    advantages: ['2小时快速响应', '全程GPS跟踪', '专业团队操作', '全程保险覆盖']
  },
  '2': {
    name: '政务巡检服务',
    slogan: '智能巡检 · 降本增效 · 精准监测',
    icon: 'eye-o', // 巡检监控
    color: '#ff9c6e',
    intro: '专业提供政务巡检服务，包括环保监测、安全巡查、设施检查等，助力智慧城市建设。',
    projects: [
      { name: '环保监测', icon: 'cluster-o' }, // 环境聚类
      { name: '安全巡查', icon: 'shield-o' }, // 安全盾牌
      { name: '设施检查', icon: 'eye-o' }, // 检查查看
      { name: '交通监控', icon: 'location-o' } // 位置监控
    ],
    advantages: ['高清数据采集', '实时监控反馈', 'AI智能分析', '专业报告输出']
  },
  '3': {
    name: '无人机托管服务',
    slogan: '专业托管 · 安全放心 · 省心省力',
    icon: 'shop-o', // 托管商店
    color: '#52c41a',
    intro: '提供专业的无人机托管服务，包括保养维护、安全存储、代飞服务等一站式解决方案。',
    projects: [
      { name: '专业维护', icon: 'setting-o' }, // 设置维护
      { name: '安全存储', icon: 'bag-o' }, // 包裹存储
      { name: '代飞服务', icon: 'friends-o' }, // 代理服务
      { name: '保险服务', icon: 'umbrella-circle' } // 保险保护
    ],
    advantages: ['专业维保团队', '安全存储环境', '灵活服务套餐', '完善保险保障']
  },
  '4': {
    name: '无人机吊运服务',
    slogan: '高空作业 · 精准操控 · 安全高效',
    icon: 'upgrade', // 吊运上升
    color: '#722ed1',
    intro: '提供专业的无人机吊运服务，适用于高空作业、建筑施工、设备安装等场景。',
    projects: [
      { name: '高空吊运', icon: 'arrow-up' }, // 上升箭头
      { name: '设备安装', icon: 'setting-o' }, // 设备设置
      { name: '建筑施工', icon: 'home-o' }, // 建筑房屋
      { name: '特殊作业', icon: 'flag-o' } // 特殊标记
    ],
    advantages: ['专业吊运设备', '精准操控技术', '严格安全规范', '经验丰富团队']
  },
  '5': {
    name: '航空表演服务',
    slogan: '震撼视觉 · 创意编排 · 精彩呈现',
    icon: 'fire-o',
    color: '#eb2f96',
    intro: '提供专业的航空表演服务，包括无人机编队飞行、灯光秀、创意表演等，为各类活动增添精彩亮点。',
    projects: [
      { name: '编队飞行', icon: 'friends-o' },
      { name: '灯光秀', icon: 'fire-o' },
      { name: '创意表演', icon: 'star-o' },
      { name: '活动定制', icon: 'certificate' }
    ],
    advantages: ['创意编排', '震撼效果', '安全可控', '定制化服务']
  },
  '6': {
    name: '无人机培训服务',
    slogan: '专业培训 · 证书认证 · 实操教学',
    icon: 'certificate',
    color: '#faad14',
    intro: '提供专业的无人机培训服务，包括CAAC执照培训、技能提升、行业应用培训等，助力无人机人才培养。',
    projects: [
      { name: 'CAAC执照', icon: 'certificate' },
      { name: '技能培训', icon: 'award-o' },
      { name: '实操教学', icon: 'friends-o' },
      { name: '行业应用', icon: 'service-o' }
    ],
    advantages: ['资质齐全', '经验丰富', '通过率高', '就业推荐']
  },
  '7': {
    name: '无人机租赁服务',
    slogan: '灵活租赁 · 多种机型 · 专业服务',
    icon: 'coupon-o',
    color: '#13c2c2',
    intro: '提供专业的无人机租赁服务，多种机型可选，灵活租赁方式，满足不同场景的使用需求。',
    projects: [
      { name: '设备租赁', icon: 'bag-o' },
      { name: '配件租赁', icon: 'setting-o' },
      { name: '短期租赁', icon: 'clock-o' },
      { name: '长期租赁', icon: 'calendar-o' }
    ],
    advantages: ['机型丰富', '价格优惠', '灵活租期', '技术支持']
  },
  '8': {
    name: '无人机外卖配送',
    slogan: '即时配送 · 快速送达 · 安全可靠',
    icon: 'shopping-cart-o',
    color: '#f5222d',
    intro: '提供专业的无人机外卖配送服务，实现城市即时配送，快速安全，为用户带来全新的外卖体验。',
    projects: [
      { name: '即时配送', icon: 'logistics' },
      { name: '在线下单', icon: 'shopping-cart-o' },
      { name: '实时追踪', icon: 'location-o' },
      { name: '安全送达', icon: 'shield-o' }
    ],
    advantages: ['30分钟送达', '全程保温保鲜', 'GPS实时跟踪', '无接触配送']
  },
  '9': {
    name: '低空研学服务',
    slogan: '科普教育 · 实践体验 · 创新培养',
    icon: 'records',
    color: '#722ed1',
    intro: '提供专业的低空研学服务，面向青少年开展无人机科普教育、飞行体验、创新实践等活动，激发科技兴趣，培养创新能力。',
    projects: [
      { name: '科普讲座', icon: 'records' },
      { name: '飞行体验', icon: 'underway-o' },
      { name: '组装实践', icon: 'setting-o' },
      { name: '竞赛培训', icon: 'medal-o' }
    ],
    advantages: ['专业导师团队', '安全场地保障', '完整课程体系', '实践动手能力']
  },
  '10': {
    name: '无人机二手交易',
    slogan: '诚信交易 · 专业检测 · 以旧换新',
    icon: 'exchange',
    color: '#fa8c16',
    intro: '提供专业的无人机二手交易平台，支持设备买卖、以旧换新、专业检测等服务，让闲置设备发挥价值。',
    projects: [
      { name: '设备买卖', icon: 'shop-o' },
      { name: '以旧换新', icon: 'exchange' },
      { name: '专业检测', icon: 'certificate' },
      { name: '质量保障', icon: 'shield-o' }
    ],
    advantages: ['专业估值评测', '交易安全保障', '质保售后服务', '置换优惠政策']
  },
  '11': {
    name: '无人机金融服务',
    slogan: '设备保险 · 飞行护航 · 专业理赔',
    icon: 'balance-o',
    color: '#1677ff',
    intro: '提供专业的无人机金融保险服务，涵盖设备险、责任险、飞手险等多种保险产品，为您的飞行保驾护航。',
    projects: [
      { name: '设备保险', icon: 'shield-o' },
      { name: '责任保险', icon: 'balance-o' },
      { name: '飞手保险', icon: 'manager-o' },
      { name: '快速理赔', icon: 'gold-coin-o' }
    ],
    advantages: ['全面保障覆盖', '快速理赔服务', '专业风险评估', '优惠保费政策']
  }
}

const currentService = serviceData[serviceId] || serviceData['1']

const serviceName = ref(currentService.name)
const serviceSlogan = ref(currentService.slogan)
const serviceIcon = ref(currentService.icon)
const serviceColor = ref(currentService.color)
const serviceIntro = ref(currentService.intro)
const serviceProjects = ref(currentService.projects)
const serviceAdvantages = ref(currentService.advantages)

const onApply = () => {
  // 无人机外卖服务跳转到外部配送平台
  if (serviceId === '8') {
    window.location.href = 'https://app.wzsjy.com:8446/h5/#/pages/diy/diy?pageId=130&title=%E6%97%A0%E4%BA%BA%E6%9C%BA%E5%A4%96%E5%8D%96%E9%85%8D%E9%80%81&jyauthcode='
  } else {
    router.push(`/service-apply/${serviceId}`)
  }
}
</script>

<style scoped>
.service-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 70px;
}

.service-header {
  background: #fff;
  padding: 32px 20px;
  text-align: center;
}

.service-icon-big {
  width: 88px;
  height: 88px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.service-name {
  font-size: 22px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.service-slogan {
  font-size: 14px;
  color: #969799;
}

.section-card {
  background: #fff;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #1677ff;
}

.section-text {
  font-size: 14px;
  color: #646566;
  line-height: 1.8;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.project-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 13px;
  color: #323233;
}

.advantage-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.advantage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #646566;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #ebedf0;
  display: flex;
  gap: 12px;
  z-index: 100;
}

.action-bar :deep(.van-button) {
  flex: 1;
}
</style>

