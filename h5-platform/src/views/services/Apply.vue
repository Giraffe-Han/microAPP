<template>
  <div class="apply-page page-container">
    <van-nav-bar
      :title="serviceName + '申请'"
      left-arrow
      @click-left="$router.back()"
      fixed
      placeholder
    />

    <div class="content-wrapper">
      <!-- 服务暂未开放提示 (5-14号服务) -->
      <template v-if="!isServiceAvailable">
        <van-empty
          image="search"
          description="该服务申请功能即将开放"
        >
          <div class="empty-tips">
            <p style="color: #969799; margin-bottom: 12px;">
              {{ serviceName }}功能正在建设中，敬请期待！
            </p>
            <p style="color: #969799; font-size: 13px; margin-bottom: 20px;">
              如有需求，请联系客服：400-888-8888
            </p>
            <van-button 
              type="primary" 
              round 
              size="small"
              @click="$router.back()"
            >
              返回服务列表
            </van-button>
          </div>
        </van-empty>
      </template>

      <!-- 服务信息提示 (1-4, 6号服务) -->
      <template v-else>
        <van-notice-bar
          color="#667eea"
          background="#f0f2ff"
          left-icon="info-o"
        >
          请填写以下信息，我们将尽快与您联系
        </van-notice-bar>

        <!-- 申请表单 -->
        <van-form ref="formRef" @submit="onSubmit" @failed="onFailed" style="margin-top: 16px;">
        <!-- 基本信息 -->
        <div class="form-section" v-if="serviceId !== '6'">
          <h3 class="form-title">基本信息</h3>
          <van-field
            v-model="formData.contactName"
            name="contactName"
            label="联系人"
            placeholder="请输入联系人姓名"
            :rules="[{ required: true, message: '请输入联系人姓名' }]"
          />
          <van-field
            v-model="formData.contactPhone"
            name="contactPhone"
            type="tel"
            label="联系电话"
            placeholder="请输入联系电话"
            :rules="[
              { required: true, message: '请输入联系电话' }
            ]"
          />
        </div>

        <!-- 服务详情 - 根据服务类型显示不同字段 -->
        <div class="form-section">
          <h3 class="form-title">服务详情</h3>
          
          <!-- 无人机物流服务 -->
          <template v-if="serviceId === '1'">
            <!-- 客户类型 -->
            <van-field name="customerType" label="客户类型">
              <template #input>
                <van-radio-group v-model="formData.customerType" direction="horizontal">
                  <van-radio name="personal">个人</van-radio>
                  <van-radio name="enterprise">企业</van-radio>
                </van-radio-group>
              </template>
            </van-field>

            <!-- 企业名称（企业客户时显示） -->
            <van-field
              v-if="formData.customerType === 'enterprise'"
              v-model="formData.companyName"
              label="企业名称"
              placeholder="请输入企业名称"
            />

            <!-- 货物信息 -->
            <van-field
              v-model="formData.cargoType"
              is-link
              readonly
              label="货物类型"
              placeholder="请选择货物类型"
              @click="showCargoTypePicker = true"
            />
            <van-popup v-model:show="showCargoTypePicker" position="bottom">
              <van-picker
                :columns="cargoTypeOptions"
                @confirm="onCargoTypeConfirm"
                @cancel="showCargoTypePicker = false"
                title="选择货物类型"
              />
            </van-popup>

            <!-- 其他货物类型（选择"其他"时显示） -->
            <van-field
              v-if="formData.cargoType === '其他'"
              v-model="formData.cargoTypeOther"
              label="具体类型"
              placeholder="请输入具体货物类型"
            />

            <van-field
              v-model="formData.cargoWeight"
              type="number"
              label="货物重量"
              placeholder="请输入货物重量"
            >
              <template #button>
                <span style="color: #969799;">kg</span>
              </template>
            </van-field>

            <van-field
              v-model="formData.cargoVolume"
              label="货物体积"
              placeholder="请输入货物体积（长×宽×高）"
            >
              <template #button>
                <span style="color: #969799;">cm³</span>
              </template>
            </van-field>

            <!-- 起运地 -->
            <van-field
              v-model="formData.startAddress"
              label="起运地"
              placeholder="请输入起运地"
              :rules="[]"
            />

            <van-field
              v-model="formData.startAddressDetail"
              label="详细地址"
              placeholder="请输入起运地详细地址（楼栋门牌号）"
              type="textarea"
              rows="2"
            />

            <!-- 目的地 -->
            <van-field
              v-model="formData.endAddress"
              label="目的地"
              placeholder="请输入目的地"
              :rules="[]"
            />

            <van-field
              v-model="formData.endAddressDetail"
              label="详细地址"
              placeholder="请输入目的地详细地址（楼栋门牌号）"
              type="textarea"
              rows="2"
            />

            <!-- 运输时效 -->
            <van-field
              v-model="formData.deliveryUrgency"
              is-link
              readonly
              label="运输时效"
              placeholder="请选择运输时效"
              @click="showUrgencyPicker = true"
            />
            <van-popup v-model:show="showUrgencyPicker" position="bottom">
              <van-picker
                :columns="urgencyOptions"
                @confirm="onUrgencyConfirm"
                @cancel="showUrgencyPicker = false"
                title="选择运输时效"
              />
            </van-popup>

            <!-- 期望运输时间 -->
            <van-field
              v-model="formData.expectedTime"
              is-link
              readonly
              label="期望运输时间"
              placeholder="请选择期望运输时间"
              @click="showTimePicker = true"
            />
            <van-popup v-model:show="showTimePicker" position="bottom">
              <van-date-picker
                v-model="expectedDate"
                title="选择日期"
                :min-date="minDate"
                @confirm="onTimeConfirm"
                @cancel="showTimePicker = false"
              />
            </van-popup>

            <!-- 附件上传 -->
            <van-field name="uploader" label="货物照片">
              <template #input>
                <van-uploader 
                  v-model="formData.fileList" 
                  :max-count="5"
                  :after-read="afterRead"
                  accept="image/*"
                >
                  <van-button icon="plus" type="primary" size="small">上传图片</van-button>
                </van-uploader>
              </template>
            </van-field>

            <van-field
              v-model="formData.remark"
              label="备注说明"
              placeholder="请输入其他需要说明的信息"
              type="textarea"
              rows="3"
            />
          </template>

          <!-- 政务巡检服务 -->
          <template v-if="serviceId === '2'">
            <van-field
              v-model="formData.inspectionType"
              label="服务类型"
              placeholder="请输入服务类型，如：环保监测、安全巡查、设施检查等"
              type="text"
            />
            <van-field
              v-model="formData.inspectionArea"
              label="巡检区域"
              placeholder="请输入巡检区域，如：某某区域、某某路段等"
              type="text"
            />
            <van-field
              v-model="formData.inspectionDate"
              label="巡检时间"
              placeholder="请输入巡检时间，如：2025-01-25 或 每周一上午"
              type="text"
            />
            <van-field
              v-model="formData.inspectionRequire"
              label="需求说明"
              placeholder="请详细描述您的巡检需求"
              type="text"
            />
          </template>

          <!-- 无人机托管服务 -->
          <template v-if="serviceId === '3'">
            <van-field
              v-model="formData.droneModel"
              label="无人机型号"
              placeholder="请输入无人机型号"
            />
            <van-field
              v-model="formData.droneCount"
              type="number"
              label="托管数量"
              placeholder="请输入托管数量"
            />
            <van-field
              v-model="formData.trusteeDuration"
              label="托管时长"
              placeholder="请选择托管时长"
              readonly
              is-link
              @click="showDurationPicker = true"
            />
          </template>

          <!-- 无人机吊运服务 -->
          <template v-if="serviceId === '4'">
            <van-field
              v-model="formData.liftItemType"
              label="吊运物品"
              placeholder="请输入吊运物品类型"
            />
            <van-field
              v-model="formData.liftItemWeight"
              type="number"
              label="物品重量(kg)"
              placeholder="请输入物品重量"
            />
            <van-field
              v-model="formData.workLocation"
              label="作业地点"
              placeholder="请输入作业地点"
            />
            <van-field
              v-model="formData.liftHeight"
              type="number"
              label="吊运高度(m)"
              placeholder="请输入吊运高度"
            />
          </template>

          <!-- 无人机培训服务 -->
          <template v-if="serviceId === '6'">
            <van-field
              v-model="formData.traineeName"
              label="姓名"
              placeholder="请输入姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
            <van-field
              v-model="formData.traineePhone"
              type="tel"
              label="联系电话"
              placeholder="请输入联系电话"
              :rules="[{ required: true, message: '请输入联系电话' }]"
            />
            <van-field name="traineeGender" label="性别">
              <template #input>
                <van-radio-group v-model="formData.traineeGender" direction="horizontal">
                  <van-radio name="male">男</van-radio>
                  <van-radio name="female">女</van-radio>
                </van-radio-group>
              </template>
            </van-field>
            <van-field
              v-model="formData.traineeBirthday"
              label="出生日期"
              placeholder="请输入出生日期（如：1990-01-01）"
              :rules="[{ required: true, message: '请输入出生日期' }]"
            />
            <van-field
              v-model="formData.traineeIdCard"
              label="身份证号"
              placeholder="请输入身份证号"
              :rules="[{ required: true, message: '请输入身份证号' }]"
            />
            <van-field
              v-model="formData.examModel"
              is-link
              readonly
              label="考试机型"
              placeholder="请选择考试机型"
              @click="showExamModelPicker = true"
            />
            <van-popup v-model:show="showExamModelPicker" position="bottom">
              <van-picker
                :columns="examModelOptions"
                @confirm="onExamModelConfirm"
                @cancel="showExamModelPicker = false"
                title="选择考试机型"
              />
            </van-popup>
            <van-field
              v-model="formData.licenseLevel"
              is-link
              readonly
              label="证照级别"
              placeholder="请选择证照级别"
              @click="showLicenseLevelPicker = true"
            />
            <van-popup v-model:show="showLicenseLevelPicker" position="bottom">
              <van-picker
                :columns="licenseLevelOptions"
                @confirm="onLicenseLevelConfirm"
                @cancel="showLicenseLevelPicker = false"
                title="选择证照级别"
              />
            </van-popup>
            <van-field
              v-model="formData.hasExperienceText"
              is-link
              readonly
              label="有无基础"
              placeholder="请选择有无基础"
              @click="showExperiencePicker = true"
            />
            <van-popup v-model:show="showExperiencePicker" position="bottom">
              <van-picker
                :columns="experienceOptions"
                @confirm="onExperienceConfirm"
                @cancel="showExperiencePicker = false"
                title="选择有无基础"
              />
            </van-popup>
          </template>

          <!-- 通用备注（物流和政务巡检已有备注，其他服务显示） -->
          <van-field
            v-if="serviceId !== '1' && serviceId !== '2'"
            v-model="formData.remark"
            type="textarea"
            label="需求说明"
            placeholder="请描述您的具体需求"
            rows="3"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 提交按钮 -->
        <div style="margin: 24px 16px;">
          <van-button round block type="primary" native-type="button" @click="manualSubmit">
            提交申请
          </van-button>
        </div>
      </van-form>
      </template>
    </div>

    <!-- 选择器弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDurationPicker" position="bottom">
      <van-picker
        :columns="durationOptions"
        @confirm="onDurationConfirm"
        @cancel="showDurationPicker = false"
        title="选择托管期限"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog, showLoadingToast, closeToast, showFailToast } from 'vant'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const serviceId = ref(route.params.id)

