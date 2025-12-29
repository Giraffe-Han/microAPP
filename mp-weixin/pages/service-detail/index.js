const { getServiceById, trainingShowcase } = require('../../utils/services')

const computeActionText = (id) => {
  if (['1', '4', '8'].includes(String(id))) {
    return '立即下单'
  }
  if (['6', '9'].includes(String(id))) {
    return '参与报名'
  }
  return '立即办理'
}

Page({
  data: {
    service: null,
    trainingShowcase: [],
    actionText: '立即办理'
  },

  onLoad(options) {
    const { id = '1' } = options
    this.loadService(id)
  },

  loadService(id) {
    const service = getServiceById(id) || getServiceById('1')
    this.setData({
      service,
      actionText: computeActionText(id),
      trainingShowcase: String(id) === '6' ? trainingShowcase : []
    })
  },

  handleApply() {
    const { service } = this.data
    if (!service) return
    if (service.id === '8') {
      wx.showModal({
        title: '敬请期待',
        content: '外卖配送正在接入微信小程序，请暂时通过H5端下单。',
        showCancel: false
      })
      return
    }
    wx.navigateTo({
      url: `/pages/service-apply/index?id=${service.id}`
    })
  },

  makeCall(event) {
    const { phone } = event.currentTarget.dataset
    if (!phone) return
    wx.makePhoneCall({ phoneNumber: phone })
  }
})

