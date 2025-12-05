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

    <div class="filter-section" v-if="activeTab === 0">
      <van-cell title="选择日期范围" :value="dateRange" is-link @click="showCalendar = true" />
      <van-calendar v-model:show="showCalendar" type="range" @confirm="onConfirmDate" />
      
      <div class="action-buttons">
        <van-button type="primary" size="small" block @click="fetchData">查询</van-button>
        <van-button type="success" size="small" block @click="handleExport" style="margin-top: 8px;">导出Excel</van-button>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" sticky offset-top="46">
        <van-tab title="订单管理">
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
        </van-tab>
        <van-tab title="案例管理">
            <div class="case-list">
                <div style="padding: 12px;">
                    <van-button block type="primary" icon="plus" @click="createCase">新增案例</van-button>
                </div>
                <van-cell-group inset>
                    <van-cell
                        v-for="caseItem in cases"
                        :key="caseItem.id"
                        :title="caseItem.title"
                        :label="caseItem.service"
                        center
                    >
                        <template #value>
                            <van-button 
                                size="small" 
                                type="primary" 
                                icon="edit" 
                                plain 
                                @click.stop="editCase(caseItem)"
                            >
                                编辑
                            </van-button>
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>
        </van-tab>
        <van-tab title="用户管理">
            <div class="user-list">
                <van-cell-group inset>
                    <van-cell
                        v-for="user in users"
                        :key="user.id"
                        :title="user.name || '未命名'"
                        :label="user.phone"
                        center
                    >
                        <template #value>
                            <van-tag :type="user.role === 'admin' ? 'danger' : 'primary'" style="margin-right: 8px;">
                                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                            </van-tag>
                            <van-button 
                                size="small" 
                                :type="user.role === 'admin' ? 'default' : 'primary'" 
                                plain 
                                @click="toggleUserRole(user)"
                            >
                                {{ user.role === 'admin' ? '设为用户' : '设为管理' }}
                            </van-button>
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>
        </van-tab>
    </van-tabs>

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
                    <van-cell title="执照种类" :value="itemValue(currentItem.examModel)" />
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

    <!-- Case Edit Popup -->
    <van-popup v-model:show="showCaseEditPopup" position="bottom" :style="{ height: '90%' }" round>
        <div class="detail-content" v-if="currentCase">
            <van-form @submit="onSaveCase">
                <van-cell-group title="基本信息">
                    <van-field name="categoryId" label="所属分类" required>
                        <template #input>
                            <van-radio-group v-model="currentCase.categoryId" direction="horizontal">
                                <van-radio :name="1">物流</van-radio>
                                <van-radio :name="4">吊运</van-radio>
                                <van-radio :name="5">表演</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                    <van-field v-model="currentCase.title" label="标题" placeholder="请输入标题" required />
                    <van-field v-model="currentCase.description" label="简介" type="textarea" rows="2" placeholder="请输入简介" />
                    <van-field v-model="currentCase.location" label="地点" placeholder="请输入地点" />
                    <van-field v-model="currentCase.date" label="时间" placeholder="请输入时间" />
                </van-cell-group>
                
                <van-cell-group title="封面设置">
                    <van-field name="coverType" label="封面类型">
                        <template #input>
                            <van-radio-group v-model="currentCase.coverType" direction="horizontal">
                                <van-radio name="image">图片</van-radio>
                                <van-radio name="video">视频</van-radio>
                            </van-radio-group>
                        </template>
                    </van-field>
                    
                    <van-field v-model="currentCase.cover" label="封面地址" placeholder="输入URL或上传" />
                    
                    <van-field label="上传封面">
                        <template #input>
                            <van-uploader 
                                :after-read="file => onReadCover(file)" 
                                max-count="1"
                                :accept="currentCase.coverType === 'video' ? 'video/*' : 'image/*'"
                            >
                                <van-button icon="plus" type="primary" size="small" plain>
                                    上传{{ currentCase.coverType === 'video' ? '视频' : '图片' }}
                                </van-button>
                            </van-uploader>
                        </template>
                    </van-field>
                </van-cell-group>

                <van-cell-group title="媒体资源 (图片/视频)">
                    <div v-for="(media, index) in currentCase.media" :key="index" style="padding: 10px; border-bottom: 1px dashed #eee;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-weight: bold;">资源 #{{ index + 1 }}</span>
                            <van-button size="mini" type="danger" icon="cross" @click="removeMedia(index)"></van-button>
                        </div>
                        <van-radio-group v-model="media.type" direction="horizontal" style="margin-bottom: 8px;">
                            <van-radio name="image">图片</van-radio>
                            <van-radio name="video">视频</van-radio>
                        </van-radio-group>
                        <van-field v-model="media.url" label="地址" placeholder="URL" />
                        <div style="margin-top: 8px;">
                            <van-uploader 
                                :after-read="file => onReadMedia(file, index)"
                                :accept="media.type === 'video' ? 'video/*' : 'image/*'"
                            >
                                <van-button icon="plus" size="mini" type="default">
                                    上传{{ media.type === 'video' ? '视频' : '图片' }}
                                </van-button>
                            </van-uploader>
                        </div>
                    </div>
                    <div style="padding: 10px;">
                        <van-button size="small" type="primary" block plain icon="plus" @click="addMedia">添加资源</van-button>
                    </div>
                </van-cell-group>

                <van-cell-group title="项目亮点 (标签)">
                    <div v-for="(tag, index) in currentCase.highlights" :key="index" style="display: flex; align-items: center; padding: 0 16px;">
                        <van-field v-model="currentCase.highlights[index]" :label="'标签 ' + (index + 1)" placeholder="输入标签内容" />
                        <van-button size="mini" type="danger" icon="cross" @click="removeHighlight(index)" style="margin-left: 8px;"></van-button>
                    </div>
                    <div style="padding: 10px;">
                        <van-button size="small" type="primary" block plain icon="plus" @click="addHighlight">添加标签</van-button>
                    </div>
                </van-cell-group>

                <van-cell-group title="详细内容">
                    <van-field 
                        v-model="currentCase.fullDescription" 
                        label="详细描述" 
                        type="textarea" 
                        rows="4" 
                        placeholder="请输入详细描述" 
                        autosize
                    />
                </van-cell-group>

                <div style="margin: 16px; padding-bottom: 30px;">
                    <van-button round block type="primary" native-type="submit" style="margin-bottom: 12px;">保存修改</van-button>
                    <van-button v-if="currentCase.id" round block type="danger" native-type="button" @click="onDeleteCase">删除案例</van-button>
                </div>
            </van-form>
        </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { showToast, showFailToast, showSuccessToast, showLoadingToast, closeToast, showConfirmDialog } from 'vant';

