<template>
  <div class="acct-page">
    <van-nav-bar
      :title="isCancel ? '账号注销' : '账号找回'"
      left-arrow
      @click-left="onBack"
    />

    <!-- 提交成功 -->
    <div v-if="submitted" class="acct-result">
      <van-icon name="checked" size="56" color="#07c160" />
      <div class="result-title">提交成功</div>
      <div class="result-desc">
        我们已收到您的{{ isCancel ? '注销' : '找回' }}申请，会尽快为您处理，请留意后续通知。
      </div>
      <van-button round block type="primary" class="result-btn" @click="goHome">返回首页</van-button>
    </div>

    <!-- 申请表单 -->
    <div v-else class="acct-body">
      <div class="acct-tip">
        {{ isCancel
          ? '提交注销申请后，您的账号及相关数据将被处理，请谨慎操作。'
          : '请填写您的注册信息，便于我们核实并协助您找回账号。' }}
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="注册手机号"
            type="tel"
            maxlength="11"
            placeholder="请输入注册时的手机号"
            :rules="[
              { required: true, message: '请填写注册手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]"
          />
          <van-field
            v-if="!isCancel"
            v-model="form.name"
            name="name"
            label="姓名"
            placeholder="请输入您的姓名（选填）"
          />
          <van-field
            v-if="!isCancel"
            v-model="form.contact"
            name="contact"
            label="联系方式"
            placeholder="可接收通知的手机号 / 邮箱（选填）"
          />
          <van-field
            v-model="form.reason"
            :label="isCancel ? '注销原因' : '问题描述'"
            type="textarea"
            rows="3"
            autosize
            maxlength="200"
            show-word-limit
            :placeholder="isCancel ? '请简要说明注销原因（选填）' : '请简要描述您遇到的问题（选填）'"
          />
        </van-cell-group>

        <div v-if="isCancel" class="acct-confirm">
          <van-checkbox v-model="confirmed" shape="square" icon-size="16px">
            <span class="confirm-text">我已知晓账号注销后相关数据将被删除且不可恢复</span>
          </van-checkbox>
        </div>

        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="submit" :loading="loading">
            提交申请
          </van-button>
        </div>
      </van-form>
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

// 申请类型：recovery=账号找回，cancellation=账号注销
const type = computed(() => (route.params.type === 'cancellation' ? 'cancellation' : 'recovery'))
const isCancel = computed(() => type.value === 'cancellation')

const loading = ref(false)
const submitted = ref(false)
const confirmed = ref(false)
const form = ref({ phone: '', name: '', contact: '', reason: '' })

onMounted(() => {
  // 已登录时预填注册信息，方便用户提交
  try {
    const cached = JSON.parse(localStorage.getItem('user') || 'null')
    if (cached) {
      form.value.phone = cached.phone || ''
      form.value.name = cached.name || ''
    }
  } catch (e) { /* ignore */ }
})

const goHome = () => router.replace('/home')

const onSubmit = async () => {
  if (isCancel.value && !confirmed.value) {
    showFailToast('请先确认知晓注销后果')
    return
  }
  loading.value = true
  try {
    const res = await axios.post('/api/account-requests', {
      type: type.value,
      phone: form.value.phone,
      name: form.value.name,
      contact: form.value.contact,
      reason: form.value.reason
    })
    if (!res.data?.success) {
      throw new Error(res.data?.message || '提交失败')
    }
    submitted.value = true
  } catch (error) {
    console.error(error)
    showFailToast(error?.response?.data?.message || error?.message || '提交失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.acct-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.acct-body {
  padding-top: 16px;
}

.acct-tip {
  margin: 0 16px 16px;
  padding: 12px;
  border-radius: 8px;
  background: #eef3ff;
  color: #3a5bbf;
  font-size: 13px;
  line-height: 1.6;
}

.acct-confirm {
  margin: 16px 16px 0;
}

.confirm-text {
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
}

.acct-result {
  padding: 80px 32px 0;
  text-align: center;
}

.result-title {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.result-desc {
  margin-top: 12px;
  font-size: 14px;
  color: #86868b;
  line-height: 1.7;
}

.result-btn {
  margin-top: 32px;
}
</style>
