Page({
  data: {
    src: ''
  },

  onLoad(options) {
    if (options && options.src) {
      const src = decodeURIComponent(options.src)
      this.setData({ src })
      console.log('[webview] load:', src)
    }
  },

  // 接收 H5 通过 wx.miniProgram.postMessage 发送的消息（页面后退/分享/自定义组件销毁时触发）
  onMessage(e) {
    console.log('[webview] message from H5:', e.detail && e.detail.data)
  },

  onError(e) {
    console.error('[webview] load error:', e.detail)
    wx.showToast({ title: 'H5 加载失败', icon: 'none' })
  }
})
