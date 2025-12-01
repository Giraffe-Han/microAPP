// pages/messages/messages.js
Page({
  data: {
    messages: [
      {
        id: 1,
        title: '订单状态更新',
        content: '您的维修订单R202501001已开始处理',
        time: '2025-01-15 14:30',
        unread: true
      },
      {
        id: 2,
        title: '系统通知',
        content: '平台功能升级，新增多项服务',
        time: '2025-01-14 09:15',
        unread: false
      },
      {
        id: 3,
        title: '服务提醒',
        content: '您的租赁服务即将到期，请及时续费',
        time: '2025-01-13 16:45',
        unread: false
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '消息中心'
    })
  },

  onMessageTap(e) {
    const messageId = e.currentTarget.dataset.id
    // 标记为已读
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        msg.unread = false
      }
      return msg
    })
    this.setData({ messages })
  }
})
