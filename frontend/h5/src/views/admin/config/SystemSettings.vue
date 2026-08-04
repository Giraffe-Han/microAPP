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
</style>
