<template>
  <div class="admin-page">
    <van-nav-bar
      title="后台数据管理"
      left-arrow
      @click-left="$router.push('/')"
      fixed
      placeholder
    >
        <template #right>
            <van-icon name="wap-home-o" size="18" @click="$router.push('/')"/>
        </template>
    </van-nav-bar>

    <div class="filter-section">
      <van-cell title="选择日期范围" :value="dateRange" is-link @click="showCalendar = true" />
      <van-calendar v-model:show="showCalendar" type="range" @confirm="onConfirmDate" />
      
      <div class="action-buttons">
        <van-button type="primary" size="small" block @click="fetchData">查询</van-button>
        <van-button type="success" size="small" block @click="handleExport" style="margin-top: 8px;">导出Excel</van-button>
      </div>
    </div>

    <div class="data-list">
        <van-empty v-if="list.length === 0" description="暂无数据" />
        <van-cell-group v-else inset>
            <van-cell 
                v-for="item in list" 
                :key="item.id" 
                :title="item.serviceName || '未知服务'" 
                :label="formatDate(item.createTime)"
                is-link
                @click="showDetail(item)"
            >
                <template #value>
                    <span :class="getStatusClass(item.status)">{{ item.status || '待处理' }}</span>
                </template>
            </van-cell>
        </van-cell-group>
    </div>

    <!-- Detail Popup -->
    <van-popup v-model:show="showDetailPopup" position="bottom" :style="{ height: '70%' }" round>
        <div class="detail-content" v-if="currentItem">
            <van-cell-group title="基本信息">
                <van-cell title="申请单号" :value="itemValue(currentItem.id)" />
                <van-cell title="申请时间" :value="formatDate(currentItem.createTime)" />
                <van-cell title="当前状态" 
                    :value="currentItem.status" 
                    is-link 
                    @click="showStatusPicker = true"
                />
                <template v-if="currentItem.serviceId === '6'">
                  <van-cell title="姓名" :value="itemValue(currentItem.traineeName)" />
                  <van-cell title="联系电话" :value="itemValue(currentItem.traineePhone)" />
                </template>
                <template v-else>
                  <van-cell title="联系人" :value="itemValue(currentItem.contactName)" />
                  <van-cell title="联系电话" :value="itemValue(currentItem.contactPhone)" />
                </template>
            </van-cell-group>

            <van-cell-group title="服务详情">
                <van-cell title="服务类型" :value="itemValue(currentItem.serviceName)" />
                
                <!-- 培训服务详情 -->
                <template v-if="currentItem.serviceId === '6'">
                    <van-cell title="性别" :value="currentItem.traineeGender === 'male' ? '男' : '女'" />
                    <van-cell title="出生日期" :value="itemValue(currentItem.traineeBirthday)" />
                    <van-cell title="身份证号" :value="itemValue(currentItem.traineeIdCard)" />
                    <van-cell title="执照种类e="itemValue(currentItem.examModel)" />
                    <van-cell title="证照级别" :value="itemValue(currentItem.licenseLevel)" />
                    <van-cell title="有无基础" :value="currentItem.hasExperience === 'yes' ? '有' : '无'" />
                </template>

                <!-- 物流服务详情 -->
                <template v-else>
                    <van-cell title="客户类型" :value="currentItem.customerType === 'enterprise' ? '企业' : '个人'" />
                    <van-cell v-if="currentItem.companyName" title="企业名称" :value="currentItem.companyName" />
                    <van-cell v-if="currentItem.cargoType" title="货物类型" :value="currentItem.cargoType" />
                    <van-cell v-if="currentItem.startAddress" title="起运地" :value="currentItem.startAddress" />
                    <van-cell v-if="currentItem.endAddress" title="目的地" :value="currentItem.endAddress" />
                </template>
                
                <van-cell title="备注" :label="itemValue(currentItem.remark)" />
            </van-cell-group>
        </div>
    </van-popup>
    <!-- Status Picker -->
    <van-popup v-model:show="showStatusPicker" position="bottom">
        <van-picker
            :columns="statusOptions"
            @confirm="onUpdateStatus"
            @cancel="showStatusPicker = false"
            title="修改订单状态"
        />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { showToast, showFailToast, showSuccessToast } from 'vant';

const list = ref([]);
const showCalendar = ref(false);
const startDate = ref('');
const endDate = ref('');
const showDetailPopup = ref(false);
const currentItem = ref(null);
const showStatusPicker = ref(false);

const statusOptions = [
  { text: '待处理', value: '待处理' },
  { text: '处理中', value: '处理中' },
  { text: '已完成', value: '已完成' },
  { text: '已取消', value: '已取消' },
];

const dateRange = computed(() => {
    if (startDate.value && endDate.value) {
        return `${formatDateShort(startDate.value)} - ${formatDateShort(endDate.value)}`;
    }
    return '全部时间';
});

const formatDateShort = (date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const itemValue = (val) => val || '-';

const getStatusClass = (status) => {
    return status === '已完成' ? 'text-success' : 'text-warning';
};

const onConfirmDate = (values) => {
    const [start, end] = values;
    showCalendar.value = false;
    startDate.value = start;
    endDate.value = end;
    fetchData();
};

const fetchData = async () => {
    try {
        const params = {};
        if (startDate.value) params.startDate = startDate.value;
        if (endDate.value) params.endDate = endDate.value;

        const res = await axios.get('/api/list', { params });
        list.value = res.data;
    } catch (error) {
        showFailToast('获取数据失败');
        console.error(error);
    }
};

const handleExport = () => {
    let url = '/api/export?';
    if (startDate.value) url += `startDate=${startDate.value.toISOString()}&`;
    if (endDate.value) url += `endDate=${endDate.value.toISOString()}`;
    window.open(url, '_blank');
};

const showDetail = (item) => {
    currentItem.value = { ...item }; // Clone to avoid direct mutation before save
    showDetailPopup.value = true;
};

const onUpdateStatus = async ({ selectedOptions }) => {
    const newStatus = selectedOptions[0].value;
    if (!currentItem.value) return;

    try {
        await axios.post('/api/update', {
            id: currentItem.value.id,
            status: newStatus
        });
        
        currentItem.value.status = newStatus;
        // Update list locally
        const index = list.value.findIndex(item => item.id === currentItem.value.id);
        if (index !== -1) {
            list.value[index].status = newStatus;
        }
        
        showSuccessToast('状态更新成功');
        showStatusPicker.value = false;
    } catch (error) {
        showFailToast('更新状态失败');
        console.error(error);
    }
};

onMounted(() => {
    fetchData();
});
</script>

<style scoped>
.admin-page {
    background-color: #f7f8fa;
    min-height: 100vh;
    padding-bottom: 20px;
}

.filter-section {
    background: #fff;
    padding: 12px;
    margin-bottom: 12px;
}

.action-buttons {
    margin-top: 12px;
    padding: 0 16px;
}

.detail-content {
    padding: 16px 0;
}

.text-success {
    color: #07c160;
}

.text-warning {
    color: #ff976a;
}
</style>
