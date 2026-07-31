<template>
  <div class="certification-list">
    <DataToolbar>
      <template #filters>
        <van-dropdown-menu>
          <van-dropdown-item v-model="filters.status" :options="statusOptions" @change="fetchList" />
        </van-dropdown-menu>
        <van-search v-model="filters.keyword" placeholder="搜索姓名/手机号" show-action @search="fetchList" @clear="fetchList" style="flex:1; padding:0;">
          <template #action>
            <span @click="fetchList">搜索</span>
          </template>
        </van-search>
      </template>
      <template #actions>
        <van-button type="primary" size="small" icon="add-o" @click="openImport">批量导入</van-button>
        <van-button type="default" size="small" icon="replay" @click="fetchList">刷新</van-button>
      </template>
    </DataToolbar>

    <!-- 统计 -->
    <div class="stats-row">
      <div class="stat-card pending">
        <span class="stat-value">{{ stats.pending }}</span>
        <span class="stat-label">待审核</span>
      </div>
      <div class="stat-card approved">
        <span class="stat-value">{{ stats.approved }}</span>
        <span class="stat-label">已通过</span>
      </div>
      <div class="stat-card rejected">
        <span class="stat-value">{{ stats.rejected }}</span>
        <span class="stat-label">已驳回</span>
      </div>
    </div>

    <!-- 列表 -->
    <van-empty v-if="!loading && list.length === 0" description="暂无认证申请" />

    <van-cell-group v-for="item in list" :key="item.id" inset style="margin-bottom: 12px; border-radius: 10px;">
      <van-cell :border="false" is-link @click="showDetail(item)">
        <template #title>
          <div class="cert-header">
            <span class="cert-name">{{ item.real_name }}</span>
            <van-tag :type="getStatusType(item.status)" size="medium">{{ getStatusLabel(item.status) }}</van-tag>
          </div>
        </template>
        <template #label>
          <div class="cert-info">
            <span>{{ item.phone }}</span>
            <span>{{ item.organization || '-' }}</span>
            <span>{{ formatTime(item.created_at) }}</span>
          </div>
          <div v-if="item.status === 'rejected' && item.reject_reason" class="reject-reason">
            驳回原因：{{ item.reject_reason }}
          </div>
        </template>
      </van-cell>
      <van-cell v-if="item.status === 'pending'" :border="false">
        <template #title>
          <div class="cert-actions">
            <van-button type="success" size="small" @click="handleApprove(item)">通过</van-button>
            <van-button type="danger" size="small" plain @click="handleReject(item)">驳回</van-button>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="detailVisible" position="bottom" :style="{ height: '80%' }" round>
      <div class="detail-popup" v-if="currentItem">
        <div class="detail-header">
          <h3>认证详情</h3>
          <van-tag :type="getStatusType(currentItem.status)" size="large">{{ getStatusLabel(currentItem.status) }}</van-tag>
        </div>

        <van-cell-group title="申请人信息" inset>
          <van-cell title="真实姓名" :value="currentItem.real_name" />
          <van-cell title="手机号" :value="currentItem.phone" />
          <van-cell title="机构类型" :value="currentItem.org_type || '-'" />
          <van-cell title="所属机构" :value="currentItem.org_name || currentItem.organization || '-'" />
          <van-cell title="职务" :value="currentItem.position || '-'" />
          <van-cell title="申请时间" :value="formatTime(currentItem.created_at)" />
        </van-cell-group>

        <van-cell-group title="审核信息" inset v-if="currentItem.status !== 'pending'">
          <van-cell title="审核结果" :value="getStatusLabel(currentItem.status)" />
          <van-cell title="审核时间" :value="formatTime(currentItem.reviewed_at)" />
          <van-cell v-if="currentItem.reject_reason" title="驳回原因" :value="currentItem.reject_reason" />
        </van-cell-group>

        <div class="detail-actions" v-if="currentItem.status === 'pending'">
          <van-button type="success" block @click="handleApprove(currentItem); detailVisible = false;">通过认证</van-button>
          <van-button type="danger" block plain style="margin-top: 10px;" @click="handleReject(currentItem); detailVisible = false;">驳回认证</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 驳回原因弹窗 -->
    <van-dialog v-model:show="rejectVisible" title="驳回认证" show-cancel-button @confirm="confirmReject">
      <van-field v-model="rejectReason" type="textarea" rows="3" placeholder="请输入驳回原因（将展示给用户）" style="margin: 16px;" :rules="[{ required: true, message: '请填写驳回原因' }]" />
    </van-dialog>

    <!-- 批量导入弹窗 -->
    <van-popup v-model:show="importVisible" position="bottom" :style="{ height: '80%' }" round>
      <div class="import-popup">
        <div class="import-header">
          <h3>批量导入认证人员</h3>
        </div>

        <div class="import-tips">
          <p>1. 点击下方按钮下载 CSV 模板；</p>
          <p>2. 按模板列填写（姓名、手机号必填），保存为 CSV(逗号分隔)；</p>
          <p>3. 选择填好的文件并确认导入。导入的人员默认状态为「已通过」。</p>
        </div>

        <div class="import-btns">
          <van-button type="default" icon="down" size="small" @click="downloadTemplate">下载模板</van-button>
          <van-button type="primary" icon="plus" size="small" @click="triggerFile">选择文件</van-button>
          <input ref="fileInput" type="file" accept=".csv,text/csv" style="display:none" @change="onFileChange" />
        </div>

        <div v-if="parsedRows.length" class="import-preview">
          <div class="preview-title">已解析 {{ parsedRows.length }} 条记录（预览前 5 条）</div>
          <van-cell-group inset>
            <van-cell v-for="(row, i) in parsedRows.slice(0, 5)" :key="i" :title="row.real_name || '(缺姓名)'" :label="`${row.phone || '(缺手机号)'} ${row.org_name || ''}`" />
          </van-cell-group>
        </div>

        <div v-if="importResult" class="import-result">
          <van-cell-group inset>
            <van-cell title="成功导入" :value="importResult.created + ' 条'" />
            <van-cell title="已存在跳过" :value="importResult.skipped + ' 条'" />
            <van-cell title="失败" :value="importResult.failed.length + ' 条'" />
          </van-cell-group>
          <div v-if="importResult.failed.length" class="fail-list">
            <div v-for="(f, i) in importResult.failed" :key="i" class="fail-item">第{{ f.row }}行 {{ f.phone || '' }}：{{ f.reason }}</div>
          </div>
        </div>

        <div class="import-actions">
          <van-button type="primary" block :loading="importing" :disabled="!parsedRows.length" @click="confirmImport">
            确认导入{{ parsedRows.length ? `（${parsedRows.length}条）` : '' }}
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { showSuccessToast, showFailToast, showImagePreview } from 'vant'
import axios from '@/utils/http'
import DataToolbar from '../components/DataToolbar.vue'

