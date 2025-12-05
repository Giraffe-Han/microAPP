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
      <van-tabs v-model:active="activeCategory" sticky offset-top="46" color="#667eea" @change="onTabChange">
        <van-tab
          v-for="category in categories"
          :key="category.id"
          :title="category.name"
        >
          <div class="cases-container">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-list
              v-model:loading="loadingMore"
              :finished="finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
            <!-- 案例列表 -->
            <div 
              v-for="caseItem in cases" 
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
                  <video 
                    :src="caseItem.cover" 
                    muted 
                    loop 
                    playsinline
                    webkit-playsinline
                    x5-playsinline
                    preload="metadata"
                    style="width: 100%; height: 100%; object-fit: cover;"
                  ></video>
                  <div class="play-icon">
                    <van-icon name="play" size="24" />
                  </div>
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
            </van-list>
            </van-pull-refresh>

            <!-- 空状态 -->
            <van-empty
              v-if="!loadingMore && !refreshing && cases.length === 0"
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
          ref="swipeRef"
          :autoplay="autoplayDuration"
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
                preload="metadata"
                playsinline
                webkit-playsinline
                x5-playsinline
                @play="onPlay"
                @pause="onPause"
                @ended="onEnded"
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { showFailToast } from 'vant'

// 分类
const categories = ref([
  { id: 0, name: '全部案例' },
  { id: 1, name: '无人机物流' },
  { id: 4, name: '无人机吊运' },
  { id: 5, name: '航空表演' }
])

const activeCategory = ref(0)
const showDetail = ref(false)
const currentCase = ref(null)

// 预置静态案例数据 (确保即使API失败也能显示)
const staticCases = [
  {
    id: 1764231459722,
    categoryId: 5,
    title: '泰顺无人机表演',
    description: '5月20日晚，泰顺县文祥湖公园的夜空被1999架无人机点亮，一场以“欢顺520”为主题的无人机灯光秀在此震撼上演。',
    location: '泰顺县文祥湖公园',
    date: '2025-05-20',
    views: '2.3k',
    service: '航空表演',
    coverType: 'image',
    cover: '/uploads/taishun-perf-cover.jpg',
    media: [
       { type: 'video', url: '/uploads/taishun-perf-video.mp4' }
    ],
    fullDescription: '这场由温州交运集团所属低空公司、浙江顺翼泰翔低空经济有限公司联合泰顺县文化和广电旅游体育局共同打造的视觉盛宴，以天为幕、以光为笔，在高空书写了一封跨越半个多世纪的"时光情书"，用动态光影演绎"执子之手，与子偕老"的深情承诺，为这座浙南山城增添了一抹动人心魄的浪漫注脚。',
    highlights: ['1999架无人机编队', '文祥湖夜空首秀', '欢顺520主题']
  },
  {
    id: 1,
    categoryId: 1,
    title: '江心屿无人机外卖配送',
    description: '江心屿无人机外卖航线，极速送达，空投德克士、永和豆浆等多家外卖',
    location: '江心屿',
    date: '2025-10-01',
    views: '1.2k',
    service: '无人机物流服务',
    coverType: 'image',
    cover: '/uploads/jiangxinyu-cover.jpg',
    media: [
      { type: 'image', url: '/uploads/jiangxinyu-cover.jpg' },
      { type: 'image', url: '/uploads/jiangxinyu-1.jpg' },
      { type: 'video', url: '/uploads/jiangxinyu-video.mp4', poster: '/uploads/jiangxinyu-cover.jpg' }
    ],
    fullDescription: '为缓解假期游客密集导致的就餐难等问题，温州交运集团所属低空公司在江心屿创新推出无人机外卖配送服务，以“宋街起飞、九曲桥草坪降落”的双节点布局，在景区内打造“低空物流”内循环。“相比传统地面配送，无人机配送效率提升了近70%，单次能装下2—3份餐食，有效解决配送慢、取餐难等问题。”低空公司一位负责人说，此次在江心屿推出无人机外卖配送服务，进一步探索了“低空物流+景区内循环”的可复制场景，为景区服务增添科技温度。',
    highlights: ['10分钟极速送达，效率提升300%', '精准定位空投柜，取餐更方便', '覆盖永和豆浆、德克士等种商品', '无接触配送，科技感十足']
  },
  {
    id: 4,
    categoryId: 4,
    title: '泰顺杨梅采摘',
    description: '偏远山区农产品无人机空运，解决传统运输方式运输难题',
    location: '泰顺山区',
    date: '2025-06-24',
    views: '1.8k',
    service: '无人机吊运服务',
    coverType: 'image',
    cover: '/uploads/taishun-bayberry-cover.jpg',
    media: [
      { type: 'image', url: '/uploads/taishun-bayberry-cover.jpg' },
      { type: 'image', url: '/uploads/taishun-bayberry-1.jpg' },
      { type: 'image', url: '/uploads/taishun-bayberry-2.jpg' },
      { type: 'video', url: '/uploads/taishun-bayberry-video.mp4' }
    ],
    fullDescription: '偏远山区，道路崎岖，传统载具运输困难。使用大型吊运无人机，成功杨梅进行吊装配送',
    highlights: ['突破地形限制，吊运能力强', '精准定位，误差小于10cm', '降低成本40%，缩短工期60%', '零安全事故，施工人员零风险']
  }
]

