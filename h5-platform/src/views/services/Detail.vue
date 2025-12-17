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
          <van-icon :name="serviceIcon" size="48" color="#ffffff" />
        </div>
        <h1 class="service-name">{{ serviceName }}</h1>
        <p class="service-slogan">{{ serviceSlogan }}</p>
      </div>

      <!-- 服务介绍 -->
      <div class="section-card" v-if="serviceId !== '6'">
        <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">服务介绍</h2>
        <p class="section-text">{{ serviceIntro }}</p>
      </div>

      <!-- 服务项目 -->
      <div class="section-card" v-if="serviceId !== '6'">
        <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">服务项目</h2>
        <div class="project-grid">
          <div v-for="(item, index) in serviceProjects" :key="index" class="project-item">
            <van-icon :name="item.icon" size="24" :color="serviceMainColor" />
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>

      <!-- 服务优势 -->
      <div class="section-card" v-if="serviceId !== '6'">
        <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">服务优势</h2>
        <div class="advantage-list">
          <div v-for="(adv, index) in serviceAdvantages" :key="index" class="advantage-item">
            <van-icon name="success" size="16" color="#07c160" />
            <span>{{ adv }}</span>
          </div>
        </div>
      </div>

      <!-- 飞手培训专属内容 -->
      <template v-if="serviceId === '6'">
        <!-- 报名条件 -->
        <div class="section-card">
          <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">报名条件</h2>
          <div class="training-list">
            <div class="training-item">(一)、中华人民共和国公民;</div>
            <div class="training-item">(二)、年满16周岁以上，70周岁以下;</div>
            <div class="training-item">(三)、初中以上文化程度;</div>
            <div class="training-item">(四)、遵纪守法，无不良行为，五年内无犯罪记录;</div>
            <div class="training-item">(五)、身体健康;矫正视力1.0以上，无色盲、色弱，无传染性疾病，无脑血管及精神类疾病，肢体无残疾，无不良嗜好;</div>
            <div class="training-item">(六)、具有适应无人机操控需要的基本知识和操作能力。</div>
          </div>
        </div>

        <!-- 培训费用 -->
        <div class="section-card">
          <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">培训费用</h2>
          <div class="price-list">
            <div class="price-item">
              <span class="label">小型无人机-多旋翼-视距内</span>
              <span class="price">8800元/人</span>
            </div>
            <div class="price-item">
              <span class="label">小型无人机-多旋翼-超视距</span>
              <span class="price">12800元/人</span>
            </div>
            <div class="price-item">
              <span class="label">中型无人机-多旋翼-视距内</span>
              <span class="price">10800元/人</span>
            </div>
            <div class="price-item">
              <span class="label">中型无人机-多旋翼-超视距</span>
              <span class="price">15800元/人</span>
            </div>
            <div class="price-item">
              <span class="label">U-BOX3.0</span>
              <span class="price">490元/套 <span class="tip">（自愿购买）</span></span>
            </div>
          </div>
        </div>

        <!-- 培训特色 -->
        <div class="section-card">
          <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">教学特色</h2>
          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-title">权威认证</div>
              <div class="feature-desc">御风航空多次荣获中国AOPA年度优秀训练机构称号;学员通过培训可获得中国民用航空局发放的无人机操控员执照。</div>
            </div>
            <div class="feature-item">
              <div class="feature-title">全面课程</div>
              <div class="feature-desc">涵盖无人机基础知识、飞行操作、维护保养、法律法规等；提供丰富的实操机会，确保学员熟练掌握飞行技巧。</div>
            </div>
            <div class="feature-item">
              <div class="feature-title">灵活教学</div>
              <div class="feature-desc">每班人数有限，确保每位学员都能得到充分指导;提供周末班、晚班等多种选择，适应不同学员需求。</div>
            </div>
            <div class="feature-item">
              <div class="feature-title">资深老牌</div>
              <div class="feature-desc">御风航空深耕无人机培训7年，积累丰富经验，专业教员团队，个性化教程，精准施教。</div>
            </div>
          </div>
        </div>

        <!-- 公司简介 -->
        <div class="section-card">
          <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">公司简介</h2>
          <div class="company-intro">
            <div class="intro-title">浙江御风航空科技有限公司</div>
            <p class="section-text">系温州交运集团所属低空公司的控股子公司，公司成立于2018年，致力于无人机专业培训，为行业客户提供专业的解决方案和人才培养，为院校搭建A1无人机教学实验室，建立金字塔式的综合教学。作为国内早期开展无人机驾驶员资格培训的机构之一，是浙南闽北地区最早一家具备民航局认定的CAAC执照培训资质的机构，并具备合法合规的空域飞行权。</p>
          </div>
        </div>

        <!-- 执照功能 -->
        <div class="section-card">
          <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">执照功能</h2>
          <div class="license-intro">
            <p class="section-text">CAAC是中国民用航空局的英文缩写，相应的无人机驾驶航空器操控员执照是由中国民航局飞行标准司直接签发的，含金量极高!是无人机行业从业者入行必备的敲门砖，具有权威的法律效力!取得该执照可申报空域、申请航线、从事无人机相关的商业活动等。</p>
            <div class="law-quote">《无人驾驶航空器飞行管理暂行条例》中规定:操控小型、中型、大型民用无人驾驶航空器飞行的人员应当向国务院民用航空主管部门申请取得相应民用无人驾驶航空操控员执照(CAAC)。</div>
          </div>
        </div>
      </template>

      <!-- 联系客服 -->
      <div class="section-card contact-card" :class="{'training-contact': serviceId === '6'}">
        <h2 class="section-title" :style="{ borderLeftColor: serviceMainColor }">联系客服</h2>
        <template v-if="serviceId === '6'">
           <div class="contact-info">
            <p>联系电话：</p>
            <a href="tel:0577-55558188" class="phone-link" :style="{ color: serviceMainColor }">0577-55558188</a>
            <a href="tel:0577-88360168" class="phone-link" :style="{ color: serviceMainColor }">0577-88360168</a>
            <p>邮箱: wzdkjjgs@163.com</p>
            <p class="address">温州低空经济发展有限公司<br />浙江御风航空科技有限公司<br />(温州市鹿城区牛山北路52号)</p>
          </div>
        </template>
        <template v-else>
        <div class="contact-info">
          <p>如有疑问，请咨询客服热线：</p>
          <a href="tel:0577-55558188" class="phone-link" :style="{ color: serviceMainColor }">0577-55558188</a>
          <p class="work-time">工作时间：工作日 8:30-17:30</p>
        </div>
        </template>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button type="primary" block @click="onApply" :color="serviceColor">
        {{ actionButtonText }}
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
    icon: '/icons/logistics-drone.svg', // 物流配送
    color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    mainColor: '#1677ff',
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
    name: '政务服务',
    slogan: '智能巡检 · 降本增效 · 精准监测',
    icon: 'eye-o', // 巡检监控
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#722ed1',
    intro: '专业提供政务服务，包括环保监测、安全巡查、设施检查等，助力智慧城市建设。',
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
    icon: '/icons/maintenance.svg', // 托管商店
    color: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)',
    mainColor: '#52c41a',
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
    icon: '/icons/lifting.svg', // 吊运上升
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#faad14',
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
    name: '无人机表演服务',
    slogan: '震撼视觉 · 创意编排 · 精彩呈现',
    icon: '/icons/drone-show-v2.svg',
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#eb2f96',
    intro: '提供专业的无人机表演服务，包括无人机编队飞行、灯光秀、创意表演等，为各类活动增添精彩亮点。',
    projects: [
      { name: '编队飞行', icon: 'friends-o' },
      { name: '灯光秀', icon: 'fire-o' },
      { name: '创意表演', icon: 'star-o' },
      { name: '活动定制', icon: 'certificate' }
    ],
    advantages: ['创意编排', '震撼效果', '安全可控', '定制化服务']
  },
  '6': {
    name: '飞手培训服务',
    slogan: '专业培训 · 证书认证 · 实操教学',
    icon: '/icons/training-v2.svg',
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#faad14',
    intro: '提供专业的飞手培训服务，包括CAAC执照培训、技能提升、行业应用培训等，助力无人机人才培养。',
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
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#13c2c2',
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
    icon: '/icons/delivery.svg',
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#f5222d',
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
    icon: '/icons/study.svg',
    color: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
    mainColor: '#722ed1',
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
    color: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
    mainColor: '#fa8c16',
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
    icon: '/icons/finance.svg',
    color: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    mainColor: '#1677ff',
    intro: '提供专业的无人机金融保险服务，涵盖设备险、责任险、飞手险等多种保险产品，为您的飞行保驾护航。',
    projects: [
      { name: '设备保险', icon: 'shield-o' },
      { name: '责任保险', icon: 'balance-o' },
      { name: '飞手保险', icon: 'manager-o' },
      { name: '快速理赔', icon: 'gold-coin-o' }
    ],
    advantages: ['全面保障覆盖', '快速理赔服务', '专业风险评估', '优惠保费政策']
  },
  '12': {
    name: '无人机维修服务',
    slogan: '专业维修 · 原厂配件 · 焕然一新',
    icon: 'setting-o',
    color: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
    mainColor: '#2f54eb',
    intro: '提供全方位的无人机维修与保养服务，拥有官方授权的专业技术团队和原厂配件库，解决各类硬件故障与软件问题，延长设备使用寿命。',
    projects: [
      { name: '故障维修', icon: 'warning-o' },
      { name: '定期保养', icon: 'like-o' },
      { name: '配件更换', icon: 'replay' },
      { name: '系统升级', icon: 'down' }
    ],
    advantages: ['官方授权认证', '原厂正品配件', '资深技师团队', '维修质保承诺']
  }
}