// 所有11项服务名称
const serviceNames = {
  '1': '无人机物流服务',
  '2': '政务巡检服务',
  '3': '无人机托管服务',
  '4': '无人机吊运服务',
  '5': '航空表演服务',
  '6': '无人机培训服务',
  '7': '无人机租赁服务',
  '8': '无人机外卖配送',
  '9': '低空研学服务',
  '10': '无人机二手交易',
  '11': '无人机金融服务'
}

const serviceName = ref(serviceNames[serviceId.value] || '服务')

// 判断服务是否可申请 (只有1-4号和6号服务在一期开放申请)
const isServiceAvailable = ref(['1', '2', '3', '4', '6'].includes(serviceId.value))

// 表单数据
const formData = ref({
  contactName: '',
  contactPhone: '',
  // 培训服务
  traineeName: '',
  traineePhone: '',
  traineeGender: 'male',
  traineeBirthday: '',
  traineeIdCard: '',
  examModel: '',
  licenseLevel: '',
  hasExperience: 'no',
  // 物流服务 - 完整字段
  customerType: 'personal', // 客户类型：personal/enterprise
  companyName: '', // 企业名称
  cargoType: '', // 货物类型
  cargoTypeOther: '', // 其他货物类型
  cargoWeight: '', // 货物重量
  cargoVolume: '', // 货物体积
  startAddress: '', // 起运地
  startAddressDetail: '', // 起运地详细地址
  endAddress: '', // 目的地
  endAddressDetail: '', // 目的地详细地址
  deliveryUrgency: '', // 运输时效
  expectedTime: '', // 期望运输时间
  fileList: [], // 上传的文件列表
  remark: '', // 备注说明
  // 巡检
  inspectionType: '',
  inspectionArea: '',
  inspectionDate: '',
  // 托管
  droneModel: '',
  droneCount: '',
  trusteeDuration: '',
  // 吊运
  liftItemType: '',
  liftItemWeight: '',
  workLocation: '',
  liftHeight: '',
  // 通用
  remark: ''
})

