// pages/platform/platform.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    statistics: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalAmount: 0
    },
    quickActions: [
      {
        name: '我的订单',
        icon: '/images/orders.png',
        path: '/pages/orders/orders'
      },
      {
        name: '在线客服',
        icon: '/images/service.png',
        action: 'contact'
      },
      {
        name: '意见反馈',
        icon: '/images/feedback.png',
        action: 'feedback'
      },
      {
        name: '关于我们',
        icon: '/images/about.png',
        action: 'about'
      }
    ]
  },

  onLoad() {
    this.loadUserData()
    this.loadStatistics()
  },

  loadUserData() {
    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },

  loadStatistics() {
    // 模拟加载统计数据
    wx.showLoading({
      title: '加载中...'
    })
    
    setTimeout(() => {
      this.setData({
        statistics: {
          totalOrders: 12,
          completedOrders: 8,
          pendingOrders: 4,
          totalAmount: 5680
        }
      })
      wx.hideLoading()
    }, 1000)
  },

  onQuickAction(e) {
    const action = e.currentTarget.dataset.action
    const path = e.currentTarget.dataset.path
    
    if (path) {
      wx.navigateTo({
        url: path
      })
    } else if (action) {
      this.handleAction(action)
    }
  },

  handleAction(action) {
    switch (action) {
      case 'contact':
        wx.showModal({
          title: '联系客服',
          content: '客服电话：400-123-4567\n工作时间：9:00-18:00',
          showCancel: false
        })
        break
      case 'feedback':
        wx.navigateTo({
          url: '/pages/feedback/feedback'
        })
        break
      case 'about':
        wx.showModal({
          title: '关于我们',
          content: '畅行温州-云享飞\n版本：1.0.0\n开发：交运集团低空经济发展有限公司',
          showCancel: false
        })
        break
    }
  },

  onRefresh() {
    this.loadStatistics()
  },

  onShareAppMessage() {
    return {
      title: '畅行温州-云享飞平台',
      path: '/pages/platform/platform'
    }
  }
})
