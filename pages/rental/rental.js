// pages/rental/rental.js
Page({
  data: {
    title: '无人机租赁服务',
    subtitle: '各类无人机设备租赁'
  },
  onLoad() {
    wx.setNavigationBarTitle({
      title: '无人机租赁'
    })
  }
})
