<template>
  <div class="order-create-page">
      <HomeFloatButton />
    <van-nav-bar title="医疗配送下单" left-arrow @click-left="onBack" fixed placeholder />

    <van-form @submit="onSubmit" @failed="onFailed" ref="formRef">
      <!-- 寄件人信息 -->
      <van-cell-group inset title="寄件人信息">
        <van-field v-model="form.sender_name" label="姓名" placeholder="寄件人姓名" :rules="[{ required: true }]">
          <template #button>
            <van-button size="small" type="primary" plain @click="selectContact('sender')">选择联系人</van-button>
          </template>
        </van-field>
        <van-field v-model="form.sender_phone" label="手机号" placeholder="寄件人手机号" type="tel" :rules="[{ required: true }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]" />
        <van-field v-model="form.sender_org" label="所属机构" placeholder="所属医疗机构" :rules="[{ required: true }]" />
      </van-cell-group>

      <!-- 取货人信息 -->
      <van-cell-group inset title="取货人信息">
        <van-notice-bar v-if="receiverNotCertified" left-icon="warning-o" type="warning" text="收货人需完成平台身份认证后方可接收配送" />
        <van-field v-model="form.receiver_name" label="姓名" placeholder="取货人姓名" :rules="[{ required: true }]">
          <template #button>
            <van-button size="small" type="primary" plain @click="selectContact('receiver')">选择联系人</van-button>
          </template>
        </van-field>
        <van-field v-model="form.receiver_phone" label="手机号" placeholder="取货人手机号" type="tel" :rules="[{ required: true }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式错误' }]" />
        <van-field v-model="form.receiver_org" label="所属机构" placeholder="所属医疗机构" :rules="[{ required: true }]" />
      </van-cell-group>

      <!-- 起降场选择 -->
      <van-cell-group inset title="起降场选择">
        <van-field v-model="departureName" is-link readonly label="出发起降场" placeholder="点击选择" @click="openMapSelect('departure')" :rules="[{ required: true, message: '请选择出发起降场' }]" />
        <van-field v-model="arrivalName" is-link readonly label="到达起降场" placeholder="点击选择" @click="openMapSelect('arrival')" :rules="[{ required: true, message: '请选择到达起降场' }]" />
      </van-cell-group>

      <!-- 物品信息 -->
      <van-cell-group inset title="配送物品信息">
        <van-field
          v-model="itemTypeLabel"
          name="item_type"
          label="物品类型"
          placeholder="点击选择物品类型"
          is-link
          readonly
          @click="showTypePicker = true"
          :rules="[{ required: true, message: '请选择物品类型' }]"
        />
        <van-field v-model="form.item_quantity" label="数量" type="digit" placeholder="请输入数量" :rules="[{ required: true, message: '请输入数量' }, { validator: v => v >= 1 && v <= 999, message: '数量需在1-999之间' }]" />
        <van-field
          v-model="form.item_unit"
          name="item_unit"
          label="单位"
          placeholder="点击选择单位"
          is-link
          readonly
          @click="showUnitPicker = true"
          :rules="[{ required: true, message: '请选择单位' }]"
        />
        <van-field name="temp" label="温控要求">
          <template #input>
            <van-checkbox-group v-model="form.temp_requirements" direction="horizontal">
              <van-checkbox name="normal" shape="square">常温</van-checkbox>
              <van-checkbox name="refrigerated" shape="square">冷藏</van-checkbox>
              <van-checkbox name="frozen" shape="square">冷冻</van-checkbox>
              <van-checkbox name="lightproof" shape="square">避光</van-checkbox>
            </van-checkbox-group>
          </template>
        </van-field>
        <van-field name="images" label="物品拍照" :rules="[{ required: true, message: '请上传物品照片' }]">
          <template #input>
            <van-uploader v-model="itemImages" :max-count="3" :after-read="onItemImageUpload" accept="image/*" />
          </template>
        </van-field>
        <van-field v-model="form.item_description" label="备注" type="textarea" rows="2" placeholder="选填，如：血常规样本，已密封包装" />
      </van-cell-group>

      <!-- 紧急程度 -->
      <van-cell-group inset title="紧急程度">
        <van-field name="urgency" :rules="[{ required: true, message: '请选择紧急程度' }]">
          <template #input>
            <van-radio-group v-model="form.urgency">
              <van-cell-group>
                <van-cell clickable @click="form.urgency = 'normal'">
                  <template #title><van-radio name="normal">普通</van-radio></template>
                  <template #label>2小时内送达</template>
                </van-cell>
                <van-cell clickable @click="form.urgency = 'urgent'">
                  <template #title><van-radio name="urgent">加急</van-radio></template>
                  <template #label>1小时内送达</template>
                </van-cell>
                <van-cell clickable @click="form.urgency = 'critical'">
                  <template #title><van-radio name="critical">特急</van-radio></template>
                  <template #label>30分钟内送达</template>
                </van-cell>
              </van-cell-group>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>

      <!-- 预估时间 -->
      <van-cell-group inset title="配送预估" v-if="estimate">
        <van-cell title="预计送达" :value="`约${estimate.estimated_minutes}分钟`" />
        <van-cell title="配送距离" :value="`${estimate.distance_km}km`" />
      </van-cell-group>

      <div class="submit-section">
        <van-button type="danger" block round native-type="button" @click="manualSubmit" :loading="submitting" size="large">
          确认下单
        </van-button>
      </div>
    </van-form>

    <!-- 联系人选择弹窗 -->
    <van-action-sheet v-model:show="showContactPicker" title="选择常用联系人">
      <div class="contact-list">
        <van-cell v-for="c in contacts" :key="c.id" :title="c.name" :label="`${c.phone} ${c.org_name || ''}`" is-link @click="onContactSelected(c)" />
        <van-empty v-if="!contacts.length" description="暂无常用联系人" />
        <van-button block plain type="primary" @click="$router.push('/medical/contacts')" style="margin: 16px">管理联系人</van-button>
      </div>
    </van-action-sheet>

    <!-- 起降场选择弹窗 -->
    <van-action-sheet v-model:show="showPadPicker" :title="padPickerTitle">
      <div class="pad-list">
        <van-cell v-for="pad in pads" :key="pad.id" :title="pad.name" :label="pad.address" is-link @click="onPadSelected(pad)" :class="{ disabled: isDisabledPad(pad) }" />
        <van-empty v-if="!pads.length" description="暂无可用起降场" />
      </div>
    </van-action-sheet>

    <!-- 物品类型选择 -->
    <van-popup v-model:show="showTypePicker" position="bottom" round>
      <van-picker :columns="typeColumns" @confirm="onTypeConfirm" @cancel="showTypePicker = false" title="选择物品类型" />
    </van-popup>

    <!-- 单位选择 -->
    <van-popup v-model:show="showUnitPicker" position="bottom" round>
      <van-picker :columns="unitColumns" @confirm="onUnitConfirm" @cancel="showUnitPicker = false" title="选择单位" />
    </van-popup>
  </div>
