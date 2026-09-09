<template>
  <view class="agreement-page">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else class="doc-wrap">
      <view class="doc-title">{{ doc.title }}</view>
      <view class="doc-meta" v-if="doc.version || updatedAtText">
        <text v-if="doc.version" class="meta-item">版本：{{ doc.version }}</text>
        <text v-if="updatedAtText" class="meta-item">更新时间：{{ updatedAtText }}</text>
      </view>
      <text class="doc-content">{{ doc.content }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request } from '../../utils/request'

const loading = ref(true)
const doc = ref({ title: '', content: '', version: '', updatedAt: '' })
const updatedAtText = ref('')

const formatDate = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

onLoad(async (options) => {
  // 协议类型：user=用户协议，privacy=隐私政策
  const type = options && options.type === 'privacy' ? 'privacy' : 'user'
  try {
    const res = await request({ url: `/api/agreements/${type}` })
    if (res?.success && res.data) {
      doc.value = res.data
      uni.setNavigationBarTitle({ title: res.data.title || '协议详情' })
      updatedAtText.value = res.data.updatedAt ? formatDate(res.data.updatedAt) : ''
    } else {
      throw new Error(res?.message || '协议加载失败')
    }
  } catch (e) {
    uni.showToast({ title: e?.message || '协议加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background: #fff;
  padding: 20px 16px 40px;
  box-sizing: border-box;
}

.loading {
  text-align: center;
  color: #969799;
  font-size: 14px;
  padding: 60px 0;
}

.doc-title {
  font-size: 20px;
  font-weight: bold;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 12px;
}

.doc-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 20px;
}

.meta-item {
  font-size: 12px;
  color: #969799;
}

.doc-content {
  font-size: 14px;
  line-height: 1.9;
  color: #323233;
  /* 保留后端提交内容中的换行 */
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
