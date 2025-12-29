<template>
  <view class="cases-page">
    <view class="page-header">
      <view class="tabs">
        <view 
          v-for="cat in categories" 
          :key="cat.id" 
          class="tab-item"
          :class="{ active: activeCategory === cat.id }"
          @tap="onTabChange(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </view>

    <view class="cases-container">
      <view 
        v-for="caseItem in filteredCases" 
        :key="caseItem.id"
        class="case-card"
        @tap="goDetail(caseItem.id)"
      >
        <view class="case-cover">
          <image :src="caseItem.cover" mode="aspectFill" class="cover-img" lazy-load />
          <view class="type-tag" :class="caseItem.coverType">
            {{ caseItem.coverType === 'video' ? '视频' : '图片' }}
          </view>
        </view>

        <view class="case-info">
          <view class="case-title">{{ caseItem.title }}</view>
          <view class="case-desc">{{ caseItem.description }}</view>
          <view class="case-meta">
            <view class="meta-item">
              <text class="meta-icon">🕒</text>
              <text>{{ caseItem.date }}</text>
            </view>
            <view class="meta-item">
              <text class="meta-icon">👁️</text>
              <text>{{ caseItem.views }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="filteredCases.length === 0" class="empty-state">
        <view class="empty-icon">🔍</view>
        <view class="empty-text">暂无相关案例</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { caseList } from '../../utils/cases'

const categories = [
  { id: 0, name: '全部案例' },
  { id: 1, name: '无人机物流' },
  { id: 4, name: '无人机吊运' },
  { id: 5, name: '无人机表演' }
]

const activeCategory = ref(0)

const onTabChange = (id) => {
  activeCategory.value = id
}

const filteredCases = computed(() => {
  if (activeCategory.value === 0) return caseList
  const cat = categories.find(c => c.id === activeCategory.value)
  return caseList.filter(c => c.service === cat.name)
})

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/cases/detail?id=${id}` })
}
</script>

<style scoped>
.cases-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  border-bottom: 1px solid #f2f3f5;
}

.tabs {
  display: flex;
  padding: 0 16px;
  overflow-x: auto;
  white-space: nowrap;
}

.tab-item {
  padding: 14px 0;
  margin-right: 24px;
  font-size: 15px;
  color: #646566;
  position: relative;
  flex-shrink: 0;
}

.tab-item.active {
  color: #667eea;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
}

.cases-container {
  padding: 16px;
}

.case-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.case-cover {
  position: relative;
  width: 100%;
  height: 180px;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.type-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.type-tag.video { color: #1989fa; }
.type-tag.image { color: #07c160; }

.case-info {
  padding: 16px;
}

.case-title {
  font-size: 17px;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.case-desc {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 42px;
}

.case-meta {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f5f6f7;
  font-size: 12px;
  color: #969799;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty-state {
  padding-top: 100px;
  text-align: center;
}

.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-text { color: #969799; font-size: 14px; }
</style>
