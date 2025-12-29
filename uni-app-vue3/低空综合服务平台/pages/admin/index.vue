<template>
  <view class="admin-page">
    <view class="tab-header">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        @tap="activeTab = index"
      >
        {{ tab }}
      </view>
    </view>

    <view class="content-body">
      <!-- 订单管理 -->
      <view v-if="activeTab === 0" class="data-list">
        <view v-if="orders.length === 0" class="empty">暂无申请数据</view>
        <view 
          v-for="item in orders" 
          :key="item.id" 
          class="card"
          @tap="showOrderDetail(item)"
        >
          <view class="card-title">
            <text class="name">{{ item.serviceName }}</text>
            <text class="status" :class="getStatusClass(item.status)">{{ item.status || '待处理' }}</text>
          </view>
          <view class="card-info">
            <view class="info-line">申请人：{{ item.contactName || item.traineeName || '匿名' }}</view>
            <view class="info-line">电话：{{ item.contactPhone || item.traineePhone }}</view>
            <view class="info-line date">时间：{{ item.applyTime || '未知' }}</view>
          </view>
        </view>
      </view>

      <!-- 用户管理 -->
      <view v-if="activeTab === 1" class="data-list">
        <view 
          v-for="user in users" 
          :key="user.id" 
          class="card user-card"
        >
          <view class="user-main">
            <view class="user-avatar">👤</view>
            <view class="user-detail">
              <view class="user-name">
                {{ user.name || '未命名' }}
                <text class="role-tag" :class="user.role">{{ user.role === 'admin' ? '管理' : '用户' }}</text>
              </view>
              <view class="user-phone">{{ user.phone }}</view>
            </view>
          </view>
          <button 
            class="action-btn" 
            size="mini" 
            :type="user.role === 'admin' ? 'default' : 'primary'"
            @tap="toggleRole(user)"
          >
            {{ user.role === 'admin' ? '设为用户' : '设为管理' }}
          </button>
        </view>
      </view>
    </view>

    <!-- 订单操作弹窗 -->
    <view class="modal" v-if="showModal" @tap="showModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-title">修改订单状态</view>
        <view class="status-options">
          <view 
            v-for="opt in statusOptions" 
            :key="opt" 
            class="opt-item"
            @tap="updateStatus(opt)"
          >
            {{ opt }}
          </view>
        </view>
        <button class="close-btn" @tap="showModal = false">取消</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { request } from '../../utils/request'

const tabs = ['订单管理', '用户管理']
const activeTab = ref(0)
const orders = ref([])
const users = ref([])
const showModal = ref(false)
const currentOrder = ref(null)
const statusOptions = ['待处理', '处理中', '已完成', '已取消']

const fetchData = async () => {
  // 模拟从 API 获取或从缓存获取全部订单
  try {
    const res = await request({ url: '/api/admin/list' })
    orders.value = res
  } catch (e) {
    // 模拟数据：合并所有人的 mock 数据
    orders.value = uni.getStorageSync('mock_applications') || []
  }

  // 模拟用户列表
  users.value = [
    { id: 1, name: '管理员', phone: '13800000000', role: 'admin' },
    { id: 2, name: '张三', phone: '13911112222', role: 'user' },
    { id: 3, name: '李四', phone: '13733334444', role: 'user' }
  ]
}

onMounted(() => {
  fetchData()
})

const getStatusClass = (status) => {
  if (status === '已完成') return 'success'
  if (status === '处理中') return 'warning'
  return 'default'
}

const showOrderDetail = (item) => {
  currentOrder.value = item
  showModal.value = true
}

const updateStatus = (newStatus) => {
  if (!currentOrder.value) return
  currentOrder.value.status = newStatus
  
  // 同步到缓存
  const all = uni.getStorageSync('mock_applications') || []
  const idx = all.findIndex(a => a.orderNo === currentOrder.value.orderNo)
  if (idx > -1) {
    all[idx].status = newStatus
    uni.setStorageSync('mock_applications', all)
  }
  
  showModal.value = false
  uni.showToast({ title: '修改成功' })
}

const toggleRole = (user) => {
  user.role = user.role === 'admin' ? 'user' : 'admin'
  uni.showToast({ title: '权限已更新' })
}
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #f7f8fa; }
.tab-header { display: flex; background: #fff; position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #eee; }
.tab-item { flex: 1; text-align: center; padding: 14px 0; font-size: 15px; color: #646566; position: relative; }
.tab-item.active { color: #2f7ef7; font-weight: bold; }
.tab-item.active::after { content: ''; position: absolute; bottom: 0; left: 30%; right: 30%; height: 3px; background: #2f7ef7; border-radius: 2px; }

.content-body { padding: 12px; }
.empty { text-align: center; padding: 100px 0; color: #969799; font-size: 14px; }

.card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.card-title { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #f2f3f5; padding-bottom: 10px; }
.card-title .name { font-size: 16px; font-weight: bold; }
.status { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.status.success { background: #e8f9f0; color: #07c160; }
.status.warning { background: #fff7e8; color: #ff976a; }
.status.default { background: #f7f8fa; color: #969799; }

.card-info { font-size: 13px; color: #646566; }
.info-line { margin-bottom: 6px; }
.info-line.date { color: #969799; font-size: 12px; }

.user-card { display: flex; justify-content: space-between; align-items: center; }
.user-main { display: flex; gap: 12px; align-items: center; }
.user-avatar { width: 40px; height: 40px; background: #f0f2f5; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.user-name { font-size: 15px; font-weight: bold; display: flex; align-items: center; gap: 6px; }
.user-phone { font-size: 13px; color: #969799; }
.role-tag { font-size: 10px; padding: 1px 4px; border-radius: 3px; font-weight: normal; }
.role-tag.admin { background: #fff2f0; color: #ff4d4f; border: 1px solid #ffa39e; }
.role-tag.user { background: #e6f7ff; color: #1890ff; border: 1px solid #91d5ff; }

.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; z-index: 100; }
.modal-content { background: #fff; width: 100%; border-radius: 16px 16px 0 0; padding: 24px 16px; }
.modal-title { font-size: 17px; font-weight: bold; text-align: center; margin-bottom: 20px; }
.status-options { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.opt-item { background: #f7f8fa; padding: 16px; text-align: center; border-radius: 12px; font-size: 15px; }
.opt-item:active { background: #ebedf0; }
.close-btn { border-radius: 99px; font-size: 15px; }
</style>

