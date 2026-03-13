<template>
  <div class="config-page">
    <DataToolbar>
      <template #filters>
        <span class="toolbar-label">服务配置</span>
      </template>
      <template #actions>
        <van-button type="default" size="small" icon="replay" @click="fetchAllServiceConfigs">刷新配置</van-button>
      </template>
    </DataToolbar>

    <van-cell-group inset title="首页配置" style="margin-bottom: 12px; border-radius: var(--card-radius);">
      <van-cell
        title="首页背景图 & 轮播消息"
        :label="(homeConfig?.headerImage ? '背景图已配置' : '背景图未配置') + '  ·  ' + (homeConfig?.notices?.length || 0) + ' 条轮播消息'"
        is-link
        @click="editHomeConfig"
      />
    </van-cell-group>

    <van-cell-group inset title="选择要编辑的服务" style="border-radius: var(--card-radius);">
      <van-cell
        v-for="[id, cfg] in serviceConfigEntries"
        :key="id"
        :title="cfg.name"
        :label="cfg.slogan"
        is-link
        @click="editServiceConfig(id)"
      />
    </van-cell-group>

    <!-- Service Config Edit Popup -->
    <van-popup :show="showServiceEditPopup" @update:show="v => showServiceEditPopup = v" position="bottom" :style="{ height: '90%' }" round>
      <div class="detail-content" v-if="editingService">
        <van-nav-bar
          :title="'编辑 - ' + editingService.name"
          left-text="取消"
          right-text="保存"
          @click-left="showServiceEditPopup = false"
          @click-right="saveServiceConfig"
        />
        <div style="padding-bottom: 40px;">
          <van-cell-group title="基本信息">
            <van-field v-model="editingService.name" label="服务名称" placeholder="请输入名称" />
            <van-field v-model="editingService.slogan" label="口号/标语" placeholder="请输入标语" />
            <van-field v-model="editingService.intro" label="服务介绍" type="textarea" rows="3" placeholder="请输入介绍" />
            <van-field v-model="editingService.mainColor" label="主题色" placeholder="例如 #1677ff" />
            <van-field v-model="editingService.contactPhone" label="联系电话" placeholder="主要联系电话" />
            <van-field v-model="editingService.contactPhone2" label="咨询热线" placeholder="第二个联系电话（可选）" />
            <van-field v-model="editingService.address" label="联系地址" type="textarea" rows="2" placeholder="请输入公司地址" />
          </van-cell-group>

          <van-cell-group title="背景图/图标">
            <van-field v-model="editingService.headerImage" label="背景图URL" placeholder="研学展示用" />
            <van-field name="headerImagePosition" label="图片对齐">
              <template #input>
                <van-radio-group v-model="editingService.headerImagePosition" direction="horizontal">
                  <van-radio name="top">顶部</van-radio>
                  <van-radio name="center">居中</van-radio>
                  <van-radio name="bottom">底部</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field label="选区预览">
              <template #input>
                <div v-if="editingService.headerImage" class="aspect-preview-container">
                  <div class="aspect-label">Banner 选区 (5:3)</div>
                  <div class="preview-box banner-box" :class="'pos-' + (editingService.headerImagePosition || 'center')">
                    <img :src="normalizeMediaUrl(editingService.headerImage)" />
                    <div class="safe-area-marker">页面文字显示区</div>
                  </div>
                </div>
                <div v-else style="color: var(--text-secondary); font-size: 12px;">上传后可查看页面实际选区</div>
              </template>
            </van-field>
            <van-field label="上传背景图">
              <template #input>
                <van-uploader :after-read="file => onReadServiceFile(file, 'headerImage')" max-count="1">
                  <van-button icon="plus" size="small" type="primary" plain>点击上传海报图</van-button>
                </van-uploader>
              </template>
            </van-field>
            <van-field v-model="editingService.icon" label="图标名称/URL" placeholder="Vant图标或SVG路径" />
          </van-cell-group>

          <van-cell-group title="服务项目">
            <div v-for="(p, idx) in editingService.projects" :key="idx" style="padding: 10px; border-bottom: 1px solid #f7f8fa; display: flex; align-items: center; gap: 10px;">
              <van-field v-model="p.name" label="项目名" dense style="flex: 1;" />
              <van-field v-model="p.icon" label="图标" dense style="width: 100px;" />
              <van-button size="mini" type="danger" icon="cross" @click="editingService.projects.splice(idx, 1)" />
            </div>
            <div style="padding: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="editingService.projects.push({name:'', icon:''})">添加项目</van-button>
            </div>
          </van-cell-group>

          <van-cell-group title="服务优势">
            <div v-for="(adv, idx) in editingService.advantages" :key="idx" style="padding: 5px 10px; display: flex; align-items: center; gap: 10px;">
              <van-field v-model="editingService.advantages[idx]" dense style="flex: 1;" />
              <van-button size="mini" type="danger" icon="cross" @click="editingService.advantages.splice(idx, 1)" />
            </div>
            <div style="padding: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="editingService.advantages.push('')">添加优势</van-button>
            </div>
          </van-cell-group>

          <!-- 研学专属：课程安排 -->
          <van-cell-group title="课程安排 (仅研学有效)" v-if="editingServiceId === '9'">
            <van-field v-model="editingService.studyPrice" label="统一票价" placeholder="例如 198元/人" />
            <div v-for="(step, idx) in editingService.courseSchedule" :key="idx" style="padding: 10px; border-bottom: 1px solid #f7f8fa;">
              <van-field v-model="step.time" label="时间段" placeholder="8:50-9:10" dense />
              <van-field v-model="step.content" label="项目" placeholder="集合签到" dense />
              <van-field v-model="step.remark" label="备注" placeholder="选填" dense />
              <div style="text-align: right; margin-top: 5px;">
                <van-button size="mini" type="danger" @click="editingService.courseSchedule.splice(idx, 1)">删除步骤</van-button>
              </div>
            </div>
            <div style="padding: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="editingService.courseSchedule ? editingService.courseSchedule.push({time:'', content:'', remark:''}) : editingService.courseSchedule = [{time:'', content:'', remark:''}]">添加课程步骤</van-button>
            </div>
          </van-cell-group>

          <!-- 亮点卡片 -->
          <van-cell-group :title="(editingServiceId === '9' ? '研学' : '培训') + '亮点'" v-if="['9', '6'].includes(editingServiceId)">
            <div v-for="(hl, idx) in editingService.highlights" :key="idx" style="padding: 10px; border-bottom: 1px solid #f7f8fa;">
              <van-field v-model="hl.title" label="标题" dense />
              <van-field v-model="hl.desc" label="描述" dense />
              <van-field v-model="hl.icon" label="图标" dense />
              <div style="text-align: right; margin-top: 5px;">
                <van-button size="mini" type="danger" @click="editingService.highlights.splice(idx, 1)">删除</van-button>
              </div>
            </div>
            <div style="padding: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="editingService.highlights.push({title:'', desc:'', icon:''})">添加亮点</van-button>
            </div>
          </van-cell-group>

          <!-- 精彩回顾 -->
          <van-cell-group :title="(editingServiceId === '9' ? '研学' : '培训') + '展示'" v-if="['9', '6'].includes(editingServiceId)">
            <div v-for="(item, idx) in editingService.studyShowcase" :key="idx" style="padding: 10px; border-bottom: 1px solid #f7f8fa;">
              <div style="display:flex; gap:10px; align-items:center; margin-bottom: 10px;">
                <div style="width: 60px; height: 45px; border-radius: 4px; overflow: hidden; background: #f7f8fa; flex: 0 0 60px;">
                  <img v-if="item.image" :src="normalizeMediaUrl(item.image)" style="width: 100%; height: 100%; object-fit: cover;" />
                </div>
                <div style="flex: 1; font-weight: 600; font-size: 14px;">{{ item.title || '未命名回顾' }}</div>
                <van-button size="mini" type="primary" plain @click="innerEditStudyItem(idx)">编辑</van-button>
                <van-button size="mini" type="danger" plain @click="editingService.studyShowcase.splice(idx, 1)">删除</van-button>
              </div>
            </div>
            <div style="padding: 10px; display: flex; gap: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="innerAddStudyItem">添加展示</van-button>
            </div>
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- Study Item Edit Popup -->
    <van-popup :show="showStudyItemEditPopup" @update:show="v => showStudyItemEditPopup = v" position="bottom" :style="{ height: '70%' }" round>
      <div class="detail-content" v-if="studyEditingItem">
        <van-cell-group title="往期回顾内容">
          <van-field v-model="studyEditingItem.title" label="标题" placeholder="请输入标题" />
          <van-field v-model="studyEditingItem.desc" label="描述" type="textarea" rows="2" placeholder="请输入描述" />
          <van-field v-model="studyEditingItem.image" label="图片地址" placeholder="输入URL或上传" />
          <van-field label="上传图片">
            <template #input>
              <van-uploader :after-read="onReadStudyImage" max-count="1" accept="image/*">
                <van-button icon="plus" type="primary" size="small" plain>上传图片</van-button>
              </van-uploader>
            </template>
          </van-field>
          <div v-if="studyEditingItem.image" style="padding: 0 16px 16px;">
            <img :src="normalizeMediaUrl(studyEditingItem.image)" style="width:100%; border-radius: 10px; display:block;" />
          </div>
        </van-cell-group>
        <div style="margin: 16px; padding-bottom: 30px;">
          <van-button round block type="primary" @click="confirmStudyItemEdit">确定</van-button>
        </div>
      </div>
    </van-popup>

    <!-- Home Config Popup -->
    <van-popup :show="showHomeConfigPopup" @update:show="v => showHomeConfigPopup = v" position="bottom" :style="{ height: '70%' }" round>
      <div class="detail-content" v-if="editingHomeConfig">
        <van-nav-bar title="首页配置" left-text="取消" right-text="保存" @click-left="showHomeConfigPopup = false" @click-right="saveHomeConfig" />
        <div style="padding-bottom: 40px;">
          <van-cell-group title="首页背景图">
            <van-field v-model="editingHomeConfig.headerImage" label="图片地址" placeholder="输入URL或上传" />
            <van-field label="上传图片">
              <template #input>
                <van-uploader :after-read="onReadHomeHeaderImage" max-count="1" accept="image/*">
                  <van-button icon="plus" type="primary" size="small" plain>上传图片</van-button>
                </van-uploader>
              </template>
            </van-field>
            <van-field name="headerImagePosition" label="图片焦点">
              <template #input>
                <van-radio-group v-model="editingHomeConfig.headerImagePosition" direction="horizontal">
                  <van-radio name="top">上</van-radio>
                  <van-radio name="center">中</van-radio>
                  <van-radio name="bottom">下</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <div v-if="editingHomeConfig.headerImage" style="padding: 0 16px 16px;">
              <div class="aspect-preview-container">
                <div class="aspect-label">背景预览</div>
                <div
                  class="preview-box"
                  :class="editingHomeConfig.headerImagePosition === 'top' ? 'pos-top' : (editingHomeConfig.headerImagePosition === 'bottom' ? 'pos-bottom' : 'pos-center')"
                  style="height: 200px;"
                >
                  <img :src="normalizeMediaUrl(editingHomeConfig.headerImage)" alt="preview" />
                </div>
              </div>
            </div>
          </van-cell-group>
          <van-cell-group title="轮播消息（首页通知栏）">
            <div v-for="(msg, idx) in editingHomeConfig.notices" :key="idx" style="display: flex; align-items: center; padding: 0 16px;">
              <van-field
                :model-value="msg"
                @update:model-value="v => editingHomeConfig.notices[idx] = v"
                :label="'消息 ' + (idx + 1)"
                placeholder="请输入通知消息"
              />
              <van-button size="mini" type="danger" icon="cross" @click="editingHomeConfig.notices.splice(idx, 1)" style="margin-left: 8px;" />
            </div>
            <div style="padding: 10px;">
              <van-button size="small" type="primary" block plain icon="plus" @click="editingHomeConfig.notices.push('')">添加消息</van-button>
            </div>
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/http'
import { showFailToast, showSuccessToast, showLoadingToast, closeToast } from 'vant'
import DataToolbar from '../components/DataToolbar.vue'
import { normalizeMediaUrl, uploadFile } from '../composables/useMedia'

