const { services } = require('../../utils/services')

Page({
  data: {
    services: []
  },
  onLoad() {
    this.setData({ services })
  },
  handleServiceTap(event) {
    const { id } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/service-detail/index?id=${id}`
    })
  }
})

