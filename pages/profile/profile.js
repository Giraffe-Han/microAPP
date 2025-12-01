// pages/profile/profile.js
Page({
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '未登录'
    },
    menuItems: [
      {
        icon: '📋',
        name: '我的资料',
        path: '/pages/profile/info/info'
      },
      {
        icon: '💳',
        name: '我的钱包',
        path: '/pages/profile/wallet/wallet'
      },
      {
        icon: '⚙️',
        name: '设置',
        path: '/pages/profile/settings/settings'
      },
      {
        icon: '📞',
        name: '联系客服',
        action: 'contact'
      },
      {
        icon: 'ℹ️',
        name: '关于我们',
        action: 'about'
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({
      title: '个人中心'
    })
    this.loadUserInfo()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  onMenuTap(e) {
    const item = e.currentTarget.dataset.item
    if (item.path) {
      wx.navigateTo({
        url: item.path
      })
    } else if (item.action) {
      this.handleAction(item.action)
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
      case 'about':
        wx.showModal({
          title: '关于我们',
          content: '畅行温州-云享飞\n版本：1.0.0\n开发：交运集团低空经济发展有限公司',
          showCancel: false
        })
        break
    }
  }
})