const DEFAULT_HOME_CONFIG = {
  headerImage: '',
  headerImagePosition: 'center',
  notices: ['交享点无人机外卖配送正式上线', '新开通江心屿无人机外卖配送']
}

const allServiceConfigs = ref({})
const editingServiceId = ref(null)
const editingService = ref(null)
const showServiceEditPopup = ref(false)
const showStudyItemEditPopup = ref(false)
const studyEditingIndex = ref(-1)
const studyEditingItem = ref(null)

const homeConfig = ref(JSON.parse(JSON.stringify(DEFAULT_HOME_CONFIG)))
const editingHomeConfig = ref(JSON.parse(JSON.stringify(DEFAULT_HOME_CONFIG)))
const showHomeConfigPopup = ref(false)

const serviceConfigEntries = computed(() => {
  const entries = Object.entries(allServiceConfigs.value || {}).filter(([id]) => /^\d+$/.test(String(id)))
  entries.sort((a, b) => Number(a[0]) - Number(b[0]))
  return entries
})

const fetchAllServiceConfigs = async () => {
  try {
    const res = await axios.get('/api/services/config')
    allServiceConfigs.value = res.data.data || {}
    homeConfig.value = JSON.parse(JSON.stringify(allServiceConfigs.value._home || DEFAULT_HOME_CONFIG))
  } catch (error) {
    console.error('[ServiceConfig] 获取配置失败', error)
    showFailToast('获取服务配置失败')
  }
}

