<template>
  <div class="config-page">
    <DataToolbar>
      <template #filters>
        <span class="toolbar-label">系统设置</span>
      </template>
      <template #actions>
        <van-button type="default" size="small" icon="replay" @click="fetchSettings">刷新</van-button>
      </template>
    </DataToolbar>

    <van-cell-group inset title="登录方式管理" style="margin-bottom: 12px; border-radius: var(--card-radius);">
      <van-cell title="微信授权登录" label="关闭后登录页将隐藏微信登录按钮，接口保留">
        <template #right-icon>
          <van-switch
            :model-value="settings.enableWechatLogin"
            @update:model-value="v => toggleSetting('enableWechatLogin', v)"
            size="22"
          />
        </template>
      </van-cell>
      <van-cell title="畅行温州SSO登录" label="关闭后登录页将隐藏畅行温州自动登录提示，接口保留">
        <template #right-icon>
          <van-switch
            :model-value="settings.enableSsoLogin"
            @update:model-value="v => toggleSetting('enableSsoLogin', v)"
            size="22"
          />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset title="协议管理（登录/注册明示勾选）" style="margin-bottom: 12px; border-radius: var(--card-radius);">
      <div class="agreement-note">
        协议正文暂未拟定时，前端展示预埋占位内容；正式文本在此填写并保存后即时生效。
      </div>

      <div class="agreement-editor">
        <div class="agreement-editor-head">
          <span class="agreement-name">《用户协议》</span>
          <van-field
            v-model="agreements.user.version"
            label="版本号"
            placeholder="选填，如 v1.0.0"
            class="version-field"
          />
        </div>
        <van-field
          v-model="agreements.user.content"
          type="textarea"
          rows="6"
          autosize
          placeholder="请输入《用户协议》正文"
        />
        <div class="agreement-actions">
          <span class="updated-at" v-if="agreements.user.updatedAt">更新于 {{ formatTime(agreements.user.updatedAt) }}</span>
          <van-button type="primary" size="small" :loading="saving.user" @click="saveAgreement('user')">保存</van-button>
        </div>
      </div>

      <div class="agreement-editor">
        <div class="agreement-editor-head">
          <span class="agreement-name">《隐私政策》</span>
          <van-field
            v-model="agreements.privacy.version"
            label="版本号"
            placeholder="选填，如 v1.0.0"
            class="version-field"
          />
        </div>
        <van-field
          v-model="agreements.privacy.content"
          type="textarea"
          rows="6"
          autosize
          placeholder="请输入《隐私政策》正文"
        />
        <div class="agreement-actions">
          <span class="updated-at" v-if="agreements.privacy.updatedAt">更新于 {{ formatTime(agreements.privacy.updatedAt) }}</span>
          <van-button type="primary" size="small" :loading="saving.privacy" @click="saveAgreement('privacy')">保存</van-button>
        </div>
      </div>
    </van-cell-group>

    <div class="settings-note">
      <p>提示：关闭登录方式仅隐藏前端入口，后端接口仍保留，后续开发完成后可随时开启。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/http'
import { showFailToast, showSuccessToast } from 'vant'
import DataToolbar from '../components/DataToolbar.vue'

const settings = ref({
  enableWechatLogin: true,
  enableSsoLogin: true
})

const agreements = ref({
  user: { title: '用户协议', content: '', version: '', updatedAt: '' },
  privacy: { title: '隐私政策', content: '', version: '', updatedAt: '' }
})

const saving = ref({ user: false, privacy: false })

const formatTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('zh-CN', { hour12: false })
}

const fetchSettings = async () => {
  try {
    const res = await axios.get('/api/admin/system-settings')
    if (res.data?.success) {
      settings.value = res.data.data
    }
  } catch (e) {
    showFailToast('获取系统设置失败')
  }
}

const fetchAgreements = async () => {
  try {
    const res = await axios.get('/api/admin/agreements')
    if (res.data?.success && res.data.data) {
      agreements.value = res.data.data
    }
  } catch (e) {
    showFailToast('获取协议内容失败')
  }
}

const saveAgreement = async (type) => {
  saving.value[type] = true
  try {
    const item = agreements.value[type] || {}
    const res = await axios.post('/api/admin/agreements', {
      type,
      content: item.content || '',
      version: item.version || ''
    })
    if (res.data?.success) {
      showSuccessToast('协议内容已保存')
      await fetchAgreements()
    } else {
      showFailToast(res.data?.message || '保存失败')
    }
  } catch (e) {
    showFailToast(e?.response?.data?.message || '保存失败')
  } finally {
    saving.value[type] = false
  }
}

const toggleSetting = async (key, value) => {
  try {
    const payload = { [key]: value }
    const res = await axios.post('/api/admin/system-settings', payload)
    if (res.data?.success) {
      settings.value[key] = value
      showSuccessToast('设置已更新')
    } else {
      showFailToast(res.data?.message || '更新失败')
    }
  } catch (e) {
    showFailToast('更新设置失败')
  }
}

onMounted(() => {
  fetchSettings()
  fetchAgreements()
})
</script>

<style scoped>
.config-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-note {
  margin: 16px;
  padding: 12px 16px;
  background: #fffbe6;
  border-radius: 8px;
  border: 1px solid #ffe58f;
}

.settings-note p {
  margin: 0;
  font-size: 13px;
  color: #8c6e00;
  line-height: 1.5;
}

.agreement-note {
  margin: 12px 16px;
  font-size: 12px;
  color: var(--text-secondary, #969799);
  line-height: 1.6;
}

.agreement-editor {
  padding: 8px 16px 16px;
  border-top: 1px solid #f2f3f5;
}

.agreement-editor-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.agreement-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color, #323233);
  flex-shrink: 0;
}

.version-field {
  flex: 1;
  padding: 4px 8px;
  background: #f7f8fa;
  border-radius: 6px;
}

.agreement-editor :deep(.van-field) {
  background: #f7f8fa;
  border-radius: 8px;
}

.agreement-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.updated-at {
  font-size: 12px;
  color: var(--text-secondary, #969799);
}
</style>
