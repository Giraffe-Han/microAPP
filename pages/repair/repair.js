// pages/repair/repair.js
Page({
  data: {
    orders: [
      {
        id: 'R202501001',
        device: 'DJI Mavic 3',
        status: '维修中',
        createTime: '2025-01-15',
        progress: 60,
        description: '云台故障，需要更换云台组件'
      },
      {
        id: 'R202501002',
        device: 'DJI Air 2S',
        status: '待报价',
        createTime: '2025-01-14',
        progress: 20,
        description: '电池无法充电，需要检测电池模块'
      }
    ],
    statusList: ['待报价', '维修中', '已完成', '已取件']
  },

  onLoad() {
    this.loadOrders()
    this.processOrders()
  },

  // 将中文状态映射到英文CSS类名
  getStatusClass(status) {
    const statusMap = {
      '待报价': 'status-pending',
      '维修中': 'status-repairing', 
      '已完成': 'status-completed',
      '已取件': 'status-picked'
    }
    return statusMap[status] || 'status-pending'
  },

  // 处理订单数据，添加CSS类名
  processOrders() {
    const orders = this.data.orders.map(order => {
      return {
        ...order,
        statusClass: this.getStatusClass(order.status)
      }
    })
    this.setData({ orders })
  },

  loadOrders() {
    // 模拟加载订单数据
    wx.showLoading({
      title: '加载中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      // 这里可以调用API获取真实数据
    }, 1000)
  },

  onCreateOrder() {
    wx.navigateTo({
      url: '/pages/repair/create/create'
    })
  },

  onOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/repair/detail/detail?id=${orderId}`
    })
  },

  onRefresh() {
    this.loadOrders()
  },

  onShareAppMessage() {
    return {
      title: '无人机维修服务',
      path: '/pages/repair/repair'
    }
  }
})
