<template>
  <div class="acct-admin">
    <div class="toolbar">
      <div class="page-title">账号找回 / 注销申请</div>
      <van-button size="small" icon="replay" @click="fetchList">刷新</van-button>
    </div>

    <van-dropdown-menu class="filters">
      <van-dropdown-item v-model="filterType" :options="typeOptions" @change="fetchList" />
      <van-dropdown-item v-model="filterStatus" :options="statusOptions" @change="fetchList" />
    </van-dropdown-menu>

    <van-empty v-if="!loading && !requests.length" description="暂无申请" />

    <div v-else class="list">
      <div v-for="r in requests" :key="r.id" class="card">
        <div class="card-head">
          <van-tag :type="r.type === 'cancellation' ? 'danger' : 'primary'" plain>
            {{ r.type === 'cancellation' ? '账号注销' : '账号找回' }}
          </van-tag>
          <van-tag :type="statusTagType(r.status)">{{ statusLabel(r.status) }}</van-tag>
          <span class="time">{{ formatTime(r.createdAt) }}</span>
        </div>

        <div class="card-body">
          <div class="row"><span class="k">注册手机号</span><span class="v">{{ r.phone || '-' }}</span></div>
          <div class="row" v-if="r.name"><span class="k">姓名</span><span class="v">{{ r.name }}</span></div>
          <div class="row" v-if="r.contact"><span class="k">联系方式</span><span class="v">{{ r.contact }}</span></div>
          <div class="row" v-if="r.reason">
            <span class="k">{{ r.type === 'cancellation' ? '注销原因' : '问题描述' }}</span>
            <span class="v">{{ r.reason }}</span>
          </div>
          <div class="row" v-if="r.handledAt"><span class="k">处理时间</span><span class="v">{{ formatTime(r.handledAt) }}</span></div>
        </div>

        <div class="card-foot">
          <van-field
            v-model="r.remark"
            class="remark"
            type="textarea"
            rows="1"
            autosize
            maxlength="200"
            placeholder="处理备注（选填）"
          />
          <div class="actions">
            <van-button v-if="r.status !== 'processed'" size="small" type="primary" @click="updateStatus(r, 'processed')">标记已处理</van-button>
            <van-button v-if="r.status !== 'rejected'" size="small" type="danger" plain @click="updateStatus(r, 'rejected')">驳回</van-button>
            <van-button v-if="r.status !== 'pending'" size="small" plain @click="updateStatus(r, 'pending')">重新打开</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showFailToast, showSuccessToast, showConfirmDialog } from 'vant'
import axios from '@/utils/http'

const loading = ref(false)
const requests = ref([])
const filterType = ref('')
const filterStatus = ref('')

const typeOptions = [
  { text: '全部类型', value: '' },
  { text: '账号找回', value: 'recovery' },
  { text: '账号注销', value: 'cancellation' }
]
const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待处理', value: 'pending' },
  { text: '已处理', value: 'processed' },
  { text: '已驳回', value: 'rejected' }
]

const statusLabel = (s) => ({ pending: '待处理', processed: '已处理', rejected: '已驳回' }[s] || s)
const statusTagType = (s) => ({ pending: 'warning', processed: 'success', rejected: 'default' }[s] || 'default')

const formatTime = (iso) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {}
    if (filterType.value) params.type = filterType.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await axios.get('/api/admin/account-requests', { params })
    requests.value = Array.isArray(res.data?.data) ? res.data.data : []
  } catch (e) {
    showFailToast(e?.response?.data?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (r, status) => {
  try {
    await showConfirmDialog({ title: '确认操作', message: `将该申请标记为「${statusLabel(status)}」？` })
  } catch {
    return
  }
  try {
    const res = await axios.put(`/api/admin/account-requests/${r.id}`, { status, remark: r.remark || '' })
    if (!res.data?.success) throw new Error(res.data?.message || '操作失败')
    showSuccessToast('已更新')
    fetchList()
  } catch (e) {
    showFailToast(e?.response?.data?.message || e?.message || '操作失败')
  }
}

onMounted(fetchList)
</script>

<style scoped>
.acct-admin {
  padding-bottom: 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
}

.filters {
  margin-bottom: 12px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 14px 16px;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.card-head .time {
  margin-left: auto;
  font-size: 12px;
  color: #969799;
}

.card-body .row {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.8;
}

.card-body .k {
  color: #969799;
  flex-shrink: 0;
  width: 72px;
}

.card-body .v {
  color: #323233;
  word-break: break-all;
}

.card-foot {
  margin-top: 12px;
  border-top: 1px solid #f2f3f5;
  padding-top: 12px;
}

.remark {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 4px 8px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
</style>