const currentService = serviceData[serviceId] || serviceData['1']

const serviceName = ref(currentService.name)
const serviceSlogan = ref(currentService.slogan)
const serviceIcon = ref(currentService.icon)
const serviceColor = ref(currentService.color)
const serviceMainColor = ref(currentService.mainColor)
const serviceIntro = ref(currentService.intro)
const serviceProjects = ref(currentService.projects)
const serviceAdvantages = ref(currentService.advantages)

const actionButtonText = computed(() => {
  // 物流(1)、吊运(4)、外卖(8)
  if (['1', '4', '8'].includes(String(serviceId))) {
    return '立即下单'
  }
  // 培训(6)、研学(9)
  if (['6', '9'].includes(String(serviceId))) {
    return '参与报名'
  }
  return '立即办理'
})

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

/* 强制 SVG 图片图标变白 */
.service-icon-big :deep(.van-icon__image) {
  filter: brightness(0) invert(1);
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

.contact-card {
  text-align: center;
  padding: 24px 16px;
}

.contact-info p {
  color: #646566;
  font-size: 14px;
  margin-bottom: 8px;
}

.phone-link {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #1677ff;
  margin: 12px 0;
  text-decoration: none;
}

.work-time {
  font-size: 12px;
  color: #969799;
}

/* 培训专属样式 */
.training-list {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
}
.training-item {
  margin-bottom: 8px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #ebedf0;
}
.price-item:last-child {
  border-bottom: none;
}
.price-item .label {
  font-size: 14px;
  color: #323233;
}
.price-item .price {
  font-size: 16px;
  font-weight: bold;
  color: #ee0a24;
}
.price-item .tip {
  font-size: 12px;
  font-weight: normal;
  color: #969799;
}

.feature-item {
  margin-bottom: 16px;
}
.feature-title {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 4px;
  position: relative;
  padding-left: 10px;
}
.feature-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #323233;
}
.feature-desc {
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
  padding-left: 10px;
}

.intro-title {
  font-size: 15px;
  font-weight: bold;
  color: #323233;
  margin-bottom: 8px;
}

.law-quote {
  margin-top: 12px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 13px;
  color: #646566;
  line-height: 1.6;
}

.training-contact .contact-info .address {
  margin-top: 12px;
  line-height: 1.6;
}
</style>