</template>

<script setup>
import HomeFloatButton from '@/components/HomeFloatButton.vue'
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useMedicalStore } from '@/stores/medical'
import axios from '@/utils/http'
import { smartBack } from '@/utils/miniprogram'

const router = useRouter()
const route = useRoute()
const onBack = () => smartBack(router)
const store = useMedicalStore()

const formRef = ref(null)

const form = reactive({
  sender_name: '', sender_phone: '', sender_org: '',
  receiver_name: '', receiver_phone: '', receiver_org: '',
  departure_pad_id: '', arrival_pad_id: '',
  item_type: '', item_quantity: '', item_unit: '', temp_requirements: [],
  item_images: [], item_description: '', urgency: ''
})

const departureName = ref('')
const arrivalName = ref('')
const itemImages = ref([])
const submitting = ref(false)
const estimate = ref(null)
const receiverNotCertified = ref(false)
const contacts = computed(() => store.contacts)
const pads = computed(() => store.pads)

const showContactPicker = ref(false)
const showPadPicker = ref(false)
const contactTarget = ref('sender')
const padTarget = ref('departure')
const padPickerTitle = computed(() => padTarget.value === 'departure' ? '选择出发起降场' : '选择到达起降场')

// 物品类型 / 单位 滚轮选择
const itemTypeLabel = ref('')
const showTypePicker = ref(false)
const showUnitPicker = ref(false)
const typeColumns = [
  { text: '血液制品', value: 'blood' },
  { text: '检验样本', value: 'sample' },
  { text: '药品制剂', value: 'medicine' },
  { text: '医疗器械', value: 'equipment' },
  { text: '其他', value: 'other' }
]
const unitColumns = [
  { text: '件', value: '件' },
  { text: '箱', value: '箱' },
  { text: '袋', value: '袋' },
  { text: '盒', value: '盒' },
  { text: '支', value: '支' },
  { text: '瓶', value: '瓶' },
  { text: '份', value: '份' }
]

function onTypeConfirm({ selectedOptions }) {
  if (selectedOptions && selectedOptions[0]) {
    form.item_type = selectedOptions[0].value
    itemTypeLabel.value = selectedOptions[0].text
  }
  showTypePicker.value = false
}