const statusOptions = [
  { text: '全部状态', value: '' },
  { text: '待审核', value: 'pending' },
  { text: '已通过', value: 'approved' },
  { text: '已驳回', value: 'rejected' }
]

const statusMap = { pending: '待审核', approved: '已通过', rejected: '已驳回' }
const statusTypeMap = { pending: 'warning', approved: 'success', rejected: 'danger' }

const filters = reactive({ status: '', keyword: '' })
const list = ref([])
const loading = ref(false)
const stats = reactive({ pending: 0, approved: 0, rejected: 0 })

const detailVisible = ref(false)
const currentItem = ref(null)
const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectItemId = ref(null)

// 批量导入
const importVisible = ref(false)
const importing = ref(false)
const fileInput = ref(null)
const parsedRows = ref([])
const importResult = ref(null)

// 模板列定义：表头 -> 字段
const TEMPLATE_HEADERS = ['姓名', '手机号', '机构类型', '所属机构', '机构地址', '职务']
const HEADER_FIELD_MAP = {
  '姓名': 'real_name',
  '手机号': 'phone',
  '机构类型': 'org_type',
  '所属机构': 'org_name',
  '机构地址': 'org_address',
  '职务': 'position'
}

const openImport = () => {
  parsedRows.value = []
  importResult.value = null
  importVisible.value = true
}

const downloadTemplate = () => {
  const sample = '张三,13800138000,医院,示例市第一人民医院,示例市示例路1号,主治医师'
  // 加 BOM 保证 Excel 打开中文不乱码
  const content = '\uFEFF' + TEMPLATE_HEADERS.join(',') + '\n' + sample + '\n'
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '认证人员导入模板.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const triggerFile = () => {
  fileInput.value && fileInput.value.click()
}

// 简单 CSV 解析（支持双引号包裹的字段）
const parseCsvLine = (line) => {
  const result = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else { cur += ch }
    } else {
      if (ch === '"') inQuotes = true
      else if (ch === ',') { result.push(cur); cur = '' }
      else cur += ch
    }
  }
  result.push(cur)
  return result.map(s => s.trim())
}

