<template>
  <div class="order-detail-page">
    <van-nav-bar title="订单详情" left-arrow @click-left="$router.back()" fixed placeholder />

    <div v-if="order" class="detail-content">
      <!-- 状态卡片 -->
      <div class="status-card" :class="order.status">
        <van-icon :name="statusIcon" size="28" />
        <div>
          <p class="status-label">{{ order.status_label }}</p>
          <p class="status-desc" v-if="order.status === 'exception'">{{ order.exception_info?.label }}</p>
        </div>
      </div>

      <!-- 路线信息 -->
      <van-cell-group inset title="配送路线">
        <van-cell title="出发" :value="order.route.departure_name" icon="location-o" />
        <van-cell title="到达" :value="order.route.arrival_name" icon="aim" />
        <van-cell title="距离" :value="`${order.route.distance_km} km`" />
      </van-cell-group>

      <!-- 寄件人/取货人 -->
      <van-cell-group inset title="联系信息">
        <van-cell title="寄件人" :value="`${order.sender.name} ${order.sender.phone}`">
          <template #right-icon>
            <a :href="`tel:${order.sender.phone}`"><van-icon name="phone-o" size="18" color="#1989fa" /></a>
          </template>
        </van-cell>
        <van-cell title="取货人" :value="`${order.receiver.name} ${order.receiver.phone}`">
          <template #right-icon>
            <a :href="`tel:${order.receiver.phone}`"><van-icon name="phone-o" size="18" color="#1989fa" /></a>
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 物品信息 -->
      <van-cell-group inset title="物品信息">
        <van-cell title="物品类型" :value="order.item.type_label" />
        <van-cell title="重量" :value="`${order.item.weight} kg`" />
        <van-cell title="温控要求" :value="order.item.temp_labels?.join(', ') || '无'" />
        <van-cell title="紧急程度" :value="order.urgency_label" />
        <van-cell v-if="order.item.description" title="物品描述" :label="order.item.description" />
        <div class="item-images" v-if="order.item.images?.length">
          <p class="images-label">物品照片</p>
          <van-image v-for="(img, i) in order.item.images" :key="i" :src="img" width="80" height="80" fit="cover" radius="4" @click="previewImage(i)" />
        </div>
      </van-cell-group>

      <!-- 费用信息 -->
      <van-cell-group inset title="费用信息">
        <van-cell title="预估费用" :value="`¥${order.estimated_price}`" />
        <van-cell title="预估送达" :value="formatTime(order.estimated_delivery_time)" />
      </van-cell-group>

      <!-- 订单时间线 -->
      <van-cell-group inset title="订单进度">
        <div class="timeline">
          <van-steps direction="vertical" :active="order.timeline.length - 1" active-color="#1989fa">
            <van-step v-for="(t, i) in order.timeline" :key="i">
              <p>{{ t.label }}</p>
              <p class="timeline-time">{{ formatTime(t.time) }}</p>
            </van-step>
          </van-steps>
        </div>
      </van-cell-group>

      <!-- 底部操作 -->
      <div class="bottom-actions">
        <van-button v-if="order.status === 'pending'" type="warning" block round @click="cancelOrder">取消订单</van-button>
        <van-button v-if="order.status === 'completed' && !order.rating" type="primary" block round @click="$router.push(`/medical/orders/${order.id}/rate`)">评价配送</van-button>
        <van-button v-if="['completed','cancelled'].includes(order.status)" plain block round @click="reorder">再次下单</van-button>
      </div>
    </div>

    <div v-else class="loading">
      <van-loading size="36px">加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast, showFailToast, showConfirmDialog, showImagePreview } from 'vant'
import { useMedicalStore } from '@/stores/medical'

const router = useRouter()
const route = useRoute()
const store = useMedicalStore()
const order = computed(() => store.currentOrder)

const statusIcon = computed(() => {
  const map = { pending: 'clock-o', accepted: 'checked', pickup: 'logistics', delivering: 'logistics', delivered: 'location-o', completed: 'success', cancelled: 'close', exception: 'warning-o' }
  return map[order.value?.status] || 'info-o'
})

onMounted(async () => {
  await store.fetchOrderDetail(route.params.id)
})

function formatTime(time) {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

function previewImage(index) {
  showImagePreview({ images: order.value.item.images, startPosition: index })
}

async function cancelOrder() {
  try {
    await showConfirmDialog({ message: '确定取消该订单？' })
    const res = await store.cancelOrder(order.value.id, { reason_type: 'not_needed' })
    if (res?.success) {
      showSuccessToast('已取消')
      await store.fetchOrderDetail(route.params.id)
    }
  } catch (e) { /* cancelled */ }
}

async function reorder() {
  const res = await store.getReorderData(order.value.id)
  if (res?.success) {
    sessionStorage.setItem('reorderData', JSON.stringify(res.data))
    router.push('/medical/order/create?reorder=1')
  }
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
  max-width: var(--page-max-width);
  margin: 0 auto;
}

/* 固定导航栏居中约束 */
.order-detail-page :deep(.van-nav-bar--fixed) {
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 100% !important;
  max-width: var(--page-max-width);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  margin: 12px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #1989fa, #07c160);
}
.status-card.pending { background: linear-gradient(135deg, #faad14, #ffc107); }
.status-card.cancelled { background: linear-gradient(135deg, #999, #666); }
.status-card.exception { background: linear-gradient(135deg, #ff4d4f, #cf1322); }
.status-card.completed { background: linear-gradient(135deg, #52c41a, #389e0d); }
.status-label { font-size: 18px; font-weight: 600; }
.status-desc { font-size: 13px; opacity: 0.9; margin-top: 4px; }
.item-images {
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.images-label {
  width: 100%;
  font-size: 14px;
  color: #646566;
  margin-bottom: 8px;
}
.timeline { padding: 12px 16px; }
.timeline-time { font-size: 12px; color: #999; margin-top: 4px; }
.bottom-actions {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 80px;
}
</style>