function onUnitConfirm({ selectedOptions }) {
  if (selectedOptions && selectedOptions[0]) {
    form.item_unit = selectedOptions[0].value
  }
  showUnitPicker.value = false
}

onMounted(async () => {
  // 检查认证状态
  await store.fetchCertificationStatus()
  if (!store.isApproved) {
    showFailToast('请先完成寄件人认证')
    router.replace('/medical/certification/status')
    return
  }

  await Promise.all([store.fetchPads(), store.fetchContacts()])

  // 自动填充认证信息
  if (store.certification) {
    form.sender_name = store.certification.real_name || ''
    form.sender_phone = store.certification.phone || ''
    form.sender_org = store.certification.org_name || ''
  }

  // 处理再次下单数据
  if (route.query.reorder) {
    try {
      const data = JSON.parse(sessionStorage.getItem('reorderData'))
      if (data) {
        Object.assign(form, data)
        const dep = pads.value.find(p => p.id === data.departure_pad_id)
        const arr = pads.value.find(p => p.id === data.arrival_pad_id)
        if (dep) departureName.value = dep.name
        if (arr) arrivalName.value = arr.name
        // 回填物品类型标签
        const t = typeColumns.find(c => c.value === form.item_type)
        if (t) itemTypeLabel.value = t.text
        sessionStorage.removeItem('reorderData')
      }
    } catch (e) { /* ignore */ }
  }
})

// 监听表单变化计算预估时间
watch(() => [form.departure_pad_id, form.arrival_pad_id, form.urgency, form.temp_requirements], async () => {
  if (form.departure_pad_id && form.arrival_pad_id && form.urgency) {
    try {
      const res = await store.getEstimate({
        departure_pad_id: form.departure_pad_id,
        arrival_pad_id: form.arrival_pad_id,
        urgency: form.urgency,
        temp_requirements: form.temp_requirements.join(',')
      })
      if (res?.success) estimate.value = res.data
    } catch (e) { /* ignore */ }
  }
}, { deep: true })

function selectContact(target) {
  contactTarget.value = target
  showContactPicker.value = true
}

function onContactSelected(c) {
  if (contactTarget.value === 'sender') {
    form.sender_name = c.name
    form.sender_phone = c.phone
    form.sender_org = c.org_name || ''
  } else {
    form.receiver_name = c.name
    form.receiver_phone = c.phone
    form.receiver_org = c.org_name || ''
  }
  showContactPicker.value = false
}

function openMapSelect(target) {
  padTarget.value = target
  showPadPicker.value = true
}

function isDisabledPad(pad) {
  if (padTarget.value === 'departure') return pad.id === form.arrival_pad_id
  return pad.id === form.departure_pad_id
}

function onPadSelected(pad) {
  if (isDisabledPad(pad)) return
  if (padTarget.value === 'departure') {
    form.departure_pad_id = pad.id
    departureName.value = pad.name
  } else {
    form.arrival_pad_id = pad.id
    arrivalName.value = pad.name
  }
  showPadPicker.value = false
}

async function onItemImageUpload(file) {
  const formData = new FormData()
  formData.append('file', file.file)
  try {
    const res = await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (res.data?.url) {
      form.item_images.push(res.data.url)
    }
  } catch (e) {
    showFailToast('图片上传失败')
  }
}

function manualSubmit() {
  formRef.value?.submit()
}

function onFailed() {
  showFailToast('请检查并填写完整必填项')
}

async function onSubmit() {
  if (form.item_images.length < 1) {
    showFailToast('请至少上传1张物品照片')
    return
  }
  submitting.value = true
  receiverNotCertified.value = false
  try {
    const res = await store.createOrder(form)
    if (res?.success) {
      showSuccessToast('下单成功')
      router.replace('/medical/orders')
    } else {
      const msg = res?.message || '下单失败'
      if (msg.includes('收货人')) {
        receiverNotCertified.value = true
      }
      showFailToast(msg)
    }
  } catch (e) {
    const msg = e.response?.data?.message || '下单失败'
    if (msg.includes('收货人')) {
      receiverNotCertified.value = true
    }
    showFailToast(msg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-create-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 100px;
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 固定导航栏居中约束 */
.order-create-page :deep(.van-nav-bar--fixed) {
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
  max-width: var(--page-max-width);
}


.submit-section {
  padding: 24px 16px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--page-max-width);
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
  z-index: 100;
}
.contact-list, .pad-list {
  max-height: 50vh;
  overflow-y: auto;
  padding-bottom: 16px;
}
.pad-list .disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