// 选择器状态
const showDatePicker = ref(false)
const showDurationPicker = ref(false)
const showCargoTypePicker = ref(false) // 货物类型选择器
const showUrgencyPicker = ref(false) // 运输时效选择器
const showTimePicker = ref(false) // 期望时间选择器
const currentDate = ref(new Date())
const expectedDate = ref([
  String(new Date().getFullYear()),
  String(new Date().getMonth() + 1).padStart(2, '0'),
  String(new Date().getDate()).padStart(2, '0')
])
const showExamModelPicker = ref(false)
const showLicenseLevelPicker = ref(false)
const showExperiencePicker = ref(false)
const showBirthdayPicker = ref(false)
const currentBirthday = ref(new Date(1990, 0, 1))
const minDate = new Date(1950, 0, 1)
const maxDate = new Date()

// 培训服务 - 选项数据
const examModelOptions = [
  { text: '小型无人机', value: '小型' },
  { text: '中型无人机', value: '中型' }
]

const licenseLevelOptions = [
  { text: '视距内', value: '视距内' },
  { text: '超视距', value: '超视距' }
]

const experienceOptions = [
  { text: '无', value: 'no' },
  { text: '有', value: 'yes' }
]

const onBirthdayConfirm = (value) => {
  const date = new Date(value)
  formData.value.traineeBirthday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  showBirthdayPicker.value = false
}