const onFileChange = (e) => {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  importResult.value = null
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      let text = ev.target.result || ''
      text = text.replace(/^\uFEFF/, '')
      const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim() !== '')
      if (lines.length < 2) {
        showFailToast('文件内容为空或缺少数据行')
        return
      }
      const headers = parseCsvLine(lines[0])
      const fields = headers.map(h => HEADER_FIELD_MAP[h] || null)
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i])
        const row = {}
        fields.forEach((f, ci) => { if (f) row[f] = cols[ci] || '' })
        if (row.real_name || row.phone) rows.push(row)
      }
      if (!rows.length) {
        showFailToast('未解析到有效数据，请检查模板格式')
        return
      }
      parsedRows.value = rows
      showSuccessToast(`已解析 ${rows.length} 条`)
    } catch (err) {
      showFailToast('文件解析失败，请使用标准模板')
    } finally {
      e.target.value = ''
    }
  }
  reader.onerror = () => showFailToast('文件读取失败')
  reader.readAsText(file, 'UTF-8')
}

const confirmImport = async () => {
  if (!parsedRows.value.length) return
  importing.value = true
  try {
    const res = await axios.post('/api/medical/certifications/import', { items: parsedRows.value })
    if (res.data?.success) {
      importResult.value = res.data.data
      showSuccessToast(`导入完成，成功 ${res.data.data.created} 条`)
      parsedRows.value = []
      fetchList()
    } else {
      showFailToast(res.data?.message || '导入失败')
    }
  } catch (err) {
    showFailToast(err.response?.data?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

const getStatusLabel = (status) => statusMap[status] || status
const getStatusType = (status) => statusTypeMap[status] || 'default'

const formatTime = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const fetchList = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.keyword) params.keyword = filters.keyword
    const res = await axios.get('/api/medical/certifications', { params })
    if (res.data?.success) {
      list.value = res.data.data || []
      computeStats()
    }
  } catch (err) {
    showFailToast('获取认证列表失败')
  } finally {
    loading.value = false
  }
}

const computeStats = () => {
  stats.pending = list.value.filter(i => i.status === 'pending').length
  stats.approved = list.value.filter(i => i.status === 'approved').length
  stats.rejected = list.value.filter(i => i.status === 'rejected').length
}

const showDetail = (item) => {
  currentItem.value = item
  detailVisible.value = true
}

const previewImage = (url) => {
  showImagePreview({ images: [url], closeable: true })
}

const handleApprove = async (item) => {
  try {
    const res = await axios.post(`/api/medical/certifications/${item.id}/approve`)
    if (res.data?.success) {
      showSuccessToast('已通过认证')
      fetchList()
    } else {
      showFailToast(res.data?.message || '操作失败')
    }
  } catch (err) {
    showFailToast('操作失败')
  }
}

const handleReject = (item) => {
  rejectItemId.value = item.id
  rejectReason.value = ''
  rejectVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    showFailToast('请填写驳回原因')
    return
  }
  try {
    const res = await axios.post(`/api/medical/certifications/${rejectItemId.value}/reject`, { reason: rejectReason.value })
    if (res.data?.success) {
      showSuccessToast('已驳回')
      fetchList()
    } else {
      showFailToast(res.data?.message || '操作失败')
    }
  } catch (err) {
    showFailToast('操作失败')
  }
}

onMounted(fetchList)
</script>

<style scoped>
.certification-list {
  padding-bottom: 20px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.stat-card.pending .stat-value { color: #ff9f0a; }
.stat-card.approved .stat-value { color: #34c759; }
.stat-card.rejected .stat-value { color: #ff3b30; }

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-top: 4px;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cert-name {
  font-weight: 600;
  font-size: 15px;
}

.cert-info {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary, #86868b);
  margin-top: 4px;
}

.reject-reason {
  margin-top: 6px;
  font-size: 12px;
  color: #ff3b30;
  background: #fff2f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.cert-actions {
  display: flex;
  gap: 8px;
}

.detail-popup {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
}

.id-card-images {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.id-card-img p {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--text-secondary, #86868b);
}

.detail-actions {
  margin-top: 20px;
  padding-bottom: 30px;
}

.import-popup {
  padding: 20px;
  overflow-y: auto;
  height: 100%;
}

.import-header h3 {
  margin: 0 0 12px;
  font-size: 18px;
}

.import-tips {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  font-size: 13px;
  color: var(--text-secondary, #86868b);
  line-height: 1.7;
}

.import-tips p {
  margin: 0;
}

.import-btns {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.import-preview {
  margin-bottom: 16px;
}

.preview-title {
  font-size: 13px;
  color: var(--text-secondary, #86868b);
  margin-bottom: 8px;
}

.import-result {
  margin-bottom: 16px;
}

.fail-list {
  margin-top: 10px;
  background: #fff2f0;
  border-radius: 8px;
  padding: 10px 12px;
}

.fail-item {
  font-size: 12px;
  color: #ff3b30;
  line-height: 1.6;
}

.import-actions {
  padding-bottom: 30px;
}
</style>