// --- Home config ---
const editHomeConfig = () => {
  editingHomeConfig.value = JSON.parse(JSON.stringify(homeConfig.value || DEFAULT_HOME_CONFIG))
  if (!Array.isArray(editingHomeConfig.value.notices)) {
    editingHomeConfig.value.notices = [...DEFAULT_HOME_CONFIG.notices]
  }
  showHomeConfigPopup.value = true
}

const onReadHomeHeaderImage = async (file) => {
  showLoadingToast({ message: '上传中...', forbidClick: true })
  const url = await uploadFile(file)
  closeToast()
  if (url && editingHomeConfig.value) {
    editingHomeConfig.value.headerImage = normalizeMediaUrl(url)
    showSuccessToast('背景图已上传')
  }
}

const saveHomeConfig = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })
    const newConfigs = { ...allServiceConfigs.value }
    newConfigs._home = editingHomeConfig.value
    await axios.post('/api/services/config', { config: newConfigs })
    allServiceConfigs.value = newConfigs
    homeConfig.value = JSON.parse(JSON.stringify(editingHomeConfig.value))
    closeToast()
    showSuccessToast('保存成功')
    showHomeConfigPopup.value = false
  } catch (error) {
    closeToast()
    showFailToast('保存失败')
  }
}

// --- Service config ---
const editServiceConfig = (id) => {
  editingServiceId.value = id
  editingService.value = JSON.parse(JSON.stringify(allServiceConfigs.value[id]))
  if (!editingService.value.projects) editingService.value.projects = []
  if (!editingService.value.advantages) editingService.value.advantages = []
  if (['9', '6'].includes(id)) {
    if (!editingService.value.highlights) editingService.value.highlights = []
    if (!editingService.value.studyShowcase) editingService.value.studyShowcase = []
  }
  showServiceEditPopup.value = true
}