const list = ref([]);
const cases = ref([]);
const users = ref([]);
const showCalendar = ref(false);
const startDate = ref('');
const endDate = ref('');
const showDetailPopup = ref(false);
const showCaseEditPopup = ref(false);
const currentItem = ref(null);
const currentCase = ref(null);
const showStatusPicker = ref(false);
const activeTab = ref(0);

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

const fetchCases = async () => {
    try {
        const res = await axios.get('/api/cases');
        cases.value = res.data;
    } catch (error) {
        showFailToast('获取案例数据失败');
        console.error(error);
    }
};

const fetchUsers = async () => {
    try {
        const res = await axios.get('/api/users');
        users.value = res.data;
    } catch (error) {
        showFailToast('获取用户数据失败');
        console.error(error);
    }
};

const toggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
        await axios.post('/api/user/role', {
            id: user.id,
            role: newRole
        });
        
        user.role = newRole;
        showSuccessToast('权限更新成功');
    } catch (error) {
        showFailToast('权限更新失败');
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

const editCase = (caseItem) => {
    currentCase.value = JSON.parse(JSON.stringify(caseItem)); // Deep clone
    if (!currentCase.value.media) currentCase.value.media = [];
    if (!currentCase.value.highlights) currentCase.value.highlights = [];
    if (!currentCase.value.coverType) currentCase.value.coverType = 'image'; // Default
    showCaseEditPopup.value = true;
};

const createCase = () => {
    currentCase.value = {
        title: '',
        description: '',
        location: '',
        date: '',
        fullDescription: '',
        coverType: 'image',
        cover: '',
        media: [],
        highlights: [],
        categoryId: 1, // Default category
        service: '无人机物流' // Default service
    };
    showCaseEditPopup.value = true;
};

// Image Upload Helpers (Upload to Server)
const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file.file); // van-uploader passes object with 'file' property
    
    try {
        const res = await axios.post('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data.success) {
            return res.data.url;
        } else {
            showFailToast('上传失败');
            return null;
        }
    } catch (err) {
        console.error(err);
        showFailToast('上传出错');
        return null;
    }
};

const onReadCover = async (file) => {
    showLoadingToast({ message: '上传中...', forbidClick: true });
    const url = await uploadFile(file);
    closeToast();
    if (url) {
        currentCase.value.cover = url;
        showSuccessToast('封面已上传');
    }
};

const onReadMedia = async (file, index) => {
    showLoadingToast({ message: '上传中...', forbidClick: true });
    const url = await uploadFile(file);
    closeToast();
    if (url) {
        currentCase.value.media[index].url = url;
        showSuccessToast('资源已上传');
    }
};

const addMedia = () => {
    currentCase.value.media.push({ type: 'image', url: '' });
};

const removeMedia = (index) => {
    currentCase.value.media.splice(index, 1);
};

const addHighlight = () => {
    currentCase.value.highlights.push('');
};

const removeHighlight = (index) => {
    currentCase.value.highlights.splice(index, 1);
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

const onSaveCase = async () => {
    if (!currentCase.value) return;

    try {
        if (currentCase.value.id) {
            // Update
            await axios.post('/api/cases/update', currentCase.value);
            const index = cases.value.findIndex(c => c.id === currentCase.value.id);
            if (index !== -1) {
                cases.value[index] = currentCase.value;
            }
        } else {
            // Create
            const res = await axios.post('/api/cases/create', currentCase.value);
            currentCase.value.id = res.data.id;
            cases.value.unshift(currentCase.value);
        }
        
        showSuccessToast('保存成功');
        showCaseEditPopup.value = false;
    } catch (error) {
        showFailToast('保存失败');
        console.error(error);
    }
};

const onDeleteCase = () => {
    showConfirmDialog({
        title: '确认删除',
        message: '确定要删除这个案例吗？删除后无法恢复。',
    })
    .then(async () => {
        try {
            await axios.post('/api/cases/delete', { id: currentCase.value.id });
            const index = cases.value.findIndex(c => c.id === currentCase.value.id);
            if (index !== -1) {
                cases.value.splice(index, 1);
            }
            showSuccessToast('删除成功');
            showCaseEditPopup.value = false;
        } catch (error) {
            showFailToast('删除失败');
            console.error(error);
        }
    })
    .catch(() => {
        // cancel
    });
};

onMounted(() => {
    fetchData();
    fetchCases();
    fetchUsers();
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
