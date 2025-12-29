const { getServiceById } = require('../../utils/services')

Page({
  data: {
    service: null,
    form: {
      name: '',
      phone: '',
      company: '',
      demand: ''
    }
  },

  onLoad(options) {
    const { id = '1' } = options
    const service = getServiceById(id) || getServiceById('1')
    this.setData({ service })
    wx.setNavigationBarTitle({
      title: `${service.name} - 服务申请`
    })
  },

  handleInput(event) {
    const { field } = event.currentTarget.dataset
    this.setData({
      [`form.${field}`]: event.detail.value
    })
  },

  handleSubmit() {
    const { name, phone } = this.data.form
    if (!name.trim()) {
      wx.showToast({ title: '请填写联系人', icon: 'none' })
      return
    }
    if (!/^(1[3-9])\\d{9}$/.test(phone)) {
      wx.showToast({ title: '请填写正确手机号', icon: 'none' })
      return
    }
    wx.showToast({ title: '已提交', icon: 'success' })
    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 1200)
  }
})