// 案例数据
const cases = ref([...staticCases]) // 初始显示静态数据
const page = ref(1)
const loadingMore = ref(false)
const finished = ref(false)
const refreshing = ref(false)

const fetchCases = async () => {
  try {
    const categoryId = categories.value[activeCategory.value].id
    
    // 过滤静态数据
    let currentStaticCases = []
    if (categoryId === 0) {
        currentStaticCases = staticCases
    } else {
        currentStaticCases = staticCases.filter(c => c.categoryId === categoryId)
    }

    const res = await axios.get('/api/cases', {
        params: {
            page: page.value,
            limit: 10,
            categoryId
        }
    })
    
    // 兼容处理：如果返回的是数组，直接用；如果是分页对象，取 .data
    let data = Array.isArray(res.data) ? res.data : (res.data.data || [])
    console.log('Cases API response:', res.data, 'Parsed data:', data)

    // 去重：移除已经存在于 staticCases 中的数据 (避免重复显示)
    // 优先使用本地 staticCases 配置的资源路径
    const staticIds = new Set(currentStaticCases.map(c => c.id))
    data = data.filter(item => !staticIds.has(item.id))
    
    if (refreshing.value) {
        // 刷新时：重置为 静态数据 + 过滤后的API数据
        cases.value = [...currentStaticCases, ...data]
        refreshing.value = false
    } else {
        // 加载更多时：追加 API 数据
        // 注意：如果是第一页且不是刷新（初始化），我们要确保静态数据只在最前面
        if (page.value === 1) {
             cases.value = [...currentStaticCases, ...data]
        } else {
             cases.value = [...cases.value, ...data]
        }
    }

    loadingMore.value = false

    // 判断是否结束：使用解析后的 data 长度判断
    if (data.length < 10) {
        finished.value = true
    } else {
        page.value++
    }
  } catch (error) {
    console.error('Failed to fetch cases:', error)
    // 即使API失败，也要保留静态数据
    const categoryId = categories.value[activeCategory.value].id
    if (categoryId === 0) {
        cases.value = staticCases
    } else {
        cases.value = staticCases.filter(c => c.categoryId === categoryId)
    }
    
    loadingMore.value = false
    refreshing.value = false
    finished.value = true
  }
}

const onLoad = () => {
    if (refreshing.value) return
    fetchCases()
}

const onRefresh = () => {
    finished.value = false
    loadingMore.value = true 
    page.value = 1
    onLoad() 
}

const onTabChange = () => {
    cases.value = []
    page.value = 1
    finished.value = false
    loadingMore.value = true 
    onLoad()
}

// 显示案例详情
const showCaseDetail = (caseItem) => {
  console.log('Clicked case item:', caseItem);
  currentCase.value = caseItem
  showDetail.value = true
}

// 视频播放控制
const swipeRef = ref(null)
const autoplayDuration = ref(3000)

const onPlay = () => {
  autoplayDuration.value = 0 // 停止轮播
}

const onPause = () => {
  autoplayDuration.value = 3000 // 恢复轮播
}

const onEnded = () => {
  autoplayDuration.value = 3000 // 恢复轮播
  swipeRef.value?.next() // 播放结束立即切换下一张
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