const onExamModelConfirm = ({ selectedOptions }) => {
  formData.value.examModel = selectedOptions[0].text
  showExamModelPicker.value = false
}

const onLicenseLevelConfirm = ({ selectedOptions }) => {
  formData.value.licenseLevel = selectedOptions[0].text
  showLicenseLevelPicker.value = false
}

const onExperienceConfirm = ({ selectedOptions }) => {
  formData.value.hasExperience = selectedOptions[0].value
  formData.value.hasExperienceText = selectedOptions[0].text
  showExperiencePicker.value = false
}

// 物流服务 - 货物类型选项
const cargoTypeOptions = [
  { text: '生鲜食品', value: '生鲜食品' },
  { text: '应急药品', value: '应急药品' },
  { text: '工业零部件', value: '工业零部件' },
  { text: '电子产品', value: '电子产品' },
  { text: '文件资料', value: '文件资料' },
  { text: '日用品', value: '日用品' },
  { text: '医疗器械', value: '医疗器械' },
  { text: '其他', value: '其他' }
]

// 物流服务 - 运输时效选项
const urgencyOptions = [
  { text: '加急配送（2小时内）', value: '加急' },
  { text: '标准配送（当日达）', value: '标准' },
  { text: '普通配送（次日达）', value: '普通' },
  { text: '经济配送（3日内）', value: '经济' }
]

