<template>
  <div class="cases-page">
    <van-nav-bar
      title="案例展示"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="page-content">
      <!-- 案例分类tabs -->
      <van-tabs v-model:active="activeCategory" sticky offset-top="46" color="#667eea">
        <van-tab
          v-for="category in categories"
          :key="category.id"
          :title="category.name"
        >
          <div class="cases-container">
            <!-- 案例列表 -->
            <div 
              v-for="caseItem in filteredCases" 
              :key="caseItem.id"
              class="case-card"
              @click="showCaseDetail(caseItem)"
            >
              <!-- 案例封面 -->
              <div class="case-cover">
                <img 
                  v-if="caseItem.coverType === 'image'" 
                  :src="caseItem.cover" 
                  :alt="caseItem.title"
                />
                <div v-else class="video-cover">
                  <img :src="caseItem.cover" :alt="caseItem.title" />
                  <van-icon name="play-circle-o" class="play-icon" size="48" color="#fff" />
                </div>
                
                <!-- 类型标签 -->
                <div class="type-tag">
                  <van-tag :type="caseItem.coverType === 'video' ? 'primary' : 'success'" size="medium">
                    {{ caseItem.coverType === 'video' ? '视频' : '图片' }}
                  </van-tag>
                </div>
              </div>

              <!-- 案例信息 -->
              <div class="case-info">
                <h3 class="case-title">{{ caseItem.title }}</h3>
                <p class="case-desc">{{ caseItem.description }}</p>
                <div class="case-meta">
                  <span class="meta-item">
                    <van-icon name="clock-o" />
                    {{ caseItem.date }}
                  </span>
                  <span class="meta-item">
                    <van-icon name="eye-o" />
                    {{ caseItem.views }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <van-empty
              v-if="filteredCases.length === 0"
              description="暂无案例"
              image="search"
            />
          </div>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 案例详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      :style="{ height: '90%' }"
      round
      closeable
      close-icon="close"
    >
      <div class="detail-content" v-if="currentCase">
        <h2 class="detail-title">{{ currentCase.title }}</h2>
        
        <!-- 媒体轮播 -->
        <van-swipe
          :autoplay="3000"
          :loop="true"
          indicator-color="#667eea"
          class="media-swiper"
        >
          <van-swipe-item v-for="(media, index) in currentCase.media" :key="index">
            <!-- 图片 -->
            <div v-if="media.type === 'image'" class="media-item">
              <img :src="media.url" :alt="`案例图片${index + 1}`" />
            </div>
            
            <!-- 视频 -->
            <div v-else class="media-item video-item">
              <video
                :src="media.url"
                controls
                :poster="media.poster"
                playsinline
                webkit-playsinline
                x5-playsinline
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          </van-swipe-item>
        </van-swipe>

        <!-- 案例详情 -->
        <div class="detail-info">
          <div class="info-row">
            <van-icon name="bookmark-o" color="#667eea" />
            <span class="info-label">服务类型：</span>
            <span class="info-value">{{ currentCase.service }}</span>
          </div>
          <div class="info-row">
            <van-icon name="location-o" color="#667eea" />
            <span class="info-label">项目地点：</span>
            <span class="info-value">{{ currentCase.location }}</span>
          </div>
          <div class="info-row">
            <van-icon name="clock-o" color="#667eea" />
            <span class="info-label">完成时间：</span>
            <span class="info-value">{{ currentCase.date }}</span>
          </div>
        </div>

        <!-- 案例描述 -->
        <div class="detail-description">
          <h3 class="section-title">案例介绍</h3>
          <p class="description-text">{{ currentCase.fullDescription || currentCase.description }}</p>
        </div>

        <!-- 项目亮点 -->
        <div class="detail-highlights" v-if="currentCase.highlights">
          <h3 class="section-title">项目亮点</h3>
          <div class="highlight-item" v-for="(highlight, idx) in currentCase.highlights" :key="idx">
            <van-icon name="passed" color="#667eea" />
            <span>{{ highlight }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 分类
const categories = ref([
  { id: 0, name: '全部案例' },
  { id: 1, name: '无人机物流' },
  { id: 2, name: '政务巡检' },
  { id: 3, name: '无人机托管' },
  { id: 4, name: '无人机吊运' },
  { id: 5, name: '航空表演' },
  { id: 8, name: '无人机外卖' }
])

const activeCategory = ref(0)

// 案例数据（示例数据，实际应从后端获取）
const cases = ref([
  {
    id: 1,
    categoryId: 1,
    title: '城市医疗物资紧急配送',
    description: '为某市医院紧急配送药品30分钟完成10公里配送任务',
    service: '无人机物流服务',
    location: '浙江省温州市',
    date: '2024-12-15',
    views: '1.2k',
    coverType: 'image',
    cover: 'https://wenzhoumall-prod.oss-cn-shanghai.aliyuncs.com/test/shop/20250930/0fa02eb2dc8b4a6382784fedc0b44dc0.jpg?Expires=3337231191&OSSAccessKeyId=LTAI5tSbLByCMG16D3eoErCU&Signature=Zk8QXbZAJhw08908Er3iuy9dKg0%3D',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800' },
      { type: 'video', url: 'https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_24fps.mp4', poster: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800' }
    ],
    fullDescription: '本次任务为某三甲医院紧急配送药品，传统地面交通预计需要90分钟，使用无人机物流仅用30分钟完成配送，为患者争取了宝贵的抢救时间。',
    highlights: [
      '快速响应，15分钟内起飞',
      '全程GPS跟踪，实时监控',
      '节省时间60分钟，提高救援效率200%'
    ]
  },
  {
    id: 2,
    categoryId: 2,
    title: '环保监测智能巡检项目',
    description: '某工业园区环保巡检，覆盖20平方公里，发现3处违规排放点',
    service: '政务巡检服务',
    location: '上海市浦东新区',
    date: '2024-11-28',
    views: '856',
    coverType: 'video',
    cover: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800',
    media: [
      { type: 'video', url: 'https://videos.pexels.com/video-files/2324349/2324349-hd_1920_1080_30fps.mp4', poster: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800' }
    ],
    fullDescription: '利用无人机搭载高清摄像头和气体检测传感器，对工业园区进行全方位环保巡检，成功发现3处违规排放点，为环保部门提供了有力的执法依据。',
    highlights: [
      '覆盖面积广，效率提升5倍',
      '高清影像采集，证据确凿',
      '实时数据分析，AI智能识别',
      '成本降低70%，准确率达98%'
    ]
  },
  {
    id: 3,
    categoryId: 5,
    title: '新年灯光秀编队表演',
    description: '500架无人机编队表演，呈现震撼灯光秀，点亮城市夜空',
    service: '航空表演服务',
    location: '温州市泰顺县',
    date: '2025-01-01',
    views: '5.6k',
    coverType: 'video',
    cover: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=800',
    media: [
      { type: 'video', url: 'https://videos.pexels.com/video-files/3191955/3191955-hd_1920_1080_25fps.mp4', poster: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=800' }
    ],
    fullDescription: '新年跨年夜，500架无人机在城市上空编队表演，呈现"新年快乐"、生肖图案、城市地标等多个图案，为市民带来震撼视觉盛宴。',
    highlights: [
      '500架无人机精准编队',
      '16种变换图案，创意十足',
      '全程无事故，安全可靠',
      '现场观众超10万人，网络直播观看超百万'
    ]
  },
  {
    id: 4,
    categoryId: 4,
    title: '山区基站设备吊装',
    description: '偏远山区通信基站设备吊装，解决传统吊装无法到达的难题',
    service: '无人机吊运服务',
    location: '四川省凉山州',
    date: '2024-09-15',
    views: '1.8k',
    coverType: 'video',
    cover: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
    media: [
      { type: 'video', url: 'https://videos.pexels.com/video-files/1743318/1743318-hd_1920_1080_30fps.mp4', poster: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800' },
      { type: 'video', url: 'https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4', poster: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800' }
    ],
    fullDescription: '在海拔3000米的偏远山区，道路崎岖，传统吊装设备无法到达。使用大型吊运无人机，成功将重达50kg的基站设备运送至指定位置并完成安装。',
    highlights: [
      '突破地形限制，吊运能力强',
      '精准定位，误差小于10cm',
      '降低成本40%，缩短工期60%',
      '零安全事故，施工人员零风险'
    ]
  },
  {
    id: 5,
    categoryId: 3,
    title: '企业无人机托管服务',
    description: '为某物流企业提供20架无人机的全方位托管服务',
    service: '无人机托管服务',
    location: '杭州市滨江区',
    date: '2024-08-10',
    views: '654',
    coverType: 'image',
    cover: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800',
    media: [
      { type: 'image', url: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800' }
    ],
    fullDescription: '为客户提供无人机存储、维护保养、飞手代飞、保险购买等一站式托管服务，让客户省心省力，专注核心业务。',
    highlights: [
      '专业恒温恒湿存储环境',
      '定期维护保养，设备状态优良',
      '7x24小时托管，随时可用',
      '客户满意度98%，续约率100%'
    ]
  },
  {
    id: 6,
    categoryId: 8,
    title: '午餐高峰期外卖配送',
    description: '商圈午餐高峰期，无人机外卖配送30分钟送达，保温保鲜',
    service: '无人机外卖配送',
    location: '北京市海淀区',
    date: '2025-01-20',
    views: '3.2k',
    coverType: 'video',
    cover: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
    media: [
      { type: 'video', url: 'https://videos.pexels.com/video-files/4434242/4434242-hd_1920_1080_24fps.mp4', poster: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800' }
    ],
    fullDescription: '在午餐高峰期，利用无人机外卖配送系统，为写字楼用户提供快速配送服务。从餐厅取餐到送达用户手中，全程30分钟，保温箱确保食品温度，用户通过APP实时追踪配送进度。',
    highlights: [
      '30分钟快速送达，准时率99%',
      '智能保温箱，食品温度保持恒定',
      'GPS实时追踪，配送过程透明',
      '无接触配送，安全卫生'
    ]
  }
])

// 当前选中案例
const currentCase = ref(null)
const showDetail = ref(false)

// 过滤案例
const filteredCases = computed(() => {
  if (activeCategory.value === 0) {
    return cases.value
  }
  return cases.value.filter(c => c.categoryId === categories.value[activeCategory.value].id)
})

// 显示案例详情
const showCaseDetail = (caseItem) => {
  currentCase.value = caseItem
  showDetail.value = true
}
</script>

<style scoped>
.cases-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}

.page-content {
  min-height: calc(100vh - 46px);
}

/* 案例容器 */
.cases-container {
  padding: 16px;
  min-height: 400px;
}

/* 案例卡片 */
.case-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(100, 101, 102, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.case-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(100, 101, 102, 0.05);
}

/* 封面 */
.case-cover {
  position: relative;
  width: 100%;
  height: 210px;
  overflow: hidden;
}

.case-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

/* 图片轻微放大效果 */
.case-card:active .case-cover img {
  transform: scale(1.05);
}

.video-cover {
  position: relative;
  width: 100%;
  height: 100%;
}

.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  padding: 8px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.type-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.type-tag :deep(.van-tag) {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.type-tag :deep(.van-tag--primary) {
  color: #1989fa !important;
}

.type-tag :deep(.van-tag--success) {
  color: #07c160 !important;
}

/* 案例信息 */
.case-info {
  padding: 16px 20px;
}

.case-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.case-desc {
  font-size: 14px;
  color: #646566;
  line-height: 1.6;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 44px; /* 固定高度保持对齐 */
}

.case-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #969799;
  padding-top: 12px;
  border-top: 1px solid #f5f6f7;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 详情弹窗 */
.detail-content {
  padding: 24px;
  padding-bottom: 40px;
  height: 100%;
  overflow-y: auto;
  background: #fff;
}

.detail-title {
  font-size: 22px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 20px;
  line-height: 1.4;
  letter-spacing: 0.5px;
}

/* 媒体轮播 */
.media-swiper {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  background: #f7f8fa;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

.media-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.media-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-item video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 详情信息 */
.detail-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border: 1px solid #edf0f3;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #646566;
  font-weight: 500;
  min-width: 70px;
}

.info-value {
  color: #323233;
  font-weight: 500;
  flex: 1;
}

/* 区块标题 */
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
  line-height: 1;
}

/* 描述 */
.detail-description {
  margin-bottom: 28px;
}

.description-text {
  font-size: 15px;
  color: #4b4c4d;
  line-height: 1.8;
  text-align: justify;
}

/* 亮点 */
.detail-highlights .highlight-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 15px;
  color: #323233;
  line-height: 1.6;
  background: #f2f4ff;
  padding: 12px;
  border-radius: 8px;
}

.detail-highlights .highlight-item:last-child {
  margin-bottom: 0;
}
</style>

