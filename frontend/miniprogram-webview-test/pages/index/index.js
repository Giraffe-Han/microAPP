const app = getApp()

// 医疗配送 H5 常用页面（路径基于 frontend/h5 的 vue-router 配置）
const LINKS = [
  { name: '服务大厅首页', path: '/' },
  { name: '登录页', path: '/login' },
  { name: '寄件人认证', path: '/medical/certification' },
  { name: '认证状态', path: '/medical/certification/status' },
  { name: '医疗配送下单', path: '/medical/order/create' },
  { name: '选择起降场', path: '/medical/order/map-select' },
  { name: '我的配送订单', path: '/medical/orders' },
  { name: '寄给我的', path: '/medical/received' },
  { name: '常用联系人', path: '/medical/contacts' }
]

const PROD_URL = 'https://microapp.zndkfx.com'
const LOCAL_URL = 'http://localhost:5173'

Page({
  data: {
    baseUrl: '',
    authcode: '',
    links: LINKS
  },

  onLoad() {
    this.setData({
      baseUrl: app.globalData.baseUrl || LOCAL_URL,
      authcode: app.globalData.authcode || ''
    })
  },

  onBaseUrlInput(e) {
    const v = e.detail.value.trim()
    this.setData({ baseUrl: v })
    app.globalData.baseUrl = v
  },

  onAuthcodeInput(e) {
    const v = e.detail.value.trim()
    this.setData({ authcode: v })
    app.globalData.authcode = v
  },

  useLocal() {
    this.setData({ baseUrl: LOCAL_URL })
    app.globalData.baseUrl = LOCAL_URL
  },

  useProd() {
    this.setData({ baseUrl: PROD_URL })
    app.globalData.baseUrl = PROD_URL
  },

  openPage(e) {
    const path = e.currentTarget.dataset.path
    let base = (this.data.baseUrl || '').replace(/\/+$/, '')
    if (!base) {
      wx.showToast({ title: '请先填写 baseURL', icon: 'none' })
      return
    }
    if (!/^https?:\/\//.test(base)) {
      wx.showToast({ title: 'baseURL 需以 http(s):// 开头', icon: 'none' })
      return
    }

    let url = base + path
    const code = (this.data.authcode || '').trim()
    if (code) {
      url += (url.indexOf('?') > -1 ? '&' : '?') + 'authcode=' + encodeURIComponent(code)
    }

    wx.navigateTo({
      url: '/pages/webview/webview?src=' + encodeURIComponent(url)
    })
  }
})