const durationOptions = [
  { text: '1个月', value: '1个月' },
  { text: '3个月', value: '3个月' },
  { text: '6个月', value: '6个月' },
  { text: '1年', value: '1年' },
  { text: '长期托管', value: '长期托管' }
]

const onDateConfirm = (value) => {
  const date = new Date(value)
  formData.value.inspectionDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  showDatePicker.value = false
}

const onDurationConfirm = ({ selectedOptions }) => {
  formData.value.trusteeDuration = selectedOptions[0].text
  showDurationPicker.value = false
}

// 物流服务 - 货物类型确认
const onCargoTypeConfirm = ({ selectedOptions }) => {
  formData.value.cargoType = selectedOptions[0].text
  showCargoTypePicker.value = false
}

// 物流服务 - 运输时效确认
const onUrgencyConfirm = ({ selectedOptions }) => {
  formData.value.deliveryUrgency = selectedOptions[0].text
  showUrgencyPicker.value = false
}

// 物流服务 - 期望时间确认
const onTimeConfirm = ({ selectedValues }) => {
  const [year, month, day] = selectedValues
  formData.value.expectedTime = `${year}-${month}-${day}`
  showTimePicker.value = false
}
// 文件上传后处理
const afterRead = (file) => {
  console.log('上传文件：', file)
  showToast('上传成功')
}

const manualSubmit = () => {
    formRef.value.submit()
}

const onFailed = (errorInfo) => {
  console.log('failed', errorInfo);
  showFailToast('请填写必填项');
};

const formRef = ref(null)

// Phone validation: allow simple check or relax it
// pattern: /^1\d{10}$/

const onSubmit = async () => {
  showLoadingToast({
    message: '提交中...',
    forbidClick: true,
    duration: 0 // 持续展示
  })
  console.log('onSubmit triggered');
  // 获取当前时间作为申请时间
  const now = new Date()
  const applyTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  
  // 生成申请单号
  const orderNo = 'DK' + now.getTime()
  
  try {
    // 构造提交数据
    const submitData = {
      ...formData.value,
      serviceId: serviceId.value,
      serviceName: serviceName.value,
      orderNo,
      applyTime,
      status: '待处理'
    };

    await axios.post('/api/submit', submitData);

    closeToast();
    showDialog({
      title: '✅ 提交成功',
      className: 'submit-success-dialog',
      message: `
申请单号：${orderNo}
申请时间：${applyTime}
处理状态：待处理
━━━━━━━━━━━━━━━━
📋 办理流程：
1️⃣ 提交申请（已完成）
2️⃣ 客服审核（1个工作日内）
3️⃣ 方案确认（电话沟通）
4️⃣ 服务执行
━━━━━━━━━━━━━━━━
📞 客服联系方式：
电话：400-888-8888
微信：DK-Service

我们将在1个工作日内与您联系！
      `,
      confirmButtonText: '查看我的申请'
    }).then(() => {
      router.push('/applications')
    })
  } catch (error) {
    closeToast();
    showFailToast('提交失败，请重试');
    console.error(error);
  }
}
</script>

<style scoped>
.form-section {
  background: #fff;
  border-radius: 12px;
  padding: 4px 0;
  margin-bottom: 12px;
}

.form-title {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  padding: 12px 16px;
  border-left: 3px solid #667eea;
  margin-left: 16px;
}

.empty-tips {
  padding: 20px;
  text-align: center;
}

.content-wrapper {
  padding: 16px;
  min-height: calc(100vh - 46px);
}
</style>

