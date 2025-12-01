// pages/index/index.js
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    version: '1.0.0',
    mainServices: [
      {
        id: 1,
        name: '维修服务',
        icon: '🔧',
        desc: '大疆过保后维修服务',
        path: '/pages/repair/repair'
      },
      {
        id: 2,
        name: '托管服务',
        icon: '🗝️',
        desc: '专业无人机托管管理',
        path: '/pages/trusteeship/trusteeship'
      },
      {
        id: 3,
        name: '表演服务',
        icon: '🎭',
        desc: '专业无人机编队表演',
        path: '/pages/performance/performance'
      },
      {
        id: 4,
        name: '租赁服务',
        icon: '📦',
        desc: '各类无人机设备租赁',
        path: '/pages/rental/rental'
      }
    ],
    secondaryServices: [
      {
        id: 5,
        name: '城市治理',
        icon: '🏙️',
        desc: '智慧城市管理应用',
        path: '/pages/governance/governance'
      },
      {
        id: 6,
        name: '飞手培训',
        icon: '🎓',
        desc: '专业无人机操作培训',
        path: '/pages/training/training'
      },
      {
        id: 7,
        name: '共享无人机',
        icon: '🤝',
        desc: '无人机设备共享平台',
        path: '/pages/sharing/sharing'
      },
      {
        id: 8,
        name: '无人机保险',
        icon: '🛡️',
        desc: '无人机设备及责任保险',
        path: '/pages/insurance/insurance'
      },
      {
        id: 9,
        name: '研学服务',
        icon: '📚',
        desc: '无人机技术研学体验',
        path: '/pages/study/study'
      },
      {
        id: 10,
        name: '二手交易',
        icon: '🔄',
        desc: '无人机设备二手交易',
        path: '/pages/secondhand/secondhand'
      },
      {
        id: 11,
        name: '技术支持',
        icon: '⚙️',
        desc: '专业技术支持服务',
        path: '/pages/support/support'
      },
      {
        id: 12,
        name: '更多服务',
        icon: '➕',
        desc: '更多无人机相关服务',
        path: '/pages/more/more'
      }
    ]
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  getUserInfo(e) {
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  onServiceTap(e) {
    const service = e.currentTarget.dataset.service
    wx.navigateTo({
      url: service.path
    })
  },

  onShareAppMessage() {
    return {
      title: '畅行温州-云享飞',
      path: '/pages/index/index'
    }
  }
})