const saveServiceConfig = async () => {
  try {
    showLoadingToast({ message: '保存中...', forbidClick: true })
    const newConfigs = { ...allServiceConfigs.value }
    newConfigs[editingServiceId.value] = editingService.value
    await axios.post('/api/services/config', { config: newConfigs })
    allServiceConfigs.value = newConfigs
    closeToast()
    showSuccessToast('保存成功')
    showServiceEditPopup.value = false
  } catch (error) {
    closeToast()
    const status = error?.response?.status
    const msg = error?.response?.data?.message
    console.error('[ServiceConfig] 保存失败', status, msg, error)
    showFailToast(status === 403 ? '无权限，请检查账号角色' : (msg || '保存失败'))
  }
}

const onReadServiceFile = async (file, field) => {
  showLoadingToast({ message: '上传中...', forbidClick: true })
  const url = await uploadFile(file)
  closeToast()
  if (url && editingService.value) {
    // 替换整个对象引用，确保 van-field 等 Vant 组件内部缓存刷新
    editingService.value = { ...editingService.value, [field]: normalizeMediaUrl(url) }
    showSuccessToast('图片已上传')
  }
}

// --- Study showcase editing ---
const innerAddStudyItem = () => {
  studyEditingIndex.value = -1
  studyEditingItem.value = { title: '', desc: '', image: '' }
  showStudyItemEditPopup.value = true
}

const innerEditStudyItem = (idx) => {
  const it = editingService.value.studyShowcase[idx]
  studyEditingIndex.value = idx
  studyEditingItem.value = { ...it }
  showStudyItemEditPopup.value = true
}

const confirmStudyItemEdit = () => {
  const it = studyEditingItem.value
  if (!it || !editingService.value) return
  if (!editingService.value.studyShowcase) editingService.value.studyShowcase = []
  if (studyEditingIndex.value >= 0) {
    editingService.value.studyShowcase[studyEditingIndex.value] = { ...it }
  } else {
    editingService.value.studyShowcase.push({ ...it })
  }
  showStudyItemEditPopup.value = false
}

const onReadStudyImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('file', file.file)
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.success && studyEditingItem.value) {
      studyEditingItem.value.image = res.data.url
    } else {
      showFailToast('上传失败')
    }
  } catch (error) {
    showFailToast('上传失败')
    console.error(error)
  }
}

onMounted(fetchAllServiceConfigs)
</script>

<style scoped>
.toolbar-label { font-size: 14px; font-weight: 500; color: var(--text-color); }
.detail-content { padding: 16px 0; }

.aspect-preview-container { width: 100%; padding: 10px 0; }
.aspect-label { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.preview-box {
  width: 100%; background: #f5f5f7; border-radius: 12px; overflow: hidden;
  position: relative; border: 1px solid var(--border-color);
}
.banner-box { aspect-ratio: 5 / 3; }
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.preview-box.pos-top img { object-position: top; }
.preview-box.pos-center img { object-position: center; }
.preview-box.pos-bottom img { object-position: bottom; }
.safe-area-marker {
  position: absolute; bottom: 10px; left: 10px;
  background: rgba(0,113,227,0.6); color: #fff; font-size: 10px;
  padding: 2px 6px; border-radius: 4px;
}
</style>
