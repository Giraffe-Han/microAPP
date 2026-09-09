<template>
  <view class="acct-page">
    <!-- 提交成功 -->
    <view v-if="submitted" class="acct-result">
      <text class="result-icon">✓</text>
      <view class="result-title">提交成功</view>
      <view class="result-desc">
        我们已收到您的{{ isCancel ? '注销' : '找回' }}申请，会尽快为您处理，请留意后续通知。
      </view>
      <button class="result-btn" type="primary" @tap="goHome">返回首页</button>
    </view>

    <!-- 申请表单 -->
    <view v-else class="acct-body">
      <view class="acct-tip">
        {{ isCancel
          ? '提交注销申请后，您的账号及相关数据将被处理，请谨慎操作。'
          : '请填写您的注册信息，便于我们核实并协助您找回账号。' }}
      </view>

      <view class="form-box">
        <view class="input-item">
          <text class="label">注册手机号</text>
          <input class="input" type="number" maxlength="11" v-model="form.phone" placeholder="请输入注册时的手机号" />
        </view>

        <view class="input-item" v-if="!isCancel">
          <text class="label">姓名</text>
          <input class="input" v-model="form.name" placeholder="请输入您的姓名（选填）" />
        </view>

        <view class="input-item" v-if="!isCancel">
          <text class="label">联系方式</text>
          <input class="input" v-model="form.contact" placeholder="可接收通知的手机号 / 邮箱（选填）" />
        </view>

        <view class="textarea-item">
          <text class="label">{{ isCancel ? '注销原因' : '问题描述' }}</text>
          <textarea
            class="textarea"
            v-model="form.reason"
            maxlength="200"
            :placeholder="isCancel ? '请简要说明注销原因（选填）' : '请简要描述您遇到的问题（选填）'"
          />
        </view>

        <view v-if="isCancel" class="confirm-row" @tap="confirmed = !confirmed">
          <view class="checkbox" :class="{ checked: confirmed }">
            <text v-if="confirmed" class="check-mark">✓</text>
          </view>
          <text class="confirm-text">我已知晓账号注销后相关数据将被删除且不可恢复</text>
        </view>

        <button class="submit-btn" type="primary" @tap="onSubmit" :loading="loading">提交申请</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { request, getStoredUser } from '../../utils/request'

// 申请类型：recovery=账号找回，cancellation=账号注销
const type = ref('recovery')
const isCancel = computed(() => type.value === 'cancellation')

const loading = ref(false)
const submitted = ref(false)
const confirmed = ref(false)
const form = ref({ phone: '', name: '', contact: '', reason: '' })

onLoad((options) => {
  type.value = options && options.type === 'cancellation' ? 'cancellation' : 'recovery'
  uni.setNavigationBarTitle({ title: isCancel.value ? '账号注销' : '账号找回' })
  // 已登录时预填注册信息，方便用户提交
  const cached = getStoredUser()
  if (cached) {
    form.value.phone = cached.phone || ''
    form.value.name = cached.name || ''
  }
})

const goHome = () => {
  uni.switchTab({ url: '/pages/home/index' })
}

const onSubmit = async () => {
  const phone = String(form.value.phone || '').trim()
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    uni.showToast({ title: '请填写正确的注册手机号', icon: 'none' })
    return
  }
  if (isCancel.value && !confirmed.value) {
    uni.showToast({ title: '请先确认知晓注销后果', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await request({
      url: '/api/account-requests',
      method: 'POST',
      data: {
        type: type.value,
        phone,
        name: form.value.name,
        contact: form.value.contact,
        reason: form.value.reason
      }
    })
    if (!res?.success) {
      throw new Error(res?.message || '提交失败')
    }
    submitted.value = true
  } catch (error) {
    const msg = error?.data?.message || error?.message || '提交失败，请稍后重试'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.acct-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 16px;
  box-sizing: border-box;
}

.acct-tip {
  padding: 12px;
  border-radius: 8px;
  background: #eef3ff;
  color: #3a5bbf;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.form-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.input-item {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 14px 16px;
  border-radius: 12px;
}

.label {
  width: 84px;
  font-size: 15px;
  color: #323233;
  flex-shrink: 0;
}

.input {
  flex: 1;
  font-size: 15px;
}

.textarea-item {
  background: #fff;
  padding: 14px 16px;
  border-radius: 12px;
}

.textarea {
  width: 100%;
  min-height: 80px;
  font-size: 15px;
  margin-top: 8px;
  box-sizing: border-box;
}

.confirm-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid #c8c9cc;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.checkbox.checked {
  background: #667eea;
  border-color: #667eea;
}

.check-mark {
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.confirm-text {
  flex: 1;
  font-size: 13px;
  color: #646566;
  line-height: 1.5;
}

.submit-btn {
  margin-top: 8px;
  height: 48px;
  line-height: 48px;
  border-radius: 24px;
  background-color: #667eea !important;
  font-size: 17px;
  font-weight: bold;
}

.acct-result {
  padding: 80px 16px 0;
  text-align: center;
}

.result-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: #07c160;
  color: #fff;
  font-size: 30px;
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
  height: 44px;
  line-height: 44px;
  border-radius: 22px;
  background-color: #667eea !important;
  font-size: 16px;
}
</style>
