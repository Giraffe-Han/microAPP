<template>
  <div class="agreement-page">
    <van-nav-bar
      :title="doc.title || '协议详情'"
      left-arrow
      @click-left="onBack"
      fixed
      placeholder
    />

    <div class="agreement-body">
      <van-loading v-if="loading" class="loading" type="spinner" />

      <template v-else>
        <h1 class="doc-title">{{ doc.title }}</h1>
        <div class="doc-meta" v-if="doc.version || updatedAtText">
          <span v-if="doc.version">版本：{{ doc.version }}</span>
          <span v-if="updatedAtText">更新时间：{{ updatedAtText }}</span>
        </div>
        <div class="doc-content">{{ doc.content }}</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast } from 'vant'
import axios from '@/utils/http'
import { smartBack } from '@/utils/miniprogram'

const route = useRoute()
const router = useRouter()
const onBack = () => smartBack(router)

const loading = ref(true)
const doc = ref({ title: '', content: '', version: '', updatedAt: '' })

// 协议类型：user=用户协议，privacy=隐私政策
const type = computed(() => (route.params.type === 'privacy' ? 'privacy' : 'user'))

const updatedAtText = computed(() => {
  if (!doc.value.updatedAt) return ''
  const d = new Date(doc.value.updatedAt)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN')
})

const fetchAgreement = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/agreements/${type.value}`)
    if (res.data?.success && res.data.data) {
      doc.value = res.data.data
    } else {
      throw new Error(res.data?.message || '协议加载失败')
    }
  } catch (e) {
    showFailToast(e?.response?.data?.message || e?.message || '协议加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAgreement)
</script>

<style scoped>
.agreement-page {
  min-height: 100vh;
  background: #fff;
  max-width: var(--page-max-width);
  margin: 0 auto;
}

.agreement-page :deep(.van-nav-bar--fixed) {
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
  max-width: var(--page-max-width);
}

.agreement-body {
  padding: 20px 16px 40px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.doc-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 12px;
}

.doc-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  font-size: 12px;
  color: #969799;
  margin-bottom: 20px;
}

.doc-content {
  font-size: 14px;
  line-height: 1.9;
  color: #323233;
  /* 保留管理端提交的换行与段落格式 */
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
