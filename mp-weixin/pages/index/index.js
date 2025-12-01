Page({
  data: {
    // Replace this with your actual HTTPS URL
    url: 'https://45d93941.r12.vip.cpolar.cn/home'
  },
  onLoad(options) {
    // Enable this if you need to handle shared links or parameters
    if (options.url) {
        this.setData({ url: decodeURIComponent(options.url) });
    }
  }
})
