// pages/orders/orders.js
Page({
  data: {
    orders: [
      {
        id: 'R202501001',
        type: '维修',
        status: '进行中',
        device: 'DJI Mavic 3',
        createTime: '2025-01-15',
        amount: '¥580'
      },
      {
        id: 'R202501002',
        type: '租赁',
        status: '已完成',
        device: 'DJI Air 2S',
        createTime: '2025-01-14',
        amount: '¥320'
      },
      {
        id: 'R202501003',
        type: '培训',
        status: '待支付',
        device: '飞手培训课程',
        createTime: '2025-01-13',
        amount: '¥1200'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '我的订单'
    })
  },

  onOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/orders/detail/detail?id=${orderId}`
    })
  }
})
